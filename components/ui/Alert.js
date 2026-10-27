// Alert and Feedback banner component adhering to design.md (Section 15)
// Success, Warning, Error, Information, and Simulated Sandbox Banner.

export function Alert({
  variant = "info",
  title,
  children,
  action,
  className = "",
}) {
  const styles = {
    info: {
      bg: "bg-blue-50/70 border-blue-200 text-blue-900",
      titleColor: "text-blue-950",
      icon: (
        <svg className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      bg: "bg-amber-50/70 border-amber-200 text-amber-900",
      titleColor: "text-amber-950",
      icon: (
        <svg className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    error: {
      bg: "bg-red-50/70 border-red-200 text-red-900",
      titleColor: "text-red-950",
      icon: (
        <svg className="h-4 w-4 text-red-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    success: {
      bg: "bg-emerald-50/70 border-emerald-200 text-emerald-900",
      titleColor: "text-emerald-950",
      icon: (
        <svg className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  }[variant] || styles.info;

  return (
    <div
      role="alert"
      className={`rounded-lg border p-3.5 text-xs sm:text-sm flex gap-3 ${styles.bg} ${className}`}
    >
      {styles.icon}
      <div className="flex-1">
        {title && (
          <h4 className={`font-semibold text-xs mb-0.5 ${styles.titleColor}`}>
            {title}
          </h4>
        )}
        <div className="leading-relaxed">{children}</div>
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}

export function SimulatedNoticeBanner({ message, className = "" }) {
  return (
    <div
      className={`bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-600 flex items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
          i
        </span>
        <span>
          {message ||
            "Notice: Core banking verification responses and OCR extracts displayed here are simulated mock demonstrations and do not represent actual live bank transactions."}
        </span>
      </div>
      <span className="shrink-0 text-[11px] font-medium text-slate-500 uppercase tracking-wider bg-white border border-slate-200 px-1.5 py-0.5 rounded">
        SANDBOX
      </span>
    </div>
  );
}
