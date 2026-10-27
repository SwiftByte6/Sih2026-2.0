"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { getInstruments, formatINR, formatDate } from "@/lib/dataService";

export default function VerificationQueuePage() {
  const [instruments, setInstruments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [bankName, setBankName] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function load() {
      // BACKEND INTEGRATION:
      // supabase.from('financial_instruments').select('*, institutions(*)').range(...)
      const res = await getInstruments({
        search: appliedSearch,
        verification_status: verificationStatus || undefined,
        bank_name: bankName || undefined,
        sort_by: sortBy,
        page,
        pageSize: 8,
      });
      setInstruments(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setLoading(false);
    }
    load();
  }, [appliedSearch, verificationStatus, bankName, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  };

  const handleResetFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setVerificationStatus("");
    setBankName("");
    setSortBy("newest");
    setPage(1);
  };

  return (
    <AppShell
      role="official"
      breadcrumbs={[
        { label: "Dashboard", href: "/official/dashboard" },
        { label: "Verification Queue" },
      ]}
    >
      <div className="space-y-5">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Financial Instrument Verification Queue
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Inspect submitted FDR certificates, automated OCR extraction, and simulated core banking reconciliations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/official/discrepancies">
              <Button variant="secondary" size="sm" icon={AlertTriangle}>
                Discrepancy Exception Queue
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <Card className="p-4 bg-white border border-slate-200">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by FDR No, Reference, or Institution..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
            </div>

            <Select
              value={verificationStatus}
              onChange={(e) => {
                setVerificationStatus(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All Verification Statuses" },
                { value: "ACTION_REQUIRED", label: "Action Required (Discrepancy)" },
                { value: "PENDING_VERIFICATION", label: "Pending Verification" },
                { value: "PROCESSING", label: "Processing" },
                { value: "VERIFIED", label: "Verified" },
                { value: "ERROR", label: "API / Gateway Error" },
              ]}
            />

            <Select
              value={bankName}
              onChange={(e) => {
                setBankName(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All Banking Institutions" },
                { value: "State Bank of India", label: "State Bank of India" },
                { value: "Punjab National Bank", label: "Punjab National Bank" },
                { value: "Canara Bank", label: "Canara Bank" },
                { value: "Bank of Baroda", label: "Bank of Baroda" },
                { value: "HDFC Bank", label: "HDFC Bank" },
                { value: "ICICI Bank", label: "ICICI Bank" },
                { value: "Union Bank of India", label: "Union Bank of India" },
              ]}
            />

            <div className="flex items-center gap-2">
              <Button type="submit" size="md" className="flex-1">
                Filter
              </Button>
              <Button
                type="button"
                variant="tertiary"
                size="md"
                onClick={handleResetFilters}
                title="Reset filters"
              >
                <RotateCcw className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
          </form>
        </Card>

        {/* Data Grid */}
        <Table
          loading={loading}
          data={instruments}
          emptyTitle="No instruments found"
          emptyDescription="Try clearing your search query or adjusting your verification filters."
          emptyAction={
            <Button variant="secondary" size="sm" onClick={handleResetFilters}>
              Reset All Filters
            </Button>
          }
          columns={[
            {
              header: "Reference & FDR",
              key: "instrument_reference",
              render: (row) => (
                <div>
                  <div className="font-semibold text-slate-900 font-mono text-xs">
                    {row.instrument_reference}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {row.fdr_number}
                  </div>
                </div>
              ),
            },
            {
              header: "Institution & AICTE ID",
              key: "institution_name",
              render: (row) => (
                <div className="max-w-[220px]">
                  <div className="text-xs font-semibold text-slate-800 truncate" title={row.institution_name}>
                    {row.institution_name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ID: {row.aicte_institution_id}
                  </div>
                </div>
              ),
            },
            {
              header: "Bank & Branch",
              key: "bank_name",
              render: (row) => (
                <div className="max-w-[180px]">
                  <div className="text-xs font-medium text-slate-800 truncate">
                    {row.bank_name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
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
                <div className="text-xs font-bold text-slate-900 font-tabular-nums">
                  {formatINR(row.amount)}
                </div>
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
                <Link href={`/official/verification/${row.id}`}>
                  <Button variant="primary" size="sm">
                    Inspect 3-Way
                  </Button>
                </Link>
              ),
            },
          ]}
        />

        {/* Pagination */}
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
