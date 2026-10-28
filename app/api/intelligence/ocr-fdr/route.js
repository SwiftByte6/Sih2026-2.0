import { extractFdrDetailsWithGemini } from "@/lib/intelligence/fdrOcrService";

export const maxDuration = 60; // Allow up to 60s for multi-page or large PDF processing

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let fileBuffer = null;
    let mimeType = "application/pdf";
    let fileName = "document.pdf";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");

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
