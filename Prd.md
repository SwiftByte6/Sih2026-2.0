# Product Requirements Document (PRD)
## AICTE Security Deposit & Fixed Deposit Receipt (FDR) Management Portal

**Project Type:** Smart India Hackathon (SIH)  
**Product Category:** Government Workflow Automation / Financial Instrument Management  
**Document Version:** 1.0  
**Status:** Proposed Product Specification  
**Regulatory Reference:** AICTE Approval Process Handbook 2024–25 to 2026–27  
**Technology Stack:** Next.js App Router, TypeScript, Tailwind CSS, Supabase PostgreSQL, Supabase Auth, Supabase Storage  
**Integration Status:** Dummy bank-verification API for the initial implementation

---

# 1. Executive Summary

The AICTE Security Deposit & FDR Management Portal is a centralised digital platform designed to manage institution-wise security deposits and Fixed Deposit Receipts (FDRs) throughout their lifecycle.

The platform will replace fragmented record-keeping and manual tracking with structured instrument records, secure document storage, verification workflows, maturity monitoring, renewal and replacement tracking, release/refund processing, automated notifications, dashboards and a comprehensive audit trail.

The solution will support institution users who submit financial instrument information and authorised officials who verify records, review discrepancies, process requests and monitor outstanding actions.

The platform will use document extraction and rule-based validation to reduce repetitive manual work. Bank verification will initially use the existing dummy API, with a replaceable integration layer for future authorised bank integrations.

The product will be built as a modular application using Next.js and Supabase. It will prioritise reliable workflows, transparent decisions, data security and traceability over unnecessary architectural complexity.

## 1.1 Core Product Principle

Every financial instrument must have one canonical record connecting its institution, documents, verification results, lifecycle events, related renewal/replacement instruments, release requests and audit history.

The system must distinguish between:

- Information submitted by an institution.
- Information extracted from a document.
- Information verified through an external source.
- Decisions recorded by authorised officials.
- Actions confirmed as completed.

These states must never be treated as interchangeable.

---

# 2. Problem Statement

Managing security deposits and FDRs involves financial instrument records, supporting documents, verification, validity periods, renewal or replacement, and release/refund requests.

When these processes are fragmented across documents, spreadsheets, email and manual follow-ups, the following operational problems can arise:

1. Institution and instrument information may be difficult to retrieve centrally.
2. Supporting documents may be incomplete, duplicated or disconnected from the relevant record.
3. Instrument details may contain inconsistencies that require manual investigation.
4. Maturity dates and pending actions may be overlooked.
5. Renewal and replacement histories may be difficult to trace.
6. Release/refund requests may remain pending because of missing documents or clearances.
7. Officials may lack a consolidated view of pending verification and workflow tasks.
8. Important actions and decisions may be difficult to audit.
9. External integration failures may interrupt processing.
10. Sensitive financial records may require stronger access controls and document protection.

The portal addresses these problems through one connected, traceable workflow.

## 2.1 Product Goals

- Centralise institution-wise and instrument-wise records.
- Digitise supporting document management.
- Reduce manual effort during verification.
- Identify discrepancies and route them for review.
- Monitor maturity and lifecycle events.
- Maintain traceable renewal/replacement relationships.
- Standardise release/refund request processing.
- Improve visibility of pending tasks and required actions.
- Enforce role-based access and maintain audit history.
- Support reliable integration with the existing dummy bank API.

## 2.2 Non-Goals

The first version will not:

- Independently transfer or release money.
- Claim authenticity solely from OCR or AI output.
- Automatically approve an instrument or release request without the required authorised decision.
- Assume that every instrument follows the same regulatory workflow.
- Introduce blockchain, autonomous AI approvals or unnecessary microservices.
- Integrate with real bank systems without authorised access and documented interfaces.
- Replace the official AICTE approval system unless an authorised integration is explicitly available.

---

# 3. Regulatory and Evidence Principles

The product will use the uploaded AICTE Approval Process Handbook 2024–25 to 2026–27 as its primary regulatory reference.

Relevant reference points include:

- **Clause 1.12:** Security deposit requirements for specified new-institution scenarios.
- **Clause 2.25:** Grant of approval and related security-deposit provisions for applicable scenarios.
- **Clause 6.46, page 61:** Release of security deposit, including supporting documents, clearances and different outcomes for FDR/RPGF versus RTGS.
- **Affidavit-6, pages 191–192:** Release-of-security-deposit affidavit format and related declarations.

The applicable clause and scenario must be identified before a requirement is configured.

### Requirement classification

Every regulatory or workflow rule should be classified as one of the following:

- **Explicit requirement:** Directly supported by an applicable official source.
- **Implementation recommendation:** A product or engineering decision intended to support the workflow.
- **Unresolved:** Requires official clarification, additional documentation or confirmation of the applicable scenario.

The application must not hard-code unverified amounts, deadlines, document requirements, eligibility conditions or approval powers as official policy.

Where requirements differ by institution type, instrument type, approval scenario or applicable clause, the workflow must support configuration or explicitly identify the applicable scenario.

---

# 4. Stakeholders and User Roles

The following roles are proposed application roles. They must be mapped to actual operational responsibilities before production deployment.

## 4.1 Institution User

**Purpose:** Submit and manage records associated with an authorised institution.

Capabilities:

- View permitted institution information.
- Create and submit instrument records.
- Upload supporting documents.
- Review and correct extracted fields before submission.
- View verification results and discrepancies.
- Respond to requests for additional information.
- Submit renewal/replacement information.
- Submit release/refund requests.
- Track the status and history of submitted requests.

Restrictions:

- Cannot access unrelated institutions' restricted records.
- Cannot mark an instrument as verified without authorised verification.
- Cannot approve their own release request unless an explicitly authorised policy permits it.
- Cannot modify protected audit records.

## 4.2 Verification Officer

**Purpose:** Review instrument information and verification evidence.

Capabilities:

- View assigned verification tasks.
- Inspect submitted documents and extracted fields.
- View dummy bank API responses.
- Review discrepancies and duplicate warnings.
- Request clarification or additional evidence.
- Record verification decisions and reasons.
- View relevant instrument history.

Restrictions:

