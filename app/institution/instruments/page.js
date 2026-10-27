"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  PlusCircle,
  Filter,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { getInstruments, formatINR, formatDate } from "@/lib/dataService";

export default function InstitutionInstrumentsPage() {
  const [instruments, setInstruments] = useState([]);
  const [search, setSearch] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const institutionId = "inst-001";

  useEffect(() => {
    async function load() {
      // BACKEND INTEGRATION:
      // supabase.from('financial_instruments').select('*').eq('institution_id', user.institution_id)
      const res = await getInstruments({
        institution_id: institutionId,
        search,
        lifecycle_status: lifecycleFilter || undefined,
        verification_status: verificationFilter || undefined,
        page,
        pageSize: 8,
      });
      setInstruments(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setLoading(false);
    }
    load();
  }, [institutionId, search, lifecycleFilter, verificationFilter, page]);

  return (
    <AppShell
      role="institution"
      breadcrumbs={[
        { label: "Dashboard", href: "/institution/dashboard" },
        { label: "Security Deposits (FDR)" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Institution Security Deposits & FDR Repository
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Authoritative ledger of Fixed Deposit Receipts submitted for AICTE regulatory approval.
            </p>
          </div>
          <Link href="/institution/instruments/new">
            <Button size="sm" icon={PlusCircle}>
              Submit New FDR
            </Button>
          </Link>
        </div>

        {/* Filter bar */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Input
                placeholder="Search FDR No, Bank, Reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
            </div>
            <Select
              value={lifecycleFilter}
              onChange={(e) => setLifecycleFilter(e.target.value)}
              options={[
                { value: "", label: "All Lifecycle Stages" },
                { value: "ACTIVE", label: "Active" },
                { value: "SUBMITTED", label: "Submitted" },
                { value: "EXPIRING", label: "Expiring Soon" },
                { value: "MATURED", label: "Matured" },
                { value: "RELEASE_PENDING", label: "Release Pending" },
                { value: "RELEASED", label: "Released" },
              ]}
            />
            <Select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              options={[
                { value: "", label: "All Verification Statuses" },
                { value: "VERIFIED", label: "Verified" },
                { value: "PENDING_VERIFICATION", label: "Pending Verification" },
                { value: "ACTION_REQUIRED", label: "Action Required (Discrepancy)" },
              ]}
            />
          </div>
        </Card>

        {/* Table */}
        <Table
          loading={loading}
          data={instruments}
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
              header: "Bank & Branch",
              key: "bank_name",
              render: (row) => (
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    {row.bank_name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {row.bank_branch}
                  </div>
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
              header: "Issue Date",
              key: "issue_date",
              render: (row) => (
                <span className="text-xs text-slate-700 font-tabular-nums">
                  {formatDate(row.issue_date)}
                </span>
              ),
            },
            {
              header: "Maturity Date",
              key: "maturity_date",
              render: (row) => (
                <div>
                  <div className="text-xs font-semibold text-slate-800 font-tabular-nums">
                    {formatDate(row.maturity_date)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {row.days_to_maturity !== undefined
                      ? row.days_to_maturity > 0
                        ? `${row.days_to_maturity} days left`
                        : `${Math.abs(row.days_to_maturity)} days matured`
                      : "—"}
                  </div>
                </div>
              ),
            },
            {
              header: "Verification",
              key: "verification_status",
              render: (row) => (
                <StatusBadge status={row.verification_status} type="verification" size="sm" />
              ),
            },
            {
              header: "Lifecycle",
              key: "lifecycle_status",
              render: (row) => (
                <StatusBadge status={row.lifecycle_status} type="lifecycle" size="sm" />
              ),
            },
            {
              header: "Action",
              align: "right",
              render: (row) => (
                <Link href={`/institution/instruments/${row.id}`}>
                  <Button variant="secondary" size="sm">
                    View
                  </Button>
                </Link>
              ),
            },
          ]}
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={8}
          onPageChange={(p) => setPage(p)}
        />
      </div>
    </AppShell>
  );
}
