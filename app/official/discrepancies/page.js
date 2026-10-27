"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  Building2,
  Clock,
  ShieldAlert,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Alert, SimulatedNoticeBanner } from "@/components/ui/Alert";
import { getDiscrepancies, formatINR } from "@/lib/dataService";

export default function DiscrepanciesPage() {
  const [discrepancies, setDiscrepancies] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // BACKEND INTEGRATION:
      // supabase.from('verification_checks')
      //   .select('*, financial_instruments(*, institutions(*))')
      //   .in('status', ['FAIL', 'WARNING', 'ERROR'])
      const data = await getDiscrepancies();
      setDiscrepancies(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = discrepancies.filter((item) => {
    if (filterType && item.status !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchInst = item.instrument?.instrument_reference?.toLowerCase().includes(q) ||
        item.instrument?.institution_name?.toLowerCase().includes(q) ||
        item.instrument?.fdr_number?.toLowerCase().includes(q) ||
        item.message?.toLowerCase().includes(q);
      if (!matchInst) return false;
    }
    return true;
  });

  return (
    <AppShell
      role="official"
      breadcrumbs={[
        { label: "Dashboard", href: "/official/dashboard" },
        { label: "Discrepancy Exception Review" },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Discrepancy & Exception Queue
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Field-level variances, duplicate warnings, and bank gateway timeouts requiring human review.
            </p>
          </div>
          <Link href="/official/verification">
            <Button variant="secondary" size="sm">
              Standard Queue →
            </Button>
          </Link>
        </div>

        {/* Regulatory Guidance Banner */}
        <Alert
          variant="warning"
          title="Regulatory Guidance on Discrepancies & External Faults"
        >
          <ul className="list-disc pl-4 space-y-1 text-xs text-amber-900/90 mt-1">
            <li>
              <strong>External Gateway Failures:</strong> A bank API timeout or connection error is NOT proof of an invalid FDR. Such cases must be diagnosed or scheduled for retry.
            </li>
            <li>
              <strong>Date & Amount Variances:</strong> Require verification with the bank branch or official clarification from the institution registrar before any rejection.
            </li>
          </ul>
        </Alert>

        {/* Filters */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by Instrument Reference, FDR No, or Issue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
            </div>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: "", label: "All Discrepancy Types" },
                { value: "FAIL", label: "Field Mismatches (Fail)" },
                { value: "WARNING", label: "Date Offsets (Warning)" },
                { value: "ERROR", label: "Bank Gateway Errors (Timeout)" },
              ]}
            />
          </div>
        </Card>

        {/* Discrepancy List */}
        <Card className="p-5">
          <SectionHeader
            title={`Active Discrepancies (${filtered.length})`}
            description="Detailed breakdown of flagged verification checks"
          />

          <div className="space-y-4">
            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Loading discrepancies...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No discrepancies match the selected filter.
              </div>
            ) : (
              filtered.map((check) => (
                <div
                  key={check.id}
                  className={`p-4 rounded-xl border ${
                    check.status === "ERROR"
                      ? "border-rose-200 bg-rose-50/30"
                      : "border-amber-200 bg-amber-50/30"
                  } flex flex-col md:flex-row md:items-center justify-between gap-4`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={check.status} type="check" size="sm" />
                      <span className="font-bold text-slate-900 text-xs font-mono">
                        {check.instrument?.instrument_reference}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {check.instrument?.institution_name}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium">
                      {check.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>
                        Rule Checked: <strong>{check.check_type}</strong>
                      </span>
                      <span>
                        Bank: <strong>{check.instrument?.bank_name}</strong>
                      </span>
                      <span>
                        Secured Amount:{" "}
                        <strong>{formatINR(check.instrument?.amount)}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/official/verification/${check.instrument_id}`}>
                      <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                        Review in 3-Way Grid
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
