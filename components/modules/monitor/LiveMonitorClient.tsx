'use client'

// Client component: manages selected line tab state + orchestrates all simulation hooks

import { useState } from 'react'
import { useOverviewSimulation }  from '@/lib/hooks/useOverviewSimulation'
import { useMonitorSimulation }   from '@/lib/hooks/useMonitorSimulation'
import { LineSynoptic }           from './LineSynoptic'
import { ETATable }               from './ETATable'
import { SharedZoneMonitor }      from './SharedZoneMonitor'
import { EventLog }               from './EventLog'
import { StatusDot }              from '@/components/ui/StatusDot'

// ─── Line selector ────────────────────────────────────────────────────────────

const LINES = ['LINE-1', 'LINE-2'] as const
type LineId = (typeof LINES)[number]

// ─── Component ────────────────────────────────────────────────────────────────

export function LiveMonitorClient() {
  const [activeLine, setActiveLine] = useState<LineId>('LINE-1')

  // Start crane + tank simulation (writes to Redux store)
  useOverviewSimulation()

  // Local simulations for ETA countdown, event log, zone distances
  const { etaRows, events, zones, clearEvents, formatSeconds } = useMonitorSimulation()

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">

        {/* Left — Title + subtitle */}
        <div>
          <h1 className="text-text-value text-xl font-mono uppercase tracking-wider">
            LIVE MONITOR
          </h1>
          <p className="text-text-muted text-xs font-mono mt-0.5">
            Real-time production line supervision
          </p>
        </div>

        {/* Center — Line selector tabs */}
        <div className="flex items-center gap-1 bg-scada-panel border border-scada-border rounded-scada p-1">
          {LINES.map(line => (
            <button
              key={line}
              onClick={() => setActiveLine(line)}
              className={`px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-scada transition-colors
                ${activeLine === line
                  ? 'bg-scada-surface border border-scada-border text-accent-primary border-b-2 border-b-accent-primary'
                  : 'text-text-muted hover:text-text-primary'
                }`}
            >
              {line}
            </button>
          ))}
        </div>

        {/* Right — Live indicator */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5">
            <StatusDot status="ok" animated size="sm" />
            <span className="text-status-ok text-xs font-mono">LIVE</span>
          </div>
          <span className="text-text-muted text-xs font-mono">↻ 2s</span>
        </div>
      </div>

      {/* ── Section A — Line Synoptic ──────────────────────────────────────── */}
      <LineSynoptic line={activeLine} />

      {/* ── Section B — ETA Table ─────────────────────────────────────────── */}
      <ETATable rows={etaRows} formatSeconds={formatSeconds} />

      {/* ── Sections C & D — Shared Zone + Event Log ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SharedZoneMonitor zones={zones} />
        <EventLog events={events} onClear={clearEvents} />
      </div>
    </div>
  )
}

