# AICTE Security Deposit & FDR Management Portal — Backend Integration Specification & Audit

> **File:** `README_BACKEND.md` (Project Root)  
> **Status:** Live & Continuously Maintained  
> **Target Stack:** Next.js App Router, JavaScript, Tailwind CSS, Supabase PostgreSQL, Supabase Auth, Supabase Storage  
> **Database Schema:** `aict_fdr_portal_schema.sql`  
> **Regulatory Reference:** AICTE Approval Process Handbook (Clauses 1.12, 2.25, 6.46, Affidavit-6)  

---

## 1. System Architecture: Dual Data Source (Demo Mode vs Live Mode)

The application maintains **one unified frontend** operating against **two explicit data modes**:

```
                              ┌────────────────────────────────────────┐
                              │             Next.js UI                 │
                              │ (Pages, Layouts, Shared Components)    │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │           lib/dataService.js           │
                              │      (Unified Gateway Interface)       │
                              └───────┬────────────────────────┬───────┘
                                      │                        │
       [NEXT_PUBLIC_DATA_MODE=demo]   │                        │   [NEXT_PUBLIC_DATA_MODE=live]
                                      ▼                        ▼
                      ┌──────────────────────┐   ┌───────────────────────────┐
                      │   lib/mockData.js    │   │  lib/supabase/dataLive.js │
                      │  (Predictable SIH    │   │   (Supabase PostgreSQL,   │
                      │   Demo Simulation)   │   │   Auth & Private Storage) │
                      └──────────────────────┘   └───────────────────────────┘
```

### Mode Invariant Rules
1. **Demo Mode (`NEXT_PUBLIC_DATA_MODE=demo`):**
   - Active by default if Supabase keys are not configured.
   - Runs offline without network dependencies.
   - Preserves all preloaded sample records, charts, discrepancy cases, and mock verification flows.
   - Clearly flags all outputs with `Simulated Sandbox` badges.
2. **Live Mode (`NEXT_PUBLIC_DATA_MODE=live`):**
   - Active when configured via `.env.local`.
   - Connects to Supabase Auth, PostgreSQL tables, and private Storage buckets.
   - Enforces PostgreSQL Row Level Security (RLS) and server-side authorization.
   - **No Silent Fallback Rule:** If a Supabase live query or mutation fails, the application returns a real error state to the user. It **never silently falls back to mock data** following a backend error.

---

## 2. Technical Audit of Current State

### A. Database Schema (`aict_fdr_portal_schema.sql`)
- **Tables (17 total):** `profiles`, `institutions`, `role_assignments`, `institution_members`, `financial_instruments`, `documents`, `document_extractions`, `verification_requests`, `verification_checks`, `lifecycle_events`, `release_refund_requests`, `release_request_documents`, `clearance_records`, `workflow_tasks`, `notifications`, `audit_logs`, `integration_sync_logs`, `outbox_events`.
- **Enums:** `app_role`, `instrument_type`, `instrument_lifecycle_status`, `verification_status`, `document_type`, `document_processing_status`, `release_status`, `task_status`, `task_priority`, `notification_status`, `clearance_status`, `outbox_status`.
- **Row Level Security (RLS):** Deny-by-default enabled on all 17 tables with helper functions:
  - `has_role(public.app_role[])`
  - `is_institution_member(uuid)`
- **Schema Gaps Identified & Addressed:**
  - Need a dedicated `seed.sql` script to populate identical initial reference records into Supabase for live parity.
  - Need private Storage bucket creation script for `fdr-documents` with signed-URL RLS access.
  - Verification transaction function `record_verification_decision` to atomically update instrument status, insert lifecycle events, and record audit logs.

### B. Authentication & Role Architecture
- **Supabase Auth Integration:**
  - Client side: `@supabase/ssr` `createBrowserClient`
  - Server side: `@supabase/ssr` `createServerClient` with Next.js cookie handling
- **Trusted Role Resolution:**
  - Client cannot claim its own role. Roles are resolved strictly server-side by joining `auth.users.id` with `public.role_assignments` and `public.profiles`.
  - Scopes:
    - Central: `reviewer`, `aicte_admin`, `super_admin`, `auditor`
    - Institution: `institution_admin`, `institution_staff` (restricted to assigned `institution_id`)

### C. Storage & Document Privacy
- **Bucket:** `fdr-documents` (private, non-public).
- **Access Rule:** Financial documents (FDR scans, payment proofs, Affidavit-6) require an authorized session. Documents are accessed exclusively via temporary signed URLs (maximum 15 minutes TTL).

---

## 3. Page & Feature Backend Integration Checklist

