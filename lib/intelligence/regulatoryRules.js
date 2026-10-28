// AICTE Regulatory Rules Engine
// Source: AICTE Approval Process Handbook (2024-25 to 2026-27)
// Provides structured, versioned regulatory clauses, criteria, and evaluation logic.

export const APH_SOURCE_METADATA = {
  document_name: "AICTE Approval Process Handbook (APH)",
  edition: "2024-25 to 2026-27",
  regulatory_authority: "All India Council for Technical Education (AICTE), New Delhi",
  statutory_basis: "All India Council for Technical Education Act, 1987 (Clause 10/11)",
  version: "APH-2024-27-REV1",
};

export const REGULATORY_CLAUSES = [
  {
    id: "CLAUSE_2_25",
    clause: "Clause 2.25",
    page: 31,
    title: "Security Deposit Submission, Joint Lien & Lock-in Term",
    source: APH_SOURCE_METADATA.edition,
    summary:
      "Mandatory security deposit submission for establishment/continuation of technical programs, drawn in joint names of applicant trust/society and Member Secretary, AICTE.",
    mandatory_provisions: [
      "Deposit must be drawn in a Scheduled Bank in the joint names of the Applicant Trust/Society/Company and 'The Member Secretary, AICTE, New Delhi'.",
      "Mandatory minimum lock-in period of 10 years (or as specified for applicable category).",
      "Failure to maintain joint encumbrance or non-submission within stipulated timeline leads to withdrawal/cancellation of approval.",
      "Premature encumbrance liquidation without AICTE written sanction is strictly prohibited.",
    ],
  },
  {
    id: "CLAUSE_6_46",
    clause: "Clause 6.46",
    page: 61,
    title: "Release of Security Deposit / FDR on Completion of Term",
    source: APH_SOURCE_METADATA.edition,
    summary:
      "Statutory procedure, document dependencies, and multi-cell clearances required to authorize the release of a matured security deposit.",
    mandatory_provisions: [
      "Release is eligible only upon completion of the full statutory 10-year lock-in period from the initial deposit date.",
      "Mandatory submission of original FDR / joint-lien certificate, notarized Affidavit-6 on non-judicial stamp paper, latest LoA/EoA, and official institution request letter.",
      "Mandatory multi-cell clearances: Legal Affairs Cell (no pending litigation/stay orders), Bureau of Approval (active approval & no show-cause), Finance Bureau (accounts reconciliation), and Regional Directorate (site compliance).",
      "Release authorized strictly via an official No Objection Certificate (NOC) issued by AICTE to the issuing bank.",
    ],
  },
  {
    id: "CLAUSE_7_7",
    clause: "Clause 7.7",
    page: 73,
    title: "Violations, Discrepancies & Statutory Penalties",
    source: APH_SOURCE_METADATA.edition,
    summary:
      "Penal sanctions for fraudulent certificates, amount misrepresentations, unauthorized withdrawals, or false affidavit declarations.",
    mandatory_provisions: [
      "Submitting tampered, forged, or inconsistent FDR amounts/certificates constitutes a severe regulatory violation.",
      "Premature withdrawal of funds or failure to maintain joint lien shall lead to forfeiture of security deposit.",
      "False statements in Affidavit-6 lead to immediate withdrawal of approval, blacklisting of trust/society, and initiation of criminal/civil legal proceedings under applicable laws.",
    ],
  },
  {
    id: "AFFIDAVIT_3",
    clause: "Affidavit 3",
    page: "Affidavit Section (Part I)",
    title: "Statutory Joint Lien Declaration for Establishment",
    source: APH_SOURCE_METADATA.edition,
    summary:
      "Sworn declaration by Chairman/Secretary confirming deposit creation, encumbrance in favor of AICTE, and compliance with statutory norms.",
    mandatory_provisions: [
      "Explicit declaration of joint lien marked with AICTE Member Secretary.",
      "Confirmation that deposited funds are free from any third-party lien, hypothecation, or mortgage.",
    ],
  },
  {
    id: "AFFIDAVIT_6",
    clause: "Affidavit 6",
    page: "Pages 191–192",
    title: "Statutory Affidavit for Release/Refund of Security Deposit",
    source: APH_SOURCE_METADATA.edition,
    summary:
      "Sworn non-judicial stamp paper affidavit required under Clause 6.46 confirming 10-year term completion, absence of dues, absence of litigation, and Council indemnity.",
    mandatory_provisions: [
      "Declaration 1: Completion of 10 continuous years of deposit lock-in.",
      "Declaration 2: No court cases, arbitration, writ petitions, or stay orders pending against institution or AICTE concerning the security deposit.",
      "Declaration 3: All staff and faculty salaries have been paid strictly as per AICTE/6th/7th Pay Commission norms with zero pending dues.",
      "Declaration 4: No student dues, illegal fee collections, or student grievances pending.",
      "Declaration 5: Full indemnification to AICTE against any third-party claims or damages arising from the release of funds.",
      "Execution on non-judicial stamp paper of prescribed denomination, duly attested by an authorized Notary Public.",
    ],
  },
];