- Decisions must be limited to the officer's assigned permissions.
- Verification decisions must be audited.
- API failures must not be treated automatically as rejection.

## 4.3 Approving Official

**Purpose:** Process authorised workflow decisions.

Capabilities:

- Review assigned release/refund requests.
- Review supporting documents and clearance status.
- Record authorised decisions.
- Request additional information.
- Record approval or rejection with a reason.
- Confirm completion evidence where permitted.

Approval authority and separation-of-duties rules must be configured according to confirmed organisational policy.

## 4.4 Administrator

**Purpose:** Manage platform operations and access configuration.

Capabilities:

- Manage users and role assignments.
- Configure institution associations.
- Configure permitted workflow rules and reminder thresholds.
- Manage integration configuration.
- View operational and integration errors.
- Monitor system health and audit events.

Administrative access must not automatically confer authority to make regulatory decisions.

## 4.5 System and Background Workers

Automated processes perform:

- Scheduled maturity checks.
- Document extraction jobs.
- Notification delivery.
- Retry of eligible failed integration requests.
- Durable event processing.
- Operational status updates.

System-generated actions must be traceable and must not impersonate a human official.

---

# 5. Product Scope: The Ten Core Features

# Feature 1: Centralised Institution and FDR Repository

## 5.1 Objective

Maintain one authoritative application record for each institution and each financial instrument managed by the portal.

## 5.2 Functional Requirements

### FR-1.1 Institution records

The system shall store:

- Internal institution ID.
- Institution name.
- Institution type, where applicable.
- Address and relevant identifying information.
- Applicable approval or reference identifiers.
- Assigned users and permitted access scope.
- Record creation and update timestamps.

Only fields required for the intended workflow should be collected.

### FR-1.2 Financial instrument records

Each instrument shall have an internal unique identifier and support fields such as:

- FDR/instrument number.
- Instrument type.
- Bank name.
- Branch information.
- Holder/depositor information.
- Amount and currency.
- Issue/deposit date.
- Maturity date.
- Purpose or applicable deposit category.
- Relevant institution and approval references.
- Applicable lien, pledge, joint-holder or assignment details, where relevant.
- Source document references.
- Current lifecycle status.
- Verification status.
- Record creation and update timestamps.

The exact field requirements must depend on the instrument and applicable workflow.

### FR-1.3 Search and filtering

Users shall be able to search or filter authorised records by:

- Institution.
- Instrument number.
- Bank.
- Instrument type.
- Amount range.
- Maturity period.
- Lifecycle status.
- Verification status.
- Assigned officer, where permitted.

### FR-1.4 Record history

The system shall preserve significant changes and related lifecycle events.

A previously recorded instrument must not be overwritten merely because a renewal or replacement is submitted.

### FR-1.5 Duplicate prevention

The system shall identify potentially duplicate instrument submissions.

A duplicate match should create a warning or review task unless a confirmed rule authorises a stronger action. Similarity alone must not silently delete or reject a record.

## 5.3 Acceptance Criteria

- An authorised user can retrieve an institution and its linked instruments.
- Each instrument has a stable internal ID.
- Related documents and events can be accessed from the instrument record.
- Duplicate warnings identify the potentially conflicting records.
- Users cannot access records outside their authorised scope.

---

# Feature 2: Digital Document Management

## 5.4 Objective

Provide secure, structured storage for financial instrument documents and supporting evidence.

## 5.5 Functional Requirements

### FR-2.1 Document upload

The system shall support uploading applicable documents, including:

- FDR certificates.
- Deposit or payment evidence.
- Bank confirmation or verification documents, where required.
- Renewal/replacement documents.
- Release/refund supporting documents.
- Institution request letters.
- Affidavits, including Affidavit-6 where applicable.
- Other documents required by the configured workflow.

This list is not a universal mandatory checklist. Document requirements must be configurable by scenario.

### FR-2.2 Document metadata

For every document, the system shall record:

- Internal document ID.
- Institution and related instrument IDs, where applicable.
- Document category.
- Original filename.
- Storage path or object key.
- File type and size.
- Uploader and upload timestamp.
- Version or supersession information.
- Extraction-processing status.
- Access classification.

### FR-2.3 Secure storage

Documents shall be stored in private Supabase Storage buckets.

Access shall be authorised through the application's security model. Public file URLs must not expose sensitive documents.

### FR-2.4 Document extraction

Where supported, the system shall extract available text and fields from uploaded documents.

Extracted fields must be displayed for review before becoming confirmed structured information.

### FR-2.5 Document completeness

The system shall compare uploaded documents against the applicable workflow checklist.

Missing documents shall be visible to the submitting user and authorised reviewer.

### FR-2.6 Version history

When a corrected or replacement document is submitted, the system shall preserve the previous version or its audit reference according to the retention policy.

The system shall identify which version was used for a verification or decision.

## 5.6 Acceptance Criteria

- Documents are linked to the correct instrument or workflow request.
- Unauthorised users cannot retrieve private documents.
- Unsupported file types and invalid uploads are rejected.
- Replaced documents do not erase evidence used in earlier decisions.
- Missing-document warnings reflect the applicable checklist.

---

# Feature 3: FDR Verification and Discrepancy Detection

## 5.7 Objective

Reduce manual checking while ensuring that verification outcomes are supported by evidence.

## 5.8 Verification Pipeline

1. Validate the submitted form and required fields.
2. Store the uploaded document securely.
3. Extract available fields using PDF text extraction or OCR.
4. Show extracted values to the user for confirmation.
5. Compare submitted fields against extracted values.
6. Apply configured validation rules.
7. Check for possible duplicates.
8. Send a verification request to the dummy bank API.
9. Compare the response against the submitted instrument.
10. Record discrepancies, API errors and unresolved checks.
11. Route cases requiring a decision to an authorised officer.
12. Record the verification result and evidence.

## 5.9 Functional Requirements

### FR-3.1 Field validation

Validate:

- Required fields.
- Supported date formats.
- Numeric amount fields.
- Date consistency.
- Required relationships between institution and instrument records.
- Applicable configurable business rules.

### FR-3.2 Discrepancy detection

The system shall identify relevant mismatches, such as:

- Instrument number mismatch.
- Amount mismatch.
- Bank mismatch.
- Holder/depositor mismatch.
- Issue or maturity date mismatch.
- Missing or inconsistent supporting documents.
- Duplicate instrument references.

The discrepancy list must be configurable and should not imply that every mismatch is proof of fraud.

### FR-3.3 Dummy bank API

The application shall call the existing dummy bank-verification API using its actual documented interface.

The implementation must inspect the existing endpoint, authentication requirements, request schema, response schema and simulated outcomes before integration.

The system shall store:

- Request reference.
- Request timestamp.
- Response timestamp.
- Returned status.
- Relevant returned fields.
- Comparison result.
- Error details where appropriate.
- Retry information.

Secrets must remain server-side.

### FR-3.4 Verification outcomes

The verification workflow should distinguish:

- Not started.
- Processing.
- Pending external verification.
- Action required.
- Verified.
- Rejected after an authorised decision.
- Error or unavailable external service.

These are proposed application statuses, not official AICTE status terminology.

### FR-3.5 Human review

The officer shall be able to inspect the evidence, record a decision and provide a reason.

OCR output or a simulated bank response must never be represented as conclusive proof of authenticity.

## 5.10 Acceptance Criteria

- Field mismatches produce visible discrepancy records.
- The source of each compared value is identifiable.
- API timeouts and errors are distinct from negative verification results.
- A reviewer can inspect evidence and record a decision.
- Verification decisions are auditable.

---

# Feature 4: Validity and Maturity Tracking

## 5.11 Objective

Monitor instrument dates and surface records that require attention.

## 5.12 Functional Requirements

### FR-4.1 Scheduled monitoring

A background process shall periodically identify instruments approaching maturity, reaching maturity or requiring follow-up.

### FR-4.2 Configurable reminders

The system shall support configurable reminder thresholds.

Example demonstration thresholds may include 90, 60, 30 and 7 days before maturity. These are configuration examples, not official deadlines unless independently confirmed by an applicable source.

### FR-4.3 Maturity dashboard

The dashboard shall display:

- Upcoming maturity.
- Due or matured instruments.
- Instruments requiring review.
- Related pending renewal/replacement cases.
- Relevant outstanding actions.

### FR-4.4 Status correctness

Maturity shall not automatically imply renewal, release, closure or compliance.

The system shall preserve the distinction between the maturity date and the workflow decision.

### FR-4.5 Reminder history

Each reminder shall include:

- Instrument reference.
- Intended recipient.
- Trigger reason.
- Scheduled or generated timestamp.
- Delivery status.
- Retry information where applicable.

## 5.13 Acceptance Criteria

- Scheduled checks identify records based on configured thresholds.
- Duplicate reminders are controlled.
- Maturity events do not automatically approve a release or renewal.
- Dashboard totals reflect actual records.

---

# Feature 5: Renewal and Replacement Monitoring

## 5.14 Objective

Maintain traceability between original and subsequent instruments.

## 5.15 Functional Requirements

### FR-5.1 Renewal/replacement request

The system shall support recording:

- Previous instrument.
- New instrument, once created.
- Request type.
- Submission date.
- Supporting documents.
- Relevant dates and amounts.
- Reason or contextual information where required.

### FR-5.2 Instrument relationship

The system shall preserve a link between the original instrument and its successor.

The relationship must be queryable in both directions where appropriate.

### FR-5.3 Comparison

The system shall compare relevant old/new fields and flag configured inconsistencies.

### FR-5.4 Verification and authorisation

The new instrument must pass the applicable verification and authorisation process.

The old instrument must not be marked replaced merely because a new document has been uploaded.

### FR-5.5 Historical continuity

The system shall preserve:

- Old instrument details.
- New instrument details.
- Previous verification outcomes.
- Relevant documents.
- Lifecycle events.
- Decisions and timestamps.

## 5.16 Acceptance Criteria

- An officer can trace the entire instrument chain.
- Old records remain available according to the retention policy.
- The replacement relationship is not finalised prematurely.
- Differences between old and new records are visible.

---

# Feature 6: Security Deposit Release/Refund Workflow

## 5.17 Objective

Provide a structured, auditable process for submitting, reviewing and completing applicable release/refund requests.

The workflow shall use the relevant requirements in the AICTE Approval Process Handbook, including Clause 6.46 and Affidavit-6 where applicable.

## 5.18 Workflow Stages

1. Request initiated.
2. Instrument and institution linked.
3. Applicable document checklist generated.
4. Required documents uploaded.
5. Submission validation completed.
6. Required clearances tracked.
7. Request assigned for review.
8. Reviewer requests clarification or additional documents, if necessary.
9. Authorised decision recorded.
10. Applicable outcome or official evidence recorded.
11. Completion confirmed where supporting evidence is available.
12. Full history retained.

## 5.19 Functional Requirements

### FR-6.1 Release request creation

An authorised institution user shall be able to initiate a request against a relevant instrument.

The request shall record:

- Request ID.
- Institution.
- Instrument.
- Request type.
- Submission date.
- Submitted-by user.
- Applicable workflow category.
- Supporting documents.
- Current workflow status.

### FR-6.2 Applicable checklist

The system shall support the documents required for the relevant scenario.

For applicable Clause 6.46 FDR/RPGF release requests, the documented materials include:

- Institution's request letter.
- Affidavit-6 with relevant details.
- Copy of the FDR to be released and applicable security-deposit payment evidence.
- Latest LoA/EoA.

The applicable checklist must be confirmed against the instrument and scenario. Do not require every listed item for every type of release or instrument.

### FR-6.3 Clearance tracking

The system shall track required clearances from the relevant AICTE cells or bureaus where applicable.

Each clearance record shall include:

- Clearance type.
- Status.
- Responsible reviewer or team, where known.
- Date requested or recorded.
- Relevant evidence.
- Notes or reason for pending status.

The system shall not invent clearances or infer that a clearance exists when no evidence has been recorded.

### FR-6.4 Review and decision

The system shall support authorised decisions, such as:

- Request additional information.
- Return for correction.
- Approve, where authorised.
- Reject, where authorised.
- Record other applicable outcomes.

Each decision must include the actor, timestamp and relevant reason.

### FR-6.5 Outcome handling

