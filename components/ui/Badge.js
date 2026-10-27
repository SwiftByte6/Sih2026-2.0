// Reusable status badge component strictly aligned with design.md (Section 13)
// Never communicate status through color alone; always includes explicit text.

export function StatusBadge({ status, type = "lifecycle", size = "normal" }) {
  if (!status) return null;

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs font-medium" : "px-2.5 py-1 text-xs font-semibold";

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
  let label = status;

  // 1. Lifecycle Statuses
  if (type === "lifecycle") {
    switch (status) {
      case "ACTIVE":
        colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200";
        label = "Active";
        break;
      case "SUBMITTED":
        colorClasses = "bg-blue-50 text-blue-800 border-blue-200";
        label = "Submitted";
        break;
      case "EXPIRING":
        colorClasses = "bg-amber-50 text-amber-900 border-amber-200";
        label = "Expiring Soon";
        break;
      case "MATURED":
        colorClasses = "bg-orange-50 text-orange-800 border-orange-200";
        label = "Matured";
        break;
      case "RENEWAL_PENDING":
        colorClasses = "bg-indigo-50 text-indigo-800 border-indigo-200";
        label = "Renewal Pending";
        break;
      case "REPLACEMENT_PENDING":
        colorClasses = "bg-purple-50 text-purple-800 border-purple-200";
        label = "Replacement Pending";
        break;
      case "RELEASE_PENDING":
        colorClasses = "bg-amber-50 text-amber-800 border-amber-200";
        label = "Release Pending";
        break;
      case "RELEASED":
        colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200";
        label = "Released";
        break;
      case "CLOSED":
        colorClasses = "bg-slate-100 text-slate-700 border-slate-300";
        label = "Closed";
        break;
      case "DRAFT":
      default:
        colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
        label = "Draft";
    }
  }

  // 2. Verification Statuses
  else if (type === "verification") {
    switch (status) {
      case "VERIFIED":
        colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200";
        label = "Verified";
        break;
      case "PENDING_VERIFICATION":
        colorClasses = "bg-blue-50 text-blue-800 border-blue-200";
        label = "Pending Verification";
        break;
      case "ACTION_REQUIRED":
        colorClasses = "bg-amber-50 text-amber-900 border-amber-300";
        label = "Action Required (Discrepancy)";
        break;
      case "PROCESSING":
        colorClasses = "bg-sky-50 text-sky-800 border-sky-200";
        label = "Processing";
        break;
      case "ERROR":
        colorClasses = "bg-red-50 text-red-800 border-red-200";
        label = "System / API Error";
        break;
      case "REJECTED":
        colorClasses = "bg-rose-50 text-rose-800 border-rose-300";
        label = "Rejected";
        break;
      case "NOT_STARTED":
      default:
        colorClasses = "bg-slate-100 text-slate-600 border-slate-200";
        label = "Not Started";
    }
  }

  // 3. Release / Refund Statuses
  else if (type === "release") {
    switch (status) {
      case "COMPLETED":
        colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200";
        label = "Completed (NOC Issued)";
        break;
      case "APPROVED":
        colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
        label = "Decision Approved";
        break;
      case "CLEARANCE_PENDING":
        colorClasses = "bg-amber-50 text-amber-900 border-amber-200";
        label = "Clearances Pending";
        break;
      case "DOCUMENTS_PENDING":
        colorClasses = "bg-amber-50 text-amber-800 border-amber-200";
        label = "Documents Pending";
        break;
      case "UNDER_REVIEW":
        colorClasses = "bg-blue-50 text-blue-800 border-blue-200";
        label = "Under Review";
        break;
      case "SUBMITTED":
        colorClasses = "bg-blue-50 text-blue-800 border-blue-200";
        label = "Submitted";
        break;
      case "REJECTED":
        colorClasses = "bg-red-50 text-red-800 border-red-200";
        label = "Rejected";
        break;
      case "WITHDRAWN":
        colorClasses = "bg-slate-100 text-slate-600 border-slate-200";
        label = "Withdrawn";
        break;
      case "NOT_REQUESTED":
      default:
        colorClasses = "bg-slate-100 text-slate-600 border-slate-200";
        label = "Not Requested";
    }
  }

  // 4. Task Priority
  else if (type === "priority") {
    switch (status) {
      case "URGENT":
        colorClasses = "bg-red-50 text-red-800 border-red-300";
        label = "Urgent";
        break;
      case "HIGH":
        colorClasses = "bg-amber-50 text-amber-900 border-amber-300";
        label = "High";
        break;
      case "NORMAL":
        colorClasses = "bg-blue-50 text-blue-800 border-blue-200";
        label = "Normal";
        break;
      case "LOW":
      default:
        colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
        label = "Low";
    }
  }

  // 5. Verification Check Result
  else if (type === "check") {
    switch (status) {
      case "PASS":
        colorClasses = "bg-emerald-50 text-emerald-800 border-emerald-200";
        label = "Pass";
        break;
      case "FAIL":
        colorClasses = "bg-red-50 text-red-800 border-red-200";
        label = "Mismatch / Fail";
        break;
      case "WARNING":
        colorClasses = "bg-amber-50 text-amber-900 border-amber-300";
        label = "Warning";
        break;
      case "ERROR":
        colorClasses = "bg-rose-50 text-rose-800 border-rose-300";
        label = "API Timeout / Error";
        break;
      default:
        colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
        label = status;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${colorClasses} tracking-tight whitespace-nowrap`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

export function SimulatedTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
      Simulated Sandbox
    </span>
  );
}
