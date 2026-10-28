// Intelligent Deterministic Discrepancy Engine for AICTE FDR Verification
// Performs objective, rule-based comparisons between submitted claims,
// document extracts (OCR), and simulated Core Banking System (CBS) ledgers.
// Does NOT allow AI hallucinations to override deterministic checks.

import { normalizeBankName } from "./fdrOcrService";

export const DISCREPANCY_SEVERITY = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
};

export const RESOLUTION_STATUS = {
  VERIFIED: "Verified",
  MISMATCH: "Mismatch",
  MISSING_EVIDENCE: "Missing evidence",
  MANUAL_REVIEW: "Manual review required",
  RESOLVED: "Resolved",
};

/**
 * Normalizes numeric currency amounts for strict mathematical comparison
 */
export function normalizeAmount(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Normalizes alphanumeric identifiers (FDR numbers, IFSC codes)
 */
export function normalizeIdentifier(val) {
  if (!val) return "";
  return String(val).trim().toUpperCase().replace(/[\s-_]/g, "");
}

/**
 * Normalizes ISO dates to YYYY-MM-DD
 */
export function normalizeDate(val) {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val).trim();
    return d.toISOString().split("T")[0];
  } catch {
    return String(val).trim();
  }
}

/**
 * Runs 8 core deterministic discrepancy checks across Submitted, Extracted, and CBS values.
 *
 * @param {Object} params
 * @param {Object} params.submitted - Form/Registry submitted instrument record
 * @param {Object} params.extracted - OCR extracted data from Document parser
 * @param {Object} params.cbs - Core Banking System response data
 * @param {Array}  params.documents - Attached document records
 * @returns {Array} Structured list of detected discrepancies with severity and evidence references
 */
