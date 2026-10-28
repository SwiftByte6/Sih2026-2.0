-- AICTE Security Deposit & FDR Management Portal
-- Supabase PostgreSQL initial schema
-- Review against the deployed Next.js app and existing bank API before applying.
-- This migration creates the data model; it does not create Auth users or Storage files.

begin;

create extension if not exists pgcrypto;

-- ---------- ENUMS ----------
create type public.app_role as enum (
  'super_admin', 'aicte_admin', 'reviewer', 'institution_admin', 'institution_staff', 'auditor'
);

create type public.instrument_type as enum ('FDR', 'RPGF', 'OTHER');
create type public.instrument_lifecycle_status as enum (
  'DRAFT', 'SUBMITTED', 'ACTIVE', 'EXPIRING', 'MATURED',
  'RENEWAL_PENDING', 'REPLACEMENT_PENDING', 'RELEASE_PENDING', 'RELEASED', 'CLOSED'
);
create type public.verification_status as enum (
  'NOT_STARTED', 'PROCESSING', 'PENDING_VERIFICATION', 'ACTION_REQUIRED',
  'VERIFIED', 'REJECTED', 'ERROR'
);
create type public.document_type as enum (
  'FDR_COPY', 'RPGF_COPY', 'INSTITUTION_REQUEST_LETTER', 'AFFIDAVIT_6',
  'PAYMENT_PROOF', 'LOA_EOA', 'CLEARANCE', 'RENEWAL_DOCUMENT',
  'REPLACEMENT_DOCUMENT', 'RELEASE_EVIDENCE', 'OTHER'
);
create type public.document_processing_status as enum (
  'UPLOADED', 'QUEUED', 'PROCESSING', 'EXTRACTED', 'REVIEW_REQUIRED', 'FAILED'
);
create type public.release_status as enum (
  'NOT_REQUESTED', 'SUBMITTED', 'DOCUMENTS_PENDING', 'CLEARANCE_PENDING',
  'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED', 'WITHDRAWN'
);
create type public.task_status as enum ('OPEN', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED');
create type public.task_priority as enum ('LOW', 'NORMAL', 'HIGH', 'URGENT');
create type public.notification_status as enum ('PENDING', 'SENT', 'FAILED', 'READ', 'CANCELLED');
create type public.clearance_status as enum ('NOT_REQUIRED', 'PENDING', 'CLEARED', 'REJECTED');
create type public.outbox_status as enum ('PENDING', 'PROCESSING', 'DELIVERED', 'RETRY', 'DEAD_LETTER');

-- ---------- SHARED UPDATED_AT TRIGGER ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- USERS, ROLES, INSTITUTIONS ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_lower_uq on public.profiles (lower(email)) where email is not null;

create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  aicte_institution_id text,
  institution_name text not null,
  institution_type text,
  state text,
  district text,
  city text,
  address text,
  pincode text,
  official_email text,
  official_phone text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index institutions_aicte_id_uq
  on public.institutions (aicte_institution_id)
  where aicte_institution_id is not null;
create index institutions_name_idx on public.institutions (institution_name);

create table public.role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  institution_id uuid references public.institutions(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (
    (role in ('institution_admin', 'institution_staff') and institution_id is not null)
    or (role in ('super_admin', 'aicte_admin', 'reviewer', 'auditor') and institution_id is null)
  ),
  unique (user_id, role, institution_id)
);

create index role_assignments_user_idx on public.role_assignments(user_id);
create index role_assignments_institution_idx on public.role_assignments(institution_id);

create table public.institution_members (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  membership_title text,
  is_primary_contact boolean not null default false,
  created_at timestamptz not null default now(),
  unique (institution_id, user_id)
);
create index institution_members_user_idx on public.institution_members(user_id);

-- ---------- FINANCIAL INSTRUMENTS ----------
create table public.financial_instruments (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete restrict,
  instrument_type public.instrument_type not null default 'FDR',
  instrument_reference text,
  bank_name text not null,
  bank_branch text,
  bank_ifsc text,
  account_holder_name text,
  fdr_number text,
  amount numeric(18,2) not null check (amount > 0),
  currency char(3) not null default 'INR' check (currency = 'INR'),
  issue_date date,
  effective_date date,
  maturity_date date,
  lien_marked boolean,
  lien_details text,
  purpose text,
  lifecycle_status public.instrument_lifecycle_status not null default 'DRAFT',
  verification_status public.verification_status not null default 'NOT_STARTED',
  parent_instrument_id uuid references public.financial_instruments(id) on delete set null,
  current_document_id uuid, -- FK added after documents table exists
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (maturity_date is null or issue_date is null or maturity_date >= issue_date),
  check (effective_date is null or issue_date is null or effective_date >= issue_date)
);
create index instruments_institution_idx on public.financial_instruments(institution_id);
create index instruments_maturity_idx on public.financial_instruments(maturity_date);
create index instruments_lifecycle_idx on public.financial_instruments(lifecycle_status);
create index instruments_verification_idx on public.financial_instruments(verification_status);
create index instruments_parent_idx on public.financial_instruments(parent_instrument_id);
create index instruments_fdr_number_idx on public.financial_instruments(fdr_number);

-- ---------- DOCUMENTS AND EXTRACTION ----------
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete restrict,
  instrument_id uuid references public.financial_instruments(id) on delete set null,
  document_type public.document_type not null default 'OTHER',
  original_filename text not null,
  storage_bucket text not null default 'fdr-documents',
  storage_path text not null,
  mime_type text,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  sha256_hash text,
  version_number integer not null default 1 check (version_number > 0),
  processing_status public.document_processing_status not null default 'UPLOADED',
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  supersedes_document_id uuid references public.documents(id) on delete set null,
  is_deleted boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  unique (storage_bucket, storage_path)
);
create index documents_institution_idx on public.documents(institution_id);
create index documents_instrument_idx on public.documents(instrument_id);
create index documents_type_idx on public.documents(document_type);
create index documents_hash_idx on public.documents(sha256_hash);

