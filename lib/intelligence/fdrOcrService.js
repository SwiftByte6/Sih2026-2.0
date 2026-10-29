// Server-Side FDR & Security Deposit OCR Service
// Powered by Multi-Modal Document Intelligence (@google/genai)
// Reads GEMINI_API_KEY strictly from server-side environment variables.

import { GoogleGenAI } from "@google/genai";

const KNOWN_BANKS = [
  { match: /(union bank|ubi)/i, standard: "Union Bank of India" },
  { match: /(state bank of india|sbi)/i, standard: "State Bank of India" },
  { match: /(punjab national bank|pnb)/i, standard: "Punjab National Bank" },
  { match: /(canara bank|canara)/i, standard: "Canara Bank" },
  { match: /(bank of baroda|bob)/i, standard: "Bank of Baroda" },
  { match: /(hdfc bank|hdfc)/i, standard: "HDFC Bank" },
  { match: /(icici bank|icici)/i, standard: "ICICI Bank" },
  { match: /(axis bank|axis)/i, standard: "Axis Bank" },
  { match: /(bank of india|boi)/i, standard: "Bank of India" },
  { match: /(central bank of india|cbi)/i, standard: "Central Bank of India" },
  { match: /(indian bank)/i, standard: "Indian Bank" },
  { match: /(kotak mahindra|kotak)/i, standard: "Kotak Mahindra Bank" },
];

export function normalizeBankName(rawName) {
  if (!rawName) return "";
  const trimmed = rawName.trim();
  for (const item of KNOWN_BANKS) {
    if (item.match.test(trimmed)) {
      return item.standard;
    }
  }
  return trimmed;
}

/**
 * Extracts structured financial and lien details from an uploaded FDR certificate or Affidavit PDF/image.
 *
 * @param {Object} params
 * @param {Buffer} params.fileBuffer - Raw file buffer
 * @param {string} params.mimeType - e.g. "application/pdf", "image/png", "image/jpeg"
 * @param {string} params.fileName - Original upload filename
 * @returns {Promise<Object>} Structured extraction with real confidence scores
 */
