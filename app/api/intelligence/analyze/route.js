import { extractDocumentIntelligence } from "@/lib/intelligence/geminiProvider";
import { runDeterministicChecks } from "@/lib/intelligence/crossDocumentVerifier";
import { evaluateRegulatoryRules, APH_SOURCE_METADATA } from "@/lib/intelligence/regulatoryRules";
import { getReleaseRequestById, getInstrumentById } from "@/lib/dataService";

export async function POST(request) {
  try {
    let body = {};
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const scenarioId = formData.get("scenario_id");
      const caseId = formData.get("case_id");
      const pdfFiles = [];

      for (const [key, val] of formData.entries()) {
        if (val && typeof val === "object" && val.name && val.name.endsWith(".pdf")) {
          const buffer = await val.arrayBuffer();
          pdfFiles.push({
            name: val.name,
            mimeType: "application/pdf",
            base64: Buffer.from(buffer).toString("base64"),
          });
        }
      }

      body = {
        scenario_id: scenarioId || "scenario_1",
        case_id: caseId || "rel-001",
        pdf_files: pdfFiles,
      };
    }

    const {
      scenario_id = "scenario_1",
      case_id = "rel-001",
      pdf_files = [],
      force_live = false,
    } = body;

    // 1. Fetch relevant case record for cross-comparison
    let caseRecord = null;
    try {
      caseRecord = await getReleaseRequestById(case_id);
    } catch {
      caseRecord = null;
    }

    if (!caseRecord) {
      // Default fallback case record if standalone or unlinked
      caseRecord = {
        id: "rel-001",
        request_reference: "REL-2026-0012",
        institution_name:
          scenario_id === "scenario_2"
            ? "Vivekananda College of Technology & Management"
            : "Delhi Institute of Engineering & Technology",
        amount: scenario_id === "scenario_2" ? 5000000 : 3000000,
        bank_name: scenario_id === "scenario_2" ? "Canara Bank" : "Union Bank of India",
        fdr_number: scenario_id === "scenario_2" ? "CNRB-FDR-7712093845" : "UBI-FDR-6629104829",
        issue_date: scenario_id === "scenario_2" ? "2024-10-01" : "2016-08-01",
        maturity_date: scenario_id === "scenario_2" ? "2029-10-01" : "2026-08-01",
        lien_marked: true,
        lien_details: "Joint Lien in favor of Member Secretary, AICTE",
      };
    }

    // 2. Run Document Extraction (Gemini Live or Seeded Demo Fixture)
    const extractionResult = await extractDocumentIntelligence({
      scenarioId: scenario_id,
      pdfFiles: pdf_files,
      forceLive: force_live,
    });

    // If live API was triggered and failed, return an explicit error response
    if (extractionResult.is_error) {
      return Response.json(
        {
          success: false,
          error: true,
          error_code: extractionResult.error_code,
          error_message: extractionResult.error_message,
          timestamp: extractionResult.timestamp,
          duration_ms: extractionResult.duration_ms,
          note: "Gemini API failure is an external service error, NOT proof that the FDR or release request is invalid. You may switch to Seeded Demonstration Mode or retry.",
        },
        { status: 502 }
      );
    }

    const extraction = extractionResult.extraction || {};
    const attachedDocs = extraction.catalogued_documents || [];

    // 3. Run Server-Side Deterministic Checks
    const deterministicChecks = runDeterministicChecks(extraction, caseRecord, attachedDocs);

    // 4. Run Regulatory Rules Engine based on AICTE Approval Process Handbook
    const regulatoryFindings = evaluateRegulatoryRules(extraction, deterministicChecks, caseRecord);

    // 5. Aggregate metrics
    const discrepanciesCount = deterministicChecks.filter((c) => c.status === "FAIL").length;
    const humanReviewCount = deterministicChecks.filter((c) => c.status === "WARNING").length;
    const missingDocsCount = deterministicChecks.filter(
      (c) => c.status === "FAIL" && c.check_type === "DOCUMENT_COMPLETENESS"
    ).length;
    const passedChecksCount = deterministicChecks.filter((c) => c.status === "PASS").length;

    const compliantFindingsCount = regulatoryFindings.filter((f) => f.status === "COMPLIANT").length;
    const actionRequiredFindingsCount = regulatoryFindings.filter(
      (f) => f.status !== "COMPLIANT"
    ).length;

    return Response.json({
      success: true,
      case_id,
      scenario_id: extractionResult.scenario_id || scenario_id,
      engine: {
        is_live_ai: extractionResult.is_live_ai,
        engine_name: extractionResult.engine_name,
        model: extractionResult.model,
        duration_ms: extractionResult.duration_ms,
        timestamp: extractionResult.timestamp,
        note: extractionResult.note || null,
      },
      handbook_metadata: APH_SOURCE_METADATA,
      summary: {
        total_checks: deterministicChecks.length,
        passed_checks: passedChecksCount,
        discrepancies: discrepanciesCount,
        requires_human_review: humanReviewCount,
        missing_evidence: missingDocsCount,
        total_regulatory_findings: regulatoryFindings.length,
        compliant_findings: compliantFindingsCount,
        action_required_findings: actionRequiredFindingsCount,
        overall_status:
          discrepanciesCount > 0
            ? "DISCREPANCY_DETECTED"
            : humanReviewCount > 0
            ? "REQUIRES_HUMAN_REVIEW"
            : missingDocsCount > 0
            ? "MISSING_EVIDENCE"
            : "CONSISTENT_VERIFIED",
      },
      extraction,
      deterministic_checks: deterministicChecks,
      regulatory_findings: regulatoryFindings,
    });
  } catch (err) {
    console.error("[API intelligence/analyze] Unhandled Exception:", err);
    return Response.json(
      {
        success: false,
        error: true,
        error_code: "INTERNAL_SERVER_ERROR",
        error_message: err.message || "An unexpected error occurred during intelligence processing.",
      },
      { status: 500 }
    );
  }
}
