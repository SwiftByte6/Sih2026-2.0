"use client";

import { useState, useEffect } from "react";
import { Download, ExternalLink, RefreshCw, AlertCircle, FileText } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Alert } from "./Alert";
import { getDocumentSignedUrl } from "@/lib/dataService";

export function PdfViewerModal({ isOpen, onClose, document: doc }) {
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchUrl() {
      if (!isOpen || !doc) {
        setSignedUrl(null);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const path = doc.storage_path;
        if (!path) {
          throw new Error("Document storage path is missing or invalid.");
        }
        const url = await getDocumentSignedUrl(path, 900);
        if (isMounted) {
          setSignedUrl(url);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to generate signed document URL:", err);
          setError(err.message || "Failed to load document preview. The file may be missing or inaccessible.");
          setLoading(false);
        }
      }
    }

    fetchUrl();

    return () => {
      isMounted = false;
    };
  }, [isOpen, doc]);

  const handleDownload = async () => {
    if (!signedUrl) return;
    setIsDownloading(true);
    try {
      const response = await fetch(signedUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = doc?.original_filename || "document.pdf";
      window.document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(blobUrl);
      window.document.body.removeChild(link);
    } catch {
      // Direct navigation fallback if blob fetch blocked by CORS
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  };

  const formattedSize = doc?.file_size_bytes
    ? doc.file_size_bytes > 1024 * 1024
      ? `${(doc.file_size_bytes / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(doc.file_size_bytes / 1024)} KB`
    : "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
      title={
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-700" />
          <span className="truncate max-w-lg">{doc?.original_filename || "Document Preview"}</span>
        </div>
      }
      description={
        doc ? (
          <span>
            {formattedSize ? `${formattedSize} • ` : ""}
            Private secure document from Supabase Storage (15-min temporary signed URL)
          </span>
        ) : undefined
      }
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          {signedUrl && (
            <>
              <Button
                variant="secondary"
                size="sm"
                icon={ExternalLink}
                iconPosition="right"
                onClick={() => window.open(signedUrl, "_blank", "noopener,noreferrer")}
              >
                Open in Tab
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                loading={isDownloading}
                onClick={handleDownload}
              >
                Download PDF
              </Button>
            </>
          )}
        </>
      }
    >
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        {loading && (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-700" />
            <p className="text-sm font-medium">Generating secure signed URL from Supabase Storage...</p>
          </div>
        )}

        {error && !loading && (
          <div className="w-full space-y-4 py-8">
            <Alert variant="error" title="Unable to Access Document">
              {error}
            </Alert>
            <div className="text-center">
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={() => {
                  setLoading(true);
                  setError("");
                  getDocumentSignedUrl(doc?.storage_path, 900)
                    .then((url) => {
                      setSignedUrl(url);
                      setLoading(false);
                    })
                    .catch((err) => {
                      setError(err.message || "Failed to load document.");
                      setLoading(false);
                    });
                }}
              >
                Retry Loading
              </Button>
            </div>
          </div>
        )}

        {signedUrl && !loading && !error && (
          <div className="w-full h-[65vh] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
            <iframe
              src={signedUrl}
              className="w-full h-full"
              title={doc?.original_filename || "PDF Document Preview"}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
