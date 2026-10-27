# AICTE Security Deposit & FDR Management Portal — Backend Integration Specification

> **File:** `README_BACKEND.md` (Project Root)  
> **Status:** Live & Continuously Maintained  
> **Target Stack:** Next.js App Router, JavaScript, Tailwind CSS, Supabase PostgreSQL, Supabase Auth, Supabase Storage  
> **Database Schema:** `aict_fdr_portal_schema.sql`  
> **Regulatory Reference:** AICTE Approval Process Handbook (Clauses 1.12, 2.25, 6.46, Affidavit-6)  

---

## 1. System Architecture Overview

The frontend is architected with a clean separation of concerns:
1. **Presentation Layer:** Next.js App Router (Server & Client Components) with Tailwind CSS following `design.md`.
2. **Data Access Layer (`lib/dataService.js`):** Unified async data provider containing precise signatures, filters, and SQL/Supabase integration comments.
3. **Canonical Data Model (`lib/mockData.js`):** Centralized mock datasets matching `aict_fdr_portal_schema.sql` tables with stable UUIDs and realistic attributes.

---

## 2. Global Security, Authentication & RLS Model

### Authentication
- Supabase Auth handles email/password and session management.
- User profile data is stored in `public.profiles` keyed by `auth.users.id`.
- Roles are granted via `public.role_assignments` referencing `public.app_role`:
  - `reviewer`, `aicte_admin`, `super_admin`, `auditor`: Central council roles.
  - `institution_admin`, `institution_staff`: Institution-scoped roles linked to `institution_id`.

### Row Level Security (RLS) Requirements
- **`financial_instruments`**:
  - Council roles (`reviewer`, `aicte_admin`, `super_admin`): `SELECT`, `UPDATE` allowed across all records.
  - Institution roles: `SELECT`, `INSERT` allowed where `institution_id = (SELECT institution_id FROM role_assignments WHERE user_id = auth.uid())`. Updates to submitted instruments are locked once status transitions beyond `DRAFT`.
- **`documents`**:
  - Storage bucket `fdr-documents` is strictly private.
  - RLS checks user permission before issuing signed URLs (maximum 15 minutes validity).
- **`release_refund_requests`**:
  - Institutions can create release requests for their own instruments.
  - Decision fields (`decision_by`, `decision_at`, `decision_reason`) can ONLY be updated by council roles via server actions or RLS restrictions.
- **`audit_logs`**:
  - Write-only from application triggers and service roles; immutable by ordinary users.

---

## 3. Feature & Page Integration Matrix

