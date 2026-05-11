'use client'

// Client component — requires state from simulation engine (status, tick, etc.)

import { StatusDot } from '@/components/ui'
import type { SimStatus, SimSpeed } from '@/lib/simulation/engine'

interface SimulationStatusBarProps {
  status:           SimStatus
  tick:             number
  speed:            SimSpeed
  elapsedFormatted: string
  activeLine:       string
}

export function SimulationStatusBar({
  status,
  tick,
  speed,
  elapsedFormatted,
  activeLine,
}: SimulationStatusBarProps) {
  const dotStatus =
    status === 'running' ? 'ok' :
    status === 'paused'  ? 'warning' :
    'offline'

  const statusLabel =
    status === 'running' ? 'SIMULATION RUNNING' :
    status === 'paused'  ? 'SIMULATION PAUSED' :
    'SIMULATION STOPPED'

  const statusColor =
    status === 'running' ? 'text-status-ok' :
    status === 'paused'  ? 'text-status-warning' :
    'text-status-offline'

  return (
    <div className="bg-scada-panel border border-scada-border rounded-scada px-4 py-2 flex items-center gap-6 flex-wrap text-xs font-mono">

      {/* Status */}
      <div className="flex items-center gap-2">
        <StatusDot status={dotStatus} animated={status === 'running'} size="sm" />
        <span className={`font-mono font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <span className="text-scada-border hidden sm:inline">│</span>

      {/* Tick */}
      <div className="flex items-center gap-1.5">
        <span className="text-text-muted uppercase tracking-wide">TICK:</span>
        <span className="value-display text-xs text-text-primary">{tick.toLocaleString()}</span>
      </div>

      <span className="text-scada-border hidden sm:inline">│</span>

      {/* Speed */}
      <div className="flex items-center gap-1.5">
        <span className="text-text-muted uppercase tracking-wide">SPEED:</span>
        <span className="font-mono text-accent-gold">{speed}×</span>
      </div>

      <span className="text-scada-border hidden sm:inline">│</span>

      {/* Elapsed time */}
      <div className="flex items-center gap-1.5">
        <span className="text-text-muted uppercase tracking-wide">TIME:</span>
        <span className="value-display text-xs text-text-primary">{elapsedFormatted}</span>
      </div>

      <span className="text-scada-border hidden sm:inline">│</span>

      {/* Active line */}
      <div className="flex items-center gap-1.5">
        <span className="text-text-muted uppercase tracking-wide">LINE:</span>
        <span className="font-mono text-accent-primary">{activeLine}</span>
      </div>

    </div>
  )
}

