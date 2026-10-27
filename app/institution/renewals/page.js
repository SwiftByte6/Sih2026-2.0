"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { getInstruments, formatINR, formatDate } from "@/lib/dataService";

export default function RenewalsPage() {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);

  const institutionId = "inst-001";

  useEffect(() => {
    async function load() {
      setLoading(true);
      // BACKEND INTEGRATION:
      // supabase.from('financial_instruments').select('*').eq('institution_id', user.institution_id)
      const data = await getInstruments({ institution_id: institutionId, pageSize: 20 });
      setInstruments(data.items);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AppShell
      role="institution"
      breadcrumbs={[
        { label: "Dashboard", href: "/institution/dashboard" },
        { label: "Renewals & Replacements" },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            FDR Renewal & Replacement Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain bidirectional links between maturing predecessor instruments and successor renewals.
          </p>
        </div>

        {/* Regulatory Rule Callout */}
        <Alert variant="info" title="Statutory Continuity Principle (Clause 2.25)">
          Original deposit records are never deleted or overwritten upon renewal. When an FDR approaches or passes maturity, a successor renewal instrument is submitted and linked to the predecessor. The predecessor deposit remains active in council records until the renewal is officially verified and approved.
        </Alert>

        <Card className="p-5">
          <SectionHeader
            title="Renewal & Replacement Succession Register"
            description="Active, expiring, and matured instruments eligible for renewal"
          />

          <div className="space-y-4">
            {instruments.map((inst) => (
              <div
                key={inst.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      {inst.instrument_reference}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {inst.bank_name}
                    </span>
                    <StatusBadge status={inst.lifecycle_status} type="lifecycle" size="sm" />
                    <StatusBadge status={inst.verification_status} type="verification" size="sm" />
                  </div>

                  <div className="text-xs text-slate-600">
                    FDR No: <strong className="font-mono text-slate-800">{inst.fdr_number}</strong> • Amount: <strong>{formatINR(inst.amount)}</strong>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-0.5">
                    Maturity Date: <strong>{formatDate(inst.maturity_date)}</strong> (
                    {inst.days_to_maturity !== undefined
                      ? inst.days_to_maturity > 0
                        ? `${inst.days_to_maturity} days remaining`
                        : `${Math.abs(inst.days_to_maturity)} days matured`
                      : "—"}
                    )
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/institution/instruments/${inst.id}`}>
                    <Button variant="secondary" size="sm">
                      Inspect Details
                    </Button>
                  </Link>

                  {(inst.lifecycle_status === "EXPIRING" || inst.lifecycle_status === "MATURED") && (
                    <Link href={`/institution/instruments/new?renewal_for=${inst.id}`}>
                      <Button variant="primary" size="sm" icon={RefreshCw}>
                        Initiate Renewal
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
