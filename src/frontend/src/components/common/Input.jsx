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
        <span className="absolute left-3 text-inksoft pointer-events-none flex items-center">
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full glass border border-line rounded-lg py-2 text-xs text-ink placeholder:text-inksoft/60 focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 transition-colors ${
          icon ? 'pl-9' : 'pl-3'
        } ${clearable && value ? 'pr-8' : 'pr-3'} ${mono ? 'font-mono' : ''}`}
        {...props}
      />
      {clearable && value && (
        <button
          type="button"
          onClick={onClear || (() => onChange({ target: { value: '' } }))}
          aria-label="Clear input"
          className="absolute right-2.5 text-inksoft hover:text-ink text-xs p-1 rounded hover:bg-obsidian-700/60 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  )
}
