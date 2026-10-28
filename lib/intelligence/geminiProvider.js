// Server-Side Gemini Document Intelligence Provider
// Uses official Google GenAI SDK (@google/genai)
// Reads GEMINI_API_KEY strictly from server-side environment variables.
// In Demo/Offline mode, serves deterministic, validated seed fixtures.
// In Live AI mode, performs multi-page document parsing and structured field extraction.

import { GoogleGenAI } from "@google/genai";

/**
 * Extraction Schema definition for AICTE technical institution deposit documents
 */
export const EXTRACTION_FIELDS_SCHEMA = {
  institution_name: { type: "string", description: "Full registered name of the technical institution" },
  trust_or_society_name: { type: "string", description: "Name of the parent trust, society, or company" },
  aicte_application_id: { type: "string", description: "Permanent AICTE ID or Application identifier" },
  fdr_number: { type: "string", description: "Fixed Deposit Receipt certificate number" },
  issuing_bank: { type: "string", description: "Name of issuing Scheduled Commercial Bank" },
  bank_branch: { type: "string", description: "Branch name or IFSC code" },
  deposit_amount: { type: "number", description: "Principal security deposit amount in INR" },
  issue_date: { type: "string", description: "Deposit issue date in YYYY-MM-DD format" },
  maturity_date: { type: "string", description: "Deposit maturity date in YYYY-MM-DD format" },
  deposit_holder_details: { type: "string", description: "Account holder text, including AICTE joint lien declaration" },
  programme_or_purpose: { type: "string", description: "Course, discipline, or purpose for deposit establishment" },
  affidavit_declarations: {
    type: "object",
    description: "Declarations made in Affidavit-6",
    properties: {
      ten_year_completion_declared: { type: "boolean" },
      no_court_cases_declared: { type: "boolean" },
      no_dues_to_faculty_staff_declared: { type: "boolean" },
      indemnity_to_aicte_declared: { type: "boolean" },
      notary_attestation_present: { type: "boolean" },
      declared_deposit_amount: { type: "number" },
      pending_court_case_noted: { type: "boolean" },
      notes: { type: "string" },
    },
  },
  approval_letter_details: {
    type: "object",
    description: "Approval letter details (LoA/EoA)",
    properties: {
      approval_type: { type: "string" },
      academic_year: { type: "string" },
      status: { type: "string" },
    },
  },
};

/**
 * Seeded fixture for Scenario 1: Consistent FDR Release Case
 * Case: REL-2026-0012 / Delhi Institute of Engineering & Technology (₹30 Lakh, Union Bank of India)
 */
export const SEEDED_SCENARIO_1_EXTRACTION = {
  institution_name: {
    value: "Delhi Institute of Engineering & Technology",
    source_document: "FDR_COPY",
    location: "Account Title / Depositor Line",
    confidence: 0.99,
  },
  trust_or_society_name: {
    value: "Delhi Educational Foundation Trust",
    source_document: "AFFIDAVIT_6",
    location: "Affidavit Header & Preamble",
    confidence: 0.98,
  },
  aicte_application_id: {
    value: "1-109283741",
    source_document: "LOA_EOA",
    location: "AICTE Permanent ID Field",
    confidence: 0.99,
  },
  fdr_number: {
    value: "UBI-FDR-6629104829",
    source_document: "FDR_COPY",
    location: "Certificate Top-Right Reference Box",
    confidence: 0.99,
  },
  issuing_bank: {
    value: "Union Bank of India",
    source_document: "FDR_COPY",
    location: "Bank Seal & Branch Header",
    confidence: 0.99,
  },
  bank_branch: {
    value: "Pushp Vihar Branch, New Delhi (00281)",
    source_document: "FDR_COPY",
    location: "Branch Identification Box",
    confidence: 0.97,
  },
  deposit_amount: {
    value: 3000000,
    formatted: "₹30,00,000",
    source_document: "FDR_COPY",
    location: "Principal Deposit Amount (Words & Figures)",
    confidence: 0.99,
  },
  issue_date: {
    value: "2016-08-01",
    source_document: "FDR_COPY",
    location: "Date of Issue Box",
    confidence: 0.98,
  },
  maturity_date: {
    value: "2026-08-01",
    source_document: "FDR_COPY",
    location: "Date of Maturity Box",
    confidence: 0.98,
  },
  deposit_holder_details: {
    value: "Delhi Institute of Engineering & Technology & The Member Secretary, AICTE Joint Lien",
    source_document: "FDR_COPY",
    location: "Joint Encumbrance Lien Field",
    confidence: 0.97,
  },
  programme_or_purpose: {
    value: "Undergraduate Engineering & Technology Establishment under Clause 1.12",
    source_document: "LOA_EOA",
    location: "Approval Letter Subject Clause",
    confidence: 0.95,
  },
  affidavit_declarations: {
    ten_year_completion_declared: { value: true, confidence: 0.99, location: "Affidavit 6 Clause 1" },
    no_court_cases_declared: { value: true, confidence: 0.99, location: "Affidavit 6 Clause 2" },
    no_dues_to_faculty_staff_declared: { value: true, confidence: 0.98, location: "Affidavit 6 Clause 3" },
    indemnity_to_aicte_declared: { value: true, confidence: 0.99, location: "Affidavit 6 Clause 4" },
    notary_attestation_present: { value: true, confidence: 0.96, location: "Notary Seal & Advocate Stamp" },
    declared_deposit_amount: { value: 3000000, confidence: 0.99, location: "Affidavit 6 Paragraph 2" },
    pending_court_case_noted: false,
    notes: "All 5 statutory declarations affirmed unconditionally.",
  },
  approval_letter_details: {
    approval_type: { value: "Extension of Approval (EoA)", confidence: 0.98, location: "Letter Header" },
    academic_year: { value: "2025-26", confidence: 0.99, location: "Paragraph 1" },
    status: { value: "ACTIVE_APPROVED", confidence: 0.99, location: "Council Order" },
  },
  catalogued_documents: ["FDR_COPY", "AFFIDAVIT_6", "INSTITUTION_REQUEST_LETTER", "LOA_EOA"],
};