alter table public.financial_instruments
  add constraint instruments_current_document_fk
  foreign key (current_document_id) references public.documents(id) on delete set null;

create table public.document_extractions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  extractor_name text not null,
  extractor_version text,
  extraction_status text not null default 'PENDING'
    check (extraction_status in ('PENDING', 'SUCCEEDED', 'PARTIAL', 'FAILED', 'REVIEW_REQUIRED')),
  extracted_fields jsonb not null default '{}'::jsonb,
  field_confidence jsonb not null default '{}'::jsonb,
  raw_text_storage_path text,
  error_code text,
  error_message text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index document_extractions_document_idx on public.document_extractions(document_id);

-- ---------- BANK / INSTRUMENT VERIFICATION ----------
create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.financial_instruments(id) on delete cascade,
  requested_by uuid references public.profiles(id) on delete set null,
  provider_name text not null default 'dummy_bank_api',
  provider_request_id text,
  idempotency_key text not null unique default gen_random_uuid()::text,
  request_payload jsonb not null default '{}'::jsonb,
  status text not null default 'QUEUED'
    check (status in ('QUEUED', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'TIMED_OUT', 'CANCELLED')),
  is_simulated boolean not null default true,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  error_code text,
  error_message text,
  response_summary jsonb not null default '{}'::jsonb
);
create index verification_requests_instrument_idx on public.verification_requests(instrument_id);
create index verification_requests_status_idx on public.verification_requests(status);
create index verification_requests_created_idx on public.verification_requests(requested_at desc);

