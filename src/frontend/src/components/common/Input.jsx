export default function Input({
  value,
  onChange,
  placeholder = '',
  icon = null,
  clearable = true,
  onClear,
  mono = false,
  className = '',
  type = 'text',
  ...props
}) {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {icon && (
        <span className="absolute left-3.5 text-inksoft pointer-events-none flex items-center justify-center">
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-surface border border-line rounded-xl py-2.5 text-xs text-ink placeholder:text-inksoft/60 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-2xs transition-all ${
          icon ? 'pl-10' : 'pl-3.5'
        } ${clearable && value ? 'pr-9' : 'pr-3.5'} ${mono ? 'font-mono' : ''}`}
        {...props}
      />
      {clearable && value && (
        <button
          type="button"
          onClick={onClear || (() => onChange({ target: { value: '' } }))}
          aria-label="Clear input"
          className="absolute right-3 text-inksoft hover:text-ink text-xs w-5 h-5 rounded-md flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          ✕
        </button>
      )}
    </div>
  )
}
