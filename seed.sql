-- AICTE Security Deposit & FDR Management Portal
-- Seed Data for Supabase PostgreSQL
-- Run this in your Supabase SQL Editor after applying aict_fdr_portal_schema.sql

begin;

-- 1. INSTITUTIONS
insert into public.institutions (id, aicte_institution_id, institution_name, institution_type, state, district, city, address, pincode, official_email, official_phone, status)
values
  ('11111111-1111-1111-1111-111111111101', '1-109283741', 'Delhi Institute of Engineering & Technology', 'Engineering & Technology (UG/PG)', 'Delhi', 'South Delhi', 'New Delhi', 'Sector 14, Institutional Area, Pushp Vihar, New Delhi - 110017', '110017', 'contact@diet-delhi.edu.in', '011-29561000', 'ACTIVE'),
  ('11111111-1111-1111-1111-111111111102', '1-209841235', 'Vivekananda College of Technology & Management', 'Technical & Management Institute', 'Tamil Nadu', 'Chennai', 'Chennai', '42, OMR IT Highway, Sholinganallur, Chennai - 600119', '600119', 'admin@vctm-chennai.ac.in', '044-24501234', 'ACTIVE'),
  ('11111111-1111-1111-1111-111111111103', '1-301928472', 'Maharashtra Academy of Polytechnic & Research', 'Diploma & Polytechnic', 'Maharashtra', 'Pune', 'Pune', 'Survey No. 89, Paud Road, Kothrud, Pune - 411038', '411038', 'info@mapr-pune.org', '020-25439870', 'ACTIVE'),
  ('11111111-1111-1111-1111-111111111104', '1-409182736', 'Kalinga Institute of Technological Studies', 'Engineering & Architecture', 'Odisha', 'Khordha', 'Bhubaneswar', 'Plot 12, Chandaka Industrial Estate, Patia, Bhubaneswar - 751024', '751024', 'registrar@kits-odisha.ac.in', '0674-2725000', 'ACTIVE'),
  ('11111111-1111-1111-1111-111111111105', '1-508273641', 'Punjab Technical Institute of Applied Sciences', 'Engineering & Applied Sciences', 'Punjab', 'SAS Nagar (Mohali)', 'Mohali', 'Phase 8, Industrial Area, Sector 73, Mohali - 160071', '160071', 'dean@ptias-mohali.edu.in', '0172-2298710', 'ACTIVE')
on conflict (id) do nothing;

-- 2. FINANCIAL INSTRUMENTS
insert into public.financial_instruments (id, institution_id, instrument_type, instrument_reference, bank_name, bank_branch, bank_ifsc, account_holder_name, fdr_number, amount, currency, issue_date, effective_date, maturity_date, lien_marked, lien_details, purpose, lifecycle_status, verification_status, notes)
values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'FDR', 'FDR-2024-ND-001', 'State Bank of India', 'Pushp Vihar Branch, New Delhi (01234)', 'SBIN0001234', 'Delhi Institute of Engineering & Technology & AICTE Joint Lien', 'SBI-FDR-9823410294', 3500000.00, 'INR', '2023-08-15', '2023-08-15', '2028-08-15', true, 'Jointly encumbered in favor of Member Secretary, AICTE, New Delhi and Delhi Institute of Engineering & Technology', 'Mandatory Security Deposit under Clause 1.12 for UG Engineering Program Establishment', 'ACTIVE', 'VERIFIED', 'Verified against State Bank of India CBS simulation.'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'FDR', 'FDR-2024-ND-002', 'Punjab National Bank', 'Saket Branch, New Delhi (04561)', 'PUNB0045610', 'Delhi Institute of Engineering & Technology', 'PNB-FDR-4481029311', 1500000.00, 'INR', '2024-03-15', '2024-03-15', '2027-03-15', true, 'Marked with AICTE Joint Lien in submitted application', 'Additional Security Deposit for Introduction of New AI & Data Science Course', 'SUBMITTED', 'ACTION_REQUIRED', 'Discrepancy detected: Extracted issue date is 2024-03-15; Bank CBS simulated response reported issue date as 2024-03-10.'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111102', 'FDR', 'FDR-2024-CH-003', 'Canara Bank', 'Sholinganallur Branch, Chennai (00349)', 'CNRB0000349', 'Vivekananda College of Technology & AICTE', 'CNRB-FDR-7712093845', 5000000.00, 'INR', '2024-10-01', '2024-10-01', '2029-10-01', true, 'Joint Lien in favor of AICTE as per Approval Process Handbook', 'Security Deposit for Integrated Campus Approval', 'SUBMITTED', 'PENDING_VERIFICATION', 'Documents queued for initial verification review by officer.'),
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111103', 'FDR', 'FDR-2024-PN-004', 'Bank of Baroda', 'Kothrud Branch, Pune (09823)', 'BARB0KOTHRU', 'Maharashtra Academy of Polytechnic & AICTE Joint Lien', 'BOB-FDR-3329018471', 2500000.00, 'INR', '2024-02-10', '2024-02-10', '2027-02-10', true, 'Joint lien registered with Bank of Baroda', 'Polytechnic Security Deposit Maintenance', 'SUBMITTED', 'ERROR', 'External verification failed: Bank API gateway timed out (HTTP 504). Please note: API timeout is NOT proof of invalid FDR. Retry queued.')
on conflict (id) do nothing;

