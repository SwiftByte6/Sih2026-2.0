"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  FileCheck2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Building2,
  ExternalLink,
  BrainCircuit,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MetricCard, Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  getDashboardMetrics,
  getVerificationQueue,
  getDiscrepancies,
  getTasks,
  formatINR,
  formatDate,
} from "@/lib/dataService";

export default function OfficialDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // BACKEND INTEGRATION:
      // Parallel server queries for official dashboard summary:
      // Promise.all([getDashboardMetrics(), getVerificationQueue(), getDiscrepancies(), getTasks()])
      const m = await getDashboardMetrics("official");
      const vq = await getVerificationQueue({ pageSize: 5 });
      const disc = await getDiscrepancies();
      const t = await getTasks({ status: "OPEN" });

      setMetrics(m);
      setVerificationQueue(vq.items.slice(0, 5));
      setDiscrepancies(disc.slice(0, 4));
      setTasks(t.slice(0, 4));
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <AppShell
      role="official"
      breadcrumbs={[{ label: "Overview Dashboard" }]}
    >
      <div className="space-y-6">
        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Official Verification Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              AICTE Bureau of Approval • Statutory Security Deposit & FDR Monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/official/verification">
              <Button size="sm" icon={CheckCircle2}>
                Open Verification Queue
              </Button>
            </Link>
            <Link href="/official/discrepancies">
              <Button variant="secondary" size="sm" icon={AlertTriangle}>
                Discrepancy Cases
              </Button>
            </Link>
          </div>
        </div>

        {/* AICTE Intelligence Hub Flagship Spotlight */}
        <Card className="p-4 border-blue-200 bg-gradient-to-r from-blue-50/70 via-white to-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  AICTE Intelligence Hub — Flagship Verification Engine
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                  Gemini 2.5
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Multi-document intelligence, 5 cross-document deterministic checks, and APH 2024–27 regulatory evaluation for security deposit releases.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/official/intelligence">
              <Button variant="primary" size="sm" icon={BrainCircuit}>
                Launch Intelligence Hub
              </Button>
            </Link>
          </div>
        </Card>

        {/* High-priority Action Banner if Discrepancies exist */}
        {metrics?.discrepanciesCount > 0 && (
          <Alert
            variant="warning"
            title="Attention Required: Discrepancy & API Exceptions Detected"
            action={
              <Link href="/official/discrepancies">
                <Button variant="secondary" size="sm">
                  Review Exceptions
                </Button>
              </Link>
            }
          >
            {metrics.discrepanciesCount} financial instrument(s) have flagged variances between submitted certificates and simulated core banking responses.
          </Alert>
        )}

        {/* Financial & Operational Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Awaiting Verification"
            value={loading ? "..." : metrics?.pendingVerificationCount}
            subtitle="New submissions pending review"
            icon={CheckCircle2}
            badge={
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Actionable
              </span>
            }
          />

          <MetricCard
            title="Discrepancies Flagged"
            value={loading ? "..." : metrics?.discrepanciesCount}
            subtitle="Mismatches needing decision"
            icon={AlertTriangle}
            badge={
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Review Required
              </span>
            }
          />

          <MetricCard
            title="Maturity Notice (<90 Days)"
            value={loading ? "..." : metrics?.expiringSoonCount}
            subtitle="Approaching lock-in completion"
            icon={Clock}
            badge={
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Maturity Alert
              </span>
            }
          />

          <MetricCard
            title="Release Requests"
            value={loading ? "..." : metrics?.activeReleasesCount}
            subtitle="Clause 6.46 multi-cell review"
            icon={FileText}
            badge={
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Clearances
              </span>
            }
          />
        </div>

        {/* Two-Column Operational Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column (2/3): Verification Queue */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5">
              <SectionHeader
                title="Immediate Verification Queue"
                description="Recently submitted financial instruments awaiting official 3-way check"
                action={
                  <Link href="/official/verification">
                    <Button variant="tertiary" size="sm" icon={ArrowRight} iconPosition="right">
                      View All
                    </Button>
                  </Link>
                }
              />

              <Table
                loading={loading}
                data={verificationQueue}
                columns={[
                  {
                    header: "Instrument Ref",
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
                    header: "Institution",
                    key: "institution_name",
                    render: (row) => (
                      <div className="max-w-[200px] truncate" title={row.institution_name}>
                        <div className="text-xs font-medium text-slate-800 truncate">
                          {row.institution_name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {row.bank_name}
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: "Amount",
                    key: "amount",
                    align: "right",
                    render: (row) => (
                      <span className="font-semibold text-slate-900 text-xs font-tabular-nums">
                        {formatINR(row.amount)}
                      </span>
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
                      <Link href={`/official/verification/${row.id}`}>
                        <Button variant="secondary" size="sm">
                          Verify
                        </Button>
                      </Link>
                    ),
                  },
                ]}
              />
            </Card>

            {/* Discrepancy Spotlights */}
            <Card className="p-5">
              <SectionHeader
                title="Flagged Discrepancies & Exceptions"
                description="Automated comparison detected discrepancies between certificate and bank responses"
                action={
                  <Link href="/official/discrepancies">
                    <Button variant="tertiary" size="sm" icon={ArrowRight} iconPosition="right">
                      Manage All
                    </Button>
                  </Link>
                }
              />

              <div className="space-y-3">
                {discrepancies.map((check) => (
                  <div
                    key={check.id}
                    className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={check.status} type="check" size="sm" />
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {check.instrument?.instrument_reference}
                        </span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs font-medium text-slate-700">
                          {check.instrument?.bank_name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {check.message}
                      </p>
                    </div>

                    <Link href={`/official/verification/${check.instrument_id}`}>
                      <Button variant="secondary" size="sm" className="shrink-0 text-xs">
                        Review Discrepancy
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Side Column (1/3): Tasks and Clearances */}
          <div className="space-y-6">
            {/* Open Workflow Tasks */}
            <Card className="p-5">
              <SectionHeader
                title="Assigned Tasks"
                description="Pending workflow items"
                action={
                  <Link href="/official/tasks">
                    <Button variant="tertiary" size="sm">
                      Tasks →
                    </Button>
                  </Link>
                }
              />

              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={task.priority} type="priority" size="sm" />
                      <span className="text-[11px] text-slate-400 font-tabular-nums">
                        Due {formatDate(task.due_at)}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-900 mt-1.5 leading-snug">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {task.institution_name}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Regulatory Reference Card */}
            <Card className="p-5 bg-blue-50/30 border-blue-200">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                Approval Handbook Compliance
              </h3>
              <ul className="text-xs text-blue-950/80 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-700">•</span>
                  <span>
                    <strong>Rule:</strong> Bank API failure is an external error, NOT proof that an FDR is invalid.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-700">•</span>
                  <span>
                    <strong>Rule:</strong> Maturity alone does not trigger approval, release, or compliance completion.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-700">•</span>
                  <span>
                    <strong>Rule:</strong> OCR extraction is supportive evidence and requires human officer verification.
                  </span>
                </li>
              </ul>
            </Card>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
