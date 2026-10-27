"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  FileCheck2,
  ArrowRight,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  ExternalLink,
  ChevronRight,
  Database,
  Layers,
  FileText,
} from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/layout/PublicHeader";
import { Card, MetricCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatINR, formatDate, getInstruments } from "@/lib/dataService";
import { SimulatedNoticeBanner } from "@/components/ui/Alert";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleLookup = async (queryToUse) => {
    const q = (queryToUse !== undefined ? queryToUse : searchQuery).trim();
    if (!q) return;

    setHasSearched(true);
    // BACKEND INTEGRATION:
    // Future public lookup RPC function: get_public_instrument_status(fdr_number)
    // Returns non-confidential status information (sanitized/masked)
    const result = await getInstruments({ search: q, pageSize: 5 });
    if (result.items.length > 0) {
      setLookupResult(result.items[0]);
    } else {
      setLookupResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <PublicHeader />

      {/* Hero Section: Restrained Financial Dashboard Style */}
      <section className="bg-white border-b border-slate-200 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6">
              <span className="h-2 w-2 rounded-full bg-blue-700 animate-pulse" />
              AICTE Approval Process Handbook (2024–25 to 2026–27)
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Centralised Security Deposit & Fixed Deposit Receipt Management
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              An authoritative digital platform replacing fragmented records with unified financial instrument tracking, 3-way automated bank reconciliation, joint lien encumbrance monitoring, and auditable Clause 6.46 release workflows.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/login">
                <Button size="lg" icon={ArrowRight} iconPosition="right">
                  Access Portal Login
                </Button>
              </Link>
              <a href="#public-tracker">
                <Button variant="secondary" size="lg" icon={Search}>
                  Verify Instrument Status
                </Button>
              </a>
              <a href="#regulations">
                <Button variant="tertiary" size="lg">
                  Handbook Clauses
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Role Portals Grid */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Role-Based Operational Gateways
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Select your authenticated role to access tailored verification, management, and audit tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Official Gateway */}
            <Card className="hover:border-blue-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4 border border-blue-100">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Council Verification Officers
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  For AICTE Regional & HQ Officers. Review incoming deposit submissions, 3-way discrepancy checks, clearances, and authorized refund decisions.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                    <span>3-Way Reconciliation (Submitted vs OCR vs Bank)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                    <span>Clause 6.46 Multi-cell Clearance Review</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                    <span>Discrepancy Exception Resolution</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link href="/official/dashboard">
                  <Button variant="primary" className="w-full text-xs">
                    Enter Official Portal →
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Institution Gateway */}
            <Card className="hover:border-blue-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4 border border-blue-100">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Technical Institutions
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  For Affiliated Engineering, Management, and Polytechnic Institutions. Submit new FDRs, monitor 5-year lock-in terms, and initiate release requests.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                    <span>Digital FDR Submissions & Joint Lien Proof</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                    <span>Maturity Alerts (90/60/30/7-Day Notices)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                    <span>Affidavit-6 Release & Refund Applications</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link href="/institution/dashboard">
                  <Button variant="secondary" className="w-full text-xs">
                    Enter Institution Portal →
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Admin Gateway */}
            <Card className="hover:border-blue-300 transition-colors flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4 border border-blue-100">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Council Administrators
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  For Portal System Administrators. Monitor core banking sync health, configure reminder intervals, inspect immutable audit events, and manage roles.
                </p>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                    <span>Immutable Audit Log Inspection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                    <span>Core Banking Gateway Latency & Retry Queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                    <span>Statutory Threshold & Notification Rules</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link href="/admin/dashboard">
                  <Button variant="secondary" className="w-full text-xs">
                    Enter Admin Console →
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* Public Instrument Status Tracker */}
        <section id="public-tracker" className="scroll-mt-20">
          <Card className="p-6 sm:p-8 bg-white border border-slate-200">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Public Transparency Utility
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Verify Instrument Status
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Enter an AICTE Instrument Reference (e.g. <code>FDR-2024-ND-001</code>) or Bank FDR Number to verify verification standing, deposit validity, and lien encumbrance.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5 max-w-2xl">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  placeholder="e.g. FDR-2024-ND-001, SBI-FDR-9823410294, PNB..."
                  className="w-full h-10 pl-9.5 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 placeholder:text-slate-400"
                />
              </div>
              <Button onClick={() => handleLookup()} size="md">
                Search Record
              </Button>
            </div>

            {/* Quick Demo Chips */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium text-slate-600">Sample records:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("FDR-2024-ND-001");
                  handleLookup("FDR-2024-ND-001");
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-mono text-[11px]"
              >
                FDR-2024-ND-001 (Verified Active)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("FDR-2024-ND-002");
                  handleLookup("FDR-2024-ND-002");
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-mono text-[11px]"
              >
                FDR-2024-ND-002 (Discrepancy)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("FDR-2024-PN-004");
                  handleLookup("FDR-2024-PN-004");
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-mono text-[11px]"
              >
                FDR-2024-PN-004 (Bank API Timeout)
              </button>
            </div>

            {/* Search Lookup Result */}
            {hasSearched && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                {lookupResult ? (
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 font-mono">
                            {lookupResult.instrument_reference}
                          </h4>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-600 font-medium">
                            {lookupResult.bank_name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Institution: {lookupResult.institution_name} (AICTE ID: {lookupResult.aicte_institution_id})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={lookupResult.lifecycle_status} type="lifecycle" />
                        <StatusBadge status={lookupResult.verification_status} type="verification" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
                      <div>
                        <span className="text-slate-400 block">Instrument Number</span>
                        <span className="font-semibold text-slate-800 font-mono">
                          {lookupResult.fdr_number}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Secured Amount</span>
                        <span className="font-bold text-slate-900 font-tabular-nums">
                          {formatINR(lookupResult.amount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Maturity Date</span>
                        <span className="font-semibold text-slate-800 font-tabular-nums">
                          {formatDate(lookupResult.maturity_date)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Joint Lien Encumbrance</span>
                        <span className="font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Marked to AICTE
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Status notes: {lookupResult.notes}</span>
                      <Link
                        href={`/official/verification/${lookupResult.id}`}
                        className="text-blue-700 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        Inspect Full Audit Record →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No matching instrument found for &ldquo;{searchQuery}&rdquo;. Please verify reference format or search via sample buttons.
                  </div>
                )}
              </div>
            )}
          </Card>
        </section>

        {/* Regulatory Basis Section */}
        <section id="regulations" className="scroll-mt-20">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Regulatory Framework & Verification Invariants
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Engineered strictly per the AICTE Approval Process Handbook (Clauses 1.12, 2.25, and 6.46).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs mb-3 border border-blue-100">
                1.12
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Clause 1.12: Security Deposit Establishment
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Technical institutions must maintain a mandatory security deposit created as a Fixed Deposit Receipt (FDR) or RPGF pledged jointly in the name of the institution and the Member Secretary, AICTE.
              </p>
            </Card>

            <Card className="p-5">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs mb-3 border border-blue-100">
                2.25
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Clause 2.25: Lock-in & Joint Lien Encumbrance
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                FDRs must remain continuously encumbered throughout the regulatory lock-in period. Premature encashment or modification without explicit AICTE authorization is prohibited.
              </p>
            </Card>

            <Card className="p-5">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs mb-3 border border-blue-100">
                6.46
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Clause 6.46 & Affidavit-6: Release & Clearances
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Release requires completion of the regulatory term, sworn Affidavit-6 on non-judicial stamp paper, latest LoA/EoA, and verified clearances from Legal, Finance, and Regional bureaus before NOC generation.
              </p>
            </Card>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
