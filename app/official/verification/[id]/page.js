"use client";

import { useState, useEffect, Suspense } from "react";
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
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge, SimulatedTag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { Alert, SimulatedNoticeBanner } from "@/components/ui/Alert";
import { getInstrumentById, formatINR, formatDate, formatDateTime } from "@/lib/dataService";

export default function VerificationDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading verification details...</div>}>
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

  // Decision Modal State
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState("VERIFY"); // VERIFY | FLAG_DISCREPANCY | REQUEST_INFO | REJECT
  const [decisionReason, setDecisionReason] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // BACKEND INTEGRATION:
      // supabase.from('financial_instruments').select(`
      //   *, institutions(*), documents(*), verification_requests(*), verification_checks(*), lifecycle_events(*)
      // `).eq('id', id).single()
      const data = await getInstrumentById(id);
      setInstrument(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleOpenDecisionModal = (type) => {
    setDecisionType(type);
    setDecisionReason("");
    setDecisionModalOpen(true);
  };

  const handleRecordDecision = async () => {
    if (!decisionReason.trim()) return;

    setIsSubmitting(true);
    // BACKEND INTEGRATION:
    // Future server-side mutation:
    // 1. Transaction to update financial_instruments: verification_status, lifecycle_status, notes
    // 2. Insert into public.lifecycle_events (from_status, to_status, actor_id, reason)
    // 3. Insert into public.audit_logs (actor_user_id, action, before_data, after_data, reason)
    // 4. If REQUEST_INFO, insert into public.notifications for institution_admin

    setTimeout(() => {
      setIsSubmitting(false);
      setDecisionModalOpen(false);

      let newStatus = instrument.verification_status;
      let newLifecycle = instrument.lifecycle_status;
      let msg = "";

      if (decisionType === "VERIFY") {
        newStatus = "VERIFIED";
        newLifecycle = "ACTIVE";
        msg = "Instrument has been officially verified and joint lien confirmed.";
      } else if (decisionType === "FLAG_DISCREPANCY") {
        newStatus = "ACTION_REQUIRED";
        msg = "Discrepancy officially flagged. Institution will be prompted to resolve variance.";
      } else if (decisionType === "REQUEST_INFO") {
        newStatus = "PROCESSING";
        msg = "Request for clarification dispatched to institution registrar.";
      } else if (decisionType === "REJECT") {
        newStatus = "REJECTED";
        msg = "Submission rejected with official remarks recorded.";
      }

      setInstrument((prev) => ({
        ...prev,
        verification_status: newStatus,
        lifecycle_status: newLifecycle,
        notes: `Official Decision: ${decisionReason}`,
      }));

      setActionSuccessMessage(msg);
    }, 500);
  };

  if (loading) {
    return (
      <AppShell role="official">
        <div className="py-20 text-center text-slate-500 text-sm animate-pulse">
          Loading 3-way instrument verification data...
        </div>
      </AppShell>
    );
  }

  if (!instrument) {
    return (
      <AppShell role="official">
        <div className="py-20 text-center text-slate-600">
          <h2 className="text-lg font-bold text-slate-800">Instrument Record Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">The requested FDR reference could not be located.</p>
          <Link href="/official/verification" className="mt-4 inline-block">
            <Button variant="secondary" size="sm">
              Return to Verification Queue
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const latestReq = instrument.verificationRequests?.[0];

  return (
    <AppShell
      role="official"
      breadcrumbs={[
        { label: "Dashboard", href: "/official/dashboard" },
        { label: "Verification Queue", href: "/official/verification" },
        { label: instrument.instrument_reference },
      ]}
    >
      <div className="space-y-6">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/official/verification"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Verification Queue</span>
            </Link>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {instrument.instrument_reference}
              </h1>
              <StatusBadge status={instrument.verification_status} type="verification" />
              <StatusBadge status={instrument.lifecycle_status} type="lifecycle" />
              <SimulatedTag />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {instrument.institution?.institution_name} • AICTE ID: {instrument.institution?.aicte_institution_id}
            </p>
          </div>

          {/* Action Buttons for Reviewer */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenDecisionModal("REQUEST_INFO")}
            >
              Request Clarification
            </Button>
            <Button
              variant="destructive-outline"
              size="sm"
              onClick={() => handleOpenDecisionModal("FLAG_DISCREPANCY")}
            >
              Flag Discrepancy
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={() => handleOpenDecisionModal("VERIFY")}
            >
              Approve Verification
            </Button>
          </div>
        </div>

        {/* Success Feedback Alert */}
        {actionSuccessMessage && (
          <Alert variant="success" title="Decision Recorded">
            {actionSuccessMessage}
          </Alert>
        )}

        {/* Important Regulatory Banner */}
        <SimulatedNoticeBanner message="Bank CBS integration response is simulated sandbox data. Note: Bank API errors (timeouts) must NOT be treated as invalid FDRs; OCR output is supportive evidence requiring officer confirmation." />

        {/* 3-WAY RECONCILIATION COMPARISON GRID */}
        <div>
          <div className="mb-3">
            <h2 className="text-base font-bold text-slate-900">
              3-Way Reconciliation Comparison
            </h2>
            <p className="text-xs text-slate-500">
              Cross-verifying submitted institution claims against extracted OCR certificate data and simulated Core Banking System (CBS) records.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* COLUMN 1: Submitted Institution Data */}
            <Card className="p-5 border-slate-300">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  1. Institution Submission
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Claimed</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">FDR Number</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {instrument.fdr_number}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Secured Amount</span>
                  <span className="font-bold text-slate-900 text-sm font-tabular-nums">
                    {formatINR(instrument.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Bank & Branch</span>
                  <span className="font-semibold text-slate-800">
                    {instrument.bank_name}
                  </span>
                  <div className="text-[11px] text-slate-500 truncate">{instrument.bank_branch}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Issue Date</span>
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
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Joint Lien Declaration</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Claimed in favor of AICTE
                  </span>
                </div>
              </div>
            </Card>

            {/* COLUMN 2: OCR Extracted Document Data */}
            <Card className="p-5 border-slate-300">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-600" />
                  2. Document Extraction (OCR)
                </span>
                <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                  98.4% Confidence
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Extracted FDR Number</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {instrument.fdr_number}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Extracted Amount</span>
                  <span className="font-bold text-slate-900 text-sm font-tabular-nums">
                    {formatINR(instrument.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Extracted Bank</span>
                  <span className="font-semibold text-slate-800">
                    {instrument.bank_name}
                  </span>
                  <div className="text-[11px] text-slate-500 font-mono">IFSC: {instrument.bank_ifsc}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Extracted Issue Date</span>
                    <span className="font-semibold text-slate-800 font-tabular-nums">
                      {formatDate(instrument.issue_date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Extracted Maturity</span>
                    <span className="font-semibold text-slate-800 font-tabular-nums">
                      {formatDate(instrument.maturity_date)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Supporting PDF Document</span>
                  <span className="font-semibold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer">
                    <FileText className="h-3 w-3" />
                    {instrument.documents?.[0]?.original_filename || "FDR_Receipt_Scan.pdf"}
                  </span>
                </div>
              </div>
            </Card>

            {/* COLUMN 3: Simulated Bank Core Banking System Response */}
            <Card className="p-5 border-slate-300">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  3. Bank CBS Response
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {latestReq?.status === "SUCCEEDED" ? "Connected (342ms)" : latestReq?.status || "Connected"}
                </span>
              </div>

              {latestReq?.status === "FAILED" ? (
                <div className="py-4">
                  <Alert variant="error" title="External Bank API Error">
                    {latestReq.error_message || "Gateway Timed Out (504)."}
                    <div className="mt-2 text-[11px] text-slate-600 font-medium">
                      Per Section 3 Rules: This API failure is a system connectivity fault, NOT proof of an invalid FDR. Scheduled retry is active.
                    </div>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">CBS Ledger FDR Reference</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {latestReq?.response_summary?.fdr_number || instrument.fdr_number}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">CBS Principal Amount</span>
                    <span className="font-bold text-slate-900 text-sm font-tabular-nums">
                      {formatINR(latestReq?.response_summary?.amount || instrument.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Lien Encumbrance Holder</span>
                    <span className="font-semibold text-slate-800">
                      {latestReq?.response_summary?.lien_holder || "Member Secretary, AICTE"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[11px]">CBS Issue Date</span>
                      <span
                        className={`font-semibold font-tabular-nums ${
                          latestReq?.response_summary?.issue_date &&
                          latestReq?.response_summary?.issue_date !== instrument.issue_date
                            ? "text-red-700 bg-red-50 px-1 rounded"
                            : "text-slate-800"
                        }`}
                      >
                        {formatDate(latestReq?.response_summary?.issue_date || instrument.issue_date)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">CBS Maturity Date</span>
                      <span className="font-semibold text-slate-800 font-tabular-nums">
                        {formatDate(latestReq?.response_summary?.maturity_date || instrument.maturity_date)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Account Status in Bank</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {latestReq?.response_summary?.account_status || "ACTIVE_LIEN_MARKED"}
                    </span>
                  </div>
                </div>
              )}
            </Card>

          </div>
        </div>

        {/* VERIFICATION RULES CHECK MATRIX */}
        <Card className="p-5">
          <SectionHeader
            title="Automated Rule Verification Matrix"
            description="Field-by-field consistency checks generated by the verification pipeline"
          />

          <Table
            data={instrument.verificationChecks || []}
            columns={[
              {
                header: "Check Rule",
                key: "check_type",
                render: (row) => (
                  <div className="font-semibold text-slate-900 text-xs font-mono">
                    {row.check_type}
                  </div>
                ),
              },
              {
                header: "Result",
                key: "status",
                render: (row) => (
                  <StatusBadge status={row.status} type="check" size="sm" />
                ),
              },
              {
                header: "Submitted / Expected",
                key: "expected_value",
                render: (row) => (
                  <span className="font-mono text-xs text-slate-700">
                    {String(row.expected_value)}
                  </span>
                ),
              },
              {
                header: "Observed / Bank Record",
                key: "observed_value",
                render: (row) => (
                  <span
                    className={`font-mono text-xs font-medium ${
                      row.status === "FAIL"
                        ? "text-red-700 bg-red-50 px-1 py-0.5 rounded"
                        : "text-slate-700"
                    }`}
                  >
                    {String(row.observed_value)}
                  </span>
                ),
              },
              {
                header: "Verification Finding & Notes",
                key: "message",
                render: (row) => (
                  <div className="text-xs text-slate-600 max-w-md">
                    {row.message}
                  </div>
                ),
              },
            ]}
          />
        </Card>

        {/* LIFECYCLE AUDIT TRAIL */}
        <Card className="p-5">
          <SectionHeader
            title="Instrument Lifecycle & Decision History"
            description="Immutable sequence of recorded submission events and official actions"
          />

          <div className="space-y-3">
            {instrument.lifecycleEvents?.map((event) => (
              <div
                key={event.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {event.event_type}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      Actor: {event.actor_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {event.reason}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 font-tabular-nums">
                    {formatDateTime(event.event_date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* DECISION ACTION MODAL */}
        <Modal
          isOpen={decisionModalOpen}
          onClose={() => setDecisionModalOpen(false)}
          title={
            decisionType === "VERIFY"
              ? "Official Verification Approval"
              : decisionType === "FLAG_DISCREPANCY"
              ? "Flag Discrepancy Exception"
              : decisionType === "REQUEST_INFO"
              ? "Request Clarification from Institution"
              : "Reject Instrument Submission"
          }
          description="Enter your official findings and mandatory justification. This action is permanently recorded in the audit trail."
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDecisionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant={
                  decisionType === "REJECT" || decisionType === "FLAG_DISCREPANCY"
                    ? "destructive"
                    : "primary"
                }
                size="sm"
                loading={isSubmitting}
                disabled={!decisionReason.trim()}
                onClick={handleRecordDecision}
              >
                Confirm & Record Decision
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-900 block mb-1">
                Instrument: {instrument.instrument_reference} ({instrument.fdr_number})
              </span>
              Secured Amount: {formatINR(instrument.amount)} • Bank: {instrument.bank_name}
            </div>

            <Textarea
              label="Official Decision Justification & Remarks"
              required
              rows={4}
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              placeholder="e.g. Verified against Core Banking Ledger; joint lien in favor of Member Secretary AICTE confirmed..."
              helpText="Mandatory per statutory audit requirements."
            />
          </div>
        </Modal>

      </div>
    </AppShell>
  );
}
