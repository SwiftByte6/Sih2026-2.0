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
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MetricCard, Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  getDashboardMetrics,
  getInstruments,
  getNotifications,
  formatINR,
  formatDate,
} from "@/lib/dataService";

export default function InstitutionDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [myInstruments, setMyInstruments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Institution scope: Delhi Institute of Engineering & Technology (inst-001)
  const institutionId = "inst-001";

  useEffect(() => {
    async function load() {
      setLoading(true);
      // BACKEND INTEGRATION:
      // Scoped query for authenticated institution user:
      // supabase.from('financial_instruments').select('*').eq('institution_id', user.institution_id)
      const m = await getDashboardMetrics("institution", institutionId);
      const instData = await getInstruments({ institution_id: institutionId, pageSize: 5 });
      const notifs = await getNotifications("institution_admin");

      setMetrics(m);
      setMyInstruments(instData.items);
      setNotifications(notifs.slice(0, 3));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AppShell
      role="institution"
      breadcrumbs={[{ label: "Institution Overview" }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Delhi Institute of Engineering & Technology
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              AICTE Permanent Institute ID: <strong className="text-slate-800 font-mono">1-109283741</strong> • Northern Region
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/institution/instruments/new">
              <Button size="sm" icon={PlusCircle}>
                Submit New FDR
              </Button>
            </Link>
            <Link href="/institution/release">
              <Button variant="secondary" size="sm">
                Apply for Release
              </Button>
            </Link>
          </div>
        </div>

        {/* Action Required Banner if Discrepancies exist */}
        {metrics?.discrepanciesCount > 0 && (
          <Alert
            variant="warning"
            title="Action Required: Discrepancy Flagged by Verification Officer"
            action={
              <Link href="/institution/instruments/fdr-002">
                <Button variant="secondary" size="sm">
                  View Issue Details
                </Button>
              </Link>
            }
          >
            FDR-2024-ND-002 (PNB FDR) has a flagged issue date variance between your submitted certificate and the bank verification response. Please provide clarification.
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
                    header: "Amount",
                    key: "amount",
                    align: "right",
                    render: (row) => (
                      <span className="font-bold text-slate-900 text-xs font-tabular-nums">
                        {formatINR(row.amount)}
                      </span>
                    ),
                  },
                  {
                    header: "Maturity",
                    key: "maturity_date",
                    render: (row) => (
                      <span className="text-xs text-slate-700 font-tabular-nums">
                        {formatDate(row.maturity_date)}
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
                      <Link href={`/institution/instruments/${row.id}`}>
                        <Button variant="secondary" size="sm">
                          Details
                        </Button>
                      </Link>
                    ),
                  },
                ]}
              />
            </Card>
          </div>

          {/* Side Notifications & Statutory Tips */}
          <div className="space-y-6">
            <Card className="p-5">
              <SectionHeader
                title="Council Notifications"
                description="Official alerts for your institution"
              />

              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs"
                  >
                    <div className="font-semibold text-slate-900">{notif.title}</div>
                    <p className="text-slate-600 mt-0.5">{notif.body}</p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 bg-blue-50/30 border-blue-200">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                Mandatory Regulatory Guidelines
              </h3>
              <p className="text-xs text-blue-950/80 leading-relaxed">
                Security deposits must be kept jointly encumbered with AICTE throughout the prescribed regulatory period. Ensure renewals are submitted at least 30 days prior to maturity to prevent compliance lapses.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
