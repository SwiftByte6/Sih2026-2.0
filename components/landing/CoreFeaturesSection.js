import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  FolderOpen,
  Layers3,
  ShieldCheck,
} from "lucide-react";

const cardClass =
  "overflow-hidden rounded-[20px] border border-[#E5E7EF] bg-[#F3F4F7] p-5 sm:p-6";
const previewClass =
  "rounded-[14px] border border-[#E5E7EF] bg-white shadow-[0_8px_24px_rgba(23,23,43,0.06)]";

function StatusPill({ children, tone = "neutral" }) {
  const tones = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    expiring: "bg-rose-50 text-rose-700 border-rose-100",
    review: "bg-[#F0ECFF] text-[#6048E8] border-[#DDD5FF]",
    neutral: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${tones[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

function SmartFdrPreview() {
  const records = [
    ["FDR-2024-ND-001", "₹35,00,000", "Active", "active"],
    ["FDR-2024-PN-004", "₹25,00,000", "Pending Review", "pending"],
    ["FDR-2024-MH-012", "₹50,00,000", "Expiring Soon", "expiring"],
  ];

  return (
    <div className={`${previewClass} mt-5 p-3.5 sm:p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-[#17172B]">FDR Records</p>
          <p className="mt-0.5 text-[9px] text-[#66677A]">
            Institutional Overview · Demo data
          </p>
        </div>
        <FolderOpen className="h-4 w-4 text-[#6048E8]" />
      </div>
      <div className="mt-4 grid grid-cols-[1.4fr_.8fr_auto] gap-2 border-b border-slate-100 pb-2 text-[8px] font-semibold uppercase tracking-wide text-[#999AAC]">
        <span>Reference</span>
        <span>Amount</span>
        <span>Status</span>
      </div>
      <div className="divide-y divide-slate-100">
        {records.map(([reference, amount, status, tone]) => (
          <div
            key={reference}
            className="grid grid-cols-[1.4fr_.8fr_auto] items-center gap-2 py-2.5 text-[9px]"
          >
            <div className="min-w-0">
              <p className="truncate font-mono font-semibold text-[#17172B]">
                {reference}
              </p>
              <p className="mt-0.5 truncate text-[#999AAC]">Institutional FDR</p>
            </div>
            <span className="font-medium text-[#66677A]">{amount}</span>
            <StatusPill tone={tone}>{status}</StatusPill>
          </div>
        ))}
      </div>
      <div className="mt-2 flex h-1.5 gap-1 overflow-hidden rounded-full bg-slate-100">
        <span className="w-[58%] rounded-full bg-emerald-400" />
        <span className="w-[24%] rounded-full bg-amber-300" />
        <span className="w-[18%] rounded-full bg-rose-300" />
      </div>
    </div>
  );
}

function DocumentVerificationPreview() {
  const documents = [
    ["Joint Lien Proof.pdf", "Submitted", "active", FileText],
    ["Affidavit-6.pdf", "Under Review", "review", FileCheck2],
    ["Latest LoA / EoA.pdf", "Needs Attention", "expiring", AlertCircle],
  ];

  return (
    <div className={`${previewClass} mt-5 p-3.5 sm:p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-[#17172B]">Document Review</p>
          <p className="mt-0.5 text-[9px] text-[#66677A]">Demo submission</p>
        </div>
        <span className="rounded-full bg-[#F0ECFF] px-2 py-1 text-[9px] font-bold text-[#6048E8]">
          2 / 3 checked
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {documents.map(([name, status, tone, Icon]) => (
          <div
            key={name}
            className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-2"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-[#6048E8]" />
            <span className="min-w-0 flex-1 truncate text-[9px] font-medium text-[#66677A]">
              {name}
            </span>
            <StatusPill tone={tone}>{status}</StatusPill>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="flex items-center gap-1 text-[9px] text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Verification summary ready
        </span>
        <span className="rounded-lg bg-[#6048E8] px-2.5 py-1.5 text-[9px] font-semibold text-white">
          View Details
        </span>
      </div>
    </div>
  );
}

function CompliancePreview() {
  const alerts = [
    ["Pending Reviews", "3 submissions awaiting review", "text-[#6048E8]", Layers3],
    ["Discrepancies Flagged", "2 records need attention", "text-amber-600", AlertCircle],
    ["Upcoming Maturity", "1 FDR reaches maturity soon", "text-blue-600", Clock3],
    ["Review Required", "Latest document set incomplete", "text-rose-600", ShieldCheck],
  ];

  return (
    <div className={`${previewClass} mt-5 p-4 sm:p-5`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <p className="text-[11px] font-bold text-[#17172B]">Compliance Alerts</p>
          <p className="mt-0.5 text-[9px] text-[#66677A]">Demo overview</p>
        </div>
        <span className="h-2 w-2 rounded-full bg-[#6048E8]" />
      </div>
      <div className="divide-y divide-slate-100">
        {alerts.map(([title, detail, color, Icon]) => (
          <div key={title} className="flex gap-3 py-4">
            <div className={`mt-0.5 ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[#17172B]">{title}</p>
              <p className="mt-1 text-[9px] leading-relaxed text-[#66677A]">
                {detail}
              </p>
              <p className="mt-1.5 text-[8px] text-[#999AAC]">Preview status</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackingPreview() {
  const stages = [
    ["Submitted", "Complete", "bg-emerald-400"],
    ["Verification", "In progress", "bg-[#6048E8]"],
    ["Official Review", "Queued", "bg-blue-300"],
    ["Decision", "Pending", "bg-slate-300"],
  ];

  return (
    <div className={`${previewClass} w-full max-w-[410px] p-4 sm:p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-[#17172B]">Submission Overview</p>
          <p className="mt-0.5 text-[9px] text-[#66677A]">Demo workflow status</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-[#6048E8]" />
      </div>
      <div className="mt-5 space-y-3">
        {stages.map(([stage, status, dot]) => (
          <div key={stage} className="flex items-center gap-2.5">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
            <span className="flex-1 text-[10px] font-medium text-[#66677A]">{stage}</span>
            <span className="text-[9px] text-[#999AAC]">{status}</span>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <div className="mb-1.5 flex justify-between text-[8px] text-[#999AAC]">
          <span>Review progress</span>
          <span>50% demo</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#F0ECFF]">
          <div className="h-full w-1/2 rounded-full bg-[#6048E8]" />
        </div>
      </div>
    </div>
  );
}

export function CoreFeaturesSection() {
  return (
    <section id="features" className="w-full bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#17172B] sm:text-4xl">
            Powerful Features for Smarter FDR Compliance
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#66677A] sm:text-base">
            Everything institutions and authorized officials need to manage FDR
            records, verify documents, and monitor compliance.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.05fr] lg:grid-rows-[1fr_1fr] lg:gap-6">
          <article className={cardClass}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0ECFF] text-[#6048E8]">
                <Layers3 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-[#17172B]">
                  Smart FDR Management
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#66677A]">
                  Keep institutional FDR records organized with clear financial
                  details, reference information, and maturity dates.
                </p>
              </div>
            </div>
            <SmartFdrPreview />
          </article>

          <article className={cardClass}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-blue-700">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-[#17172B]">
                  Document Verification
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#66677A]">
                  Review submitted documents and identify missing information or
                  discrepancies that require attention.
                </p>
              </div>
            </div>
            <DocumentVerificationPreview />
          </article>

          <article className={`${cardClass} md:col-span-2 lg:col-span-1 lg:row-span-2`}>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-blue-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-[#17172B]">
                  Compliance Overview
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#66677A]">
                  Understand pending reviews, flagged discrepancies, and
                  upcoming maturity dates at a glance.
                </p>
              </div>
            </div>
            <CompliancePreview />
          </article>

          <article className={`${cardClass} md:col-span-2 lg:col-span-2`}>
            <div className="flex h-full flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0ECFF] text-[#6048E8]">
                  <Clock3 className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-base font-bold tracking-tight text-[#17172B]">
                  FDR Tracking &amp; Review Progress
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#66677A]">
                  Follow submissions through verification, discrepancy
                  resolution, and official review with clear status visibility.
                </p>
                <p className="mt-4 text-[10px] font-medium text-[#999AAC]">
                  Demo workflow preview · Statuses reflect sample data only
                </p>
              </div>
              <TrackingPreview />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
