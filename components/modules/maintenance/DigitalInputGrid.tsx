'use client'

// Client component — renders DI signal rows with Monitor button

import { StatusDot, Button } from '@/components/ui'
import { Monitor } from '@/lib/icons'
import type { IOSignal } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DigitalInputGridProps {
  signals:            IOSignal[]
  onMonitor:          (signal: IOSignal) => void
  monitoredAddresses: string[]
}

// ─── Status Cell ──────────────────────────────────────────────────────────────

function SignalStatusCell({ status }: { status: IOSignal['status'] }) {
  switch (status) {
    case 'HIGH':
      return (
        <span className="flex items-center gap-1.5">
          <StatusDot status="ok" size="sm" />
          <span className="text-status-ok text-xs font-mono">HIGH</span>
        </span>
      )
    case 'LOW':
      return (
        <span className="flex items-center gap-1.5">
          <StatusDot status="offline" size="sm" />
          <span className="text-text-muted text-xs font-mono">LOW</span>
        </span>
      )
    case 'FAULT':
      return (
        <span className="flex items-center gap-1.5">
          <span className="status-dot alarm-blink bg-status-alarm inline-block w-1.5 h-1.5 rounded-full" />
          <span className="text-status-alarm text-xs font-mono">FAULT</span>
        </span>
      )
    case 'CAUTION':
      return (
        <span className="flex items-center gap-1.5">
          <StatusDot status="warning" size="sm" />
          <span className="text-status-warning text-xs font-mono">CAUTION</span>
        </span>
      )
    case 'FORCED':
      return (
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-gold" />
          <span className="text-accent-gold text-xs font-mono">FORCED</span>
        </span>
      )
    default:
      return null
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DigitalInputGrid({ signals, onMonitor, monitoredAddresses }: DigitalInputGridProps) {
  if (signals.length === 0) {
    return (
      <div className="text-text-muted text-xs font-mono text-center py-4">
        No digital inputs match the current filter.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
      {signals.map(sig => {
        const isMonitored = monitoredAddresses.includes(sig.address)
        return (
          <div
            key={sig.address}
            className="flex items-center gap-2 px-2 py-1.5 rounded-scada border border-transparent hover:bg-scada-panel transition-colors"
          >
            {/* Address */}
            <span className="text-text-muted font-mono text-[10px] w-12 shrink-0">
              {sig.address}
            </span>

            {/* Name */}
            <span className="text-text-primary font-mono text-xs flex-1 truncate">
              {sig.name}
            </span>

            {/* Status */}
            <SignalStatusCell status={sig.status} />

            {/* Monitor button */}
            <Button
              variant="ghost"
              size="sm"
              icon={<Monitor size={10} />}
              onClick={() => onMonitor(sig)}
              className={`text-[10px] px-2 py-0.5 ${isMonitored ? 'text-accent-primary' : ''}`}
            >
              {isMonitored ? 'Watching' : 'Monitor'}
            </Button>
          </div>
        )
      })}
    </div>
  )
}