/**
 * Seeded fixture for Scenario 2: Deliberate Amount Mismatch & Missing Evidence
 * Case: REL-2026-0015 / Vivekananda College of Technology & Management (Canara Bank, ₹50L claimed vs ₹45L affidavit, missing EoA)
 */
export const SEEDED_SCENARIO_2_EXTRACTION = {
  institution_name: {
    value: "Vivekananda College of Technology & Management",
    source_document: "FDR_COPY",
    location: "Account Title Line",
    confidence: 0.98,
  },
  trust_or_society_name: {
    value: "Sri Vivekananda Educational Trust",
    source_document: "AFFIDAVIT_6",
    location: "Affidavit Header",
    confidence: 0.96,
  },
  aicte_application_id: {
    value: "1-209841235",
    source_document: "FDR_COPY",
    location: "Certificate Reference",
    confidence: 0.95,
  },
  fdr_number: {
    value: "CNRB-FDR-7712093845",
    source_document: "FDR_COPY",
    location: "Certificate Header",
    confidence: 0.99,
  },
  issuing_bank: {
    value: "Canara Bank",
    source_document: "FDR_COPY",
    location: "Bank Seal",
    confidence: 0.99,
  },
  bank_branch: {
    value: "Sholinganallur Branch, Chennai (00349)",
    source_document: "FDR_COPY",
    location: "Branch Box",
    confidence: 0.96,
  },
  deposit_amount: {
    value: 5000000,
    formatted: "₹50,00,000",
    source_document: "FDR_COPY",
    location: "Principal Certificate Amount",
    confidence: 0.99,
  },
  issue_date: {
    value: "2024-10-01",
    source_document: "FDR_COPY",
    location: "Issue Date Box",
    confidence: 0.98,
  },
  maturity_date: {
    value: "2029-10-01",
    source_document: "FDR_COPY",
    location: "Maturity Date Box",
    confidence: 0.97,
  },
  deposit_holder_details: {
    value: "Vivekananda College of Technology & AICTE Joint Lien",
    source_document: "FDR_COPY",
    location: "Lien Inscription",
    confidence: 0.96,
  },
  programme_or_purpose: {
    value: "Security Deposit for Integrated Campus Approval",
    source_document: "REQUEST_LETTER",
    location: "Letter Subject",
    confidence: 0.92,
  },
  affidavit_declarations: {
    ten_year_completion_declared: { value: false, confidence: 0.95, location: "Affidavit 6 Clause 1" },
    no_court_cases_declared: { value: true, confidence: 0.98, location: "Affidavit 6 Clause 2" },
    no_dues_to_faculty_staff_declared: { value: true, confidence: 0.97, location: "Affidavit 6 Clause 3" },
    indemnity_to_aicte_declared: { value: true, confidence: 0.98, location: "Affidavit 6 Clause 4" },
    notary_attestation_present: { value: true, confidence: 0.94, location: "Notary Seal" },
    declared_deposit_amount: { value: 4500000, confidence: 0.98, location: "Affidavit 6 Paragraph 2" }, // ₹5,00,000 mismatch!
    pending_court_case_noted: false,
    notes: "Variance detected: Declared amount in Affidavit is ₹45,00,000 versus FDR certificate of ₹50,00,000.",
  },
  approval_letter_details: {
    approval_type: { value: "unknown", confidence: 0.0, location: "Missing Document" },
    academic_year: { value: "unknown", confidence: 0.0, location: "Missing Document" },
    status: { value: "unknown", confidence: 0.0, location: "Missing Document" },
  },
  catalogued_documents: ["FDR_COPY", "AFFIDAVIT_6", "INSTITUTION_REQUEST_LETTER"], // LOA_EOA is missing!
};

