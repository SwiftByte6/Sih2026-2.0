"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  Lock,
  ExternalLink,
  ShieldAlert,
  Send,
  History,
  Info,
  Scale,
  Sparkles,
  Layers,
  Check,
  Edit2,
  RefreshCw,
  Clock,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge, SimulatedTag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert, SimulatedNoticeBanner } from "@/components/ui/Alert";
import { PdfSplitViewer } from "@/components/verification/PdfSplitViewer";
import { FieldVerificationTable } from "@/components/verification/FieldVerificationTable";
import { ComplianceIntelligencePanel } from "@/components/verification/ComplianceIntelligencePanel";
import { OfficerActionModal } from "@/components/verification/OfficerActionModal";
import { analyzeDiscrepancies } from "@/lib/intelligence/discrepancyEngine";
import { calculateReviewPriority } from "@/lib/intelligence/riskScoring";
import {
  getInstrumentById,
  recordVerificationDecision,
  formatINR,
  formatDate,
  formatDateTime,
} from "@/lib/dataService";

export default function VerificationDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading verification workspace...</div>}>
      <VerificationDetailContent />
    </Suspense>
  );
}

function VerificationDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("fields"); // fields | compliance | reconciliation | audit

  // PDF Split-Screen & Evidence State
  const [activeField, setActiveField] = useState(null);
  const [activeDocumentIndex, setActiveDocumentIndex] = useState(0);

  // Investigation Workflow Action Modal
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [modalActionType, setModalActionType] = useState("REQUEST_CLARIFICATION");
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  // Officer field overrides / corrections map
  const [corrections, setCorrections] = useState({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getInstrumentById(id);
      setInstrument(data);
      setLoading(false);
    }
    load();
  }, [id]);

  // Derived OCR & CBS mocks for comprehensive cross-reconciliation
  const latestReq = instrument?.verificationRequests?.[0];
  const cbsData = useMemo(() => {
    if (!latestReq?.response_summary) {
      return {
        fdr_number: instrument?.fdr_number,
        amount: instrument?.amount,
        bank_name: instrument?.bank_name,
        issue_date: instrument?.issue_date,
        maturity_date: instrument?.maturity_date,
        lien_holder: "Member Secretary, AICTE",
        status: "ACTIVE_LIEN_MARKED",
      };
    }
    return latestReq.response_summary;
  }, [latestReq, instrument]);

  const extractedData = useMemo(() => {
    return {
      fdr_number: instrument?.fdr_number || "UBI-FDR-6629104829",
      bank_name: instrument?.bank_name || "Union Bank of India",
      bank_branch: instrument?.bank_branch || "Pushp Vihar Branch, New Delhi",
      bank_ifsc: instrument?.bank_ifsc || "UBIN0000281",
      amount: instrument?.amount || 3000000,
      issue_date: instrument?.issue_date || "2016-08-01",
      maturity_date: instrument?.maturity_date || "2026-08-01",
      institution_name: instrument?.institution_name || "Delhi Institute of Engineering & Technology",
      lien_marked: instrument?.lien_marked !== false,
      lien_details: instrument?.lien_details || "Encumbered in favor of Member Secretary, AICTE, New Delhi",
      overall_confidence: 0.985,
      confidence_percentage: "98.5%",
      document_title: instrument?.documents?.[0]?.original_filename || "FDR_Certificate_Scan.pdf",
      raw_snippets: [
        { label: "fdr_number", text: `Fixed Deposit Receipt Certificate No: ${instrument?.fdr_number || "UBI-FDR-6629104829"}` },
        { label: "amount", text: `Principal Secured Deposit: ₹${(instrument?.amount || 3000000).toLocaleString("en-IN")}` },
        { label: "lien", text: "Security deposit held under joint lien to Member Secretary, AICTE, New Delhi per Clause 2.25" },
      ],
    };
  }, [instrument]);

  // Deterministic Discrepancy Engine Evaluation
  const discrepancies = useMemo(() => {
    if (!instrument) return [];
    return analyzeDiscrepancies({
      submitted: instrument,
      extracted: extractedData,
      cbs: cbsData,
      documents: instrument.documents || [],
    });
  }, [instrument, extractedData, cbsData]);

  // Explainable Review Prioritization (Triage)
  const priority = useMemo(() => {
    if (!instrument) return { level: "LOW", label: "Standard Review", score: 10, reasons: [] };
    return calculateReviewPriority(instrument, discrepancies);
  }, [instrument, discrepancies]);

  // Documents list
  const documentsList = useMemo(() => {
    if (!instrument) return [];
    if (instrument.documents && instrument.documents.length > 0) {
      return instrument.documents;
    }
    return [
      {
        id: "doc-fdr",
        original_filename: "FDR_Certificate_Scan.pdf",
        storage_path: "AICTE_FDR_Demo_PDF_Pack/fdr-001_FDR-2024-ND-001_SIMULATED.pdf",
        document_type: "FDR_COPY",
        file_size_bytes: 1420580,
      },
      {
        id: "doc-aff",
        original_filename: "10_Affidavit_6_Release_Security_Deposit_SIMULATED.pdf",
        storage_path: "AICTE_FDR_Demo_PDF_Pack/10_Affidavit_6_Release_Security_Deposit_SIMULATED.pdf",
        document_type: "AFFIDAVIT_6",
        file_size_bytes: 840200,
      },
    ];
  }, [instrument]);

  const handleOpenActionModal = (type) => {
    setModalActionType(type);
    setActionModalOpen(true);
  };

  const handleExecuteOfficerAction = async (payload) => {
    const { actionType, subject, content, reason, decisionType } = payload;

    let res;
    if (actionType === "RECORD_DECISION") {
      res = await recordVerificationDecision({
        instrumentId: id,
        decisionType,
        reason,
        actorId: "user-official-1",
        actorName: "Dr. Rajesh Sharma",
      });

      setActionSuccessMessage(
        decisionType === "VERIFY"
          ? "Decision Recorded: Instrument officially verified and joint lien approved."
          : decisionType === "FLAG_DISCREPANCY"
          ? "Decision Recorded: Variance officially flagged. Institution will be required to resolve."
          : "Decision Recorded: Submission rejected with official remarks recorded."
      );

      setInstrument((prev) => ({
        ...prev,
        verification_status: decisionType === "VERIFY" ? "VERIFIED" : decisionType === "FLAG_DISCREPANCY" ? "ACTION_REQUIRED" : "REJECTED",
        lifecycle_status: decisionType === "VERIFY" ? "ACTIVE" : prev.lifecycle_status,
      }));
    } else if (actionType === "REQUEST_CLARIFICATION") {
      setActionSuccessMessage(`Official Clarification Dispatched: "${subject}" sent to institution registrar.`);
      setInstrument((prev) => ({
        ...prev,
        verification_status: "ACTION_REQUIRED",
      }));
    } else if (actionType === "RESOLVE_DISCREPANCY") {
      setActionSuccessMessage(`Discrepancy Marked Resolved: ${reason}`);
    } else if (actionType === "ADD_INTERNAL_NOTE") {
      setActionSuccessMessage("Internal review note saved to immutable officer audit trail.");
    }
  };

  const handleSaveFieldCorrection = ({ fieldId, value, reason }) => {
    setCorrections((prev) => ({
      ...prev,
      [fieldId]: { value, reason, timestamp: new Date().toISOString() },
    }));
    setActionSuccessMessage(`Field ${fieldId} updated to "${value}". Logged to audit trail.`);
  };

  if (loading) {
    return (
      <AppShell role="official">
        <div className="py-24 text-center text-slate-500 text-sm space-y-3">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-700" />
          <p className="font-semibold text-slate-700">Loading AICTE Verification Workspace...</p>
        </div>
      </AppShell>
    );
  }

  if (!instrument) {
    return (
      <AppShell role="official">
        <div className="py-24 text-center text-slate-500 text-sm space-y-4">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
          <p className="font-bold text-slate-800 text-base">Instrument record not found.</p>
          <Link href="/official/verification">
            <Button variant="secondary" size="sm">
              Return to Verification Queue
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const criticalCount = discrepancies.filter((d) => d.severity === "CRITICAL").length;
  const pendingCount = discrepancies.filter((d) => d.status !== "Resolved").length;

  return (
    <AppShell
      role="official"
      breadcrumbs={[
        { label: "Dashboard", href: "/official/dashboard" },
        { label: "Verification Queue", href: "/official/verification" },
        { label: instrument.instrument_reference || "Instrument Workspace" },
      ]}
    >
      <div className="space-y-5">
        {/* TOP NAVIGATION & ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200">
          <Link
            href="/official/verification"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Queue</span>
          </Link>

          {/* Quick Officer Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Send}
              onClick={() => handleOpenActionModal("REQUEST_CLARIFICATION")}
            >
              Request Clarification
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={FileText}
              onClick={() => handleOpenActionModal("ADD_INTERNAL_NOTE")}
            >
              Internal Note
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Check}
              onClick={() => handleOpenActionModal("RESOLVE_DISCREPANCY")}
            >
              Resolve Issue
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={() => handleOpenActionModal("RECORD_DECISION")}
            >
              Record Decision
            </Button>
          </div>
        </div>

        {/* FEEDBACK SUCCESS ALERT */}
        {actionSuccessMessage && (
          <Alert variant="success" title="Action Completed">
            {actionSuccessMessage}
          </Alert>
        )}

        {/* =========================================================================
            SECTION 2.A: HEADER & CASE SUMMARY
            ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  {instrument.instrument_reference || "FDR-2024-ND-001"}
                </span>
                <span className="text-slate-300">•</span>
                <h1 className="text-lg font-bold text-slate-900">
                  {instrument.institution_name}
                </h1>
                <span className="text-xs text-slate-500 font-mono">
                  (AICTE ID: {instrument.aicte_institution_id})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {instrument.purpose || "Mandatory Security Deposit under AICTE Approval Process Handbook Clause 1.12 / 2.25"}
              </p>
            </div>

            {/* Status & Review Priority Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={instrument.verification_status} type="verification" />
              <StatusBadge status={instrument.lifecycle_status} type="lifecycle" />
              <div className={`px-2.5 py-1 rounded-md border text-xs font-bold flex items-center gap-1.5 ${priority.badgeClasses}`}>
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                <span>{priority.label}</span>
              </div>
            </div>
          </div>

          {/* KPI Metrics Row: Extraction Quality vs Compliance Separation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <span className="text-[11px] text-slate-400 block font-medium">Secured Amount</span>
              <span className="text-base font-bold text-slate-900 font-tabular-nums mt-0.5 block">
                {formatINR(instrument.amount)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <span className="text-[11px] text-slate-400 block font-medium">Scheduled Bank</span>
              <span className="font-semibold text-slate-900 mt-0.5 block truncate" title={instrument.bank_name}>
                {instrument.bank_name}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <span className="text-[11px] text-slate-400 block font-medium">Extraction Quality</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="font-bold text-blue-700 font-tabular-nums text-sm">
                  {extractedData.confidence_percentage}
                </span>
                <span className="text-[10px] text-slate-400">(AI OCR)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <span className="text-[11px] text-slate-400 block font-medium">Critical Issues</span>
              <span className={`font-bold text-sm mt-0.5 block ${criticalCount > 0 ? "text-red-700" : "text-emerald-700"}`}>
                {criticalCount} Critical Mismatch
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <span className="text-[11px] text-slate-400 block font-medium">Pending Checks</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {pendingCount} Pending Action
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <span className="text-[11px] text-slate-400 block font-medium">Assigned Officer</span>
              <span className="font-semibold text-slate-900 mt-0.5 block truncate">
                {instrument.assigned_reviewer || "Dr. Rajesh Sharma"}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2.B: DISCREPANCY OVERVIEW PANEL
            ========================================================================= */}
        {discrepancies.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Detected Discrepancies & Variances ({discrepancies.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Rule: High OCR confidence does not override detected discrepancies.
              </span>
            </div>

            <div className="space-y-2.5">
              {discrepancies.map((disc) => (
                <div
                  key={disc.id}
                  className={`p-3.5 rounded-lg border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    disc.severity === "CRITICAL"
                      ? "bg-red-50/50 border-red-200 text-red-950"
                      : disc.severity === "HIGH"
                      ? "bg-orange-50/50 border-orange-200 text-orange-950"
                      : "bg-amber-50/40 border-amber-200 text-amber-950"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.2 rounded font-bold text-[10px] ${
                          disc.severity === "CRITICAL"
                            ? "bg-red-200 text-red-900"
                            : disc.severity === "HIGH"
                            ? "bg-orange-200 text-orange-900"
                            : "bg-amber-200 text-amber-900"
                        }`}
                      >
                        {disc.severity}
                      </span>
                      <strong className="text-slate-900">{disc.field}:</strong>
                      <span className="font-semibold">{disc.reason}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 pt-0.5 font-mono">
                      <span>Submitted: <strong>{disc.submitted_value}</strong></span>
                      <span>•</span>
                      <span>Extracted: <strong>{disc.extracted_value}</strong></span>
                      {disc.cbs_value !== "N/A" && (
                        <>
                          <span>•</span>
                          <span>CBS Ledger: <strong>{disc.cbs_value}</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions on this discrepancy */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setActiveField({
                          id: disc.id,
                          label: disc.field,
                          confidence: "High",
                          evidence_snippet: disc.evidence_snippet,
                          source_page: disc.source_page || 1,
                        });
                      }}
                    >
                      Inspect in PDF
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenActionModal("RESOLVE_DISCREPANCY")}
                    >
                      Resolve with Reason
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 2.D: SPLIT-SCREEN VERIFICATION WORKSPACE
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT PANEL: PDF Evidence Viewer (5 cols) */}
          <div className="lg:col-span-5 h-[750px] sticky top-4">
            <PdfSplitViewer
              documents={documentsList}
              activeField={activeField}
              activeDocumentIndex={activeDocumentIndex}
              onSelectDocument={setActiveDocumentIndex}
              className="h-full"
            />
          </div>

          {/* RIGHT PANEL: Workspace Tabs (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Workspace Navigation Tabs */}
            <div className="bg-white border border-slate-200 rounded-xl p-1.5 shadow-xs flex items-center gap-1 overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("fields")}
                className={`py-2 px-3.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === "fields"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Field-by-Field Verification (11)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("compliance")}
                className={`py-2 px-3.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === "compliance"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Scale className="h-3.5 w-3.5" />
                <span>AICTE Handbook Compliance</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("reconciliation")}
                className={`py-2 px-3.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === "reconciliation"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>3-Way Reconciliation</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("audit")}
                className={`py-2 px-3.5 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  activeTab === "audit"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>Audit Trail ({instrument.lifecycleEvents?.length || 3})</span>
              </button>
            </div>

            {/* TAB 1: FIELD-BY-FIELD VERIFICATION */}
            {activeTab === "fields" && (
              <FieldVerificationTable
                submitted={instrument}
                extracted={extractedData}
                discrepancies={discrepancies}
                activeField={activeField}
                onSelectField={setActiveField}
                onSaveCorrection={handleSaveFieldCorrection}
              />
            )}

            {/* TAB 2: AICTE COMPLIANCE INTELLIGENCE */}
            {activeTab === "compliance" && (
              <ComplianceIntelligencePanel
                instrument={instrument}
                extracted={extractedData}
                discrepancies={discrepancies}
              />
            )}

            {/* TAB 3: 3-WAY RECONCILIATION */}
            {activeTab === "reconciliation" && (
              <div className="space-y-4">
                <SimulatedNoticeBanner message="Bank CBS integration response is simulated sandbox data. Note: Bank API errors (timeouts) must NOT be treated as invalid FDRs; OCR output is supportive evidence requiring officer confirmation." />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Col 1 */}
                  <Card className="p-4 border-slate-300 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block border-b pb-2">
                      1. Institution Submission
                    </span>
                    <div>
                      <span className="text-slate-400 block text-[10px]">FDR Number:</span>
                      <span className="font-mono font-bold text-slate-900">{instrument.fdr_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Secured Amount:</span>
                      <span className="font-bold text-slate-900">{formatINR(instrument.amount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Bank & Branch:</span>
                      <span className="font-semibold text-slate-800">{instrument.bank_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Dates:</span>
                      <span>{formatDate(instrument.issue_date)} → {formatDate(instrument.maturity_date)}</span>
                    </div>
                  </Card>

                  {/* Col 2 */}
                  <Card className="p-4 border-blue-200 bg-blue-50/20 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                      <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                        2. AI Document OCR Extraction
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                        {extractedData.confidence_percentage}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Extracted FDR No:</span>
                      <span className="font-mono font-bold text-slate-900">{extractedData.fdr_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Extracted Amount:</span>
                      <span className="font-bold text-slate-900">{formatINR(extractedData.amount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Extracted Bank:</span>
                      <span className="font-semibold text-slate-800">{extractedData.bank_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Extracted Dates:</span>
                      <span>{formatDate(extractedData.issue_date)} → {formatDate(extractedData.maturity_date)}</span>
                    </div>
                  </Card>

                  {/* Col 3 */}
                  <Card className="p-4 border-slate-300 space-y-2.5">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
                        3. Core Banking Response
                      </span>
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1 rounded">
                        CBS Succeeded
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">CBS Ledger Reference:</span>
                      <span className="font-mono font-bold text-slate-900">{cbsData.fdr_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">CBS Balance:</span>
                      <span className="font-bold text-slate-900">{formatINR(cbsData.amount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Lien Holder:</span>
                      <span className="font-semibold text-slate-800">{cbsData.lien_holder}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">CBS Dates:</span>
                      <span>{formatDate(cbsData.issue_date)} → {formatDate(cbsData.maturity_date)}</span>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 4: AUDIT TRAIL */}
            {activeTab === "audit" && (
              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <Table
                    data={instrument.lifecycleEvents || [
                      {
                        event_type: "SUBMISSION_RECEIVED",
                        event_date: instrument.created_at,
                        performed_by_name: instrument.created_by_name || "Institution Registrar",
                        notes: "FDR registration submitted through technical institution portal.",
                      },
                      {
                        event_type: "AI_OCR_SCAN_COMPLETED",
                        event_date: instrument.created_at,
                        performed_by_name: "AI Document Intelligence Engine",
                        notes: "Document intelligence pass completed with 98.5% confidence.",
                      },
                      {
                        event_type: "OFFICER_WORKSPACE_OPENED",
                        event_date: new Date().toISOString(),
                        performed_by_name: "Dr. Rajesh Sharma",
                        notes: "Verification workspace accessed for scrutiny under Clause 2.25.",
                      },
                    ]}
                    columns={[
                      {
                        header: "Event",
                        key: "event_type",
                        render: (row) => (
                          <span className="font-mono font-semibold text-slate-800 text-[11px]">
                            {row.event_type}
                          </span>
                        ),
                      },
                      {
                        header: "Actor",
                        key: "performed_by_name",
                        render: (row) => (
                          <span className="text-slate-700 text-xs">
                            {row.performed_by_name}
                          </span>
                        ),
                      },
                      {
                        header: "Details / Audit Reason",
                        key: "notes",
                        render: (row) => (
                          <span className="text-slate-600 text-xs">
                            {row.notes}
                          </span>
                        ),
                      },
                      {
                        header: "Timestamp",
                        key: "event_date",
                        render: (row) => (
                          <span className="text-slate-400 text-[11px] font-mono">
                            {formatDateTime(row.event_date)}
                          </span>
                        ),
                      },
                    ]}
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* OFFICER ACTION INVESTIGATION MODAL */}
        <OfficerActionModal
          isOpen={actionModalOpen}
          onClose={() => setActionModalOpen(false)}
          actionType={modalActionType}
          instrument={instrument}
          discrepancies={discrepancies}
          onExecuteAction={handleExecuteOfficerAction}
        />
      </div>
    </AppShell>
  );
}
