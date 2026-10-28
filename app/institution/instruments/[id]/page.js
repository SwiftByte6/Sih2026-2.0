"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ShieldCheck,
  Send,
  Building2,
  RefreshCw,
  Upload,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Alert, SimulatedNoticeBanner } from "@/components/ui/Alert";
import { PdfViewerModal } from "@/components/ui/PdfViewerModal";
import {
  getInstrumentById,
  sendClarification,
  uploadDocument,
  formatINR,
  formatDate,
  formatDateTime,
} from "@/lib/dataService";

export default function InstitutionInstrumentDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading instrument details...</div>}>
      <InstitutionInstrumentDetailContent />
    </Suspense>
  );
}

function InstitutionInstrumentDetailContent() {
  const params = useParams();
  const id = params?.id;

  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clarificationText, setClarificationText] = useState("");
  const [clarificationSent, setClarificationSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Document upload state
  const uploadInputRef = useRef(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadDocError, setUploadDocError] = useState("");
  const [uploadDocSuccess, setUploadDocSuccess] = useState("");

  const handleDirectUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadDocError("");
    setUploadDocSuccess("");

    const isPdf =
      (file.type && file.type === "application/pdf") ||
      (file.name && file.name.toLowerCase().endsWith(".pdf"));
    if (!isPdf) {
      setUploadDocError("Only PDF documents (.pdf) are permitted.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadDocError("File size exceeds the 10 MB limit.");
      return;
    }

    setIsUploadingDoc(true);
    try {
      const newDoc = await uploadDocument({
        file,
        institutionId: instrument.institution_id,
        instrumentId: instrument.id,
        documentType: "OTHER",
      });

      setInstrument((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), newDoc],
      }));
      setUploadDocSuccess("Document attached successfully.");
      setTimeout(() => setUploadDocSuccess(""), 4000);
    } catch (err) {
      console.error("Direct upload failed:", err);
      setUploadDocError(err.message || "Failed to upload document.");
    } finally {
      setIsUploadingDoc(false);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getInstrumentById(id);
      setInstrument(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSendClarification = async (e) => {
    e.preventDefault();
    if (!clarificationText.trim()) return;

    setIsSending(true);
    try {
      await sendClarification({ instrumentId: id, text: clarificationText });
      setIsSending(false);
      setClarificationSent(true);
      setInstrument((prev) => ({
        ...prev,
        notes: `Clarification Submitted by Institution: ${clarificationText}`,
      }));
    } catch (err) {
      console.error("Failed to send clarification:", err);
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <AppShell role="institution">
        <div className="py-20 text-center text-slate-500 text-sm animate-pulse">
          Loading instrument details...
        </div>
      </AppShell>
    );
  }

  if (!instrument) {
    return (
      <AppShell role="institution">
        <div className="py-20 text-center text-slate-600">
          <h2 className="text-lg font-bold">Instrument Not Found</h2>
          <Link href="/institution/instruments" className="mt-4 inline-block">
            <Button variant="secondary" size="sm">
              Back to Repository
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const isActionRequired = instrument.verification_status === "ACTION_REQUIRED";

  return (
    <AppShell
      role="institution"
      breadcrumbs={[
        { label: "Dashboard", href: "/institution/dashboard" },
        { label: "Security Deposits", href: "/institution/instruments" },
        { label: instrument.instrument_reference },
      ]}
    >
      <div className="space-y-6">
        {/* Back link & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/institution/instruments"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to FDR Repository</span>
            </Link>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {instrument.instrument_reference}
              </h1>
              <StatusBadge status={instrument.verification_status} type="verification" />
              <StatusBadge status={instrument.lifecycle_status} type="lifecycle" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              FDR Certificate No: <strong className="font-mono text-slate-800">{instrument.fdr_number}</strong> • {instrument.bank_name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/institution/release">
              <Button variant="secondary" size="sm">
                Apply for Release
              </Button>
            </Link>
          </div>
        </div>

        {/* Discrepancy Banner if Action Required */}
        {isActionRequired && (
          <Alert
            variant="warning"
            title="Council Verification Action Required"
          >
            The Council Verification Officer has flagged a discrepancy on this instrument:
            <div className="font-semibold text-slate-900 mt-1">
              &ldquo;{instrument.notes}&rdquo;
            </div>
            Please provide written clarification or confirmation below to expedite approval.
          </Alert>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5">
              <SectionHeader
                title="Deposit & Banking Details"
                description="Registered certificate parameters"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Bank Name</span>
                  <span className="font-semibold text-slate-800">{instrument.bank_name}</span>
                  <div className="text-slate-500 text-[11px] truncate">{instrument.bank_branch}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">IFSC Code</span>
                  <span className="font-semibold text-slate-800 font-mono">{instrument.bank_ifsc}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Secured Amount</span>
                  <span className="font-bold text-slate-900 text-sm font-tabular-nums">
                    {formatINR(instrument.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Date of Issue</span>
                  <span className="font-semibold text-slate-800 font-tabular-nums">
                    {formatDate(instrument.issue_date)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Maturity Date</span>
                  <span className="font-semibold text-slate-800 font-tabular-nums">
                    {formatDate(instrument.maturity_date)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Joint Lien</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Encumbered to AICTE
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <strong>Purpose:</strong> {instrument.purpose}
              </div>
            </Card>

            {/* Clarification Response Form */}
            {isActionRequired && (
              <Card className="p-5 border-amber-300 bg-amber-50/20">
                <SectionHeader
                  title="Respond to Council Clarification Request"
                  description="Submit explanation or confirmation from your authorized signatory"
                />

                {clarificationSent ? (
                  <Alert variant="success" title="Clarification Transmitted">
                    Your remarks have been dispatched to the assigned AICTE Verification Officer. The record status will update upon re-inspection.
                  </Alert>
                ) : (
                  <form onSubmit={handleSendClarification} className="space-y-4">
                    <Textarea
                      label="Institution Explanation / Statement"
                      required
                      rows={3}
                      value={clarificationText}
                      onChange={(e) => setClarificationText(e.target.value)}
                      placeholder="e.g. The bank branch confirmed that the certificate printing date was 15-Mar, whereas internal ledger booking occurred on 10-Mar..."
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={isSending}
                      icon={Send}
                    >
                      Transmit Clarification to AICTE
                    </Button>
                  </form>
                )}
              </Card>
            )}

            {/* Lifecycle Events */}
            <Card className="p-5">
              <SectionHeader
                title="Instrument Lifecycle Audit"
                description="Recorded state transitions and verification actions"
              />

              <div className="space-y-3">
                {instrument.lifecycleEvents?.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{event.event_type}</div>
                      <p className="text-slate-600 mt-0.5">{event.reason}</p>
                    </div>
                    <span className="text-slate-400 text-[11px] font-tabular-nums shrink-0">
                      {formatDateTime(event.event_date)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Side Documents & Actions */}
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Attached Documents</h3>
                  <p className="text-xs text-slate-500">Uploaded evidence files</p>
                </div>
                <div>
                  <input
                    type="file"
                    ref={uploadInputRef}
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleDirectUpload}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Upload}
                    loading={isUploadingDoc}
                    disabled={isUploadingDoc}
                    onClick={() => uploadInputRef.current?.click()}
                  >
                    Upload PDF
                  </Button>
                </div>
              </div>

              {uploadDocError && (
                <div className="mb-3">
                  <Alert variant="error">{uploadDocError}</Alert>
                </div>
              )}
              {uploadDocSuccess && (
                <div className="mb-3">
                  <Alert variant="success">{uploadDocSuccess}</Alert>
                </div>
              )}

              <div className="space-y-2.5">
                {(!instrument.documents || instrument.documents.length === 0) ? (
                  <div className="p-4 text-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-500">
                    <FileText className="h-5 w-5 text-slate-400 mx-auto mb-1 opacity-70" />
                    <span>No documents attached to this record</span>
                  </div>
                ) : (
                  instrument.documents.map((doc) => (
                    <div
                      key={doc.id || doc.storage_path}
                      className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-blue-700 shrink-0" />
                        <span className="truncate font-medium text-slate-800" title={doc.original_filename}>
                          {doc.original_filename}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setIsViewerOpen(true);
                        }}
                        className="text-blue-700 hover:text-blue-900 hover:underline font-semibold cursor-pointer shrink-0 ml-2"
                      >
                        View
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-5 bg-blue-50/30 border-blue-200">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                Renewal & Release Notes
              </h4>
              <p className="text-xs text-blue-950/80 leading-relaxed">
                Institutions must not attempt unilateral closure or encashment. To release funds after 10-year lock-in completion, submit an application under Clause 6.46 accompanied by Affidavit-6.
              </p>
            </Card>
          </div>
        </div>

        {/* PDF Document Preview Modal */}
        <PdfViewerModal
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
        />
      </div>
    </AppShell>
  );
}