/**
 * Seeded fixture for Scenario 3: Conditional Litigation Declaration Requiring Human Review
 * Case: FDR-2024-ND-002 / REL-2026-0019 (Punjab National Bank / Date Variance & Pending Court Case Mentioned)
 */
export const SEEDED_SCENARIO_3_EXTRACTION = {
  institution_name: {
    value: "Delhi Institute of Engineering & Technology",
    source_document: "FDR_COPY",
    location: "Account Title",
    confidence: 0.98,
  },
  trust_or_society_name: {
    value: "Delhi Educational Foundation Trust",
    source_document: "AFFIDAVIT_6",
    location: "Affidavit Preamble",
    confidence: 0.97,
  },
  aicte_application_id: {
    value: "1-109283741",
    source_document: "LOA_EOA",
    location: "Permanent ID",
    confidence: 0.99,
  },
  fdr_number: {
    value: "PNB-FDR-4481029311",
    source_document: "FDR_COPY",
    location: "Certificate Number Box",
    confidence: 0.99,
  },
  issuing_bank: {
    value: "Punjab National Bank",
    source_document: "FDR_COPY",
    location: "Bank Header",
    confidence: 0.99,
  },
  bank_branch: {
    value: "Saket Branch, New Delhi (04561)",
    source_document: "FDR_COPY",
    location: "Branch IFSC PUNB0045610",
    confidence: 0.97,
  },
  deposit_amount: {
    value: 1500000,
    formatted: "₹15,00,000",
    source_document: "FDR_COPY",
    location: "Principal Amount Words & Figures",
    confidence: 0.99,
  },
  issue_date: {
    value: "2024-03-15",
    source_document: "FDR_COPY",
    location: "Issue Date Box",
    confidence: 0.96,
  },
  maturity_date: {
    value: "2027-03-15",
    source_document: "FDR_COPY",
    location: "Maturity Date Box",
    confidence: 0.96,
  },
  deposit_holder_details: {
    value: "Delhi Institute of Engineering & Technology",
    source_document: "FDR_COPY",
    location: "Account Holder Field",
    confidence: 0.92, // Missing AICTE joint lien in holder string!
  },
  programme_or_purpose: {
    value: "Additional Security Deposit for AI & Data Science Course Introduction",
    source_document: "REQUEST_LETTER",
    location: "Subject Line",
    confidence: 0.94,
  },
  affidavit_declarations: {
    ten_year_completion_declared: { value: false, confidence: 0.96, location: "Affidavit 6 Clause 1" },
    no_court_cases_declared: { value: false, confidence: 0.97, location: "Affidavit 6 Clause 2" },
    no_dues_to_faculty_staff_declared: { value: true, confidence: 0.98, location: "Affidavit 6 Clause 3" },
    indemnity_to_aicte_declared: { value: true, confidence: 0.97, location: "Affidavit 6 Clause 4" },
    notary_attestation_present: { value: true, confidence: 0.95, location: "Notary Seal & Date" },
    declared_deposit_amount: { value: 1500000, confidence: 0.99, location: "Affidavit 6 Paragraph 2" },
    pending_court_case_noted: true,
    notes:
      "Affidavit includes conditional qualification: 'Subject to outcome of writ petition WP-8821/2025 before High Court regarding municipal land lease dispute'. Requires mandatory Legal Cell review.",
  },
  approval_letter_details: {
    approval_type: { value: "Extension of Approval (EoA)", confidence: 0.98, location: "Council Letter" },
    academic_year: { value: "2024-25", confidence: 0.98, location: "Council Letter" },
    status: { value: "UNDER_INQUIRY", confidence: 0.95, location: "Remarks" },
  },
  catalogued_documents: ["FDR_COPY", "AFFIDAVIT_6", "INSTITUTION_REQUEST_LETTER", "LOA_EOA"],
};

/**
 * Returns seeded scenario extraction based on scenario ID or case reference
 */
