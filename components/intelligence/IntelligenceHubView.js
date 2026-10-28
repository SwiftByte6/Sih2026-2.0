"use client";

import { useState, useCallback } from "react";
import {
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Send,
  Upload,
  ArrowRight,
  BookOpen,
  Scale,
  Clock,
  Layers,
  FileCheck2,
  Check,
  X,
  Building2,
} from "lucide-react";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Alert, SimulatedNoticeBanner } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { PdfViewerModal } from "@/components/ui/PdfViewerModal";
import { formatINR, formatDate, formatDateTime } from "@/lib/dataService";
import { getSeededExtraction } from "@/lib/intelligence/geminiProvider";
import { runDeterministicChecks } from "@/lib/intelligence/crossDocumentVerifier";
import { evaluateRegulatoryRules, APH_SOURCE_METADATA } from "@/lib/intelligence/regulatoryRules";

const SCENARIO_PRESETS = [
  {
    id: "scenario_1",
    label: "Scenario 1: Consistent Release Case",
    tag: "Consistent (10-Yr Term)",
    description: "Delhi Institute of Eng. • Union Bank ₹30L • 10-year term complete • All affidavits verified",
    badgeVariant: "success",
    caseId: "rel-001",
    files: [
      { name: "fdr-008_FDR-2016-ND-008_SIMULATED.pdf", type: "FDR_COPY", label: "Original FDR Copy (₹30 Lakh)" },
      { name: "10_Affidavit_6_Release_Security_Deposit_SIMULATED.pdf", type: "AFFIDAVIT_6", label: "Notarized Affidavit-6" },
      { name: "11_Request_Letter_Release_REL-2026-0012_SIMULATED.pdf", type: "INSTITUTION_REQUEST_LETTER", label: "Release Request Letter" },
      { name: "13_Latest_LoA_EoA_Illustrative_SIMULATED.pdf", type: "LOA_EOA", label: "Latest AICTE EoA Approval" },
    ],
  },
  {
    id: "scenario_2",
    label: "Scenario 2: Amount Mismatch & Missing Doc",
    tag: "Discrepancy & Missing EoA",
    description: "Vivekananda College • Canara Bank • Claimed ₹50L vs Affidavit ₹45L • Latest EoA missing",
    badgeVariant: "error",
    caseId: "rel-002",
    files: [
      { name: "fdr-003_FDR-2024-CH-003_SIMULATED.pdf", type: "FDR_COPY", label: "FDR Scan (₹50 Lakh)" },
      { name: "10_Affidavit_6_Release_Security_Deposit_SIMULATED.pdf", type: "AFFIDAVIT_6", label: "Affidavit-6 (Declaring ₹45 Lakh)" },
      { name: "12_Request_Letter_Refund_REL-2026-0015_SIMULATED.pdf", type: "INSTITUTION_REQUEST_LETTER", label: "Institution Refund Request" },
    ],
  },
  {
    id: "scenario_3",
    label: "Scenario 3: Conditional Litigation Flag",
    tag: "Human Review Mandatory",
    description: "Punjab National Bank • Date offset • Affidavit references pending High Court litigation",
    badgeVariant: "warning",
    caseId: "rel-003",
    files: [
      { name: "fdr-002_FDR-2024-ND-002_SIMULATED.pdf", type: "FDR_COPY", label: "PNB Deposit Certificate (₹15 Lakh)" },
      { name: "10_Affidavit_6_Release_Security_Deposit_SIMULATED.pdf", type: "AFFIDAVIT_6", label: "Affidavit-6 (Pending Writ Clause)" },
      { name: "11_Request_Letter_Release_REL-2026-0012_SIMULATED.pdf", type: "INSTITUTION_REQUEST_LETTER", label: "Clarification Request" },
      { name: "13_Latest_LoA_EoA_Illustrative_SIMULATED.pdf", type: "LOA_EOA", label: "Council EoA Letter" },
    ],
  },
];

