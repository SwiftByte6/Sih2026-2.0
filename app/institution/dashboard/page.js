"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Upload,
  Send,
  Download,
  ShieldCheck,
  Check,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MetricCard, Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import {
  getDashboardMetrics,
  getInstruments,
  getNotifications,
  getInstitutions,
  getCurrentUser,
  formatINR,
  formatDate,
  formatDateTime,
} from "@/lib/dataService";

export default function InstitutionDashboardPage() {
  const [institutionsList, setInstitutionsList] = useState([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState("inst-001");
  const [metrics, setMetrics] = useState(null);
  const [myInstruments, setMyInstruments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Clarification / Document Replacement Modal State
  const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [responseSuccessMsg, setResponseSuccessMsg] = useState("");

  // Initialize selected institution from current logged-in user
  useEffect(() => {
    const user = getCurrentUser();
    if (user?.institution_id) {
      setSelectedInstitutionId(user.institution_id);
    }
  }, []);

  useEffect(() => {
    async function loadInstitutions() {
      try {
        const insts = await getInstitutions();
        setInstitutionsList(insts);
      } catch (e) {
        console.warn("Could not load institutions list:", e);
      }
    }
    loadInstitutions();
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const m = await getDashboardMetrics("institution", selectedInstitutionId);
      const instData = await getInstruments({ institution_id: selectedInstitutionId, pageSize: 6 });
      const notifs = await getNotifications("institution_admin");

      setMetrics(m);
      setMyInstruments(instData.items);
      setNotifications(notifs.slice(0, 4));
      setLoading(false);
    }
    load();
  }, [selectedInstitutionId]);

  const currentInstitution = institutionsList.find((i) => i.id === selectedInstitutionId) || {
    id: selectedInstitutionId,
    institution_name: "Delhi Institute of Engineering & Technology",
    aicte_institution_id: "1-109283741",
    state: "New Delhi",
  };

  const handleOpenClarificationModal = (inst) => {
    setSelectedInstrument(inst);
    setResponseText("");
    setClarificationModalOpen(true);
  };

  const handleSendClarification = async () => {
    if (!responseText.trim()) return;
    setIsSubmittingResponse(true);
    setTimeout(() => {
      setIsSubmittingResponse(false);
      setClarificationModalOpen(false);
      setResponseSuccessMsg(
        `Clarification submitted for ${selectedInstrument?.instrument_reference}. AICTE Officer notified for re-scrutiny.`
      );
    }, 600);
  };

  const handleDownloadSummary = () => {
    const content = `AICTE SECURITY DEPOSIT & FDR COMPLIANCE REPORT\nInstitution: ${currentInstitution.institution_name} (${currentInstitution.aicte_institution_id})\nDate: ${new Date().toLocaleDateString()}\nTotal Instruments: ${myInstruments.length}\nTotal Secured Amount: ₹${metrics?.totalSecuredAmount?.toLocaleString("en-IN") || "50,00,000"}\n\nInstruments:\n` +
      myInstruments.map((inst) => `- ${inst.instrument_reference} | ${inst.bank_name} | ₹${inst.amount.toLocaleString("en-IN")} | Maturity: ${inst.maturity_date} | Status: ${inst.verification_status}`).join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AICTE_FDR_Compliance_Summary_${selectedInstitutionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell
      role="institution"
      breadcrumbs={[{ label: "Institution Overview" }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-700 shrink-0" />
              {institutionsList.length > 0 ? (
                <select
                  value={selectedInstitutionId}
                  onChange={(e) => setSelectedInstitutionId(e.target.value)}
                  className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-xs cursor-pointer max-w-md truncate"
                >
                  {institutionsList.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.institution_name} ({inst.state})
                    </option>
                  ))}
                </select>
              ) : (
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {currentInstitution.institution_name}
                </h1>
              )}
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Accredited / Approved
              </span>
            </div>
            <p className="text-xs text-slate-500">
              AICTE Permanent Institute ID: <strong className="text-slate-800 font-mono">{currentInstitution.aicte_institution_id}</strong> • {currentInstitution.state}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={handleDownloadSummary}
            >
              Export Report
            </Button>
            <Link href="/institution/instruments/new">
              <Button size="sm" icon={PlusCircle}>
                Submit New FDR
              </Button>
            </Link>
          </div>
        </div>

        {responseSuccessMsg && (
          <Alert variant="success" title="Clarification Dispatched">
            {responseSuccessMsg}
          </Alert>
        )}

        {/* Action Required Banner if Discrepancies exist */}
        {metrics?.discrepanciesCount > 0 && (
          <Alert
            variant="warning"
            title="Action Required: Discrepancy Flagged by AICTE Officer"
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenClarificationModal(myInstruments.find((i) => i.id === "fdr-002") || myInstruments[0])}
              >
                Respond to Clarification
              </Button>
            }
          >
            FDR-2024-ND-002 (PNB FDR ₹15 Lakh) has an issue date variance flagged during officer verification. Please submit bank confirmation or upload rectified document.
          </Alert>
        )}

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Secured Deposits"
            value={loading ? "..." : formatINR(metrics?.totalSecuredAmount)}
            subtitle="Active locked-in FDRs"
            icon={Building2}
          />

          <MetricCard
            title="Registered Instruments"
            value={loading ? "..." : metrics?.totalInstruments}
            subtitle={`${metrics?.verifiedCount || 0} officially verified`}
            icon={FileText}
          />

          <MetricCard
            title="Action Required"
            value={loading ? "..." : metrics?.discrepanciesCount}
            subtitle="Clarification requested"
            icon={AlertTriangle}
            badge={
              metrics?.discrepanciesCount > 0 ? (
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Needs Attention
                </span>
              ) : null
            }
          />

          <MetricCard
            title="Upcoming Maturities"
            value={loading ? "..." : metrics?.expiringSoonCount}
            subtitle="Maturity in <90 days"
            icon={Clock}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5">
              <SectionHeader
                title="Institution Security Deposits & FDRs"
                description="Financial instruments registered under AICTE Approval Process"
                action={
                  <Link href="/institution/instruments">
                    <Button variant="tertiary" size="sm" icon={ArrowRight} iconPosition="right">
                      View All
                    </Button>
                  </Link>
                }
              />

              <Table
                loading={loading}
                data={myInstruments}
                columns={[
                  {
                    header: "Reference & FDR",
                    key: "instrument_reference",
                    render: (row) => (
                      <div>
                        <div className="font-semibold text-slate-900 font-mono text-xs">
                          {row.instrument_reference}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {row.fdr_number}
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: "Bank",
                    key: "bank_name",
                    render: (row) => (
                      <span className="text-xs text-slate-800 font-medium">
                        {row.bank_name}
                      </span>
                    ),
                  },
                  {
                    header: "Secured Amount",
                    key: "amount",
                    align: "right",
                    render: (row) => (
                      <span className="text-xs font-bold text-slate-900 font-tabular-nums">
                        {formatINR(row.amount)}
                      </span>
                    ),
                  },
                  {
                    header: "Maturity Date",
                    key: "maturity_date",
                    render: (row) => (
                      <div>
                        <div className="text-xs font-medium text-slate-700 font-tabular-nums">
                          {formatDate(row.maturity_date)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {row.days_to_maturity !== undefined
                            ? row.days_to_maturity > 0
                              ? `${row.days_to_maturity}d left`
                              : `${Math.abs(row.days_to_maturity)}d matured`
                            : "—"}
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: "Status",
                    key: "verification_status",
                    render: (row) => (
                      <StatusBadge status={row.verification_status} type="verification" size="sm" />
                    ),
                  },
                  {
                    header: "Action",
                    align: "right",
                    render: (row) => (
                      <div className="flex items-center justify-end gap-1.5">
                        {row.verification_status === "ACTION_REQUIRED" ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenClarificationModal(row)}
                          >
                            Resolve Issue
                          </Button>
                        ) : (
                          <Link href={`/institution/instruments/${row.id}`}>
                            <Button variant="secondary" size="sm">
                              Inspect
                            </Button>
                          </Link>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </Card>

            {/* Statutory Maturity Alerts (Clause 6.46 90-Day Tracker) */}
            <Card className="p-5">
              <SectionHeader
                title="Statutory Lock-in & Maturity Tracking (Clause 6.46)"
                description="Mandatory 90/60/30-day alerts for maturing instruments requiring renewal or refund application"
              />

              <div className="space-y-3 pt-1">
                {myInstruments
                  .filter((inst) => inst.days_to_maturity !== undefined && inst.days_to_maturity < 180)
                  .map((inst) => (
                    <div
                      key={inst.id}
                      className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 font-mono">
                              {inst.instrument_reference}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="font-semibold text-slate-800">
                              {inst.bank_name} ({formatINR(inst.amount)})
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Maturity: <strong className="text-slate-700">{formatDate(inst.maturity_date)}</strong> • {inst.days_to_maturity > 0 ? `${inst.days_to_maturity} days remaining` : `${Math.abs(inst.days_to_maturity)} days elapsed since maturity boundary`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {inst.days_to_maturity <= 0 ? (
                          <Link href="/institution/release">
                            <Button variant="primary" size="sm">
                              Apply for Release (Affidavit-6)
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/institution/renewals">
                            <Button variant="secondary" size="sm">
                              Initiate Term Renewal
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Regulatory Notifications & Officer Messages */}
          <div className="space-y-6">
            <Card className="p-5">
              <SectionHeader
                title="Council Inquiries & Notices"
                description="Communications from AICTE Verification Bureaus"
              />

              <div className="space-y-3 text-xs">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-300 transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-[11px]">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDateTime(notif.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 bg-blue-50/40 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-blue-700" />
                <h3 className="text-xs font-bold text-blue-900">
                  AICTE Handbook Regulations Notice
                </h3>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Under Clause 2.25, security deposits must remain continuously lien-marked to the Member Secretary, AICTE throughout the 5 or 10-year term. Premature encashment without Council approval constitutes an automatic withdrawal violation.
              </p>
            </Card>
          </div>
        </div>

        {/* College Administrator Clarification Response Modal */}
        {clarificationModalOpen && (
          <Modal
            isOpen={clarificationModalOpen}
            onClose={() => setClarificationModalOpen(false)}
            maxWidth="max-w-xl"
            title={`Respond to AICTE Clarification Notice: ${selectedInstrument?.instrument_reference}`}
            description="Submit official institutional clarification or bank branch confirmation regarding the flagged variance."
            footer={
              <>
                <Button variant="secondary" size="sm" onClick={() => setClarificationModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={isSubmittingResponse}
                  onClick={handleSendClarification}
                  icon={Send}
                >
                  Submit Clarification to AICTE
                </Button>
              </>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-950">
                <span className="font-bold block text-[11px]">Officer Variance Notice:</span>
                <p className="mt-0.5 text-[11px]">
                  {selectedInstrument?.notes || "Variance noted between certificate issue date and bank CBS ledger. Official confirmation requested."}
                </p>
              </div>

              <Textarea
                label="Institution Official Clarification Response"
                required
                rows={5}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="e.g. Respectfully submitted: The deposit certificate was re-issued by Punjab National Bank Saket Branch on 2024-03-15 following branch CBS system upgrade. Attached please find the branch manager certificate confirming original deposit validity."
              />

              <div className="p-3 border border-dashed border-slate-300 rounded-lg text-center cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                <span className="text-slate-700 font-semibold text-[11px] block">
                  Attach Supporting Letter from Bank Branch Manager (PDF)
                </span>
                <span className="text-[10px] text-slate-400">Optional supporting proof (up to 10 MB)</span>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppShell>
  );
}