export function getSeededExtraction(scenarioId = "scenario_1") {
  if (scenarioId === "scenario_2" || scenarioId === "rel-002" || scenarioId === "fdr-003") {
    return {
      scenarioId: "scenario_2",
      title: "Scenario 2: Amount Mismatch & Missing Evidence",
      description: "Canara Bank FDR ₹50L vs Affidavit declared ₹45L, with missing latest EoA approval document.",
      extraction: SEEDED_SCENARIO_2_EXTRACTION,
    };
  }

  if (scenarioId === "scenario_3" || scenarioId === "rel-003" || scenarioId === "fdr-002") {
    return {
      scenarioId: "scenario_3",
      title: "Scenario 3: Conditional Litigation Declaration (Human Review)",
      description: "Punjab National Bank FDR ₹15L with Affidavit citing pending High Court litigation WP-8821/2025.",
      extraction: SEEDED_SCENARIO_3_EXTRACTION,
    };
  }

  // Default: Scenario 1
  return {
    scenarioId: "scenario_1",
    title: "Scenario 1: Consistent FDR Release Case (10-Year Term)",
    description: "Union Bank of India FDR ₹30L, 10-year lock-in completed under Clause 6.46, all affidavits verified.",
    extraction: SEEDED_SCENARIO_1_EXTRACTION,
  };
}

/**
 * Main AI extraction orchestrator.
 * If GEMINI_API_KEY is configured and PDF buffers are supplied, executes live Gemini multimodal extraction.
 * Otherwise, cleanly falls back to seeded demonstration fixtures with explicit engine labeling.
 *
 * @param {Object} params
 * @param {string} [params.scenarioId] - Optional preset scenario ID
 * @param {Array<Object>} [params.pdfFiles] - Array of { name, mimeType, base64 } for live upload
 * @param {boolean} [params.forceLive] - Force live AI execution
 * @returns {Promise<Object>}
 */
export async function extractDocumentIntelligence({
  scenarioId = "scenario_1",
  pdfFiles = [],
  forceLive = false,
}) {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. If Live AI is requested or PDF files uploaded and API key exists
  if (apiKey && (pdfFiles.length > 0 || forceLive)) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      // Construct multimodal parts
      const parts = [];
      for (const file of pdfFiles) {
        if (file.base64 && file.mimeType === "application/pdf") {
          parts.push({
            inlineData: {
              mimeType: "application/pdf",
              data: file.base64,
            },
          });
        }
      }

      const promptText = `
You are the official AICTE Intelligence Hub Document Verification System.
Analyze the provided technical education institution documents (Fixed Deposit Receipt, Affidavit-6, Letter of Approval / EoA, Request Letter).
Extract structured fields accurately.
Rules:
1. Missing or illegible information must be marked as "unknown" with 0.0 confidence. Never guess or hallucinate.
2. For each field, specify the extracted value, source document type, page/location, and a confidence score between 0.0 and 1.0.
3. For Affidavit 6, check whether:
   - 10-year completion is declared
   - zero court cases / litigation is declared
   - no faculty/staff dues is declared
   - indemnity to AICTE is declared
   - notary stamp and advocate attestation is present
   - whether any conditional litigation, writ petition, or pending arbitration is noted.
4. Output strictly valid JSON matching the schema provided.
`;

      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText);
      const durationMs = Date.now() - startTime;

      return {
        is_live_ai: true,
        engine_name: "AI Document Intelligence (Live Analysis)",
        model: "document-intelligence-v2",
        extraction: parsedData,
        duration_ms: durationMs,
        timestamp: new Date().toISOString(),
        pdf_count: pdfFiles.length,
      };
    } catch (err) {
      console.error("[Document Intelligence] API Error:", err);
      // Strictly treat API failures as integration errors; do not silently corrupt the case
      return {
        is_live_ai: true,
        is_error: true,
        error_code: err.code || "AI_SERVICE_ERROR",
        error_message: err.message || "Failed to communicate with AI Document Intelligence service.",
        duration_ms: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 2. Demonstration / Seeded Mode
  const seeded = getSeededExtraction(scenarioId);
  return {
    is_live_ai: false,
    engine_name: "Simulated Demo Intelligence Engine (Seeded Fixture Scenario)",
    model: "simulated-aph-fixture-v1",
    scenario_id: seeded.scenarioId,
    scenario_title: seeded.title,
    scenario_description: seeded.description,
    extraction: seeded.extraction,
    duration_ms: 112,
    timestamp: new Date().toISOString(),
    note: "Seeded demonstration scenario. To run live AI extraction, configure API key in .env.local.",
  };
}