function buildInitialAnalysis(caseId) {
  const scenarioId = caseId === "rel-002" ? "scenario_2" : caseId === "rel-003" ? "scenario_3" : "scenario_1";
  const seeded = getSeededExtraction(scenarioId);
  const caseRecord = {
    id: caseId || "rel-001",
    request_reference: "REL-2026-0012",
    institution_name:
      scenarioId === "scenario_2"
        ? "Vivekananda College of Technology & Management"
        : "Delhi Institute of Engineering & Technology",
    amount: scenarioId === "scenario_2" ? 5000000 : scenarioId === "scenario_3" ? 1500000 : 3000000,
    bank_name: scenarioId === "scenario_2" ? "Canara Bank" : scenarioId === "scenario_3" ? "Punjab National Bank" : "Union Bank of India",
    fdr_number: scenarioId === "scenario_2" ? "CNRB-FDR-7712093845" : scenarioId === "scenario_3" ? "PNB-FDR-4481029311" : "UBI-FDR-6629104829",
    issue_date: scenarioId === "scenario_2" ? "2024-10-01" : scenarioId === "scenario_3" ? "2024-03-15" : "2016-08-01",
    maturity_date: scenarioId === "scenario_2" ? "2029-10-01" : scenarioId === "scenario_3" ? "2027-03-15" : "2026-08-01",
    lien_marked: true,
  };
  const deterministicChecks = runDeterministicChecks(seeded.extraction, caseRecord, seeded.extraction.catalogued_documents);
  const regulatoryFindings = evaluateRegulatoryRules(seeded.extraction, deterministicChecks, caseRecord);

  return {
    success: true,
    case_id: caseId || "rel-001",
    scenario_id: seeded.scenarioId,
    engine: {
      is_live_ai: false,
      engine_name: "Simulated Demo Intelligence Engine (Seeded Fixture Scenario)",
      model: "simulated-aph-fixture-v1",
      duration_ms: 112,
      timestamp: new Date().toISOString(),
      note: "Seeded demonstration scenario. To run live AI extraction, configure API key in .env.local.",
    },
    handbook_metadata: APH_SOURCE_METADATA,
    summary: {
      total_checks: deterministicChecks.length,
      passed_checks: deterministicChecks.filter((c) => c.status === "PASS").length,
      discrepancies: deterministicChecks.filter((c) => c.status === "FAIL").length,
      requires_human_review: deterministicChecks.filter((c) => c.status === "WARNING").length,
      missing_evidence: deterministicChecks.filter((c) => c.status === "FAIL" && c.check_type === "DOCUMENT_COMPLETENESS").length,
      total_regulatory_findings: regulatoryFindings.length,
      compliant_findings: regulatoryFindings.filter((f) => f.status === "COMPLIANT").length,
      action_required_findings: regulatoryFindings.filter((f) => f.status !== "COMPLIANT").length,
      overall_status:
        deterministicChecks.some((c) => c.status === "FAIL")
          ? "DISCREPANCY_DETECTED"
          : deterministicChecks.some((c) => c.status === "WARNING")
          ? "REQUIRES_HUMAN_REVIEW"
          : "CONSISTENT_VERIFIED",
    },
    extraction: seeded.extraction,
    deterministic_checks: deterministicChecks,
    regulatory_findings: regulatoryFindings,
  };
}