| Section / Route | Features & Workflow | Proposed Tables | Data Provider Functions | Future Supabase Query / Mutation | Status |
|---|---|---|---|---|---|
| **Home (`/`)** | Public landing, regulatory overview, public instrument tracker | `institutions`, `financial_instruments` | `getInstruments()`, `getInstitutions()` | Public RPC: `get_public_instrument_status(fdr_no)` (masked PII) | Built |
| **Login (`/login`)** | Auth gateway, role switching, credentials sign-in | `profiles`, `role_assignments`, `institutions` | `getCurrentUser()`, `setCurrentUser()` | `supabase.auth.signInWithPassword()` + role lookup | Built |
| **Official Dashboard (`/official/dashboard`)** | Overview counts, maturity alerts, pending queues | `financial_instruments`, `workflow_tasks`, `release_refund_requests` | `getDashboardMetrics()`, `getTasks()`, `getVerificationQueue()` | Aggregation queries with RLS | Built |
| **Verification Queue (`/official/verification`)** | Filterable list of submissions needing officer check | `financial_instruments`, `institutions` | `getVerificationQueue(filters)` | `.from('financial_instruments').select(...).in('verification_status', [...])` | Built |
| **Verification Detail (`/official/verification/[id]`)** | 3-way check (Submitted vs OCR vs Bank CBS), decision dialog | `financial_instruments`, `documents`, `verification_requests`, `verification_checks`, `lifecycle_events` | `getInstrumentById(id)`, `recordVerificationDecision()` | Transacted update: update `financial_instruments` + insert `lifecycle_events` + insert `audit_logs` | Built |
| **Discrepancy Review (`/official/discrepancies`)** | Mismatches, date variances, bank API timeouts | `verification_checks`, `financial_instruments` | `getDiscrepancies()` | `.from('verification_checks').select('*, financial_instruments(...)').in('status', ['FAIL', 'WARNING', 'ERROR'])` | Built |
| **Official Tasks (`/official/tasks`)** | Officer task queue, priorities, due dates | `workflow_tasks` | `getTasks(filters)` | `.from('workflow_tasks').select('*').order('due_at')` | Built |
| **Release Queue (`/official/release`)** | Clause 6.46 release/refund queue, clearances | `release_refund_requests`, `clearance_records` | `getReleaseRequests(filters)` | `.from('release_refund_requests').select('*, institutions(*), clearance_records(*)')` | Built |
| **Release Review (`/official/release/[id]`)** | Clearance check (Legal/Finance/Approval/RO), NOC approval | `release_refund_requests`, `clearance_records`, `documents` | `getReleaseRequestById(id)` | Update clearance record, finalize NOC reference, log audit event | Built |
| **Lifecycle History (`/official/lifecycle`)** | Audit timeline of instrument states & renewals | `lifecycle_events`, `financial_instruments` | `getInstruments()`, `getInstrumentById()` | `.from('lifecycle_events').select('*').order('event_date', { ascending: false })` | Built |
| **Notifications (`/official/notifications`)** | In-app alerts, maturity warnings, escalation notices | `notifications` | `getNotifications('reviewer')` | `.from('notifications').select('*').eq('recipient_user_id', auth.uid())` | Built |
| **Institution Dashboard (`/institution/dashboard`)** | Institution portfolio, active FDR value, upcoming actions | `financial_instruments`, `institutions` | `getDashboardMetrics('institution', instId)` | Scoped aggregation queries for institution | Built |
| **Institution Instruments (`/institution/instruments`)** | Deposit repository, status breakdown, details | `financial_instruments`, `documents` | `getInstruments({ institution_id })` | `.from('financial_instruments').select('*').eq('institution_id', userInstId)` | Built |
| **Institution New FDR (`/institution/instruments/new`)** | Multi-step deposit submission, joint lien declaration | `financial_instruments`, `documents`, `document_extractions` | `createInstrumentSubmission()` | Storage upload to bucket + insert `financial_instruments` (DRAFT/SUBMITTED) | Built |
| **Institution Renewals (`/institution/renewals`)** | Predecessor/successor instrument linkage | `financial_instruments` | `getInstruments()`, `getInstrumentById()` | `.from('financial_instruments').select('*').not('parent_instrument_id', 'is', null)` | Built |
| **Institution Release (`/institution/release`)** | Clause 6.46 application & Affidavit-6 upload | `release_refund_requests`, `release_request_documents` | `getReleaseRequests()`, `createReleaseRequest()` | Insert into `release_refund_requests` + link documents | Built |
| **Admin Console (`/admin/dashboard`)** | Platform metrics, queue backlog, sync errors | `institutions`, `profiles`, `audit_logs`, `integration_sync_logs` | `getInstitutions()`, `getAuditLogs()`, `getIntegrationLogs()` | System statistics queries | Built |
| **Admin Institutions (`/admin/institutions`)** | Manage institutions and role assignments | `institutions`, `role_assignments`, `profiles` | `getInstitutions()` | `.from('institutions').select('*, role_assignments(*)')` | Built |
| **Admin Audit Trail (`/admin/audit`)** | Immutable audit log viewer with correlation IDs | `audit_logs` | `getAuditLogs(filters)` | `.from('audit_logs').select('*').order('created_at', { ascending: false })` | Built |
| **Admin Integrations (`/admin/integrations`)** | Bank API gateway sync logs, latency, retry queue | `integration_sync_logs` | `getIntegrationLogs()` | `.from('integration_sync_logs').select('*').order('created_at', { ascending: false })` | Built |
| **Admin Settings (`/admin/settings`)** | Regulatory reminder thresholds (90, 60, 30, 7 days) | `system_settings` | `getSystemSettings()` | Update threshold parameters in configuration table | Built |

---

## 4. Sensitive Business Rules & Invariants

1. **Independent Lifecycle vs Verification vs Release Statuses:**
   - `instrument_lifecycle_status`, `verification_status`, and `release_status` are distinct enums and columns.
   - An instrument reaching maturity changes `lifecycle_status` to `MATURED`; it does NOT automatically approve release or mark compliance complete.
2. **Bank API Errors != Invalid FDRs:**
   - HTTP 504 / gateway timeouts are stored in `integration_sync_logs` with status `FAILED` and `verification_checks` with status `ERROR`.
   - Never mark `verification_status = 'REJECTED'` solely on a network or server fault.
3. **OCR Document Extraction != Authenticity Proof:**
   - Extraction fields in `document_extractions` require official human review and reconciliation before confirmation.
4. **Audit Trail Immutability:**
   - All state transitions produce `audit_logs` and `lifecycle_events` entries with `actor_user_id`, `correlation_id`, and explicit `reason`.