The application shall distinguish the applicable documented outcome, including the NOC route for FDR/RPGF or sanction-order route for RTGS described in Clause 6.46.

The exact workflow must reflect the applicable scenario rather than applying one generic path.

### FR-6.6 Completion evidence

The system shall distinguish:

- Request submitted.
- Documents complete.
- Clearances recorded.
- Decision approved.
- Required outcome document issued or recorded.
- Final completion confirmed.

Approval alone shall not mean that the release/refund has physically completed.

The portal shall record actual completion evidence where available. It shall not claim to transfer funds unless a separate authorised integration actually performs that function.

## 5.20 Acceptance Criteria

- Release requests cannot bypass applicable required workflow steps.
- Missing documents and clearances are visible.
- Every decision is attributable to an authorised actor.
- The applicable release outcome is recorded.
- The system distinguishes approval from completion.
- The complete request history is auditable.

---

# Feature 7: Automated Notifications and Escalation

## 5.21 Objective

Notify the appropriate users when an action is required or a workflow changes.

## 5.22 Functional Requirements

The system shall support notifications for:

- New instrument submissions.
- Verification tasks.
- Discrepancy detection.
- Requests for additional information.
- Maturity reminders.
- Renewal/replacement tasks.
- Release/refund workflow changes.
- Missing documents.
- Pending clearance tasks.
- Overdue actions.

### Notification rules

- Events must be associated with a real instrument or workflow request.
- Recipients must be resolved from authorised assignments.
- Duplicate notifications must be controlled.
- Delivery failures must be recorded.
- Retries must be safe and idempotent.
- Escalation thresholds must be configurable.
- Every escalation must preserve the original task and its history.

Email or other delivery channels shall be enabled only when the required provider and configuration are available.

## 5.23 Acceptance Criteria

A workflow event produces the intended notification, delivery status is recorded, and repeated processing does not generate uncontrolled duplicates.

---

# Feature 8: Dashboards and Reports

## 5.24 Objective

Provide actionable visibility into institution records, verification work and lifecycle workflows.

## 5.25 Institution Dashboard

The institution user shall see, within their authorised scope:

- Total registered instruments.
- Instrument status distribution.
- Upcoming maturity.
- Verification results and unresolved discrepancies.
- Missing-document requests.
- Renewal/replacement status.
- Release/refund request status.
- Recent actions and notifications.

## 5.26 Official Dashboard

Authorised officials shall see:

- Instruments awaiting verification.
- Unresolved discrepancies.
- Records approaching maturity.
- Overdue tasks.
- Renewal/replacement cases requiring review.
- Release/refund requests awaiting documents.
- Release/refund requests awaiting clearance.
- Requests awaiting authorised decisions.
- Recently completed workflows.

## 5.27 Administrative Dashboard

Administrators shall see operational information such as:

- User and role configuration.
- Failed integration requests.
- Background job failures.
- Notification failures.
- Processing backlog.
- System operational status.

Administrative visibility must not automatically grant decision-making authority.

## 5.28 Reporting Requirements

Reports shall support appropriate filters and authorised export.

Potential reports include:

- Institution-wise instrument register.
- Instrument maturity report.
- Verification and discrepancy report.
- Renewal/replacement history.
- Release/refund request report.
- Pending-task report.
- Audit and integration-error report.

All figures must be derived from actual database records.

## 5.29 Acceptance Criteria

- Dashboard counts match underlying records.
- Role and institution scope are enforced.
- Filters produce correct results.
- Exports contain only authorised data.
- Reports do not invent missing values or conceal unresolved statuses.

---

# Feature 9: Audit Trail and Role-Based Access Control

## 5.30 Objective

Protect sensitive records and ensure important operations are traceable.

## 5.31 Functional Requirements

### FR-9.1 Authentication

Users must authenticate before accessing protected resources.

### FR-9.2 Authorisation

The application shall check permissions on the server and through Supabase Row Level Security.

The system must not rely only on frontend route visibility or hidden UI elements.

### FR-9.3 Institution isolation

Institution users shall only access institution records and related documents for which they have permission.

### FR-9.4 Audit events

Audit events shall capture relevant information such as:

- Actor.
- Action.
- Entity type and ID.
- Timestamp.
- Previous and new values where appropriate.
- Reason for significant decisions.
- Request or correlation reference where useful.

### FR-9.5 Audit protection

Ordinary users must not be able to edit or delete protected audit events.

Privileged access to audit data must itself be controlled.

### FR-9.6 Sensitive information

The system shall minimise unnecessary collection and exposure of personal and financial information.

### FR-9.7 Session and access security

Protected server routes, APIs and document retrieval shall validate authentication and authorisation.

## 5.32 Acceptance Criteria

- Unauthenticated users cannot access protected data.
- Users cannot perform actions outside their role.
- Institution boundaries are enforced at the data layer.
- Important changes create audit events.
- Audit data is not exposed through public storage or unrestricted APIs.

---

# Feature 10: Integration, Reliability and Data Security

## 5.33 Objective

Enable dependable operation with the existing technology stack and support future authorised integrations.

## 5.34 Functional Requirements

### FR-10.1 Integration adapter

Bank verification shall be accessed through a defined provider interface rather than being tightly coupled to a specific API endpoint.

### FR-10.2 Dummy bank API

The initial integration shall:

- Use the existing dummy API's actual contract.
- Validate request inputs.
- Validate and interpret returned fields.
- Record request and response references.
- Handle simulated positive, negative and error outcomes.
- Clearly identify simulated results.

The implementation must inspect the existing API before defining its adapter.

### FR-10.3 Failure handling

The system shall support:

- Request timeouts.
- Network errors.
- Invalid responses.
- Retryable failures.
- Non-retryable validation failures.
- Safe retry and idempotency.
- Visible integration-error records.

### FR-10.4 Background processing

Scheduled or background processing shall support:

- Document extraction.
- Maturity monitoring.
- Notifications.
- Integration retries.
- Durable event handling.

### FR-10.5 Durable event processing

Important database changes that require downstream processing should be recorded durably, using a transactional outbox or an equivalent reliable mechanism.

Event handlers shall be idempotent.

### FR-10.6 Future integrations

The architecture shall permit future authorised integrations with banks or relevant AICTE systems when documentation, access and permission become available.