| Section / Route | Features & Workflow | Proposed Database Tables | Data Provider Functions | Live Mode Supabase Implementation | Demo Mode Fallback | Status |
|---|---|---|---|---|---|---|
| **Foundation** | Supabase Clients, Env, Auth & Mode Dispatcher | `profiles`, `role_assignments` | `getDataMode()`, `getSupabaseClient()` | `@supabase/ssr` Browser & Server clients + cookies | Built-in Mock Auth State | **Phase A (Completed)** |
| **Verification Queue** (`/official/verification`) | Multi-filter FDR queue (status, bank, search) | `financial_instruments`, `institutions` | `getInstruments(filters)` | `.from('financial_instruments').select('*, institutions(*)').range(...)` | `MOCK_INSTRUMENTS` filter | **Phase B (Completed)** |
| **Verification Details** (`/official/verification/[id]`) | 3-Way Reconciliation & Decision Recording | `financial_instruments`, `documents`, `verification_checks`, `lifecycle_events`, `audit_logs` | `getInstrumentById(id)`, `recordVerificationDecision()` | RPC / Transaction: Update instrument + insert `lifecycle_events` + insert `audit_logs` | Centralized `mockData.js` updates | **Phase B (Completed)** |
| **Official Dashboard** (`/official/dashboard`) | Metrics, queue summary, assigned tasks | `financial_instruments`, `workflow_tasks`, `release_refund_requests` | `getDashboardMetrics()`, `getVerificationQueue()`, `getTasks()` | Aggregation count queries with RLS scope | Computed from `MOCK_INSTRUMENTS` | **Phase C (Completed)** |
| **Discrepancy Review** (`/official/discrepancies`) | Mismatches, date variances, gateway errors | `verification_checks`, `financial_instruments` | `getDiscrepancies()` | `.from('verification_checks').select('*, financial_instruments(*)').in('status', ['FAIL', 'WARNING', 'ERROR'])` | `MOCK_VERIFICATION_CHECKS` | **Phase C (Completed)** |
| **Workflow Tasks** (`/official/tasks`) | Officer task management, status transitions | `workflow_tasks` | `getTasks()`, `updateTaskStatus()` | `.from('workflow_tasks').select('*').order('due_at')` | `MOCK_TASKS` in-memory transitions | **Phase C (Completed)** |
| **Release Queue & Review** (`/official/release`, `/[id]`) | Clause 6.46 multi-cell clearances & NOC approval | `release_refund_requests`, `clearance_records`, `documents` | `getReleaseRequests()`, `getReleaseRequestById()`, `updateClearance()`, `approveRelease()` | Transacted release status updates and clearance resolutions | `MOCK_RELEASE_REQUESTS`, `MOCK_CLEARANCES` | **Phase C (Completed)** |
| **Lifecycle History** (`/official/lifecycle`) | Complete instrument timeline and renewal chains | `lifecycle_events`, `financial_instruments` | `getInstruments()`, `getInstrumentById()` | `.from('lifecycle_events').select('*').order('event_date', { ascending: false })` | `MOCK_LIFECYCLE_EVENTS` | **Phase C (Completed)** |
| **Notifications** (`/official/notifications`) | In-app alerts, maturity notices, read toggles | `notifications` | `getNotifications()`, `markNotificationRead()`, `markAllNotificationsRead()` | `.from('notifications').select('*').eq('recipient_user_id', auth.uid())` | `MOCK_NOTIFICATIONS` read toggles | **Phase C (Completed)** |
| **Institution Dashboard & FDRs** (`/institution/...`) | Portfolio summary, new FDR upload & OCR review, renewal tracking, Affidavit-6 release | `financial_instruments`, `documents`, `document_extractions`, `release_refund_requests` | `getInstruments()`, `createInstrument()`, `sendClarification()`, `createReleaseRequest()` | Scoped queries by `institution_id`, private document uploads, live inserts | Scoped mock data & in-memory creation | **Phase D (Completed)** |
| **Admin Console & Audit** (`/admin/...`) | Users, institutions, immutable audit inspection, bank sync diagnostics, settings | `institutions`, `profiles`, `audit_logs`, `integration_sync_logs`, `system_settings` | `getInstitutions()`, `getAuditLogs()`, `getIntegrationLogs()`, `updateSystemSettings()`, `triggerBankPingDiagnostic()` | Admin-scoped queries, diagnostic pings, audit trails | `MOCK_AUDIT_LOGS`, `MOCK_INTEGRATION_LOGS` | **Phase E (Completed)** |

---

## 4. Critical Business & Verification Invariants

1. **Independent Statuses:**
   - `instrument_lifecycle_status` (DRAFT → ACTIVE → EXPIRING → MATURED → RELEASE_PENDING → RELEASED)
   - `verification_status` (NOT_STARTED → PROCESSING → PENDING_VERIFICATION → ACTION_REQUIRED → VERIFIED / REJECTED / ERROR)
   - `release_status` (NOT_REQUESTED → SUBMITTED → DOCUMENTS_PENDING → CLEARANCE_PENDING → UNDER_REVIEW → APPROVED → COMPLETED)
2. **Bank API Error Rule:**
   - Bank API gateway timeouts (HTTP 504) or connection errors are recorded as `status = 'ERROR'` in `verification_checks` and `integration_sync_logs`.
   - **An API failure is an external service error, NOT proof that an FDR is invalid.**
3. **OCR Extraction Evidence Rule:**
   - OCR extractions in `document_extractions` are treated as supportive evidence, never automated conclusive proof. Human official verification is mandatory.
4. **Maturity Rule:**
   - Reaching the deposit maturity date transitions `lifecycle_status` to `MATURED`. It does **not** trigger automatic release, renewal, or compliance fulfillment.
5. **Fund Transfer Representation:**
   - The portal records official decisions and generates NOCs; it never misrepresents a recorded workflow decision as an actual completed banking fund transfer.
6. **Zero Silent Fallback:**
   - Failures in live mode trigger explicit error alerts, never silent substitution of mock records.
