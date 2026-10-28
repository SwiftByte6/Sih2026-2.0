"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  AlertCircle,
  Building2,
  Check,
  X,
  ExternalLink,
  BrainCircuit,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { Alert, SimulatedNoticeBanner } from "@/components/ui/Alert";
import { PdfViewerModal } from "@/components/ui/PdfViewerModal";
import { IntelligenceHubView } from "@/components/intelligence/IntelligenceHubView";
import {
  getReleaseRequestById,
  updateClearance,
  approveRelease,
  formatINR,
  formatDate,
  formatDateTime,
} from "@/lib/dataService";

export default function ReleaseDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading release details...</div>}>
      <ReleaseDetailContent />
    </Suspense>
  );
}

function ReleaseDetailContent() {
  const params = useParams();
  const id = params?.id;

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clearance Resolution Modal
  const [clearanceModalOpen, setClearanceModalOpen] = useState(false);
  const [selectedClearance, setSelectedClearance] = useState(null);
  const [clearanceRemarks, setClearanceRemarks] = useState("");
  const [refNumber, setRefNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Release Approval Modal
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [nocNumber, setNocNumber] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [viewerDoc, setViewerDoc] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [showIntelligenceHub, setShowIntelligenceHub] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getReleaseRequestById(id);
      setRequest(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleOpenClearanceModal = (clr) => {
    setSelectedClearance(clr);
    setClearanceRemarks(clr.remarks || "");
    setRefNumber(clr.reference_number || `CLR/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`);
    setClearanceModalOpen(true);
  };

  const handleResolveClearance = async (actionStatus) => {
    setIsSubmitting(true);
    try {
      await updateClearance({
        clearanceId: selectedClearance.id,
        status: actionStatus,
        remarks: clearanceRemarks,
        refNumber,
      });

      // Reload fresh data from service
      const freshData = await getReleaseRequestById(id);
      if (freshData) {
        setRequest(freshData);
      } else {
        setRequest((prev) => {
          const updatedClearances = prev.clearances.map((c) =>
            c.id === selectedClearance.id
              ? {
                  ...c,
                  status: actionStatus,
                  reference_number: refNumber,
                  remarks: clearanceRemarks,
                  resolved_at: new Date().toISOString(),
                  resolved_by_name: "Dr. Rajesh Sharma",
                }
              : c
          );
          const allCleared = updatedClearances.every((c) => c.status === "CLEARED");
          return {
            ...prev,
            clearances: updatedClearances,
            status: allCleared ? "UNDER_REVIEW" : prev.status,
            clearances_summary: {
              ...prev.clearances_summary,
              cleared: updatedClearances.filter((c) => c.status === "CLEARED").length,
              pending: updatedClearances.filter((c) => c.status === "PENDING").length,
            },
          };
        });
      }
    } catch (err) {
      console.error("Failed to update clearance:", err);
    } finally {
      setIsSubmitting(false);
      setClearanceModalOpen(false);
    }
  };

  const handleApproveRelease = async () => {
    setIsSubmitting(true);
    try {
      await approveRelease({
        releaseRequestId: request.id,
        nocNumber,
        remarks: approvalRemarks,
      });

      const freshData = await getReleaseRequestById(id);
      if (freshData) {
        setRequest(freshData);
      } else {
        setRequest((prev) => ({
          ...prev,
          status: "COMPLETED",
          completion_reference: nocNumber || `NOC-AICTE-HQ-${Math.floor(10000 + Math.random() * 90000)}`,
          notes: `Release officially approved. NOC Reference: ${nocNumber}. Remarks: ${approvalRemarks}`,
          decision_by_name: "Meenakshi Sundaram (Finance Director)",
          decision_at: new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error("Failed to approve release:", err);
    } finally {
      setIsSubmitting(false);
      setApprovalModalOpen(false);
    }
  };

  if (loading) {
    return (
      <AppShell role="official">
        <div className="py-20 text-center text-slate-500 text-sm animate-pulse">
          Loading release application and clearances...
        </div>
      </AppShell>
    );
  }

  if (!request) {
    return (
      <AppShell role="official">
        <div className="py-20 text-center text-slate-600">
          <h2 className="text-lg font-bold">Release Request Not Found</h2>
          <Link href="/official/release" className="mt-4 inline-block">
            <Button variant="secondary" size="sm">
              Return to Release Queue
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const allClearancesApproved = request.clearances?.every((c) => c.status === "CLEARED");

  return (
    <AppShell
      role="official"
      breadcrumbs={[
        { label: "Dashboard", href: "/official/dashboard" },
        { label: "Release Queue", href: "/official/release" },
        { label: request.request_reference },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/official/release"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Release Queue</span>
            </Link>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {request.request_reference}
              </h1>
              <StatusBadge status={request.status} type="release" />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Institution: {request.institution_name} • Instrument: {request.instrument_reference} ({request.fdr_number})
            </p>
          </div>

          {/* Action to Issue NOC */}
          {request.status !== "COMPLETED" && (
            <Button
              variant="primary"
              size="sm"
              icon={ShieldCheck}
              disabled={!allClearancesApproved}
              onClick={() => {
                setNocNumber(`NOC-AICTE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
                setApprovalRemarks("All regulatory cell clearances confirmed. 10-year term completed under Clause 6.46.");
                setApprovalModalOpen(true);
              }}
            >
              {allClearancesApproved ? "Authorize NOC Issuance" : "Awaiting All Clearances"}
            </Button>
          )}
        </div>

        {/* Overview Banner */}
        <Card className="p-5 bg-white border border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Request Type</span>
              <span className="font-bold text-slate-900">{request.request_type}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Deposit Amount</span>
              <span className="font-bold text-slate-900 text-sm font-tabular-nums">
                {formatINR(request.amount)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Bank Institution</span>
              <span className="font-semibold text-slate-800">{request.bank_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Submission Date</span>
              <span className="font-semibold text-slate-800 font-tabular-nums">
                {formatDate(request.submitted_at)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <strong>Applicable Regulatory Basis:</strong> {request.applicable_rule_reference}
          </div>
        </Card>

        {/* AICTE INTELLIGENCE HUB — FLAGSHIP EMBEDDED ENGINE */}
        <Card className="p-5 border-blue-200 bg-gradient-to-r from-blue-50/40 via-white to-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    AICTE Intelligence Hub — Automated Verification & Regulatory Analysis
                  </h2>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                    Flagship
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Automated multi-document extraction, 5 cross-document deterministic checks, and APH 2024–27 regulatory evaluation for this release case.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/official/intelligence">
                <Button variant="secondary" size="sm" icon={ExternalLink}>
                  Open Full Hub
                </Button>
              </Link>
              <Button
                variant={showIntelligenceHub ? "secondary" : "primary"}
                size="sm"
                icon={BrainCircuit}
                onClick={() => setShowIntelligenceHub(!showIntelligenceHub)}
              >
                {showIntelligenceHub ? "Hide Intelligence Panel" : "Run Case Intelligence"}
              </Button>
            </div>
          </div>

          {showIntelligenceHub && (
            <div className="mt-6 pt-5 border-t border-slate-200">
              <IntelligenceHubView
                initialCaseId={id}
                embedded={true}
                onCaseUpdated={async () => {
                  const fresh = await getReleaseRequestById(id);
                  if (fresh) setRequest(fresh);
                }}
              />
            </div>
          )}
        </Card>

        {/* 1. STATUTORY CHECKLIST (Clause 6.46 & Affidavit-6) */}
        <Card className="p-5">
          <SectionHeader
            title="Statutory Document Checklist"
            description="Verified documents submitted by the institution per Clause 6.46 requirements"
          />

          <div className="space-y-2.5">
            {[
              {
                name: "Affidavit-6 (Sworn Declaration on Non-Judicial Stamp Paper)",
                required: true,
                status: "VERIFIED",
                filename: "Affidavit_6_Notarized_Delhi_Inst.pdf",
              },
              {
                name: "Formal Institution Release Request Letter on Official Letterhead",
                required: true,
                status: "VERIFIED",
                filename: "Request_Letter_Release_FDR_UBI.pdf",
              },
              {
                name: "Original FDR Copy & Joint Lien Deposit Proof",
                required: true,
                status: "VERIFIED",
                filename: "Union_Bank_FDR_30Lakh_Original.pdf",
              },
              {
                name: "Latest AICTE Extension of Approval (EoA) / LoA",
                required: true,
                status: "VERIFIED",
                filename: "AICTE_EoA_Approval_2025_26.pdf",
              },
            ].map((doc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900">{doc.name}</span>
                    <span className="text-slate-400 block text-[11px]">{doc.filename}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewerDoc({
                      original_filename: doc.filename,
                      storage_path: `release/${doc.filename}`,
                    });
                    setIsViewerOpen(true);
                  }}
                  className="text-blue-700 hover:text-blue-900 hover:underline font-medium cursor-pointer shrink-0"
                >
                  Inspect File →
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* 2. MULTI-CELL CLEARANCES GRID */}
        <Card className="p-5">
          <SectionHeader
            title="Multi-Cell Regulatory Clearances"
            description="Formal clearances recorded by respective AICTE bureaus prior to deposit release"
          />

          <Table
            data={request.clearances || []}
            columns={[
              {
                header: "Clearance Type",
                key: "clearance_type",
                render: (row) => (
                  <div>
                    <span className="font-bold text-slate-900 text-xs font-mono">
                      {row.clearance_type}
                    </span>
                    <span className="text-slate-500 block text-[11px]">
                      {row.department_name}
                    </span>
                  </div>
                ),
              },
              {
                header: "Status",
                key: "status",
                render: (row) => (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      row.status === "CLEARED"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-900 border-amber-200"
                    }`}
                  >
                    {row.status === "CLEARED" ? "Cleared" : "Pending"}
                  </span>
                ),
              },
              {
                header: "Clearance Ref & Remarks",
                key: "remarks",
                render: (row) => (
                  <div className="text-xs text-slate-600 max-w-md">
                    {row.reference_number && (
                      <span className="font-semibold text-slate-800 font-mono block">
                        Ref: {row.reference_number}
                      </span>
                    )}
                    <span>{row.remarks || "No remarks recorded."}</span>
                  </div>
                ),
              },
              {
                header: "Resolved At / By",
                key: "resolved_at",
                render: (row) => (
                  <div className="text-[11px] text-slate-500">
                    {row.resolved_at ? (
                      <>
                        <div className="font-medium text-slate-800">
                          {formatDate(row.resolved_at)}
                        </div>
                        <div>{row.resolved_by_name}</div>
                      </>
                    ) : (
                      "—"
                    )}
                  </div>
                ),
              },
              {
                header: "Action",
                align: "right",
                render: (row) => (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenClearanceModal(row)}
                  >
                    Update Clearance
                  </Button>
                ),
              },
            ]}
          />
        </Card>

        {/* CLEARANCE UPDATE MODAL */}
        <Modal
          isOpen={clearanceModalOpen}
          onClose={() => setClearanceModalOpen(false)}
          title={`Update Clearance: ${selectedClearance?.clearance_type}`}
          description={`Record official clearance decision for ${selectedClearance?.department_name}`}
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setClearanceModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive-outline"
                size="sm"
                onClick={() => handleResolveClearance("REJECTED")}
              >
                Withhold Clearance
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSubmitting}
                onClick={() => handleResolveClearance("CLEARED")}
              >
                Mark Cleared
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Department: <strong>{selectedClearance?.department_name}</strong>
            </div>

            <Textarea
              label="Clearance Remarks & Evidence Findings"
              rows={3}
              value={clearanceRemarks}
              onChange={(e) => setClearanceRemarks(e.target.value)}
              placeholder="e.g. Verified zero pending student court cases or financial liabilities..."
            />
          </div>
        </Modal>

        {/* NOC RELEASE APPROVAL MODAL */}
        <Modal
          isOpen={approvalModalOpen}
          onClose={() => setApprovalModalOpen(false)}
          title="Authorize Security Deposit Release (NOC Generation)"
          description="Issue formal AICTE No Objection Certificate (NOC) to the bank. This action confirms all cell clearances have been obtained."
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setApprovalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSubmitting}
                onClick={handleApproveRelease}
              >
                Confirm & Issue Official NOC
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg text-emerald-900">
              <span className="font-bold block mb-1">
                Release Approved for {request.institution_name}
              </span>
              Secured Amount: {formatINR(request.amount)} ({request.bank_name})
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Generated Official NOC Reference Number
              </label>
              <input
                type="text"
                value={nocNumber}
                onChange={(e) => setNocNumber(e.target.value)}
                className="w-full h-9.5 text-sm rounded-lg border border-slate-300 px-3 py-1.5 font-mono"
              />
            </div>

            <Textarea
              label="Authorizing Officer Remarks"
              rows={3}
              value={approvalRemarks}
              onChange={(e) => setApprovalRemarks(e.target.value)}
            />
          </div>
        </Modal>

        {/* PDF Document Preview Modal */}
        <PdfViewerModal
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setViewerDoc(null);
          }}
          document={viewerDoc}
        />

      </div>
    </AppShell>
  );
}