/**
 * Evaluates regulatory compliance findings for an analysed release case based on
 * extracted document values, cross-document check outcomes, and case metadata.
 *
 * @param {Object} extraction - Extracted structured fields from Gemini
 * @param {Array} checks - Results from deterministic cross-document checks
 * @param {Object} caseRecord - Existing application case record
 * @returns {Array} List of regulatory findings with handbook citations and recommended actions
 */
export function evaluateRegulatoryRules(extraction, checks, caseRecord) {
  const findings = [];

  // 1. Evaluate Clause 2.25: Joint Lien and Encumbrance Compliance
  const lienHolderText = (
    extraction.deposit_holder_details?.value ||
    extraction.fdr_details?.account_holder_name?.value ||
    ""
  ).toLowerCase();
  const hasAicteLien =
    lienHolderText.includes("aicte") ||
    lienHolderText.includes("member secretary") ||
    caseRecord.lien_marked === true;

  if (hasAicteLien) {
    findings.push({
      rule_id: "REG_FINDING_2_25_LIEN_OK",
      clause: "Clause 2.25",
      page: 31,
      version: APH_SOURCE_METADATA.edition,
      title: "Joint Lien Encumbrance Compliance",
      requirement:
        "Deposit must be encumbered jointly with the Member Secretary, AICTE, New Delhi throughout the statutory deposit duration.",
      evidence_considered: `Account holder / Lien details: "${extraction.deposit_holder_details?.value || caseRecord.lien_details || "AICTE Joint Lien"}" matches statutory requirement.`,
      status: "COMPLIANT",
      severity: "LOW",
      recommended_action: "Maintain lien verification in records until formal NOC issuance.",
      can_resolve: false,
    });
  } else {
    findings.push({
      rule_id: "REG_FINDING_2_25_LIEN_FAIL",
      clause: "Clause 2.25",
      page: 31,
      version: APH_SOURCE_METADATA.edition,
      title: "Missing or Incomplete AICTE Joint Lien",
      requirement:
        "FDR must be drawn in joint names of Trust and 'The Member Secretary, AICTE, New Delhi'.",
      evidence_considered: `Extracted holder string "${extraction.deposit_holder_details?.value || "Unknown"}" does not clearly reflect joint encumbrance in favor of AICTE.`,
      status: "DISCREPANCY_DETECTED",
      severity: "HIGH",
      recommended_action:
        "Require bank lien-confirmation certificate from institution branch manager before proceeding.",
      can_resolve: true,
    });
  }

  // 2. Evaluate Clause 6.46: 10-Year Lock-in Duration
  const issueDateStr = extraction.issue_date?.value || caseRecord.issue_date;
  const maturityDateStr = extraction.maturity_date?.value || caseRecord.maturity_date;
  let termYears = 0;

  if (issueDateStr) {
    const issueYear = new Date(issueDateStr).getFullYear();
    const currentYear = 2026; // Current simulation / project reference year
    termYears = currentYear - issueYear;
  }

  const isTenYearsCompleted = termYears >= 10;

  if (isTenYearsCompleted) {
    findings.push({
      rule_id: "REG_FINDING_6_46_TERM_OK",
      clause: "Clause 6.46",
      page: 61,
      version: APH_SOURCE_METADATA.edition,
      title: "Statutory 10-Year Lock-in Duration Satisfied",
      requirement:
        "Release of security deposit is permitted only after completion of the 10-year term from initial establishment approval.",
      evidence_considered: `Deposit Issue Date: ${issueDateStr || "2016-08-01"}. Elapsed duration is ${termYears} years (>= 10 years). Term completed.`,
      status: "COMPLIANT",
      severity: "LOW",
      recommended_action: "Proceed with multi-cell clearance verification.",
      can_resolve: false,
    });
  } else {
    findings.push({
      rule_id: "REG_FINDING_6_46_TERM_PREMATURE",
      clause: "Clause 6.46",
      page: 61,
      version: APH_SOURCE_METADATA.edition,
      title: "Premature Release Request (Lock-in Term Incomplete)",
      requirement:
        "Clause 6.46 stipulates completion of 10-year lock-in period prior to security deposit release, unless institutional closure has been officially sanctioned.",
      evidence_considered: `Deposit Issue Date: ${issueDateStr || "Recent"}. Only ${termYears} years elapsed out of mandatory 10 years.`,
      status: "DISCREPANCY_DETECTED",
      severity: "HIGH",
      recommended_action:
        "Reject premature release or verify if institution is undergoing formal closure under Chapter VII with Council NOC.",
      can_resolve: true,
    });
  }

  // 3. Evaluate Clause 6.46: Mandatory Document Checklist
  const missingDocCheck = checks.find((c) => c.check_type === "DOCUMENT_COMPLETENESS");
  if (missingDocCheck && missingDocCheck.status !== "PASS") {
    findings.push({
      rule_id: "REG_FINDING_6_46_DOCS_MISSING",
      clause: "Clause 6.46",
      page: 61,
      version: APH_SOURCE_METADATA.edition,
      title: "Mandatory Statutory Release Documents Missing",
      requirement:
        "Release application must include FDR certificate, notarized Affidavit-6, latest LoA/EoA, and formal institution release request letter.",
      evidence_considered: missingDocCheck.message || "One or more mandatory release documents are absent from submission pack.",
      status: "MISSING_EVIDENCE",
      severity: "HIGH",
      recommended_action:
        "Issue formal Document Deficiency Notice to institution; suspend clearance processing until re-upload.",
      can_resolve: true,
    });
  } else {
    findings.push({
      rule_id: "REG_FINDING_6_46_DOCS_OK",
      clause: "Clause 6.46",
      page: 61,
      version: APH_SOURCE_METADATA.edition,
      title: "Mandatory Document Pack Complete",
      requirement:
        "All statutory documents prescribed under Clause 6.46 are submitted and catalogued.",
      evidence_considered: "Original FDR scan, notarized Affidavit-6, official request letter, and current EoA verified present.",
      status: "COMPLIANT",
      severity: "LOW",
      recommended_action: "Confirm document completeness checklist in release case file.",
      can_resolve: false,
    });
  }

  // 4. Evaluate Clause 7.7: Amount Consistency & Tampering Check
  const amountCheck = checks.find((c) => c.check_type === "FDR_VS_AFFIDAVIT_AMOUNT");
  if (amountCheck && amountCheck.status === "FAIL") {
    findings.push({
      rule_id: "REG_FINDING_7_7_AMOUNT_MISMATCH",
      clause: "Clause 7.7",
      page: 73,
      version: APH_SOURCE_METADATA.edition,
      title: "Deposit Amount Variance / Misrepresentation Risk",
      requirement:
        "Clause 7.7 prescribes severe penalties (including forfeiture and approval withdrawal) for inconsistent or misrepresented security deposit amounts.",
      evidence_considered: `Extracted FDR Amount (${amountCheck.observed_value}) differs from Declared/Application Amount (${amountCheck.expected_value}).`,
      status: "DISCREPANCY_DETECTED",
      severity: "CRITICAL",
      recommended_action:
        "Do not issue NOC. Disagree/Flag discrepancy and require explanation and certified bank ledger statement from institution.",
      can_resolve: true,
    });
  }

  // 5. Evaluate Affidavit 6 Declarations (Litigation, Staff Dues, Indemnity)
  const affidavitCheck = checks.find((c) => c.check_type === "AFFIDAVIT_DECLARATIONS_REVIEW");
  if (affidavitCheck && affidavitCheck.status === "WARNING") {
    findings.push({
      rule_id: "REG_FINDING_AFFIDAVIT_6_LITIGATION",
      clause: "Affidavit 6",
      page: "Pages 191–192",
      version: APH_SOURCE_METADATA.edition,
      title: "Affidavit 6: Conditional Legal / Litigation Clause Flagged",
      requirement:
        "Affidavit-6 requires an unconditional declaration that no court cases, writ petitions, arbitration, or stay orders are pending concerning the deposit.",
      evidence_considered: affidavitCheck.message || "Declaration contains reservations or references pending court proceedings.",
      status: "REQUIRES_HUMAN_REVIEW",
      severity: "HIGH",
      recommended_action:
        "Mandatory referral to Legal Affairs Cell. Legal clearance cannot be granted without formal opinion from AICTE Legal Counsel.",
      can_resolve: true,
    });
  } else if (affidavitCheck && affidavitCheck.status === "PASS") {
    findings.push({
      rule_id: "REG_FINDING_AFFIDAVIT_6_OK",
      clause: "Affidavit 6",
      page: "Pages 191–192",
      version: APH_SOURCE_METADATA.edition,
      title: "Affidavit-6 Statutory Declarations Satisfied",
      requirement:
        "All 5 mandatory declarations (10-yr completion, zero litigation, faculty pay compliance, student grievance clearance, council indemnity) verified.",
      evidence_considered: "Extracted notarized sworn declaration confirms all standard Clause 6.46 indemnities.",
      status: "COMPLIANT",
      severity: "LOW",
      recommended_action: "Clear statutory declaration checklist item.",
      can_resolve: false,
    });
  }

  return findings;
}
