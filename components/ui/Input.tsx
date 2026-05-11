'use client'

import type { InputProps } from '@/types'

export function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  icon,
  rightIcon,
  unit,
  register,
  className = '',
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-text-muted text-xs uppercase tracking-wide font-mono">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-text-muted flex items-center">
            {icon}
          </span>
        )}
        <input
          {...(register
            ? register
            : { value, onChange, onBlur }
          )}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-scada-bg border text-text-primary text-sm px-3 py-2 rounded-scada outline-none transition-colors
            ${icon ? 'pl-9' : ''}
            ${unit || rightIcon ? 'pr-10' : ''}
            ${error ? 'border-status-alarm' : 'border-scada-border focus:border-accent-primary'}
            ${disabled ? 'opacity-40 cursor-not-allowed bg-scada-surface' : ''}`}
        />
        {unit && (
          <span className="absolute right-3 text-text-muted text-xs font-mono pointer-events-none">
            {unit}
          </span>
        )}
        {rightIcon && !unit && (
          <span className="absolute right-3 text-text-muted flex items-center">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <span className="text-status-alarm text-xs font-mono">{error}</span>
      )}
    </div>
  )
}