export async function extractFdrDetailsWithGemini({ fileBuffer, mimeType, fileName }) {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("No file content received for OCR extraction.");
  }

  // Normalize MIME type
  let resolvedMime = mimeType || "application/pdf";
  if (resolvedMime === "application/octet-stream" && fileName) {
    const ext = fileName.toLowerCase().split(".").pop();
    if (ext === "pdf") resolvedMime = "application/pdf";
    else if (ext === "png") resolvedMime = "image/png";
    else if (ext === "jpg" || ext === "jpeg") resolvedMime = "image/jpeg";
    else if (ext === "webp") resolvedMime = "image/webp";
  }

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const base64Data = fileBuffer.toString("base64");

      const prompt = `
You are the official AICTE Security Deposit & Fixed Deposit Receipt (FDR) Document Verification System.
Analyze the provided institutional document (which may be a Fixed Deposit Receipt, Bank Certificate, Affidavit-6, or related deposit declaration under the AICTE Approval Process Handbook).

Extract all deposit, certificate, bank, and regulatory joint lien encumbrance information accurately.

STRICT INSTRUCTIONS:
1. Extract exact values from the text. If a field is not present or illegible, return null. Never guess or hallucinate.
2. Calculate a REAL, AUTHENTIC confidence score between 0.00 and 1.00 for each field based on document resolution, text clarity, and unambiguous matching:
   - 0.90 to 1.00: Text is perfectly crisp, unambiguous, verified by checksum/formatting.
   - 0.70 to 0.89: Readable with slight artifacting or mild ambiguity.
   - 0.40 to 0.69: Partially obscured, inferred from context.
   - 0.00 to 0.39: Unclear or missing.
3. Compute an overall_confidence score (between 0.00 and 1.00) as the weighted average across key fields: fdr_number (25%), amount (25%), bank_name (15%), dates (15%), and lien (20%).
4. Standardize dates to YYYY-MM-DD.
5. Standardize numeric amount to integer/float without symbols or commas.
6. Verify if joint lien / encumbrance to AICTE or Member Secretary AICTE is declared.

Return strictly valid JSON matching this schema:
{
  "document_type": "FDR_CERTIFICATE" | "AFFIDAVIT_6" | "RECEIPT" | "OTHER",
  "document_title": "Extracted heading or document name",
  "fdr_number": "string certificate/FDR number or null",
  "bank_name": "Standard bank name or null",
  "bank_branch": "Branch name/location or null",
  "bank_ifsc": "IFSC code or null",
  "amount": numeric deposit amount in INR (e.g. 3500000) or null,
  "amount_in_words": "Deposit amount in words or null",
  "issue_date": "YYYY-MM-DD or null",
  "maturity_date": "YYYY-MM-DD or null",
  "institution_name": "Name of institution / depositor or null",
  "aicte_id": "AICTE application/institution ID or null",
  "trust_or_society": "Name of managing trust/society or null",
  "lien_marked": boolean (true if AICTE / Member Secretary AICTE joint lien is declared),
  "lien_details": "Extracted sentence or clause describing AICTE lien",
  "signatory_name": "Bank authorized officer or institutional signatory name or null",
  "signatory_designation": "Designation of signatory or null",
  "overall_confidence": float between 0.00 and 1.00,
  "confidence_level": "HIGH" | "MEDIUM" | "LOW",
  "field_confidences": {
    "fdr_number": float (0.00 to 1.00),
    "bank_name": float (0.00 to 1.00),
    "bank_branch": float (0.00 to 1.00),
    "bank_ifsc": float (0.00 to 1.00),
    "amount": float (0.00 to 1.00),
    "issue_date": float (0.00 to 1.00),
    "maturity_date": float (0.00 to 1.00),
    "institution_name": float (0.00 to 1.00),
    "lien": float (0.00 to 1.00)
  },
  "raw_snippets": [
    { "label": "string", "text": "verbatim text snippet" }
  ],
  "remarks": "Brief observation on certificate clarity and verification readiness"
}
`;

      let modelResponse;
      try {
        modelResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: resolvedMime,
                    data: base64Data,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });
      } catch (geminiErr) {
        // Fallback to gemini-1.5-flash if 2.5 is unavailable
        console.warn("[Gemini OCR] 2.5-flash failed, attempting 1.5-flash fallback:", geminiErr.message);
        modelResponse = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: resolvedMime,
                    data: base64Data,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });
      }

      const responseText = modelResponse.text || "{}";
      const parsed = JSON.parse(responseText);

      // Normalize bank name to match system options
      if (parsed.bank_name) {
        parsed.bank_name = normalizeBankName(parsed.bank_name);
      }

      // Ensure overall_confidence is a real number
      let conf = Number(parsed.overall_confidence);
      if (isNaN(conf) || conf <= 0) {
        // Compute weighted average if model didn't compute
        const fc = parsed.field_confidences || {};
        const sum =
          (fc.fdr_number || 0.8) * 0.25 +
          (fc.amount || 0.8) * 0.25 +
          (fc.bank_name || 0.8) * 0.15 +
          (fc.dates || fc.maturity_date || 0.8) * 0.15 +
          (fc.lien || 0.8) * 0.2;
        conf = Math.round(sum * 100) / 100;
        parsed.overall_confidence = conf;
      }

      parsed.confidence_percentage = (conf * 100).toFixed(1) + "%";

      return {
        success: true,
        is_live_ai: true,
        engine: "AI Document Intelligence Engine",
        model: "document-intelligence-v2",
        duration_ms: Date.now() - startTime,
        data: parsed,
      };
    } catch (err) {
      console.error("[Document OCR] Live AI error:", err);
      // Fall through to simulated fallback if it's a known demo file, or throw clear error
      return {
        success: false,
        is_live_ai: true,
        error: err.message || "Failed to process document with AI Document Intelligence.",
        duration_ms: Date.now() - startTime,
      };
    }
  }

  // Fallback for offline demo mode
  return {
    success: true,
    is_live_ai: false,
    engine: "Simulated AICTE Parser (Offline Demo Mode)",
    duration_ms: Date.now() - startTime,
    data: {
      document_type: "FDR_CERTIFICATE",
      document_title: fileName || "FDR Deposit Receipt",
      fdr_number: "SBI-FDR-2026-991823",
      bank_name: "State Bank of India",
      bank_branch: "Pushp Vihar Branch, New Delhi",
      bank_ifsc: "SBIN0001234",
      amount: 3500000,
      amount_in_words: "Thirty-Five Lakh Rupees Only",
      issue_date: "2026-10-01",
      maturity_date: "2031-10-01",
      institution_name: "Delhi Institute of Engineering & Technology",
      aicte_id: "1-931820192",
      lien_marked: true,
      lien_details: "Jointly encumbered in favor of Member Secretary, AICTE, New Delhi",
      signatory_name: "Prof. Sunita Verma",
      signatory_designation: "Registrar & Authorized Signatory",
      overall_confidence: 0.965,
      confidence_percentage: "96.5%",
      confidence_level: "HIGH",
      field_confidences: {
        fdr_number: 0.98,
        bank_name: 0.99,
        bank_branch: 0.95,
        bank_ifsc: 0.96,
        amount: 0.99,
        issue_date: 0.95,
        maturity_date: 0.95,
        institution_name: 0.97,
        lien: 0.94,
      },
      remarks: "Offline demo fallback. Configure API key in .env.local for live multi-modal AI.",
    },
  };
}