The presence of an adapter does not imply that a real integration is operational.

### FR-10.7 Security and operations

The system shall support:

- HTTPS.
- Server-side secret management.
- Input validation.
- Private file storage.
- Access controls.
- Error logging.
- Backups and recovery procedures.
- Monitoring of background jobs and integration failures.

## 5.35 Acceptance Criteria

- API failures do not corrupt instrument records.
- Repeated events do not create duplicate requests or notifications.
- Sensitive secrets are not exposed to the browser.
- Integration results are traceable.
- A provider can be replaced without rewriting the entire verification workflow.

---

# 6. End-to-End Product Workflows

## 6.1 Workflow A: New FDR Submission

1. Institution user authenticates.
2. User selects the institution and begins a new instrument submission.
3. User uploads the FDR document.
4. System validates the file and stores it privately.
5. Document extraction runs.
6. Extracted fields are displayed for confirmation.
7. User corrects extraction errors and supplies required contextual information.
8. System validates the submission.
9. System checks for potential duplicates.
10. Instrument record is created or submitted according to the defined draft/submission model.
11. Bank verification is requested through the dummy API.
12. Results and discrepancies are recorded.
13. A case requiring review enters the officer queue.
14. An authorised officer reviews the evidence and records a decision.
15. The instrument lifecycle and verification statuses are updated independently.
16. Audit events and notifications are generated.

## 6.2 Workflow B: Verification Discrepancy

1. System identifies a discrepancy.
2. Discrepancy is associated with the instrument and verification attempt.
3. Instrument is marked as requiring action where appropriate.
4. An authorised reviewer receives a task.
5. Reviewer inspects the submitted document, extracted values and API result.
6. Reviewer requests clarification, records a supported decision or escalates the case.
7. Any correction is preserved in the record history.
8. Verification is repeated where required.
9. Final decision and supporting evidence are recorded.
10. Dashboard and notifications are updated.

## 6.3 Workflow C: Maturity Monitoring

1. Scheduled job selects eligible instruments.
2. Days remaining until maturity are calculated.
3. Configured reminder thresholds are evaluated.
4. Applicable notification events are generated.
5. Delivery status is recorded.
6. Dashboard displays upcoming and matured instruments.
7. Related renewal/replacement or release actions are tracked independently.

Maturity alone must not trigger an unauthorised release, replacement or compliance decision.

## 6.4 Workflow D: Renewal or Replacement

1. Institution user initiates a renewal/replacement submission.
2. Previous instrument is selected.
3. New instrument details and documents are provided.
4. System links the proposed successor to the original.
5. New document fields are extracted and validated.
6. Old/new fields are compared.
7. Discrepancies are flagged.
8. Required verification and review are performed.
9. Authorised completion is recorded.
10. Previous and new instrument histories remain accessible.
11. Notifications and dashboards are updated.

## 6.5 Workflow E: Release/Refund Request

1. Institution user initiates a request.
2. The relevant institution and instrument are linked.
3. The system identifies the applicable release workflow.
4. The corresponding document checklist is generated.
5. Institution user submits the required supporting evidence.
6. The system validates document completeness.
7. Missing documents are requested.
8. The request is routed for review.
9. Required clearances are tracked.
10. Authorised reviewers inspect the request.
11. The decision and reason are recorded.
12. The applicable official outcome, such as the relevant NOC or sanction-order route, is recorded.
13. Completion evidence is captured when available.
14. The request is marked complete only when the defined completion criteria are met.
15. Audit history, notifications and reports are updated.

## 6.6 Workflow F: Integration Failure

1. System submits a verification request.
2. External API times out or returns an invalid response.
3. The attempt is recorded as an integration error.
4. The instrument is not automatically marked invalid.
5. A retry is scheduled when appropriate.
6. Duplicate processing is prevented through idempotency.
7. If the problem persists, the case is surfaced for operational review.
8. A later successful attempt is recorded separately.
9. Final verification remains subject to the actual evidence and authorised workflow.

---

# 7. Proposed System Architecture

## 7.1 Architecture Style

Use a modular monolith for the first version.

This provides clear separation between business domains without requiring independent microservices, service-to-service authentication or distributed deployment complexity.

## 7.2 Application Layers

### Presentation layer

Next.js App Router pages and components for:

- Authentication.
- Institution dashboard.
- Institution management.
- Instrument register.
- Instrument detail.
- Document management.
- Verification queue.
- Maturity monitoring.
- Renewal/replacement.
- Release/refund requests.
- Official dashboard.
- Administration.
- Reports and audit views.

### Application/domain layer

Modules:

- Institutions.
- Financial instruments.
- Documents.
- Verification.
- Maturity.
- Renewals and replacements.
- Release/refund.
- Notifications.
- Reporting.
- Audit.
- Integrations.
- Authorisation.

### Data layer

Supabase PostgreSQL stores structured records and relationships.

Supabase Storage stores private documents.

Supabase Auth provides authentication.

Row Level Security and server-side authorisation enforce access restrictions.

### Background processing layer

Scheduled or worker processes handle:

- Document extraction.
- Maturity checks.
- Notification delivery.
- Integration retries.
- Event-outbox processing.

The implementation mechanism may be selected according to deployment constraints, but the business logic should remain independent of the scheduler.

## 7.3 Suggested Folder Structure

    src/
      app/
        (auth)/
          login/
          register/
        institution/
          dashboard/
          instruments/
          documents/
          requests/
        official/
          dashboard/
          verification/
          release-requests/
          tasks/
        admin/
          users/
          configuration/
          integrations/
          audit/
        api/
          instruments/
          documents/
          verification/
          release-requests/
          notifications/

      modules/
        institutions/
        instruments/
        documents/
        verification/
        maturity/
        renewals/
        releases/
        notifications/
        reports/
        audit/
        integrations/

      lib/
        supabase/
        authorization/
        validation/
        errors/
        logging/
        events/

      workers/
        document-processing/
        maturity-checks/
        notifications/
        event-outbox/
        integration-retries/

      types/
      components/

This is a proposed organisation. Adapt it to the existing repository rather than restructuring working code unnecessarily.

---

# 8. Database Design

## 8.1 Core Tables

### institutions

Suggested fields:

- `id`
- `name`
- `institution_type`
- `address`
- `approval_reference`
- `created_at`
- `updated_at`

### profiles

Suggested fields:

- `id`
- `auth_user_id`
- `display_name`
- `email`
- `created_at`
- `updated_at`

### role_assignments

Suggested fields:

- `id`
- `user_id`
- `role`
- `institution_id`, where applicable
- `created_at`

### financial_instruments

Suggested fields:

- `id`
- `institution_id`
- `instrument_number`
- `instrument_type`
- `bank_name`
- `branch_name`
- `holder_name`
- `amount`
- `currency`
- `issue_date`
- `maturity_date`
- `deposit_purpose`
- `approval_reference`
- `lien_details`
- `lifecycle_status`
- `verification_status`
- `created_by`
- `created_at`
- `updated_at`

Do not assume that every field is mandatory for every instrument. Use the applicable workflow to determine required fields.

### documents

Suggested fields:

- `id`
- `institution_id`
- `instrument_id`, where applicable
- `release_request_id`, where applicable
- `document_type`
- `storage_path`
- `original_filename`
- `mime_type`
- `file_size`
- `version`
- `uploaded_by`
- `created_at`

### document_extractions

Suggested fields:

- `id`
- `document_id`
- `extraction_status`
- `extracted_fields`
- `field_confidence`
- `reviewed_fields`
- `processing_error`
- `created_at`

Use a documented JSON structure for extraction output and validate it before accepting data into canonical instrument fields.

### verification_checks

Suggested fields:

- `id`
- `instrument_id`
- `verification_request_id`
- `check_type`
- `check_status`
- `expected_value`
- `observed_value`
- `discrepancy_details`
- `evidence_reference`
- `reviewed_by`
- `reviewed_at`
- `created_at`

### verification_requests

Suggested fields:

- `id`
- `instrument_id`
- `provider`
- `request_reference`
- `response_reference`
- `request_status`
- `response_payload`
- `error_code`
- `attempt_count`
- `created_at`
- `completed_at`

Store only necessary provider data, protect sensitive payloads and avoid recording credentials.

### lifecycle_events

Suggested fields:

- `id`
- `instrument_id`
- `event_type`
- `previous_status`
- `new_status`
- `related_instrument_id`
- `actor_id`
- `reason`
- `metadata`
- `created_at`

### release_refund_requests

Suggested fields:

- `id`
- `institution_id`
- `instrument_id`
- `request_type`
- `workflow_type`
- `workflow_status`
- `submitted_by`
- `assigned_to`
- `submitted_at`
- `decision`
- `decision_reason`
- `decision_by`
- `decision_at`
- `completion_evidence_document_id`
- `completed_at`
- `created_at`
- `updated_at`

### workflow_tasks

Suggested fields:

- `id`
- `institution_id`
- `instrument_id`
- `release_request_id`
- `task_type`
- `assigned_to`
- `task_status`
- `due_at`
- `completed_at`
- `created_at`

### notifications

Suggested fields:

- `id`
- `recipient_id`
- `event_type`
- `entity_type`
- `entity_id`
- `channel`
- `delivery_status`
- `attempt_count`
- `sent_at`
- `created_at`

### audit_logs

Suggested fields:

- `id`
- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `previous_values`
- `new_values`
- `reason`
- `correlation_id`
- `created_at`

### integration_sync_logs

Suggested fields:

- `id`
- `provider`
- `operation`
- `entity_id`
- `attempt_number`
- `status`
- `error_code`
- `started_at`
- `completed_at`

### outbox_events

Suggested fields:

- `id`
- `event_type`
- `entity_type`
- `entity_id`
- `payload`
- `created_at`
- `processed_at`
- `attempt_count`
- `processing_status`

## 8.2 Relationship Rules

- One institution can have multiple financial instruments.
- One instrument can have multiple documents.
- One instrument can have multiple verification attempts and checks.
- One instrument can have multiple lifecycle events.
- One instrument may be linked to a predecessor or successor instrument.
- One instrument may have multiple release/refund requests where the applicable process permits them.
- One release request can have multiple supporting documents, tasks, clearances and decisions.
- Significant changes should generate audit events.
- Notification and background-processing events should refer to stable entity IDs.

## 8.3 Status Model

Maintain separate status dimensions.

**Instrument lifecycle**

Examples:

`DRAFT`, `SUBMITTED`, `ACTIVE`, `EXPIRING`, `MATURED`, `RENEWAL_PENDING`, `REPLACEMENT_PENDING`, `RELEASE_PENDING`, `RELEASED`, `CLOSED`

**Verification**

Examples:

`NOT_STARTED`, `PROCESSING`, `PENDING_VERIFICATION`, `ACTION_REQUIRED`, `VERIFIED`, `REJECTED`, `ERROR`

**Release workflow**

Examples:

`NOT_REQUESTED`, `SUBMITTED`, `DOCUMENTS_PENDING`, `CLEARANCE_PENDING`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `COMPLETED`

These are proposed internal statuses. Their transitions must be validated against the actual workflows.

---

# 9. API and Integration Requirements

## 9.1 Internal API Domains

The application may expose authenticated server-side endpoints for:

- Institution records.
- Instrument creation and updates.
- Document upload and retrieval.
- Document extraction status.
- Verification initiation and results.
- Maturity and lifecycle information.
- Renewal/replacement submissions.
- Release/refund requests.
- Workflow decisions.
- Notifications.
- Reports.
- Audit and operational administration.

The final route design should match the existing codebase and security model.

## 9.2 Bank Verification Adapter

Define a provider abstraction with operations conceptually equivalent to:

- Verify instrument.
- Retrieve verification result where supported.
- Interpret provider errors.
- Normalise provider responses.
- Record integration evidence.

The dummy provider implements this interface first.

A future authorised provider can implement the same interface without requiring the entire application to change.

## 9.3 Integration Requirements

- Server-side API calls for sensitive operations.
- Request and response validation.
- Explicit timeouts.
- Retry policies for eligible failures.
- Idempotency keys or equivalent duplicate protection.
- Correlation IDs for tracing requests.
- Structured logs.
- Separation of provider errors from business verification outcomes.
- No exposure of secrets to the client.
- No claim of real bank verification when the result is simulated.

