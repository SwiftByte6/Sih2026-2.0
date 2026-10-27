"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { getReleaseRequests, formatINR, formatDate } from "@/lib/dataService";

export default function ReleaseQueuePage() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // BACKEND INTEGRATION:
      // supabase.from('release_refund_requests').select('*, institutions(*), financial_instruments(*), clearance_records(*)')
      const data = await getReleaseRequests({
        status: statusFilter || undefined,
        search,
      });
      setRequests(data);
      setLoading(false);
    }
    load();
  }, [statusFilter, search]);

  return (
    <AppShell
      role="official"
      breadcrumbs={[
        { label: "Dashboard", href: "/official/dashboard" },
        { label: "Release & Refund Queue" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Security Deposit Release & Refund Queue
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Governed by AICTE Approval Process Handbook Clause 6.46 & Affidavit-6.
            </p>
          </div>
        </div>

        {/* Regulatory Reminder */}
        <Alert variant="info" title="Statutory Clause 6.46 Requirements">
          Release of security deposits requires completion of the full regulatory lock-in duration, verified submission of notarized Affidavit-6, latest EoA approval, and recorded clearances from the Legal Cell, Bureau of Approval, Finance Bureau, and Regional Office.
        </Alert>

        {/* Filter bar */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by Request Reference (e.g. REL-2026-0012) or Institution..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "All Release Statuses" },
                { value: "CLEARANCE_PENDING", label: "Clearances Pending" },
                { value: "DOCUMENTS_PENDING", label: "Documents Pending" },
                { value: "UNDER_REVIEW", label: "Under Review" },
                { value: "APPROVED", label: "Decision Approved" },
                { value: "COMPLETED", label: "Completed (NOC Issued)" },
              ]}
            />
          </div>
        </Card>

        {/* Requests Table */}
        <Table
          loading={loading}
          data={requests}
          emptyTitle="No release requests found"
          emptyDescription="There are currently no active release or refund applications matching your filter."
          columns={[
            {
              header: "Request Reference",
              key: "request_reference",
              render: (row) => (
                <div>
                  <div className="font-semibold text-slate-900 font-mono text-xs">
                    {row.request_reference}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Type: <strong className="text-slate-700">{row.request_type}</strong>
                  </div>
                </div>
              ),
            },
            {
              header: "Institution",
              key: "institution_name",
              render: (row) => (
                <div className="max-w-[200px]">
                  <div className="text-xs font-semibold text-slate-800 truncate" title={row.institution_name}>
                    {row.institution_name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Submitted: {formatDate(row.submitted_at)}
                  </div>
                </div>
              ),
            },
            {
              header: "Instrument & Bank",
              key: "instrument_reference",
              render: (row) => (
                <div>
                  <div className="text-xs font-mono font-medium text-slate-800">
                    {row.instrument_reference}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {row.bank_name}
                  </div>
                </div>
              ),
            },
            {
              header: "Deposit Amount",
              key: "amount",
              align: "right",
              render: (row) => (
                <span className="font-bold text-slate-900 text-xs font-tabular-nums">
                  {formatINR(row.amount)}
                </span>
              ),
            },
            {
              header: "Clearances Progress",
              key: "clearances",
              render: (row) => (
                <div className="text-xs">
                  <span className="font-semibold text-slate-800">
                    {row.clearances_summary?.cleared || 0} of {row.clearances_summary?.total || 4}
                  </span>
                  <span className="text-slate-400 text-[11px] block">
                    {row.clearances_summary?.pending || 0} pending
                  </span>
                </div>
              ),
            },
            {
              header: "Status",
              key: "status",
              render: (row) => (
                <StatusBadge status={row.status} type="release" size="sm" />
              ),
            },
            {
              header: "Action",
              align: "right",
              render: (row) => (
                <Link href={`/official/release/${row.id}`}>
                  <Button variant="primary" size="sm">
                    Review Clearances
                  </Button>
                </Link>
              ),
            },
          ]}
        />
      </div>
    </AppShell>
  );
}
