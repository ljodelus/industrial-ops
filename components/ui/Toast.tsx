'use client'

// Client component — uses useEffect for auto-dismiss timer and state for fade-out animation

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info } from '@/lib/icons'
import type { ToastItem } from '@/types'

interface ToastProps extends ToastItem {
  onDismiss: (id: string) => void
}

const typeMap: Record<ToastItem['type'], { border: string; icon: React.ReactNode }> = {
  success: {
    border: 'border-l-2 border-l-status-ok',
    icon:   <CheckCircle size={14} className="text-status-ok shrink-0" />,
  },
  error: {
    border: 'border-l-2 border-l-status-alarm',
    icon:   <XCircle size={14} className="text-status-alarm shrink-0" />,
  },
  warning: {
    border: 'border-l-2 border-l-status-warning',
    icon:   <AlertTriangle size={14} className="text-status-warning shrink-0" />,
  },
  info: {
    border: 'border-l-2 border-l-accent-primary',
    icon:   <Info size={14} className="text-accent-primary shrink-0" />,
  },
}

export function Toast({ id, type, message, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger fade-in
    const show = setTimeout(() => setVisible(true), 10)
    // Auto-dismiss after 3 seconds
    const dismiss = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(id), 300) // wait for fade-out
    }, 3000)
    return () => {
      clearTimeout(show)
      clearTimeout(dismiss)
    }
  }, [id, onDismiss])

  const { border, icon } = typeMap[type]

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3
        bg-scada-panel border border-scada-border ${border} rounded-scada
        min-w-60 max-w-80 shadow-none
        transition-opacity duration-300
        ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {icon}
      <span className="text-text-primary text-xs font-mono flex-1">{message}</span>
      <button
        onClick={() => onDismiss(id)}
        className="text-text-muted hover:text-text-primary transition-colors ml-1"
        aria-label="Dismiss"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
