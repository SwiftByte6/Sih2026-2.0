"use client";

// Button component adhering strictly to design.md (Section 12)
// Primary Blue #1D4ED8, Secondary, Tertiary, Destructive, with loading and focus states.

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  icon: Icon,
  iconPosition = "left",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors select-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-9 px-4 text-sm gap-2",
    lg: "h-11 px-5 text-base gap-2.5",
    icon: "h-9 w-9 p-0",
  }[size] || "h-9 px-4 text-sm gap-2";

  const variantClasses = {
    primary:
      "bg-blue-700 text-white hover:bg-blue-800 active:bg-blue-900 shadow-sm border border-transparent",
    secondary:
      "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 shadow-xs",
    tertiary:
      "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200",
    destructive:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm border border-transparent",
    "destructive-outline":
      "bg-white text-red-700 border border-red-300 hover:bg-red-50 active:bg-red-100",
    subtle:
      "bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 border border-blue-200",
  }[variant] || "bg-blue-700 text-white hover:bg-blue-800";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {!loading && Icon && iconPosition === "left" && (
        <Icon className="h-4 w-4 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === "right" && (
        <Icon className="h-4 w-4 shrink-0" />
      )}
    </button>
  );
}
