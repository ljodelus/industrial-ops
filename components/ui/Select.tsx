'use client'

import type { SelectProps } from '@/types'

export function Select({
  label,
  value,
  onChange,
  options,
  disabled = false,
  error,
  register,
  className = '',
}: SelectProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-text-muted text-xs uppercase tracking-wide font-mono">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          {...(register ?? {})}
          value={register ? undefined : value}
          onChange={register ? undefined : (e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`w-full appearance-none bg-scada-bg border text-text-primary text-sm px-3 py-2 pr-8 rounded-scada outline-none transition-colors cursor-pointer
            ${error ? 'border-status-alarm' : 'border-scada-border focus:border-accent-primary'}
            ${disabled ? 'opacity-40 cursor-not-allowed bg-scada-surface' : ''}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-scada-panel text-text-primary">
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute right-3 pointer-events-none text-text-muted">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      {error && (
        <span className="text-status-alarm text-xs font-mono">{error}</span>
      )}
    </div>
  )
}