export function IntelligenceHubView({
  initialCaseId = "rel-001",
  embedded = false,
  onCaseUpdated = null,
}) {
  const [selectedScenario, setSelectedScenario] = useState("scenario_1");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "extraction" | "checks" | "regulations" | "timeline"
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(() => buildInitialAnalysis(initialCaseId));
  const [errorState, setErrorState] = useState(null);
  const [customFiles, setCustomFiles] = useState([]);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Viewer modal state
  const [viewerDoc, setViewerDoc] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Reviewer action modal state
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [actionType, setActionType] = useState("ACKNOWLEDGE_FINDING"); // "ACKNOWLEDGE_FINDING" | "REQUEST_CORRECTION" | "RESOLVE_FINDING"
  const [actionRemarks, setActionRemarks] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [localTimeline, setLocalTimeline] = useState([]);

  const executeAnalysis = useCallback(async (scenarioId) => {
    setAnalyzing(true);
    setErrorState(null);
    setActionFeedback(null);

    try {
      const response = await fetch("/api/intelligence/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: scenarioId,
          case_id: initialCaseId || "rel-001",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorState({
          code: data.error_code || "API_FAILURE",
          message: data.error_message || "Document intelligence processing failed.",
          note: data.note,
        });
        setAnalysisResult(null);
      } else {
        setAnalysisResult(data);
      }
    } catch (err) {
      console.error("Failed to run intelligence analysis:", err);
      setErrorState({
        code: "NETWORK_ERROR",
        message: err.message || "Failed to reach server-side intelligence endpoint.",
      });
    } finally {
      setAnalyzing(false);
    }
  }, [initialCaseId]);

  const handleCustomUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsCustomMode(true);
    setAnalyzing(true);
    setErrorState(null);

    try {
      const formData = new FormData();
      formData.append("scenario_id", "custom_upload");
      formData.append("case_id", initialCaseId);
      files.forEach((f) => formData.append("files", f));

      const res = await fetch("/api/intelligence/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorState({
          code: data.error_code || "UPLOAD_PROCESSING_ERROR",
          message: data.error_message || "Failed to extract uploaded documents.",
          note: data.note,
        });
      } else {
        setAnalysisResult(data);
      }
    } catch (err) {
      setErrorState({
        code: "UPLOAD_ERROR",
        message: err.message || "File upload failed.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOpenActionModal = (finding, type = "ACKNOWLEDGE_FINDING") => {
    setSelectedFinding(finding);
    setActionType(type);
    if (type === "ACKNOWLEDGE_FINDING") {
      setActionRemarks(`Acknowledged regulatory finding under ${finding.clause}. Evidence documented in case file.`);
    } else if (type === "REQUEST_CORRECTION") {
      setActionRemarks(`Discrepancy identified under ${finding.clause} (${finding.title}). Institution requested to furnish revised documents or certified clarification.`);
    } else {
      setActionRemarks(`Resolved finding under ${finding.clause} pursuant to official verification protocol.`);
    }
    setActionModalOpen(true);
  };

  const handleSubmitAction = async () => {
    if (!actionRemarks.trim()) return;

    setActionSubmitting(true);
    try {
      const res = await fetch("/api/intelligence/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: initialCaseId,
          actionType,
          findingId: selectedFinding?.rule_id || "GENERAL",
          findingClause: selectedFinding?.clause || "Clause 6.46",
          remarks: actionRemarks,
          actorName: "Dr. Rajesh Sharma (Senior Reviewer)",
          actorRole: "reviewer",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionFeedback({
          type: "success",
          message: `Official Action [${actionType}] recorded in immutable audit log and case activity history.`,
        });

        // Add to local timeline
        setLocalTimeline((prev) => [
          {
            id: `act-${Date.now()}`,
            action: actionType,
            clause: selectedFinding?.clause || "Clause 6.46",
            remarks: actionRemarks,
            actor: "Dr. Rajesh Sharma (Senior Reviewer)",
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);

        if (onCaseUpdated) {
          onCaseUpdated();
        }
      }
    } catch (err) {
      console.error("Failed to record intelligence action:", err);
      setActionFeedback({
        type: "error",
        message: `Failed to record action: ${err.message}`,
      });
    } finally {
      setActionSubmitting(false);
      setActionModalOpen(false);
    }
  };

  const currentPreset = SCENARIO_PRESETS.find((s) => s.id === selectedScenario) || SCENARIO_PRESETS[0];

  return (
    <div className="space-y-6">
      {/* 1. FLAGSHIP BANNER & SCENARIO SELECTOR */}
      <Card className="p-5 border-blue-200 bg-gradient-to-r from-blue-50/70 via-white to-slate-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  AICTE Intelligence Hub
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
                  <Sparkles className="h-3 w-3 text-blue-600" />
                  AI-Powered
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Multi-document intelligence and automated regulatory compliance verification against the AICTE Approval Process Handbook (2024–25 to 2026–27).
              </p>
            </div>
          </div>

          {/* Engine Status Tag */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {analysisResult?.engine && (
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  analysisResult.engine.is_live_ai
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-blue-50 text-blue-800 border-blue-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    analysisResult.engine.is_live_ai ? "bg-emerald-600 animate-pulse" : "bg-blue-600"
                  }`}
                />
                <span>{analysisResult.engine.engine_name}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({analysisResult.engine.duration_ms}ms)
                </span>
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={analyzing}
              onClick={() => executeAnalysis(selectedScenario)}
            >
              Re-analyze Case
            </Button>
          </div>
        </div>

        {/* 3 Repeatable Scenario Switcher */}
        <div className="mt-4 pt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Select Demonstration Scenario:
            </span>
            <span className="text-[11px] text-slate-500">
              Repeatable test fixtures based on Approval Process Handbook provisions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SCENARIO_PRESETS.map((sc) => {
              const isSelected = selectedScenario === sc.id && !isCustomMode;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    setIsCustomMode(false);
                    setSelectedScenario(sc.id);
                    executeAnalysis(sc.id);
                  }}
                  className={`text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-slate-900">{sc.label}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        sc.badgeVariant === "success"
                          ? "bg-emerald-50 text-emerald-700"
                          : sc.badgeVariant === "error"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {sc.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {sc.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Custom PDF Upload Option */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="text-slate-500 flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5 text-slate-400" />
              <span>Or analyze custom documents (FDR, Affidavit-6, LoA/EoA, Request Letter):</span>
            </div>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-md cursor-pointer text-xs">
              <span>Select PDF Scans...</span>
              <input
                type="file"
                multiple
                accept="application/pdf"
                className="hidden"
                onChange={handleCustomUpload}
              />
            </label>
          </div>
        </div>
      </Card>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <Alert
          variant={actionFeedback.type === "success" ? "success" : "error"}
          title={actionFeedback.type === "success" ? "Action Recorded" : "Action Failed"}
        >
          {actionFeedback.message}
        </Alert>
      )}

      {/* Error State Banner */}
      {errorState && (
        <Alert variant="error" title={`Intelligence Error: ${errorState.code}`}>
          <div>
            <p className="font-medium">{errorState.message}</p>
            {errorState.note && <p className="text-xs mt-1 text-slate-600">{errorState.note}</p>}
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => executeAnalysis(selectedScenario)}>
                Retry Live AI Analysis
              </Button>
              <Button
                size="sm"
                variant="tertiary"
                onClick={() => {
                  setSelectedScenario("scenario_1");
                  setIsCustomMode(false);
                }}
              >
                Load Seeded Demonstration Fixture
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Domain Rule Reminder Banner */}
      <SimulatedNoticeBanner message="AI-extracted fields and confidence metrics represent supportive verification evidence. AICTE release decisions strictly require authorized human officer validation and multi-cell clearances. Never treat AI outputs as proof of deposit authenticity." />

      {/* 2. NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-medium">
        {[
          { id: "overview", label: "Executive Summary & Checks", icon: Scale },
          { id: "extraction", label: "Extracted Fields & Evidence", icon: FileText },
          { id: "regulations", label: "Handbook Regulatory Findings", icon: BookOpen },
          { id: "timeline", label: "Case Timeline & Clearances", icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-blue-700 text-blue-700 bg-blue-50/40"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT */}
      {analyzing ? (
        <Card className="p-12 text-center text-slate-500">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-800">
            Running AI Document Intelligence & Regulatory Verification...
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Extracting structured deposit parameters, executing 5 cross-document deterministic checks, and evaluating compliance against AICTE Handbook Clauses 2.25, 6.46, and 7.7.
          </p>
        </Card>
      ) : analysisResult ? (
        <div className="space-y-6">
          {/* TAB 1: OVERVIEW & DETERMINISTIC CHECKS */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Overall Case Status
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    {analysisResult.summary.discrepancies > 0 ? (
                      <span className="text-sm font-bold text-rose-700 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" /> Discrepancy Found
                      </span>
                    ) : analysisResult.summary.requires_human_review > 0 ? (
                      <span className="text-sm font-bold text-amber-700 flex items-center gap-1">
                        <HelpCircle className="h-4 w-4" /> Review Required
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Consistent Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {analysisResult.summary.passed_checks} of {analysisResult.summary.total_checks} checks passed
                  </span>
                </Card>

                <Card className="p-4 border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Handbook Regulatory Findings
                  </span>
                  <div className="mt-1 text-xl font-bold text-slate-900 font-tabular-nums">
                    {analysisResult.summary.total_regulatory_findings}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {analysisResult.summary.compliant_findings} compliant • {analysisResult.summary.action_required_findings} action needed
                  </span>
                </Card>

                <Card className="p-4 border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Analyzed FDR Amount
                  </span>
                  <div className="mt-1 text-xl font-bold text-slate-900 font-tabular-nums">
                    {formatINR(analysisResult.extraction?.deposit_amount?.value)}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {analysisResult.extraction?.issuing_bank?.value || "Scheduled Bank"}
                  </span>
                </Card>

                <Card className="p-4 border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Regulatory Basis
                  </span>
                  <div className="mt-1 text-xs font-bold text-slate-900">
                    AICTE APH 2024–27
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Clauses 2.25, 6.46, 7.7, Aff-6
                  </span>
                </Card>
              </div>

              {/* 5 Deterministic Cross-Document Checks */}
              <Card className="p-5">
                <SectionHeader
                  title="Deterministic Cross-Document Checks"
                  description="Server-side objective comparisons between claimed values, extracted certificate data, and case records"
                />

                <div className="space-y-3 mt-4">
                  {analysisResult.deterministic_checks?.map((chk) => (
                    <div
                      key={chk.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        chk.status === "PASS"
                          ? "border-emerald-200 bg-emerald-50/20"
                          : chk.status === "WARNING"
                          ? "border-amber-200 bg-amber-50/20"
                          : "border-rose-200 bg-rose-50/20"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {chk.status === "PASS" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          ) : chk.status === "WARNING" ? (
                            <HelpCircle className="h-4 w-4 text-amber-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-slate-900 font-mono">
                            {chk.label}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            chk.outcome === "Consistent"
                              ? "bg-emerald-100 text-emerald-800"
                              : chk.outcome === "Requires human review"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {chk.outcome}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 mt-2 font-medium">
                        {chk.message}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Expected / Claimed Value</span>
                          <span className="font-semibold text-slate-800 font-mono">{chk.expected_value}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Observed Document Evidence</span>
                          <span className="font-semibold text-slate-800 font-mono">{chk.observed_value}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Catalogued Source Documents in Current Case */}
              <Card className="p-5">
                <SectionHeader
                  title="Catalogued Case Documents & Verification Files"
                  description="Source PDF fixtures analyzed for this demonstration scenario"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {currentPreset.files.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-4 w-4 text-blue-700 shrink-0" />
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 block truncate">{f.label}</span>
                          <span className="text-slate-400 text-[10px] block font-mono truncate">{f.name}</span>
                        </div>
                      </div>
                      <Button
                        size="xs"
                        variant="tertiary"
                        onClick={() => {
                          setViewerDoc({
                            original_filename: f.name,
                            storage_path: f.name,
                          });
                          setIsViewerOpen(true);
                        }}
                      >
                        Inspect File →
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 2: EXTRACTED FIELDS & SOURCE EVIDENCE */}
          {activeTab === "extraction" && (
            <Card className="p-5">
              <SectionHeader
                title="Structured AI Document Extraction Matrix"
                description="Field-by-field extracted data with source document citations, page/location references, and confidence scores"
              />

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Field Name</th>
                      <th className="py-2.5 px-3">Extracted Value</th>
                      <th className="py-2.5 px-3">Source Document</th>
                      <th className="py-2.5 px-3">Page / Location</th>
                      <th className="py-2.5 px-3">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { key: "Institution Name", data: analysisResult.extraction?.institution_name },
                      { key: "Trust / Society Name", data: analysisResult.extraction?.trust_or_society_name },
                      { key: "AICTE Application / Permanent ID", data: analysisResult.extraction?.aicte_application_id },
                      { key: "FDR Number", data: analysisResult.extraction?.fdr_number },
                      { key: "Issuing Bank & Branch", data: {
                        value: `${analysisResult.extraction?.issuing_bank?.value || "Unknown"} (${analysisResult.extraction?.bank_branch?.value || "N/A"})`,
                        source_document: analysisResult.extraction?.issuing_bank?.source_document,
                        location: analysisResult.extraction?.issuing_bank?.location,
                        confidence: analysisResult.extraction?.issuing_bank?.confidence,
                      }},
                      { key: "Deposit Amount", data: {
                        value: formatINR(analysisResult.extraction?.deposit_amount?.value),
                        source_document: analysisResult.extraction?.deposit_amount?.source_document,
                        location: analysisResult.extraction?.deposit_amount?.location,
                        confidence: analysisResult.extraction?.deposit_amount?.confidence,
                      }},
                      { key: "Deposit Term (Issue → Maturity)", data: {
                        value: `${formatDate(analysisResult.extraction?.issue_date?.value)} → ${formatDate(analysisResult.extraction?.maturity_date?.value)}`,
                        source_document: analysisResult.extraction?.issue_date?.source_document,
                        location: analysisResult.extraction?.issue_date?.location,
                        confidence: analysisResult.extraction?.issue_date?.confidence,
                      }},
                      { key: "Account Holder / Joint Lien", data: analysisResult.extraction?.deposit_holder_details },
                      { key: "Programme / Purpose", data: analysisResult.extraction?.programme_or_purpose },
                      { key: "Affidavit 6: Declared Amount", data: {
                        value: formatINR(analysisResult.extraction?.affidavit_declarations?.declared_deposit_amount?.value),
                        source_document: "AFFIDAVIT_6",
                        location: "Clause 2",
                        confidence: analysisResult.extraction?.affidavit_declarations?.declared_deposit_amount?.confidence || 0.95,
                      }},
                      { key: "Affidavit 6: 10-Yr Term Declared", data: {
                        value: analysisResult.extraction?.affidavit_declarations?.ten_year_completion_declared?.value ? "Yes (Affirmed)" : "No (Incomplete)",
                        source_document: "AFFIDAVIT_6",
                        location: "Clause 1",
                        confidence: 0.98,
                      }},
                      { key: "Affidavit 6: Zero Litigation Declared", data: {
                        value: analysisResult.extraction?.affidavit_declarations?.pending_court_case_noted
                          ? "Litigation Flagged in Text"
                          : "Yes (No Court Cases Affirmed)",
                        source_document: "AFFIDAVIT_6",
                        location: "Clause 2",
                        confidence: 0.97,
                      }},
                      { key: "Approval Letter Status", data: {
                        value: `${analysisResult.extraction?.approval_letter_details?.approval_type?.value || "N/A"} (${analysisResult.extraction?.approval_letter_details?.academic_year?.value || "N/A"}) - ${analysisResult.extraction?.approval_letter_details?.status?.value || "Unknown"}`,
                        source_document: "LOA_EOA",
                        location: "Approval Letter Header",
                        confidence: analysisResult.extraction?.approval_letter_details?.status?.confidence || 0.0,
                      }},
                    ].map((row, idx) => {
                      const val = row.data?.value || "unknown";
                      const isUnknown = val === "unknown" || !val;
                      const conf = row.data?.confidence || 0.0;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{row.key}</td>
                          <td className="py-2.5 px-3">
                            <span className={`font-mono ${isUnknown ? "text-amber-700 font-semibold" : "text-slate-900"}`}>
                              {val}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                            {row.data?.source_document || "N/A"}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                            {row.data?.location || "N/A"}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                conf >= 0.95
                                  ? "bg-emerald-100 text-emerald-800"
                                  : conf >= 0.8
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {(conf * 100).toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 3: REGULATORY FINDINGS & ACTIONS */}
          {activeTab === "regulations" && (
            <div className="space-y-4">
              <Card className="p-5 bg-white">
                <SectionHeader
                  title="AICTE Approval Process Handbook (2024–25 to 2026–27) Regulatory Findings"
                  description="Evaluated against Clauses 2.25, 6.46, 7.7, and Affidavit 6. Each finding cites the exact clause, handbook page, considered evidence, and recommended next action."
                />

                <div className="space-y-4 mt-4">
                  {analysisResult.regulatory_findings?.map((finding) => (
                    <div
                      key={finding.rule_id}
                      className={`p-4 rounded-lg border text-xs ${
                        finding.status === "COMPLIANT"
                          ? "border-emerald-200 bg-emerald-50/10"
                          : finding.status === "DISCREPANCY_DETECTED"
                          ? "border-rose-200 bg-rose-50/20"
                          : "border-amber-200 bg-amber-50/20"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 mb-2 border-b border-slate-200/60">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono text-sm">
                            {finding.clause}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="font-semibold text-slate-700">
                            Page {finding.page} ({finding.version})
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            finding.status === "COMPLIANT"
                              ? "bg-emerald-100 text-emerald-800"
                              : finding.status === "DISCREPANCY_DETECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {finding.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 text-sm mb-1">
                        {finding.title}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div className="p-2.5 rounded bg-white border border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Handbook Statutory Requirement
                          </span>
                          <p className="text-slate-700 leading-relaxed text-[11px]">
                            {finding.requirement}
                          </p>
                        </div>
                        <div className="p-2.5 rounded bg-white border border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Evidence Considered
                          </span>
                          <p className="text-slate-700 leading-relaxed text-[11px]">
                            {finding.evidence_considered}
                          </p>
                        </div>
                      </div>

                      {/* Recommended Next Action & Reviewer Action Bar */}
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="text-slate-700">
                          <strong className="text-slate-900">Recommended Action: </strong>
                          {finding.recommended_action}
                        </div>

                        {/* Interactive Reviewer Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {finding.status !== "COMPLIANT" ? (
                            <>
                              <Button
                                size="xs"
                                variant="destructive-outline"
                                onClick={() => handleOpenActionModal(finding, "REQUEST_CORRECTION")}
                              >
                                Request Correction
                              </Button>
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() => handleOpenActionModal(finding, "ACKNOWLEDGE_FINDING")}
                              >
                                Acknowledge Finding
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="xs"
                              variant="secondary"
                              onClick={() => handleOpenActionModal(finding, "RESOLVE_FINDING")}
                            >
                              Confirm Checklist
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: CASE ACTIVITY TIMELINE & CLEARANCES */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              <Card className="p-5">
                <SectionHeader
                  title="Intelligence Audit Trail & Reviewer Timeline"
                  description="Immutable event log tracking every AI extraction run, officer acknowledgement, and correction request"
                />

                <div className="space-y-3 mt-4">
                  {/* Latest local action */}
                  {localTimeline.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-blue-200 bg-blue-50/30 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-blue-700 mt-0.5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 uppercase font-mono">
                              {item.action}
                            </span>
                            <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-1.5 py-0.2 rounded">
                              {item.clause}
                            </span>
                          </div>
                          <p className="text-slate-700 mt-0.5">{item.remarks}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Actor: {item.actor} • Just now
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Seeded intelligence baseline event */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <BrainCircuit className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 uppercase font-mono">
                            INTELLIGENCE_ANALYSIS_EXECUTED
                          </span>
                          <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                            {analysisResult.engine?.model || "AI Intelligence"}
                          </span>
                        </div>
                        <p className="text-slate-700 mt-0.5">
                          Cross-document verification completed across 5 deterministic checks and 5 handbook clauses.
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          System Intelligence Worker • {formatDateTime(analysisResult.engine?.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Pending Clearances Dependency Grid */}
              <Card className="p-5">
                <SectionHeader
                  title="Multi-Cell Clearance Dependencies for Release Authorization"
                  description="Clause 6.46 statutory requirements prior to official NOC generation"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs">
                  {[
                    { cell: "Legal Affairs Cell", status: "CLEARED", note: "No court cases / stay orders pending" },
                    { cell: "Bureau of Approval", status: "CLEARED", note: "Active EoA approval maintained" },
                    { cell: "Finance & Accounts", status: "PENDING", note: "Deposit reconciliation underway" },
                    { cell: "Regional Office", status: "PENDING", note: "Site compliance confirmation pending" },
                  ].map((c, i) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900">{c.cell}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            c.status === "CLEARED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">{c.note}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      ) : null}

      {/* 4. MODALS */}
      {/* Reviewer Action Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={`Record Official Action: ${actionType.replace(/_/g, " ")}`}
        description={
          selectedFinding
            ? `Regarding regulatory finding under ${selectedFinding.clause}: ${selectedFinding.title}`
            : undefined
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Select Official Action Type
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full text-xs rounded-md border border-slate-300 p-2 font-medium"
            >
              <option value="ACKNOWLEDGE_FINDING">Acknowledge Finding (Case Audit Log)</option>
              <option value="REQUEST_CORRECTION">Request Correction from Institution (Task & Notice)</option>
              <option value="RESOLVE_FINDING">Record Resolution / Clearance Confirmation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Official Review Remarks & Justification
            </label>
            <Textarea
              rows={4}
              value={actionRemarks}
              onChange={(e) => setActionRemarks(e.target.value)}
              placeholder="Provide clear rationale, handbook clause references, and specific instructions for institution..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Send}
              loading={actionSubmitting}
              onClick={handleSubmitAction}
            >
              Submit Official Action
            </Button>
          </div>
        </div>
      </Modal>

      {/* Document PDF Inspection Modal */}
      <PdfViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        document={viewerDoc}
      />
    </div>
  );
}