---

# 10. Non-Functional Requirements

## 10.1 Security

- Authenticate all protected operations.
- Enforce server-side authorisation and database RLS.
- Use private document storage.
- Protect credentials and environment secrets.
- Validate all input at system boundaries.
- Limit access to sensitive data.
- Record security-sensitive actions.
- Avoid trusting client-supplied role claims without validation.

## 10.2 Reliability

- Handle external API failures gracefully.
- Prevent duplicate background actions.
- Preserve submitted records when an external service is unavailable.
- Make failed jobs visible and retryable where appropriate.
- Maintain consistent status transitions.
- Avoid silently discarding errors.

## 10.3 Performance

- Paginate large instrument and audit lists.
- Index frequently filtered fields.
- Avoid loading full documents into list views.
- Use asynchronous processing for expensive extraction jobs.
- Avoid unnecessary database queries in dashboards.
- Measure actual performance before introducing additional infrastructure.

Performance targets should be set after establishing expected data volume and deployment constraints.

## 10.4 Maintainability

- Keep domain logic separate from UI components.
- Use shared validation schemas.
- Define typed API contracts.
- Centralise status transition logic.
- Keep provider-specific logic behind adapters.
- Use database migrations for schema changes.
- Maintain environment-specific configuration.

## 10.5 Accessibility and Usability

- Provide clear field labels and validation errors.
- Make workflow status understandable.
- Display discrepancies with their evidence and next action.
- Avoid relying on colour alone to communicate status.
- Ensure keyboard accessibility for core forms and tables.
- Provide useful empty, loading and error states.

## 10.6 Retention and Recovery

Define retention periods and recovery procedures with the relevant authority before production use.

The application should support backups and a documented recovery process appropriate to its deployment.

---

# 11. UI/UX Requirements

## 11.1 Design Direction

Use a professional, light-mode administrative interface suitable for institutional and government workflows.

Recommended characteristics:

- Clear hierarchy and restrained visual styling.
- Neutral backgrounds and accessible contrast.
- Consistent status indicators.
- Data tables with useful filtering and pagination.
- Clear document and verification panels.
- Explicit confirmation for sensitive actions.
- Responsive layouts.
- No unnecessary animations or decorative complexity.

## 11.2 Core Pages

### Authentication

- Login.
- Password recovery where supported.
- Access-denied state.

### Institution portal

- Dashboard.
- Institution profile.
- Instrument register.
- Create instrument.
- Instrument details.
- Upload documents.
- Verification results.
- Renewal/replacement.
- Release/refund request.
- Request history and notifications.

### Official portal

- Official dashboard.
- Verification queue.
- Instrument review.
- Discrepancy details.
- Assigned tasks.
- Release/refund queue.
- Request review and decisions.
- Lifecycle history.

### Administration

- User and role management.
- Institution access assignments.
- Workflow configuration.
- Integration health.
- Background job status.
- Audit log.
- Operational reports.

## 11.3 Instrument Detail Page

The instrument detail page should act as the central workspace.

It should include:

1. Instrument summary.
2. Institution and approval references.
3. Document list.
4. Extracted and confirmed field comparison.
5. Verification attempts and results.
6. Discrepancies and review notes.
7. Lifecycle timeline.
8. Renewal/replacement relationships.
9. Related release/refund requests.
10. Audit history.

The page must clearly distinguish submitted values, extracted values, external verification results and authorised decisions.

---

# 12. Error Handling and Edge Cases

The system must explicitly handle the following cases.

## 12.1 Document errors

- Unsupported file type.
- File too large.
- Upload interrupted.
- Extraction failed.
- Unreadable document.
- Missing required field.
- Duplicate document upload.
- Incorrect document linked to an instrument.

## 12.2 Verification errors

- Bank API timeout.
- Network failure.
- Invalid API response.
- Instrument not found in simulated data.
- Conflicting amount or dates.
- Duplicate instrument number.
- OCR value differs from the manually confirmed value.
- Verification remains pending.

## 12.3 Lifecycle errors

- Instrument reaches maturity without a renewal request.
- New instrument is submitted but not verified.
- Replacement amount or dates differ.
- A release request references the wrong instrument.
- Multiple requests concern the same instrument.
- An instrument is already marked released or closed.
- A status transition is not permitted.

## 12.4 Release/refund errors

- Required document missing.
- Affidavit or supporting evidence incomplete.
- Required clearance not recorded.
- Request returned for correction.
- Request rejected.
- Required outcome document unavailable.
- Approval recorded without completion evidence.
- External system unavailable.

The system must preserve the current valid state and create a visible task or error record rather than silently advancing the workflow.

---

# 13. Testing and Acceptance Strategy

## 13.1 Unit Testing

Test:

- Field validation.
- Date calculations.
- Status transitions.
- Discrepancy rules.
- Duplicate detection logic.
- Workflow checklist evaluation.
- Notification eligibility.
- Permission-check functions.

## 13.2 Integration Testing

Test:

- Supabase database operations.
- Authenticated API routes.
- RLS policies.
- Private Storage access.
- Dummy bank API integration.
- Document extraction processing.
- Scheduled maturity jobs.
- Notification delivery.
- Event-outbox processing.

## 13.3 End-to-End Testing

Test a complete instrument submission through verification and subsequent lifecycle monitoring.

Test a separate release/refund journey with missing documents, pending clearance, authorised decision and completion evidence.

## 13.4 Security Testing

Verify that:

- Unauthenticated requests are denied.
- Institution users cannot read unrelated institution records.
- Protected documents cannot be retrieved publicly.
- Users cannot submit decisions outside their role.
- Audit records cannot be modified through ordinary application access.
- API secrets are not present in browser responses.
- Invalid input cannot bypass workflow validation.

## 13.5 Minimum Acceptance Checklist

The first release is not ready until the following scenarios are tested:

- [ ] Create an institution and an instrument.
- [ ] Upload an FDR document securely.
- [ ] Extract fields and allow correction.
- [ ] Detect a mismatch.
- [ ] Detect a possible duplicate.
- [ ] Handle a dummy API success result.
- [ ] Handle a dummy API negative result.
- [ ] Handle an API timeout without falsely rejecting the instrument.
- [ ] Generate a maturity reminder.
- [ ] Link an old instrument to a replacement.
- [ ] Preserve the previous instrument history.
- [ ] Submit a release/refund request.
- [ ] Identify missing required documents.
- [ ] Track applicable clearances.
- [ ] Record an authorised decision.
- [ ] Distinguish approval from completion.
- [ ] Generate audit events.
- [ ] Enforce institution-level access restrictions.
- [ ] Display dashboard metrics from actual database data.
- [ ] Recover or retry an eligible failed background job without duplicate processing.

---

# 14. Implementation Roadmap

## Phase 0: Existing System Inspection

**Goal:** Avoid rebuilding existing functionality or inventing integration contracts.

Tasks:

- Inspect the current repository.
- Review existing database tables and migrations.
- Inspect the existing dummy bank API.
- Document request/response schemas and simulated outcomes.
- Identify existing authentication and storage implementation.
- Map current functionality against this PRD.
- Confirm unresolved regulatory requirements.

**Deliverable:** Repository gap analysis and implementation checklist.

## Phase 1: Core Foundation

Tasks:

- Configure Supabase Auth.
- Implement institution and role associations.
- Create institution and instrument schemas.
- Configure RLS.
- Set up private document storage.
- Implement instrument register and details.
- Add audit foundations.

**Deliverable:** Secure institution and instrument management.

## Phase 2: Document Submission and Verification

Tasks:

- Implement document upload.
- Build extraction pipeline.
- Add field confirmation and validation.
- Integrate the dummy bank API.
- Implement discrepancy detection.
- Build officer verification queue.
- Record decisions and verification evidence.

**Deliverable:** Working submission-to-verification workflow.

## Phase 3: Lifecycle Monitoring

Tasks:

- Implement maturity tracking.
- Configure scheduled checks.
- Add reminders and notification records.
- Implement renewal/replacement relationships.
- Preserve instrument history.
- Build lifecycle timeline.

**Deliverable:** End-to-end lifecycle monitoring.

## Phase 4: Release/Refund Workflow

Tasks:

- Implement release/refund requests.
- Add applicable checklist configuration.
- Implement document completeness validation.
- Track clearances and assigned tasks.
- Add authorised decision workflow.
- Record applicable outcome documents.
- Implement completion evidence and audit history.

**Deliverable:** Traceable release/refund processing.

## Phase 5: Dashboard and Operational Reliability

Tasks:

- Build institution and official dashboards.
- Implement database-backed metrics.
- Add filters and reports.
- Implement reliable event processing.
- Add retry and idempotency handling.
- Surface notification and integration failures.

**Deliverable:** Operationally usable portal.

## Phase 6: Validation and Demonstration Hardening

Tasks:

- Execute acceptance tests.
- Test role restrictions.
- Test error and recovery scenarios.
- Validate applicable workflow rules.
- Review audit completeness.
- Prepare realistic demonstration data.
- Confirm that simulated and real results are clearly distinguished.

**Deliverable:** Demonstration-ready SIH prototype.

---

# 15. Success Metrics

The following are proposed product metrics, not official AICTE performance targets.

- Percentage of submitted instruments with complete structured records.
- Percentage of documents successfully extracted and reviewed.
- Number of discrepancies detected and resolved.
- Number of maturity reminders generated and delivered.
- Number of renewal/replacement records with traceable relationships.
- Number of release requests with complete applicable workflow evidence.
- Number of requests awaiting documents or clearances.
- Percentage of significant actions with audit entries.
- Number of failed or retried integration requests.
- Number of unauthorised access attempts successfully blocked.
- Agreement between dashboard metrics and database records.

Baselines and numerical targets should be established after observing the initial implementation.

---

# 16. Key Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Incorrectly interpreting handbook requirements | Link rules to applicable clauses and maintain an unresolved-items register. |
| OCR extracting incorrect information | Require confirmation and preserve source values. |
| Dummy API being mistaken for real verification | Label simulated responses explicitly. |
| Release requests bypassing required steps | Use scenario-specific workflow checklists and controlled transitions. |
| Unauthorised document access | Use private storage, RLS and server-side authorisation. |
| Duplicate background actions | Use idempotency and durable event processing. |
| Incorrect lifecycle status | Separate lifecycle, verification and release-workflow statuses. |
| Overengineering before core functionality works | Use a modular monolith and prioritise end-to-end workflows. |
| Integration contract changing | Keep external provider logic behind an adapter. |
| Unclear responsibility for decisions | Map application roles to confirmed operational authority before production use. |

---

# 17. Assumptions and Open Questions

The following require confirmation before production implementation.

1. What are the exact request and response schemas of the existing dummy bank API?
2. Which institution and instrument types are in scope for the SIH demonstration?
3. Which clauses and scenarios apply to the selected release/refund journeys?
4. Which documents are mandatory for each applicable scenario?
5. Which official roles are authorised to verify, approve or complete each workflow?
6. What constitutes sufficient evidence of final release/refund completion?
7. Are any official bank or AICTE integrations available, documented and authorised?
8. What are the applicable data retention and recovery requirements?
9. Which reminder thresholds and escalation timelines should be configured?
10. What deployment environment and expected record volume must the system support?

These questions must be resolved through the relevant official documentation, system documentation or authorised stakeholders. They must not be answered by inventing policy.

---

# 18. Final Product Definition

The AICTE Security Deposit & FDR Management Portal is a secure, centralised workflow application that manages financial instrument records and their lifecycle through document management, verification, maturity monitoring, renewal/replacement, release/refund processing, notifications, dashboards, access control and integration reliability.

Its defining capability is not simply storing FDR PDFs. It is maintaining a **traceable, evidence-backed record of every instrument and every important action taken against it**.

The first implementation should demonstrate one complete, reliable journey:

**Institution submits an FDR → fields are extracted and confirmed → verification runs through the dummy bank API → discrepancies are reviewed → the instrument is monitored → a release/refund request follows its applicable checklist and clearance process → the outcome is recorded → the complete history is available in the audit trail and dashboard.**

All ten feature areas support this journey and remain within the established problem scope.

**Product priority:** correctness, traceability, secure access, transparent workflow states and a working end-to-end demonstration before optional complexity.