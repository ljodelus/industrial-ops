'use client'

// Client component — renders DO signal rows with Force and Monitor buttons

import { StatusDot, Badge, Button } from '@/components/ui'
import { Monitor } from '@/lib/icons'
import type { IOSignal } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DigitalOutputGridProps {
  signals:          IOSignal[]
  forcedOutputs:    Record<string, number>    // `${plc}:${address}` → value
  selectedAddress?: string
  onForce:          (signal: IOSignal) => void
  onMonitor:        (signal: IOSignal) => void
  monitoredAddresses: string[]
}

// ─── Status Rendering ─────────────────────────────────────────────────────────

function SignalStatusCell({ signal }: { signal: IOSignal }) {
  switch (signal.status) {
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
    case 'FORCED':
      return (
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-gold" />
          <Badge variant="gold" label="FORCED" />
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
    default:
      return null
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DigitalOutputGrid({
  signals,
  forcedOutputs,
  selectedAddress,
  onForce,
  onMonitor,
  monitoredAddresses,
}: DigitalOutputGridProps) {
  if (signals.length === 0) {
    return (
      <div className="text-text-muted text-xs font-mono text-center py-4">
        No digital outputs match the current filter.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
      {signals.map(sig => {
        const isForced   = sig.status === 'FORCED' || forcedOutputs[`${sig.plc}:${sig.address}`] !== undefined
        const isSelected = selectedAddress === sig.address
        const isMonitored = monitoredAddresses.includes(sig.address)

        return (
          <div
            key={sig.address}
            className={`
              flex items-center gap-2 px-2 py-1.5 rounded-scada border transition-colors cursor-default
              ${isForced   ? 'bg-accent-gold/10 border-accent-gold/30' : 'border-transparent hover:bg-scada-panel'}
              ${isSelected ? 'border-accent-primary/40' : ''}
            `}
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
            <SignalStatusCell signal={sig} />

            {/* Force button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onForce(sig)}
              className="text-[10px] px-2 py-0.5"
            >
              Force
            </Button>

            {/* Monitor button */}
            <Button
              variant="ghost"
              size="sm"
              icon={<Monitor size={10} />}
              onClick={() => onMonitor(sig)}
              disabled={isMonitored && !monitoredAddresses.includes(sig.address)}
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

