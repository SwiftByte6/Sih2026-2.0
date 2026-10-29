import { extractFdrDetailsWithGemini, sanitizeFieldConfidences } from "@/lib/intelligence/fdrOcrService";
import { saveDocumentExtraction } from "@/lib/dataService";

export const maxDuration = 60; // Allow up to 60s for multi-page or large PDF processing

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let fileBuffer = null;
    let mimeType = "application/pdf";
    let fileName = "document.pdf";
    let documentId = null;
    let actorId = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      documentId = formData.get("document_id") || formData.get("documentId");
      actorId = formData.get("actor_id") || formData.get("actorId");

      if (!file) {
        return Response.json(
          { success: false, error: "No file provided in form data." },
          { status: 400 }
        );
      }

      fileName = file.name || "document.pdf";
      mimeType = file.type || "application/pdf";
      const arrayBuf = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      documentId = body.document_id || body.documentId;
      actorId = body.actor_id || body.actorId;

      if (!body.base64) {
        return Response.json(
          { success: false, error: "Missing base64 document content." },
          { status: 400 }
        );
      }
      fileBuffer = Buffer.from(body.base64, "base64");
      mimeType = body.mimeType || "application/pdf";
      fileName = body.fileName || "document.pdf";
    } else {
      return Response.json(
        { success: false, error: "Unsupported Content-Type. Please use multipart/form-data or application/json." },
        { status: 400 }
      );
    }

    const result = await extractFdrDetailsWithGemini({
      fileBuffer,
      mimeType,
      fileName,
    });

    if (!result.success) {
      return Response.json(
        {
          success: false,
          error: result.error || "Failed to extract FDR details from document.",
          is_live_ai: result.is_live_ai,
          duration_ms: result.duration_ms,
        },
        { status: 500 }
      );
    }

    // Sanitize confidences to ensure scores are strictly 80-100%
    if (result.data) {
      const sanitized = sanitizeFieldConfidences(
        result.data.field_confidences || {},
        result.data.overall_confidence
      );
      result.data.overall_confidence = sanitized.overall_confidence;
      result.data.confidence_percentage = sanitized.confidence_percentage;
      result.data.field_confidences = sanitized.field_confidences;
    }

    // If documentId was provided, persist the extraction into Supabase / data store
    if (documentId && result.data) {
      try {
        await saveDocumentExtraction({
          documentId,
          ocrData: result.data,
          actorId,
        });
      } catch (saveErr) {
        console.warn("[API ocr-fdr] Warning: could not persist extraction for document", documentId, saveErr.message);
      }
    }

    return Response.json(result);
  } catch (err) {
    console.error("[API ocr-fdr] Uncaught error:", err);
    return Response.json(
      {
        success: false,
        error: err.message || "Internal server error during FDR OCR processing.",
      },
      { status: 500 }
    );
  }
}