create table public.verification_checks (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.financial_instruments(id) on delete cascade,
  verification_request_id uuid references public.verification_requests(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  check_type text not null,
  status text not null check (status in ('PASS', 'FAIL', 'WARNING', 'INCONCLUSIVE', 'ERROR')),
  expected_value jsonb,
  observed_value jsonb,
  discrepancy_code text,
  message text,
  is_simulated boolean not null default true,
  checked_by uuid references public.profiles(id) on delete set null,
  checked_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index verification_checks_instrument_idx on public.verification_checks(instrument_id);
create index verification_checks_request_idx on public.verification_checks(verification_request_id);

-- ---------- LIFECYCLE / RENEWAL / REPLACEMENT HISTORY ----------
create table public.lifecycle_events (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.financial_instruments(id) on delete cascade,
  event_type text not null,
  from_status public.instrument_lifecycle_status,
  to_status public.instrument_lifecycle_status,
  event_date timestamptz not null default now(),
  actor_id uuid references public.profiles(id) on delete set null,
  related_instrument_id uuid references public.financial_instruments(id) on delete set null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index lifecycle_events_instrument_date_idx on public.lifecycle_events(instrument_id, event_date desc);

-- ---------- RELEASE / REFUND WORKFLOW ----------
create table public.release_refund_requests (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete restrict,
  instrument_id uuid not null references public.financial_instruments(id) on delete restrict,
  request_reference text not null unique default ('REL-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  request_type text not null default 'RELEASE'
    check (request_type in ('RELEASE', 'REFUND')),
  status public.release_status not null default 'SUBMITTED',
  applicable_rule_reference text,
  submitted_by uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz not null default now(),
  assigned_to uuid references public.profiles(id) on delete set null,
  decision_by uuid references public.profiles(id) on delete set null,
  decision_at timestamptz,
  decision_reason text,
  completed_at timestamptz,
  completion_reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index release_requests_institution_idx on public.release_refund_requests(institution_id);
create index release_requests_instrument_idx on public.release_refund_requests(instrument_id);
create index release_requests_status_idx on public.release_refund_requests(status);
create index release_requests_assignee_idx on public.release_refund_requests(assigned_to);

create table public.release_request_documents (
  id uuid primary key default gen_random_uuid(),
  release_request_id uuid not null references public.release_refund_requests(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete restrict,
  requirement_key text,
  is_required boolean not null default true,
  review_status text not null default 'PENDING'
    check (review_status in ('PENDING', 'ACCEPTED', 'REJECTED', 'NOT_APPLICABLE')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_comment text,
  created_at timestamptz not null default now(),
  unique (release_request_id, document_id)
);

create table public.clearance_records (
  id uuid primary key default gen_random_uuid(),
  release_request_id uuid not null references public.release_refund_requests(id) on delete cascade,
  clearance_type text not null,
  department_name text,
  status public.clearance_status not null default 'PENDING',
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  reference_number text,
  remarks text,
  metadata jsonb not null default '{}'::jsonb,
  unique (release_request_id, clearance_type)
);
create index clearance_status_idx on public.clearance_records(status);

-- ---------- TASKS / NOTIFICATIONS ----------
create table public.workflow_tasks (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade,
  instrument_id uuid references public.financial_instruments(id) on delete cascade,
  release_request_id uuid references public.release_refund_requests(id) on delete cascade,
  title text not null,
  description text,
  task_type text not null,
  status public.task_status not null default 'OPEN',
  priority public.task_priority not null default 'NORMAL',
  assigned_to uuid references public.profiles(id) on delete set null,
  due_at timestamptz,
  completed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(instrument_id, release_request_id, institution_id) >= 1)
);
create index workflow_tasks_assignee_status_idx on public.workflow_tasks(assigned_to, status);
create index workflow_tasks_due_idx on public.workflow_tasks(due_at) where status in ('OPEN', 'IN_PROGRESS', 'BLOCKED');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references public.profiles(id) on delete cascade,
  institution_id uuid references public.institutions(id) on delete cascade,
  instrument_id uuid references public.financial_instruments(id) on delete cascade,
  release_request_id uuid references public.release_refund_requests(id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text not null,
  channel text not null default 'IN_APP' check (channel in ('IN_APP', 'EMAIL', 'SMS', 'OTHER')),
  status public.notification_status not null default 'PENDING',
  dedupe_key text,
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  read_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create unique index notifications_dedupe_uq on public.notifications(recipient_user_id, dedupe_key)
  where dedupe_key is not null;
create index notifications_recipient_status_idx on public.notifications(recipient_user_id, status, scheduled_for desc);

-- ---------- AUDIT / INTEGRATION / RELIABLE EVENTS ----------
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  institution_id uuid references public.institutions(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  reason text,
  before_data jsonb,
  after_data jsonb,
  ip_address inet,
  user_agent text,
  correlation_id text,
  created_at timestamptz not null default now()
);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);
create index audit_logs_actor_idx on public.audit_logs(actor_user_id, created_at desc);

create table public.integration_sync_logs (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null,
  operation text not null,
  instrument_id uuid references public.financial_instruments(id) on delete set null,
  verification_request_id uuid references public.verification_requests(id) on delete set null,
  correlation_id text,
  idempotency_key text,
  status text not null check (status in ('STARTED', 'SUCCEEDED', 'FAILED', 'TIMED_OUT', 'RETRYING')),
  http_status integer,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  attempt_number integer not null default 1 check (attempt_number > 0),
  error_code text,
  error_message text,
  request_summary jsonb not null default '{}'::jsonb,
  response_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index integration_logs_provider_date_idx on public.integration_sync_logs(provider_name, created_at desc);
create index integration_logs_instrument_idx on public.integration_sync_logs(instrument_id);

create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  status public.outbox_status not null default 'PENDING',
  available_at timestamptz not null default now(),
  attempts integer not null default 0 check (attempts >= 0),
  locked_at timestamptz,
  locked_by text,
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);
create index outbox_ready_idx on public.outbox_events(status, available_at)
  where status in ('PENDING', 'RETRY');
create index outbox_aggregate_idx on public.outbox_events(aggregate_type, aggregate_id, created_at);

-- ---------- UPDATED_AT TRIGGERS ----------
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger institutions_updated_at before update on public.institutions
for each row execute function public.set_updated_at();
create trigger instruments_updated_at before update on public.financial_instruments
for each row execute function public.set_updated_at();
create trigger release_requests_updated_at before update on public.release_refund_requests
for each row execute function public.set_updated_at();
create trigger workflow_tasks_updated_at before update on public.workflow_tasks
for each row execute function public.set_updated_at();

-- ---------- AUTH HELPERS FOR RLS ----------
-- SECURITY DEFINER prevents RLS recursion while checking role assignments.
create or replace function public.has_role(required_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.role_assignments ra
    where ra.user_id = (select auth.uid())
      and ra.role = any(required_roles)
  );
$$;

create or replace function public.is_institution_member(target_institution uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.institution_members im
    where im.user_id = (select auth.uid())
      and im.institution_id = target_institution
  )
  or exists (
    select 1
    from public.role_assignments ra
    where ra.user_id = (select auth.uid())
      and ra.institution_id = target_institution
      and ra.role in ('institution_admin', 'institution_staff')
  );
$$;

revoke all on function public.has_role(public.app_role[]) from public;
revoke all on function public.is_institution_member(uuid) from public;
grant execute on function public.has_role(public.app_role[]) to authenticated;
grant execute on function public.is_institution_member(uuid) to authenticated;

-- ---------- RLS ----------
-- Start deny-by-default. Extend policies only after validating the intended UI/API flows.
alter table public.profiles enable row level security;
alter table public.institutions enable row level security;
alter table public.role_assignments enable row level security;
alter table public.institution_members enable row level security;
alter table public.financial_instruments enable row level security;
alter table public.documents enable row level security;
alter table public.document_extractions enable row level security;
alter table public.verification_requests enable row level security;
alter table public.verification_checks enable row level security;
alter table public.lifecycle_events enable row level security;
alter table public.release_refund_requests enable row level security;
alter table public.release_request_documents enable row level security;
alter table public.clearance_records enable row level security;
alter table public.workflow_tasks enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.integration_sync_logs enable row level security;
alter table public.outbox_events enable row level security;

-- Profiles: users see/update only their own profile; privileged roles may read profiles.
create policy profiles_select_own_or_admin on public.profiles
for select to authenticated
using (
  id = (select auth.uid())
  or public.has_role(array['super_admin','aicte_admin','reviewer','auditor']::public.app_role[])
);
create policy profiles_update_own on public.profiles
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Institutions: institution members see their institution; AICTE/admin/auditor roles can see all.
create policy institutions_select_scoped on public.institutions
for select to authenticated
using (
  public.is_institution_member(id)
  or public.has_role(array['super_admin','aicte_admin','reviewer','auditor']::public.app_role[])
);
create policy institutions_insert_admin on public.institutions
for insert to authenticated
with check (public.has_role(array['super_admin','aicte_admin']::public.app_role[]));
create policy institutions_update_admin on public.institutions
for update to authenticated
using (public.has_role(array['super_admin','aicte_admin']::public.app_role[]))
with check (public.has_role(array['super_admin','aicte_admin']::public.app_role[]));

-- Role assignment visibility only; mutations should be performed by trusted server/admin workflow.
create policy roles_select_self_or_admin on public.role_assignments
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.has_role(array['super_admin','aicte_admin','auditor']::public.app_role[])
);

create policy institution_members_select_scoped on public.institution_members
for select to authenticated
using (
  user_id = (select auth.uid())
  or public.is_institution_member(institution_id)
  or public.has_role(array['super_admin','aicte_admin','reviewer','auditor']::public.app_role[])
);

create policy instruments_select_scoped on public.financial_instruments
for select to authenticated
using (
  public.is_institution_member(institution_id)
  or public.has_role(array['super_admin','aicte_admin','reviewer','auditor']::public.app_role[])
);
create policy instruments_insert_institution_or_admin on public.financial_instruments
for insert to authenticated
with check (
  public.is_institution_member(institution_id)
  or public.has_role(array['super_admin','aicte_admin']::public.app_role[])
);
create policy instruments_update_scoped on public.financial_instruments
for update to authenticated
using (
  public.is_institution_member(institution_id)
  or public.has_role(array['super_admin','aicte_admin','reviewer']::public.app_role[])
)
with check (
  public.is_institution_member(institution_id)
  or public.has_role(array['super_admin','aicte_admin','reviewer']::public.app_role[])
);

create policy documents_select_scoped on public.documents
for select to authenticated
using (
  public.is_institution_member(institution_id)
  or public.has_role(array['super_admin','aicte_admin','reviewer','auditor']::public.app_role[])
);
create policy documents_insert_scoped on public.documents
for insert to authenticated
with check (
  public.is_institution_member(institution_id)
  or public.has_role(array['super_admin','aicte_admin','reviewer']::public.app_role[])
);

create policy extractions_select_scoped on public.document_extractions
for select to authenticated
using (
  exists (
    select 1 from public.documents d
    where d.id = document_id
      and (
        public.is_institution_member(d.institution_id)
        or public.has_role(array['super_admin','aicte_admin','reviewer','auditor']::public.app_role[])
      )
  )
);

create policy verification_requests_select_scoped on public.verification_requests
for select to authenticated
using (
  exists (
    select 1 from public.financial_instruments fi
    where fi.id = instrument_id
      and (
        public.is_institution_member(fi.institution_id)
        or public.has_role(array['super_admin','aicte_admin','reviewer','auditor']::public.app_role[])
      )
  )
);
create policy verification_checks_select_scoped on public.verification_checks
for select to authenticated
using (
  exists (
    select 1 from public.financial_instruments fi
    where fi.id = instrument_id
      and (
        public.is_institution_member(fi.institution_id)
        or public.has_role(array['super_admin','aicte_admin','reviewer','auditor']::public.app_role[])
      )
  )
);

create policy lifecycle_events_select_scoped on public.lifecycle_events
for select to authenticated
using (
  exists (
    select 1 from public.financial_instruments fi
    where fi.id = instrument_id
      and (
        public.is_institution_member(fi.institution_id)
        or public.has_role(array['super_admin','aicte_admin','reviewer','auditor']::public.app_role[])
      )
  )
);

create policy release_requests_select_scoped on public.release_refund_requests
for select to authenticated
using (
  public.is_institution_member(institution_id)
  or public.has_role(array['super_admin','aicte_admin','reviewer','auditor']::public.app_role[])
);
create policy release_requests_insert_scoped on public.release_refund_requests
for insert to authenticated
with check (
  public.is_institution_member(institution_id)
  or public.has_role(array['super_admin','aicte_admin']::public.app_role[])
);
create policy release_requests_update_reviewers on public.release_refund_requests
for update to authenticated
using (
  public.has_role(array['super_admin','aicte_admin','reviewer']::public.app_role[])
)
with check (
  public.has_role(array['super_admin','aicte_admin','reviewer']::public.app_role[])
);

create policy release_request_documents_select_scoped on public.release_request_documents
for select to authenticated
using (
  exists (
    select 1 from public.release_refund_requests rr
    where rr.id = release_request_id
      and (
        public.is_institution_member(rr.institution_id)
        or public.has_role(array['super_admin','aicte_admin','reviewer','auditor']::public.app_role[])
      )
  )
);

create policy clearances_select_scoped on public.clearance_records
for select to authenticated
using (
  exists (
    select 1 from public.release_refund_requests rr
    where rr.id = release_request_id
      and (
        public.is_institution_member(rr.institution_id)
        or public.has_role(array['super_admin','aicte_admin','reviewer','auditor']::public.app_role[])
      )
  )
);

create policy tasks_select_scoped on public.workflow_tasks
for select to authenticated
using (
  (assigned_to = (select auth.uid()))
  or (institution_id is not null and public.is_institution_member(institution_id))
  or public.has_role(array['super_admin','aicte_admin','reviewer','auditor']::public.app_role[])
);

create policy notifications_select_own on public.notifications
for select to authenticated
using (
  recipient_user_id = (select auth.uid())
  or public.has_role(array['super_admin','aicte_admin']::public.app_role[])
);
create policy notifications_update_own_read_state on public.notifications
for update to authenticated
using (recipient_user_id = (select auth.uid()))
with check (recipient_user_id = (select auth.uid()));

create policy audit_logs_select_privileged on public.audit_logs
for select to authenticated
using (public.has_role(array['super_admin','aicte_admin','auditor']::public.app_role[]));

create policy integration_logs_select_admin on public.integration_sync_logs
for select to authenticated
using (public.has_role(array['super_admin','aicte_admin']::public.app_role[]));

-- Outbox has no client-facing policies by design; process only from trusted server/worker.
-- Writes to verification, audit, integration, and outbox tables should generally go through
-- trusted server-side code / narrowly scoped RPCs after authentication and authorization.

commit;
