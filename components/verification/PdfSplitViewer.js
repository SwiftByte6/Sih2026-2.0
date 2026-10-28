"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  Download,
  RefreshCw,
  AlertCircle,
  FileSearch,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { getDocumentSignedUrl } from "@/lib/dataService";

export function PdfSplitViewer({
  documents = [],
  activeField = null,
  activeDocumentIndex = 0,
  onSelectDocument,
  className = "",
}) {
  const [currentDocIndex, setCurrentDocIndex] = useState(activeDocumentIndex);
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pageNumber, setPageNumber] = useState(1);

  const currentDoc = documents[currentDocIndex] || documents[0] || {
    original_filename: "FDR_Receipt_Scan.pdf",
    storage_path: "AICTE_FDR_Demo_PDF_Pack/fdr-001_FDR-2024-ND-001_SIMULATED.pdf",
    document_type: "FDR_COPY",
  };

  useEffect(() => {
    let isMounted = true;
    async function loadSignedUrl() {
      if (!currentDoc) return;
      setLoading(true);
      setError("");
      try {
        const path = currentDoc.storage_path || `AICTE_FDR_Demo_PDF_Pack/${currentDoc.original_filename}`;
        const url = await getDocumentSignedUrl(path, 900);
        if (isMounted) {
          setSignedUrl(url);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load secure document preview.");
          setLoading(false);
        }
      }
    }
    loadSignedUrl();
    return () => {
      isMounted = false;
    };
  }, [currentDocIndex, currentDoc?.storage_path, currentDoc?.original_filename]);

  // When activeField changes, adjust page if specified
  useEffect(() => {
    if (activeField?.source_page) {
      setPageNumber(activeField.source_page);
    }
  }, [activeField]);

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 60), 160));
  };

  return (
    <div className={`flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs ${className}`}>
      {/* Top Document Toolbar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Document Switcher (if multiple files) */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
          {documents.length > 1 ? (
            documents.map((doc, idx) => (
              <button
                key={doc.id || idx}
                type="button"
                onClick={() => {
                  setCurrentDocIndex(idx);
                  if (onSelectDocument) onSelectDocument(idx);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  currentDocIndex === idx
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <FileText className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[140px]">{doc.original_filename || `Doc ${idx + 1}`}</span>
              </button>
            ))
          ) : (
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <FileText className="h-4 w-4 text-blue-700 shrink-0" />
              <span className="truncate max-w-xs">{currentDoc.original_filename}</span>
            </div>
          )}
        </div>

        {/* Viewer Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => handleZoom(-15)}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[11px] font-mono font-medium text-slate-500 w-9 text-center">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={() => handleZoom(15)}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <div className="h-3.5 w-[1px] bg-slate-300 mx-1" />
          {signedUrl && (
            <button
              type="button"
              onClick={() => window.open(signedUrl, "_blank", "noopener,noreferrer")}
              className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Open full view in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Selected Field Evidence Inspector Banner */}
      {activeField && (
        <div className="p-3 bg-blue-50/70 border-b border-blue-200 text-xs transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-700 shrink-0" />
              <span className="font-bold text-slate-900">
                Evidence Inspector: <span className="text-blue-800">{activeField.label || activeField.field}</span>
              </span>
            </div>
            {activeField.confidence && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                {activeField.confidence} Confidence
              </span>
            )}
          </div>

          {activeField.evidence_snippet ? (
            <div className="mt-1.5 p-2 bg-white rounded border border-blue-100 text-[11px] font-mono text-slate-800 italic">
              &ldquo;{activeField.evidence_snippet}&rdquo;
            </div>
          ) : (
            <p className="mt-1 text-[11px] text-slate-500 italic">
              Extracted from page {pageNumber}. Inspect document viewer below for certificate context.
            </p>
          )}
        </div>
      )}

      {/* PDF Viewport Area */}
      <div className="flex-1 min-h-[500px] relative bg-slate-100 overflow-hidden flex items-center justify-center">
        {loading && (
          <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-700" />
            <span>Loading document preview...</span>
          </div>
        )}

        {error && !loading && (
          <div className="p-6 max-w-sm text-center">
            <Alert variant="error" title="Document Preview Unavailable">
              {error}
            </Alert>
          </div>
        )}

        {signedUrl && !loading && !error && (
          <div
            className="w-full h-full transition-transform duration-150 origin-top"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
          >
            <iframe
              src={`${signedUrl}#page=${pageNumber}&view=FitH`}
              className="w-full h-full border-0"
              title={currentDoc.original_filename || "FDR Document"}
            />
          </div>
        )}
      </div>

      {/* Bottom Status / Navigation bar */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Encrypted Supabase Document Storage (Audit Logged)</span>
        </span>
        <span className="font-mono text-slate-400">
          Page {pageNumber} of {currentDoc.page_count || 1}
        </span>
      </div>
    </div>
  );
}
