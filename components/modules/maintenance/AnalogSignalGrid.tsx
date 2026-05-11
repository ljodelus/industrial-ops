'use client'

// Client component — renders AI/AO signal rows with value, unit, mini bar, and Monitor/Force buttons

import { ProgressBar, Button } from '@/components/ui'
import { Monitor } from '@/lib/icons'
import type { IOSignal } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalogSignalGridProps {
  signals:            IOSignal[]
  onForce:            (signal: IOSignal) => void
  onMonitor:          (signal: IOSignal) => void
  monitoredAddresses: string[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AnalogSignalGrid({ signals, onForce, onMonitor, monitoredAddresses }: AnalogSignalGridProps) {
  if (signals.length === 0) {
    return (
      <div className="text-text-muted text-xs font-mono text-center py-4">
        No analog signals match the current filter.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {signals.map(sig => {
        const isMonitored = monitoredAddresses.includes(sig.address)
        const value       = sig.value ?? 0
        const min         = sig.min ?? 0
        const max         = sig.max ?? 100
        const isFault     = sig.status === 'FAULT'

        return (
          <div
            key={sig.address}
            className="flex items-center gap-2 px-2 py-2 rounded-scada border border-transparent hover:bg-scada-panel transition-colors"
          >
            {/* Address */}
            <span className="text-text-muted font-mono text-[10px] w-14 shrink-0">
              {sig.address}
            </span>

            {/* Name */}
            <span className={`font-mono text-xs w-52 shrink-0 truncate ${isFault ? 'text-status-alarm' : 'text-text-primary'}`}>
              {sig.name}
            </span>

            {/* Value */}
            <span className={`value-display text-sm w-20 text-right shrink-0 ${isFault ? 'text-status-alarm' : 'text-text-value'}`}>
              {isFault ? '---' : value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>

            {/* Unit */}
            <span className="text-text-muted text-xs font-mono w-12 shrink-0">
              {sig.unit ?? ''}
            </span>

            {/* Mini bar */}
            <div className="flex-1 min-w-[60px] max-w-[120px]">
              {isFault ? (
                <div className="h-1.5 bg-status-alarm/30 rounded-scada" />
              ) : (
                <ProgressBar value={value - min} max={max - min} className="h-1.5" />
              )}
            </div>

            {/* Force button (AO only) */}
            {sig.type === 'AO' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onForce(sig)}
                className="text-[10px] px-2 py-0.5 shrink-0"
              >
                Force
              </Button>
            )}

            {/* Monitor button */}
            <Button
              variant="ghost"
              size="sm"
              icon={<Monitor size={10} />}
              onClick={() => onMonitor(sig)}
              className={`text-[10px] px-2 py-0.5 shrink-0 ${isMonitored ? 'text-accent-primary' : ''}`}
            >
              {isMonitored ? 'Watching' : 'Monitor'}
            </Button>
          </div>
        )
      })}
    </div>
  )
}

