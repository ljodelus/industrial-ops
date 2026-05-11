'use client'

import type { ButtonProps } from '@/types'
import { Spinner } from './Spinner'

const variantBase: Record<string, string> = {
  primary:   'bg-accent-primary text-scada-bg hover:opacity-90 hover:border-l-2 hover:border-text-value',
  secondary: 'bg-scada-surface text-text-primary border border-scada-border hover:border-accent-primary hover:text-accent-primary',
  ghost:     'bg-transparent text-text-muted hover:text-text-primary hover:bg-scada-surface',
  danger:    'bg-status-alarm text-white hover:opacity-90',
}

const sizeMap: Record<string, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  onClick,
  type = 'button',
  children,
  className = '',
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex items-center gap-2 font-medium uppercase tracking-wide rounded-scada transition-all
        ${variantBase[variant]}
        ${sizeMap[size]}
        ${isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        ${className}`}
    >
      {loading ? <Spinner size="sm" /> : icon ? <span className="flex-shrink-0">{icon}</span> : null}
      {children}
    </button>
  )
}
