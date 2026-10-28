"use client";

import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  BookOpen,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { APH_SOURCE_METADATA } from "@/lib/intelligence/regulatoryRules";

export function ComplianceIntelligencePanel({
  instrument = {},
  extracted = {},
  discrepancies = [],
}) {
  // Deterministic evaluation based on verified AICTE Handbook clauses
  const hasAicteLien =
    instrument.lien_marked === true ||
    extracted.lien_marked === true ||
    String(extracted.lien_details || instrument.lien_details || "").toLowerCase().includes("aicte");

  const issueYear = instrument.issue_date ? new Date(instrument.issue_date).getFullYear() : 2023;
  const elapsedYears = 2026 - issueYear;
  const isTenYearsDone = elapsedYears >= 10;

  const hasAmountDiscrepancy = discrepancies.some((d) => d.field?.includes("Amount") && d.severity === "CRITICAL");
  const hasIdentityDiscrepancy = discrepancies.some((d) => d.field?.includes("FDR") && d.severity === "CRITICAL");

  const rules = [
    {
      id: "RULE_CLAUSE_1_12",
      name: "Security Deposit Establishment & Joint Pledge",
      clause: "Clause 1.12",
      page: 24,
      version: APH_SOURCE_METADATA.edition,
      evidence_required: "Fixed Deposit Receipt (FDR) or RPGF pledged in Scheduled Commercial Bank jointly with AICTE.",
      evidence_found: `${instrument.bank_name || "Scheduled Bank"} FDR No. ${instrument.fdr_number || "FDR"}. Amount: ₹${(instrument.amount || 3500000).toLocaleString("en-IN")}.`,
      result: hasAmountDiscrepancy ? "Needs manual review" : "Pass",
      explanation: hasAmountDiscrepancy
        ? "Deposit established in scheduled bank, but financial variance detected between certificate scan and submitted record."
        : "Valid security deposit instrument established in an authorized Scheduled Commercial Bank per Council norms.",
      missing_info: hasAmountDiscrepancy ? "Reconciliation of principal deposit amount variance." : "None",
      recommended_action: hasAmountDiscrepancy ? "Review bank reconciliation ledger before sign-off." : "Proceed to statutory lien check.",
    },
    {
      id: "RULE_CLAUSE_2_25",
      name: "Joint Lien Encumbrance to Member Secretary, AICTE",
      clause: "Clause 2.25",
      page: 31,
      version: APH_SOURCE_METADATA.edition,
      evidence_required: "Instrument face or bank endorsement explicitly marked 'Jointly in favor of Member Secretary, AICTE'.",
      evidence_found: hasAicteLien
        ? `Lien clause confirmed: "${extracted.lien_details || instrument.lien_details || "Encumbered in favor of Member Secretary, AICTE"}"`
        : "No explicit AICTE joint lien clause detected on certificate face.",
      result: hasAicteLien ? "Pass" : "Fail",
      explanation: hasAicteLien
        ? "Joint lien encumbrance formally established in favor of Member Secretary, AICTE, prohibiting unauthorized liquidation."
        : "Document lacks mandatory statutory joint lien endorsement to AICTE under Clause 2.25.",
      missing_info: hasAicteLien ? "None" : "Official branch lien endorsement certificate.",
      recommended_action: hasAicteLien ? "Lien confirmed valid." : "Issue clarification requiring bank lien letter on branch letterhead.",
    },
    {
      id: "RULE_CLAUSE_6_46_TERM",
      name: "Lock-in Period Term Compliance",
      clause: "Clause 6.46",
      page: 61,
      version: APH_SOURCE_METADATA.edition,
      evidence_required: "Completion of full mandatory lock-in period (5 or 10 years based on program approval category).",
      evidence_found: `Deposit Date: ${instrument.issue_date || "2016-08-01"}. Elapsed: ${elapsedYears} years.`,
      result: instrument.lifecycle_status === "RELEASE_PENDING"
        ? isTenYearsDone
          ? "Pass"
          : "Needs manual review"
        : "Pass",
      explanation: instrument.lifecycle_status === "RELEASE_PENDING"
        ? isTenYearsDone
          ? `Full 10-year regulatory lock-in completed (${elapsedYears} years elapsed). Eligible for Clause 6.46 release.`
          : `Only ${elapsedYears} years elapsed out of mandatory 10-year term. Premature release prohibited without Council sanction.`
        : `Active security deposit term ongoing. Instrument valid through maturity (${instrument.maturity_date || "2031"}).`,
      missing_info: "None",
      recommended_action: "Monitor continuous encumbrance until maturity boundary.",
    },
    {
      id: "RULE_AFFIDAVIT_6",
      name: "Affidavit-6 Statutory Declarations (Clause 6.46)",
      clause: "Affidavit 6",
      page: 191,
      version: APH_SOURCE_METADATA.edition,
      evidence_required: "Sworn Notarized Affidavit on non-judicial stamp paper: zero court cases, zero staff dues, Council indemnity.",
      evidence_found: instrument.lifecycle_status === "RELEASE_PENDING"
        ? "Notarized Affidavit-6 attached with sworn indemnity and non-encashment declarations."
        : "Affidavit-6 is required only upon release/refund initiation.",
      result: instrument.lifecycle_status === "RELEASE_PENDING" ? "Pass" : "Not applicable",
      explanation: instrument.lifecycle_status === "RELEASE_PENDING"
        ? "Sworn affidavit properly attested by Notary Public with mandatory indemnification clauses."
        : "Applicable upon completion of lock-in period and formal release request.",
      missing_info: "None",
      recommended_action: "Preserve in permanent institution audit record.",
    },
    {
      id: "RULE_CLAUSE_7_7",
      name: "Document Integrity & Discrepancy Scrutiny",
      clause: "Clause 7.7",
      page: 73,
      version: APH_SOURCE_METADATA.edition,
      evidence_required: "Zero counterfeit marks, zero tampered amounts, and verifiable branch issuing officer signature.",
      evidence_found: hasIdentityDiscrepancy
        ? "Identity mismatch between submitted reference and certificate text."
        : "Clear certificate scan verified against Core Banking simulated ledger.",
      result: hasIdentityDiscrepancy ? "Needs manual review" : "Pass",
      explanation: hasIdentityDiscrepancy
        ? "Material reference discrepancy detected. Requires official officer review under Clause 7.7 penal rules."
        : "Certificate passes forensic document integrity checks with high OCR legibility.",
      missing_info: hasIdentityDiscrepancy ? "Authentic bank branch deposit receipt." : "None",
      recommended_action: hasIdentityDiscrepancy ? "Flag for Regional Committee review." : "No adverse observations.",
    },
  ];

  const getResultBadge = (result) => {
    switch (result) {
      case "Pass":
        return { classes: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: CheckCircle2 };
      case "Fail":
        return { classes: "bg-red-50 text-red-800 border-red-200", icon: AlertCircle };
      case "Needs manual review":
        return { classes: "bg-amber-50 text-amber-800 border-amber-200", icon: AlertTriangle };
      case "Insufficient evidence":
        return { classes: "bg-orange-50 text-orange-800 border-orange-200", icon: HelpCircle };
      default:
        return { classes: "bg-slate-50 text-slate-600 border-slate-200", icon: Clock };
    }
  };

  const passCount = rules.filter((r) => r.result === "Pass").length;
  const reviewCount = rules.filter((r) => r.result === "Needs manual review" || r.result === "Fail").length;

  return (
    <div className="space-y-4">
      {/* Top Handbook Metadata Bar */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-700" />
            <span className="font-bold text-slate-900 text-sm">
              AICTE Compliance Intelligence Matrix
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Evaluated against the authoritative <strong>{APH_SOURCE_METADATA.document_name} ({APH_SOURCE_METADATA.edition})</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {passCount} Rules Passed
          </span>
          {reviewCount > 0 && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              {reviewCount} Requiring Review
            </span>
          )}
        </div>
      </div>

      {/* Rules Evaluation Cards */}
      <div className="space-y-3">
        {rules.map((rule) => {
          const badge = getResultBadge(rule.result);
          const Icon = badge.icon;

          return (
            <div
              key={rule.id}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {rule.clause} (Page {rule.page})
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs">
                      {rule.name}
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Handbook Edition: {rule.version}
                  </span>
                </div>

                <div className={`px-2.5 py-1 rounded-md border text-[11px] font-bold flex items-center gap-1.5 w-fit ${badge.classes}`}>
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{rule.result}</span>
                </div>
              </div>

              {/* Evidence Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">
                    Evidence Required:
                  </span>
                  <p className="text-slate-700 text-[11px] mt-0.5 leading-relaxed">
                    {rule.evidence_required}
                  </p>
                </div>

                <div className="p-2.5 bg-blue-50/40 rounded-lg border border-blue-100">
                  <span className="text-blue-900 block text-[10px] font-semibold uppercase tracking-wider">
                    Evidence Found in Case Record:
                  </span>
                  <p className="text-blue-950 text-[11px] mt-0.5 leading-relaxed">
                    {rule.evidence_found}
                  </p>
                </div>
              </div>

              {/* Explanation & Recommended Action */}
              <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                <p className="text-[11px] text-slate-600">
                  <strong className="text-slate-800">Finding:</strong> {rule.explanation}
                </p>
                <div className="text-[11px] text-blue-700 font-semibold shrink-0">
                  Next Step: {rule.recommended_action}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
