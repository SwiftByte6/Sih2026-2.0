# AICTE Security Deposit & Fixed Deposit Receipt (FDR) Management Portal
## Flagship Feature: AICTE Intelligence Hub — Automated AI Document Verification

> **Project:** AICTE Security Deposit & FDR Management Portal (Smart India Hackathon - SIH)  
> **Status:** Production-Ready & SIH Demonstration Flagship  
> **Technology Stack:** Next.js 16 (App Router), JavaScript, Tailwind CSS v4, Google GenAI SDK (`@google/genai`), Supabase (PostgreSQL, Auth, Storage)  
> **Statutory Source:** AICTE Approval Process Handbook (APH) 2024–25 to 2026–27 (Clauses 2.25, 6.46, 7.7, Affidavit-3, Affidavit-6)

---

## 1. Executive Overview

The **AICTE Security Deposit & FDR Management Portal** digitizes, automates, reconciles, and audits mandatory security deposits (Fixed Deposit Receipts - FDRs and RPGF deposits) encumbered jointly in favor of the Member Secretary, AICTE by technical educational institutions across India.

### Flagship Innovation: AICTE Intelligence Hub
The **AICTE Intelligence Hub** is the central verification and regulatory intelligence engine of the application. It brings together:
1. **Multi-Modal Document Intelligence:** Server-side multimodal extraction for technical institution PDF documents (FDR Certificates, notarized Affidavit-6, Letter of Approval / Extension of Approval, and release request letters) with structured field extraction, page/location coordinates, and field confidence indicators.
2. **Deterministic Cross-Document Verification:** Objective, server-side cross-checks comparing claimed values against extracted certificate evidence and case records across 5 standard verification checks.
3. **Regulatory Rules Engine:** Grounded strictly in the statutory provisions of the **AICTE Approval Process Handbook 2024–25 to 2026–27**:
   - **Clause 2.25 (Page 31):** Mandatory security deposit term, joint encumbrance in favor of Member Secretary AICTE, and timeline enforcement.
   - **Clause 6.46 (Page 61):** Release requirements for 10-year completed lock-in term, multi-cell clearances dependency (Legal, Approval, Finance, Regional), and statutory NOC conditions.
   - **Clause 7.7 (Page 73):** Deposit violations (premature liquidation, unauthorized encumbrance, misrepresentation, amount discrepancies) and corresponding sanctions.
   - **Affidavit 3:** Mandatory joint lien declaration and establishment provisions.
   - **Affidavit 6 (Pages 191–192):** Statutory 5-clause release declarations (10-year term completion, no pending court litigation, no faculty/staff dues, no student grievances, indemnification of the Council).
4. **Auditable Reviewer Workflow:** Reviewers can acknowledge findings, dispatch correction notices, or record clearance resolutions—all updating immutable audit logs and case activity timelines without ever automatically releasing funds or approving cases without human authorization.

---

## 2. System Architecture

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    Next.js UI                          │
                               │  - /official/intelligence (Flagship Intelligence Hub)  │
                               │  - /official/release/[id] (Embedded Case Verification) │
                               │  - /official/dashboard (Spotlight & KPIs)              │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                                                           ▼
                               ┌────────────────────────────────────────────────────────┐
                               │               API Intelligence Layer                   │
                               │  - POST /api/intelligence/analyze                      │
                               │  - POST /api/intelligence/action                       │
                               └───────────┬────────────────────────────────┬───────────┘
                                           │                                │
                 ┌─────────────────────────┴──────────┐   ┌─────────────────┴───────────┐
                 │    lib/intelligence/               │   │     lib/dataService.js      │
                 │    - geminiProvider.js             │   │  (Unified Gateway Layer)    │
                 │    - crossDocumentVerifier.js      │   └──────┬──────────────────┬───┘
                 │    - regulatoryRules.js            │          │                  │
                 │    - adapterContract.js            │          ▼                  ▼
                 └────────────────────────────────────┘   Demo Store        Live Supabase
                                                          (mockData.js)     (dataLive.js)
