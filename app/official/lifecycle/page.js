"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  ArrowRight,
  GitCommit,
  CheckCircle2,
  Clock,
  RefreshCw,
  Building2,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getInstruments, formatINR, formatDate } from "@/lib/dataService";

export default function LifecycleHistoryPage() {
  const [instruments, setInstruments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // BACKEND INTEGRATION:
      // supabase.from('financial_instruments').select('*, institutions(*), lifecycle_events(*)').order('created_at', { ascending: false })
      const data = await getInstruments({ search, pageSize: 50 });
      setInstruments(data.items);
      setLoading(false);
    }
    load();
  }, [search]);

  return (
    <AppShell
      role="official"
      breadcrumbs={[
        { label: "Dashboard", href: "/official/dashboard" },
        { label: "Instrument Lifecycle History" },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Instrument Lifecycle & Succession History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete traceability connecting original deposits, renewals, replacements, and authorized release completions.
          </p>
        </div>

        {/* Search */}
        <Card className="p-4 bg-white border border-slate-200">
          <Input
            placeholder="Search by Instrument Reference, FDR No, Institution..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </Card>

        {/* Lifecycle Chains and Instruments */}
        <Card className="p-5">
          <SectionHeader
            title="Tracked Financial Instruments"
            description="Lifecycle status timeline and renewal succession chains"
          />

          <div className="space-y-4">
            {instruments.map((inst) => (
              <div
                key={inst.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        {inst.instrument_reference}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {inst.institution_name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      FDR No: <strong className="font-mono text-slate-800">{inst.fdr_number}</strong> • Bank: <strong>{inst.bank_name}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={inst.lifecycle_status} type="lifecycle" size="sm" />
                    <StatusBadge status={inst.verification_status} type="verification" size="sm" />
                  </div>
                </div>

                {/* Predecessor / Successor Indicator */}
                {inst.parent_instrument_id && (
                  <div className="mt-3 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 text-indigo-700 shrink-0" />
                    <span>
                      <strong>Successor Renewal Instrument:</strong> This FDR extends and links to predecessor record <strong>{inst.parent_instrument_id}</strong>. Old instrument remains archived for regulatory continuity.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Secured Amount</span>
                    <span className="font-bold text-slate-900 font-tabular-nums">
                      {formatINR(inst.amount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Issue Date</span>
                    <span className="font-semibold text-slate-800 font-tabular-nums">
                      {formatDate(inst.issue_date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Maturity Date</span>
                    <span className="font-semibold text-slate-800 font-tabular-nums">
                      {formatDate(inst.maturity_date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Actions</span>
                    <Link
                      href={`/official/verification/${inst.id}`}
                      className="text-blue-700 hover:underline font-semibold text-xs inline-flex items-center gap-1"
                    >
                      Inspect Timeline →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
