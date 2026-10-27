"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText,
  Calendar,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader, MetricCard } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { getInstruments, formatINR, formatDate } from "@/lib/dataService";

export default function InstitutionMaturityPage() {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);

  const institutionId = "inst-001";

  useEffect(() => {
    async function load() {
      setLoading(true);
      // BACKEND INTEGRATION:
      // supabase.from('financial_instruments').select('*').eq('institution_id', user.institution_id).order('maturity_date', { ascending: true })
      const data = await getInstruments({
        institution_id: institutionId,
        sort_by: "maturity_asc",
        pageSize: 50,
      });
      setInstruments(data.items);
      setLoading(false);
    }
    load();
  }, []);

  const expiringCount = instruments.filter(
    (i) => i.days_to_maturity !== undefined && i.days_to_maturity >= 0 && i.days_to_maturity <= 90
  ).length;

  const maturedCount = instruments.filter(
    (i) => i.days_to_maturity !== undefined && i.days_to_maturity < 0
  ).length;

  return (
    <AppShell
      role="institution"
      breadcrumbs={[
        { label: "Dashboard", href: "/institution/dashboard" },
        { label: "Maturity Tracking" },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Validity & Maturity Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Proactive monitoring of lock-in validity periods and automated reminder thresholds.
          </p>
        </div>

        {/* Business Invariant Banner */}
        <Alert variant="warning" title="Critical Regulatory Rule on Maturity">
          <strong>Important:</strong> Reaching a maturity date does NOT automatically renew, release, close, or fulfill regulatory compliance. An explicit authorized action (Renewal Submission or Clause 6.46 Release Request) is required.
        </Alert>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            title="Approaching Maturity (<90 Days)"
            value={loading ? "..." : expiringCount}
            subtitle="Renewal notice issued"
            icon={Clock}
          />
          <MetricCard
            title="Matured Instruments"
            value={loading ? "..." : maturedCount}
            subtitle="Eligible for renewal / release"
            icon={AlertTriangle}
          />
          <MetricCard
            title="Configured Reminder Cadence"
            value="90, 60, 30, 7 Days"
            subtitle="Automated council notices"
            icon={Calendar}
          />
        </div>

        <Card className="p-5">
          <SectionHeader
            title="Institution FDR Maturity Schedule"
            description="Sorted chronologically by impending maturity date"
          />

          <Table
            loading={loading}
            data={instruments}
            columns={[
              {
                header: "Reference & FDR",
                key: "instrument_reference",
                render: (row) => (
                  <div>
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      {row.instrument_reference}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      {row.fdr_number}
                    </span>
                  </div>
                ),
              },
              {
                header: "Bank & Branch",
                key: "bank_name",
                render: (row) => (
                  <div>
                    <span className="text-xs font-semibold text-slate-800">
                      {row.bank_name}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                      {row.bank_branch}
                    </span>
                  </div>
                ),
              },
              {
                header: "Secured Amount",
                key: "amount",
                align: "right",
                render: (row) => (
                  <span className="font-bold text-slate-900 text-xs font-tabular-nums">
                    {formatINR(row.amount)}
                  </span>
                ),
              },
              {
                header: "Maturity Date",
                key: "maturity_date",
                render: (row) => (
                  <div>
                    <span className="text-xs font-bold text-slate-900 font-tabular-nums">
                      {formatDate(row.maturity_date)}
                    </span>
                    <span
                      className={`text-[11px] font-semibold block ${
                        row.days_to_maturity !== undefined && row.days_to_maturity < 0
                          ? "text-red-700"
                          : row.days_to_maturity <= 30
                          ? "text-amber-700"
                          : "text-slate-500"
                      }`}
                    >
                      {row.days_to_maturity !== undefined
                        ? row.days_to_maturity > 0
                          ? `${row.days_to_maturity} days remaining`
                          : `${Math.abs(row.days_to_maturity)} days matured`
                        : "—"}
                    </span>
                  </div>
                ),
              },
              {
                header: "Lifecycle Status",
                key: "lifecycle_status",
                render: (row) => (
                  <StatusBadge status={row.lifecycle_status} type="lifecycle" size="sm" />
                ),
              },
              {
                header: "Action",
                align: "right",
                render: (row) => (
                  <div className="flex items-center justify-end gap-1.5">
                    {row.lifecycle_status === "RELEASE_PENDING" ? (
                      <Link href="/institution/release">
                        <Button variant="secondary" size="sm">
                          Release Status
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/institution/instruments/${row.id}`}>
                        <Button variant="secondary" size="sm">
                          Details
                        </Button>
                      </Link>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </AppShell>
  );
}