```

---

## 3. The 3 Repeatable Demonstration Scenarios

The portal includes 3 repeatable, pre-configured test scenarios based on synthetic fixtures located in `public/AICTE_FDR_Demo_PDF_Pack/`:

| Scenario | Institution & Instrument | Key Characteristics | Expected Outcome |
|---|---|---|---|
| **Scenario 1: Consistent Release Case** | Delhi Institute of Engineering & Technology (`rel-001` / `fdr-008`, ₹30 Lakh, Union Bank of India) | 10-year lock-in period satisfied (2016-08-01 to 2026-08-01). Notarized Affidavit-6, official request letter, and current EoA verified. | **Consistent Verified (All 5 Checks Pass).** Compliant under Clauses 2.25, 6.46, and Affidavit-6. Ready for multi-cell clearances. |
| **Scenario 2: Amount Mismatch & Missing Evidence** | Vivekananda College of Technology & Management (`rel-002` / `fdr-003`, Canara Bank) | Application claims ₹50,00,000, but Affidavit-6 declares ₹45,00,000 (₹5,00,000 variance). Latest Extension of Approval (EoA) is missing from submission pack. | **Discrepancy Detected & Missing Evidence.** Flagged under Clause 6.46 and Clause 7.7. Reviewer dispatches correction request. |
| **Scenario 3: Conditional Litigation Flag** | Delhi Institute (`rel-003` / `fdr-002`, Punjab National Bank, ₹15 Lakh) | Deposit has 5-day date offset in bank record. Affidavit-6 contains conditional reservation citing pending High Court litigation (WP-8821/2025). | **Requires Human Review Mandatory.** Flagged under Clause 6.46 and Affidavit-6. Automatic clearance prohibited; escalated to Legal Cell. |

### Live AI vs. Seeded Demo Mode Indicator
The application clearly labels the execution engine:
- **`AI Document Intelligence (Live Analysis)`:** Active when API key is configured and live document parsing is triggered.
- **`Simulated Demo Intelligence Engine (Seeded Fixture Scenario)`:** Active in offline demo mode, showing pre-computed verified fixtures with explicit sandbox tags.
- **Zero Silent Fallback:** If the AI service fails (rate limit, timeout, or invalid credentials), the application displays an explicit error alert with retry options; it never silently presents mock findings as live AI analysis.

---

## 4. Deterministic Cross-Document Checks

The server-side verification engine executes 5 deterministic checks:
1. `FDR_VS_AFFIDAVIT_AMOUNT`: Compares FDR certificate amount against declared amount in Affidavit-6 and application record.
2. `INSTITUTION_AND_HOLDER_NAME`: Cross-checks institution name and AICTE joint encumbrance title across documents.
3. `LOCK_IN_PERIOD_AND_MATURITY`: Evaluates issue date and maturity date against the 10-year statutory requirement under Clause 6.46.
4. `DOCUMENT_COMPLETENESS`: Verifies that all 4 mandatory statutory documents under Clause 6.46 are catalogued (FDR Copy, Affidavit 6, Request Letter, and latest EoA/LoA).
5. `AFFIDAVIT_DECLARATIONS_REVIEW`: Scrutinizes sworn statements regarding pending litigation, faculty salary arrears, and council indemnity.

Outcome representations:
- `Consistent`
- `Discrepancy detected`
- `Missing evidence`
- `Unable to verify`
- `Requires human review`

---

## 5. Domain & Security Invariants

1. **AI Supportive Evidence Rule:** Document extractions and confidence scores represent supportive verification data; human official authorization and multi-cell clearances are strictly mandatory for deposit release.
2. **Never Auto-Release:** Reaching maturity or obtaining clean AI analysis **never** triggers automated fund release, renewal, or NOC authorization.
3. **Bank API Timeout Rule:** External bank API gateway timeouts (HTTP 504) or communication errors are treated strictly as integration errors—**never as evidence that an FDR is invalid**.
4. **Server-Side API Keys:** `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are strictly confined to server-side code and route handlers. They are never exposed to browser bundles or client responses.
5. **No False Fund Claims:** Issuing an official NOC records an authorized regulatory release decision; it is never misrepresented as an automated banking fund transfer.

---

## 6. Getting Started

### Prerequisites
- Node.js >= 18 (Node 24 recommended)
- `pnpm` >= 9 (`pnpm -v`)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd y

# Install dependencies using pnpm
pnpm install
```

### Environment Configuration (`.env.local`)
Create or edit `.env.local`:
```env
# Operational Mode: 'demo' (offline SIH sandbox) or 'live' (Supabase connected)
NEXT_PUBLIC_DATA_MODE=demo

# Google Gemini API Key (Required for live Gemini Document Intelligence)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Credentials (Required only for Live Mode)
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=fdr-documents
```

### Running the Application
```bash
# Launch Next.js development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **AICTE Intelligence Hub:** Navigate to `http://localhost:3000/official/intelligence` or click the sidebar link.
- **Embedded Release Case:** Navigate to `http://localhost:3000/official/release/rel-001` to test the integrated case review workflow.
- **Persona Switcher:** Use the quick-switcher in the top/sidebar to switch between Official Reviewer, Technical Institution, and Council Admin roles.

---

## 7. Verification & Code Quality

```bash
# Run ESLint (0 errors, 0 warnings)
pnpm lint

# Build production bundle (Turbopack)
pnpm build
```