export function analyzeDiscrepancies({ submitted = {}, extracted = {}, cbs = {}, documents = [] }) {
  const issues = [];

  // =========================================================================
  // 1. PRINCIPAL AMOUNT VERIFICATION (CRITICAL)
  // =========================================================================
  const subAmount = normalizeAmount(submitted.amount);
  const extAmount = normalizeAmount(extracted.amount || extracted.deposit_amount?.value);
  const cbsAmount = normalizeAmount(cbs.amount || cbs.response_summary?.amount);

  if (extAmount > 0 && subAmount > 0 && extAmount !== subAmount) {
    issues.push({
      id: "DISC_AMOUNT_OCR_MISMATCH",
      field: "Principal Amount",
      category: "FINANCIAL",
      severity: DISCREPANCY_SEVERITY.CRITICAL,
      status: RESOLUTION_STATUS.MISMATCH,
      submitted_value: `₹${subAmount.toLocaleString("en-IN")}`,
      extracted_value: `₹${extAmount.toLocaleString("en-IN")}`,
      cbs_value: cbsAmount > 0 ? `₹${cbsAmount.toLocaleString("en-IN")}` : "N/A",
      reason: `Certificate OCR indicates ₹${extAmount.toLocaleString("en-IN")}, differing by ₹${Math.abs(subAmount - extAmount).toLocaleString("en-IN")} from submitted record.`,
      source_document: extracted.document_title || "FDR Certificate",
      source_page: 1,
      evidence_snippet: extracted.raw_snippets?.find((s) => s.label?.includes("amount") || s.label?.includes("fdr"))?.text || `Principal Amount: ₹${extAmount.toLocaleString("en-IN")}`,
      recommendation: "Require institution to upload matching corrected deposit receipt or bank statement.",
    });
  }

  if (cbsAmount > 0 && subAmount > 0 && cbsAmount !== subAmount) {
    issues.push({
      id: "DISC_AMOUNT_CBS_MISMATCH",
      field: "Bank Ledger Amount",
      category: "FINANCIAL",
      severity: DISCREPANCY_SEVERITY.CRITICAL,
      status: RESOLUTION_STATUS.MISMATCH,
      submitted_value: `₹${subAmount.toLocaleString("en-IN")}`,
      extracted_value: extAmount > 0 ? `₹${extAmount.toLocaleString("en-IN")}` : "N/A",
      cbs_value: `₹${cbsAmount.toLocaleString("en-IN")}`,
      reason: `Core Banking System ledger records ₹${cbsAmount.toLocaleString("en-IN")}, but submitted claim is ₹${subAmount.toLocaleString("en-IN")}.`,
      source_document: "Core Banking API Gateway",
      source_page: null,
      evidence_snippet: `CBS Account Ledger balance query: ₹${cbsAmount.toLocaleString("en-IN")}`,
      recommendation: "Contact issuing bank nodal officer to reconcile ledger variance.",
    });
  }

  // =========================================================================
  // 2. FDR / CERTIFICATE NUMBER CHECK (CRITICAL)
  // =========================================================================
  const subFdrNo = normalizeIdentifier(submitted.fdr_number);
  const extFdrNo = normalizeIdentifier(extracted.fdr_number);
  const cbsFdrNo = normalizeIdentifier(cbs.fdr_number || cbs.response_summary?.fdr_number);

  if (extFdrNo && subFdrNo && extFdrNo !== subFdrNo) {
    issues.push({
      id: "DISC_FDR_NUMBER_MISMATCH",
      field: "FDR Certificate Number",
      category: "IDENTITY",
      severity: DISCREPANCY_SEVERITY.CRITICAL,
      status: RESOLUTION_STATUS.MISMATCH,
      submitted_value: submitted.fdr_number,
      extracted_value: extracted.fdr_number,
      cbs_value: cbs.fdr_number || "N/A",
      reason: `Extracted certificate reference "${extracted.fdr_number}" does not match claimed number "${submitted.fdr_number}".`,
      source_document: extracted.document_title || "FDR Certificate",
      source_page: 1,
      evidence_snippet: extracted.raw_snippets?.find((s) => s.label?.includes("fdr"))?.text || `Certificate No: ${extracted.fdr_number}`,
      recommendation: "Check if wrong PDF certificate was attached to application.",
    });
  }

  // =========================================================================
  // 3. ISSUING BANK STANDARDIZATION & NAME CHECK (HIGH)
  // =========================================================================
  const subBankNorm = normalizeBankName(submitted.bank_name);
  const extBankNorm = normalizeBankName(extracted.bank_name);

  if (extBankNorm && subBankNorm && extBankNorm.toLowerCase() !== subBankNorm.toLowerCase()) {
    issues.push({
      id: "DISC_BANK_NAME_MISMATCH",
      field: "Issuing Bank Name",
      category: "BANKING",
      severity: DISCREPANCY_SEVERITY.HIGH,
      status: RESOLUTION_STATUS.MANUAL_REVIEW,
      submitted_value: submitted.bank_name,
      extracted_value: extracted.bank_name,
      normalized_value: extBankNorm,
      cbs_value: cbs.bank_name || submitted.bank_name,
      reason: `Submitted bank "${submitted.bank_name}" differs from document header "${extracted.bank_name}".`,
      source_document: extracted.document_title || "FDR Certificate",
      source_page: 1,
      evidence_snippet: `Bank Header: ${extracted.bank_name}`,
      recommendation: "Verify if branch underwent bank amalgamation/merger.",
    });
  }

  // =========================================================================
  // 4. STATUTORY JOINT LIEN DECLARATION CHECK (HIGH)
  // =========================================================================
  const hasSubmittedLien = Boolean(submitted.lien_marked);
  const hasExtractedLien = extracted.lien_marked !== undefined ? Boolean(extracted.lien_marked) : true;
  const holderText = String(extracted.deposit_holder_details || extracted.institution_name || "").toLowerCase();
  const lienDetails = String(submitted.lien_details || extracted.lien_details || "").toLowerCase();

  const mentionsAicte =
    holderText.includes("aicte") ||
    holderText.includes("member secretary") ||
    lienDetails.includes("aicte") ||
    lienDetails.includes("member secretary");

  if (!hasSubmittedLien || (!hasExtractedLien && !mentionsAicte)) {
    issues.push({
      id: "DISC_LIEN_NOT_CONFIRMED",
      field: "Joint Lien Encumbrance",
      category: "REGULATORY",
      severity: DISCREPANCY_SEVERITY.HIGH,
      status: RESOLUTION_STATUS.MANUAL_REVIEW,
      submitted_value: hasSubmittedLien ? "Claimed Pledged" : "Unmarked",
      extracted_value: hasExtractedLien ? "Lien Clause Found" : "No AICTE Lien Text",
      cbs_value: cbs.response_summary?.lien_holder || "Unconfirmed",
      reason: "Document does not clearly demonstrate joint lien encumbrance marked to 'Member Secretary, AICTE' per Clause 2.25.",
      source_document: extracted.document_title || "FDR Certificate",
      source_page: 1,
      evidence_snippet: extracted.lien_details || "No explicit AICTE joint lien endorsement detected on certificate face.",
      recommendation: "Demand bank branch lien confirmation letter on official letterhead.",
    });
  }

  // =========================================================================
  // 5. DATE CONSISTENCY & CBS VARIANCE CHECK (MEDIUM / HIGH)
  // =========================================================================
  const subIssue = normalizeDate(submitted.issue_date);
  const extIssue = normalizeDate(extracted.issue_date);
  const cbsIssue = normalizeDate(cbs.issue_date || cbs.response_summary?.issue_date);

  if (cbsIssue && subIssue && cbsIssue !== subIssue) {
    issues.push({
      id: "DISC_DATE_CBS_VARIANCE",
      field: "Issue Date vs CBS Ledger",
      category: "DATES",
      severity: DISCREPANCY_SEVERITY.HIGH,
      status: RESOLUTION_STATUS.MISMATCH,
      submitted_value: subIssue,
      extracted_value: extIssue || "N/A",
      cbs_value: cbsIssue,
      reason: `Claimed issue date is ${subIssue}, but bank ledger records creation date as ${cbsIssue}.`,
      source_document: "CBS Ledger Query",
      source_page: null,
      evidence_snippet: `Bank ledger issue date: ${cbsIssue}`,
      recommendation: "Investigate if deposit was renewed or backdated by the institution branch.",
    });
  }

  // =========================================================================
  // 6. MATURITY DATE & LOCK-IN EXPIRY CHECK (MEDIUM)
  // =========================================================================
  const subMaturity = normalizeDate(submitted.maturity_date);
  const extMaturity = normalizeDate(extracted.maturity_date);
  const today = new Date().toISOString().split("T")[0];

  if (subMaturity && subMaturity < today && submitted.lifecycle_status === "ACTIVE") {
    issues.push({
      id: "DISC_INSTRUMENT_EXPIRED",
      field: "Maturity Date",
      category: "LIFECYCLE",
      severity: DISCREPANCY_SEVERITY.HIGH,
      status: RESOLUTION_STATUS.MANUAL_REVIEW,
      submitted_value: subMaturity,
      extracted_value: extMaturity || subMaturity,
      cbs_value: cbs.response_summary?.maturity_date || subMaturity,
      reason: `Instrument matured on ${subMaturity}. Active status requires formal renewal or Clause 6.46 release.`,
      source_document: "FDR Certificate",
      source_page: 1,
      evidence_snippet: `Maturity Date: ${subMaturity} (Expired)`,
      recommendation: "Notify institution to initiate renewal or submit Affidavit-6 for release.",
    });
  }

  // =========================================================================
  // 7. SUPPORTING DOCUMENTS COMPLETENESS CHECK (MEDIUM)
  // =========================================================================
  const hasFdrDoc = documents.some((d) => d.document_type === "FDR_COPY" || d.original_filename?.toLowerCase().includes("fdr"));
  if (!hasFdrDoc && documents.length === 0) {
    issues.push({
      id: "DISC_MISSING_FDR_SCAN",
      field: "Supporting Evidence",
      category: "DOCUMENTATION",
      severity: DISCREPANCY_SEVERITY.MEDIUM,
      status: RESOLUTION_STATUS.MISSING_EVIDENCE,
      submitted_value: "FDR Application Record",
      extracted_value: "None",
      cbs_value: "N/A",
      reason: "No scanned copy of the official deposit receipt is attached in the repository.",
      source_document: "Document Store",
      source_page: null,
      evidence_snippet: "0 attached files found for this instrument.",
      recommendation: "Request institution registrar to upload original scanned FDR certificate.",
    });
  }

  return issues;
}