-- 3. VERIFICATION CHECKS
insert into public.verification_checks (id, instrument_id, check_type, status, expected_value, observed_value, message, is_simulated)
values
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 'INSTRUMENT_NUMBER', 'PASS', '"SBI-FDR-9823410294"', '"SBI-FDR-9823410294"', 'FDR reference matches Bank CBS record exactly.', true),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', 'DEPOSIT_AMOUNT', 'PASS', '3500000.0', '3500000.0', 'Deposit amount of ₹35,00,000 matches both OCR certificate and CBS ledger.', true),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222202', 'ISSUE_DATE_ALIGNMENT', 'FAIL', '"2024-03-15"', '"2024-03-10"', 'Institution submitted issue date 15-Mar-2024; Core Banking record states 10-Mar-2024. 5-day variance detected.', true),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222204', 'BANK_INTEGRATION_CHECK', 'ERROR', '"HTTP 200 SUCCESS"', '"HTTP 504 GATEWAY TIMEOUT"', 'External bank gateway timed out. This is a system connectivity fault, NOT evidence of an invalid FDR.', true)
on conflict (id) do nothing;

-- 4. RELEASE & REFUND REQUESTS
insert into public.release_refund_requests (id, institution_id, instrument_id, request_reference, request_type, status, applicable_rule_reference, notes)
values
  ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 'REL-2026-0012', 'RELEASE', 'CLEARANCE_PENDING', 'Clause 6.46 - Release of Security Deposit / FDR on completion of 10-year term', 'Ten-year lock-in term completed. Affidavit-6 and latest EoA uploaded.')
on conflict (id) do nothing;

-- 5. CLEARANCE RECORDS
insert into public.clearance_records (id, release_request_id, clearance_type, department_name, status, reference_number, remarks)
values
  ('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', 'LEGAL_CELL', 'Legal Affairs Cell, AICTE HQ', 'CLEARED', 'LC/CLR/2026/891', 'No court cases, arbitration, or stay orders pending against institution.'),
  ('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444401', 'APPROVAL_BUREAU', 'Bureau of Approval (North)', 'CLEARED', 'APPR/CLR/2026/1102', 'EoA records verified. Institution maintains active approval without penalty.'),
  ('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444401', 'FINANCE_BUREAU', 'Finance & Accounts Bureau', 'PENDING', null, 'Verification of original deposit receipt and payment reconciliation under review.'),
  ('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444401', 'REGIONAL_OFFICE', 'North Regional Office, Chandigarh', 'PENDING', null, 'Awaiting physical site compliance confirmation from regional directorate.')
on conflict (id) do nothing;

-- 6. WORKFLOW TASKS
insert into public.workflow_tasks (id, institution_id, instrument_id, title, description, task_type, status, priority)
values
  ('66666666-6666-6666-6666-666666666601', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222202', 'Review Issue Date Discrepancy on FDR-2024-ND-002', 'Compare submitted FDR scan with PNB Core Banking simulated response (5-day variance).', 'DISCREPANCY_REVIEW', 'OPEN', 'HIGH'),
  ('66666666-6666-6666-6666-666666666602', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222203', 'Verify New Submission: Canara Bank ₹50 Lakh', 'Perform initial verification checks on newly submitted FDR-2024-CH-003.', 'INITIAL_VERIFICATION', 'IN_PROGRESS', 'NORMAL')
on conflict (id) do nothing;

-- 7. INTEGRATION SYNC LOGS
insert into public.integration_sync_logs (id, provider_name, operation, instrument_id, status, http_status, duration_ms, response_summary)
values
  ('77777777-7777-7777-7777-777777777701', 'State Bank of India CBS', 'FDR_QUERY_DISPATCH', '22222222-2222-2222-2222-222222222201', 'SUCCEEDED', 200, 342, '{"status": "CONFIRMED", "balance": 3500000.0, "lien": "ACTIVE"}'::jsonb),
  ('77777777-7777-7777-7777-777777777702', 'Punjab National Bank CBS', 'FDR_QUERY_DISPATCH', '22222222-2222-2222-2222-222222222202', 'SUCCEEDED', 200, 418, '{"status": "CONFIRMED", "issue_date": "2024-03-10", "variance": "5_DAYS"}'::jsonb),
  ('77777777-7777-7777-7777-777777777703', 'Bank of Baroda CBS', 'FDR_QUERY_DISPATCH', '22222222-2222-2222-2222-222222222204', 'FAILED', 504, 8500, '{"error": "GATEWAY_TIMEOUT", "message": "Bank API gateway timed out after 8500ms"}'::jsonb)
on conflict (id) do nothing;

-- 8. AUDIT LOGS
insert into public.audit_logs (id, institution_id, entity_type, entity_id, action, correlation_id, reason)
values
  ('88888888-8888-8888-8888-888888888801', '11111111-1111-1111-1111-111111111101', 'financial_instruments', '22222222-2222-2222-2222-222222222201', 'VERIFICATION_DECISION_VERIFY', 'CORR-INIT-001', 'Three-way match confirmed against SBI CBS simulation.'),
  ('88888888-8888-8888-8888-888888888802', '11111111-1111-1111-1111-111111111101', 'financial_instruments', '22222222-2222-2222-2222-222222222202', 'VERIFICATION_DECISION_FLAG_DISCREPANCY', 'CORR-INIT-002', 'Issue date mismatch (5-day variance). Clarification requested.')
on conflict (id) do nothing;

commit;

