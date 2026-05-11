'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ModalProps } from '@/types'

export function Modal({
  open,
  onClose,
  title,
  accentColor,
  maxWidth = 'max-w-lg',
  closeOnOverlay = true,
  footer,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidth} bg-scada-panel border border-scada-border rounded-scada outline-none ${accentColor ?? ''}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-scada-border px-6 py-4">
          <span className="text-text-primary font-medium text-sm uppercase tracking-wide">
            {title}
          </span>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-scada"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-scada-border px-6 py-4 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
