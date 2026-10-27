// Card and MetricCard components strictly following design.md (Section 8 & 14)
// Light surfaces, 1px border, 8-12px radius, restrained financial metrics hierarchy.

export function Card({
  children,
  className = "",
  padding = "normal",
  border = true,
}) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    normal: "p-5",
    lg: "p-6",
  }[padding] || "p-5";

  return (
    <div
      className={`bg-white ${border ? "border border-slate-200" : ""} rounded-xl shadow-xs ${paddingClasses} ${className}`}
    >
      {children}
    </div>
  );
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  badge,
  className = "",
}) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {title}
        </span>
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900 font-tabular-nums">
          {value}
        </div>
        {(subtitle || trend || badge) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
            {badge && <span>{badge}</span>}
            {trend && (
              <span
                className={`font-medium ${
                  trend === "up"
                    ? "text-emerald-700"
                    : trend === "down"
                    ? "text-rose-700"
                    : "text-slate-600"
                }`}
              >
                {trendLabel}
              </span>
            )}
            {subtitle && !trend && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-100 ${className}`}>
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
