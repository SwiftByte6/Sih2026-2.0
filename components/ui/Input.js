// Form controls strictly adhering to design.md (Section 11)
// Visible labels, 8px corner radii, 40px input height, accessible focus rings, error messages.

export function Input({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helpText,
  icon: Icon,
  className = "",
  ...props
}) {
  const inputId = id || name;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-700 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-600" title="Required field">*</span>}
        </label>
      )}

      <div className="relative rounded-lg">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full h-9.5 text-sm rounded-lg border bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 ${
            Icon ? "pl-9" : ""
          } ${
            error
              ? "border-red-400 focus:border-red-600 focus:ring-red-100"
              : "border-slate-300 hover:border-slate-400"
          }`}
          {...props}
        />
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {!error && helpText && <p className="text-xs text-slate-500">{helpText}</p>}
    </div>
  );
}

export function Select({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  helpText,
  className = "",
  ...props
}) {
  const selectId = id || name;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-slate-700 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full h-9.5 text-sm rounded-lg border bg-white px-3 py-1.5 text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-500 ${
          error
            ? "border-red-400 focus:border-red-600 focus:ring-red-100"
            : "border-slate-300 hover:border-slate-400"
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {!error && helpText && <p className="text-xs text-slate-500">{helpText}</p>}
    </div>
  );
}

export function Textarea({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  disabled = false,
  error,
  helpText,
  className = "",
  ...props
}) {
  const textareaId = id || name;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold text-slate-700 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full text-sm rounded-lg border bg-white p-3 text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-500 ${
          error
            ? "border-red-400 focus:border-red-600 focus:ring-red-100"
            : "border-slate-300 hover:border-slate-400"
        }`}
        {...props}
      />

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {!error && helpText && <p className="text-xs text-slate-500">{helpText}</p>}
    </div>
  );
}
