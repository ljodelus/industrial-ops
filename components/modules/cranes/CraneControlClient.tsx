'use client'

// Client component — main crane control page orchestrator
// Runs useOverviewSimulation for position animation and useCraneSimulation for telemetry
import { useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectAllCranes } from '@/store/slices/cranesSlice'
import { selectUserRole } from '@/store/slices/authSlice'
import { selectAllJobs } from '@/store/slices/jobsSlice'
import { useOverviewSimulation } from '@/lib/hooks/useOverviewSimulation'
import { useCraneSimulation } from '@/lib/hooks/useCraneSimulation'
import { Card } from '@/components/ui'
import { StatusDot } from '@/components/ui'
import { CraneSelectorTabs } from './CraneSelectorTabs'
import { CraneRailVisualizer } from './CraneRailVisualizer'
import { CraneTelemetryGrid } from './CraneTelemetryGrid'
import { CraneFaultPanel } from './CraneFaultPanel'
import { CraneSensorStatus } from './CraneSensorStatus'
import { CraneControlPanel } from './CraneControlPanel'
import { CraneMovementTable } from './CraneMovementTable'
import type { CraneStatus } from '@/types'

const STATUS_LABEL: Record<CraneStatus, string> = {
  moving:  'MOVING',
  loading: 'LOADING',
  idle:    'IDLE',
  error:   'ERROR',
  offline: 'OFFLINE',
}

function craneHeaderDot(status: CraneStatus): {
  dotStatus: 'ok' | 'warning' | 'alarm' | 'offline' | 'idle'
  animated:  boolean
} {
  switch (status) {
    case 'moving':  return { dotStatus: 'ok',      animated: true  }
    case 'loading': return { dotStatus: 'ok',      animated: true  }
    case 'idle':    return { dotStatus: 'idle',    animated: false }
    case 'error':   return { dotStatus: 'alarm',   animated: true  }
    case 'offline': return { dotStatus: 'offline', animated: false }
  }
}

const CRANE_ACCENT: Record<CraneStatus, 'ok' | 'warning' | 'alarm' | 'offline' | 'primary' | 'gold'> = {
  moving:  'gold',
  loading: 'primary',
  idle:    'offline',
  error:   'alarm',
  offline: 'offline',
}

export function CraneControlClient() {
  // Run position animation — same simulation as overview page
  useOverviewSimulation()

  const cranes   = useAppSelector(selectAllCranes)
  const jobs     = useAppSelector(selectAllJobs)
  const userRole = useAppSelector(selectUserRole)

  const [selectedCraneId, setSelectedCraneId] = useState<string>('crane-1')

  const selectedCrane  = cranes.find(c => c.id === selectedCraneId) ?? cranes[0]
  const cranesOnLine   = cranes.filter(c => c.line === selectedCrane?.line)
  const currentJob     = jobs.find(j => j.id === selectedCrane?.currentJob)

  const { speed, uptimeStr, movements } = useCraneSimulation(selectedCraneId)

  if (!selectedCrane) return null

  return (
    <div className="flex flex-col gap-4">

      {/* ── Page Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="value-display text-xl text-text-value uppercase tracking-widest font-mono">
            Crane Control
          </h1>
          <p className="text-text-muted text-xs font-mono mt-0.5">
            Manual control and diagnostics
          </p>
        </div>

        {/* Global status summary — click to switch crane tab */}
        <div className="flex items-center gap-4">
          {cranes.map(crane => {
            const { dotStatus, animated } = craneHeaderDot(crane.status)
            return (
              <button
                key={crane.id}
                onClick={() => setSelectedCraneId(crane.id)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                <span className="text-text-muted text-xs font-mono">{crane.name}</span>
                <StatusDot status={dotStatus} animated={animated} size="sm" />
                <span className={`text-xs font-mono ${
                  crane.status === 'error'
                    ? 'text-status-alarm'
                    : crane.status === 'moving' || crane.status === 'loading'
                      ? 'text-status-ok'
                      : 'text-text-muted'
                }`}>
                  {STATUS_LABEL[crane.status]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Section A — Crane Selector Tabs ───────────────────────────────────── */}
      <div className="bg-scada-surface border border-scada-border rounded-scada overflow-hidden">
        <CraneSelectorTabs
          cranes={cranes}
          selectedCraneId={selectedCraneId}
          onSelect={setSelectedCraneId}
        />

        {/* ── Sections B + C ── Detail + Control ─────────────────────────────── */}
        <div className="grid grid-cols-5 gap-0 divide-x divide-scada-border">

          {/* ── Section B — Crane Detail View (60%) ────────────────────────── */}
          <div className="col-span-3 p-4 flex flex-col gap-4">
            <Card
              title={selectedCrane.name}
              accent={CRANE_ACCENT[selectedCrane.status]}
              noPadding
            >
              <div className="p-4 flex flex-col gap-4">
                {/* B1 — Rail Position Visualizer */}
                <CraneRailVisualizer
                  crane={selectedCrane}
                  cranesOnLine={cranesOnLine}
                />

                {/* B2 — Live Telemetry Grid */}
                <CraneTelemetryGrid
                  crane={selectedCrane}
                  job={currentJob}
                  speed={speed}
                  uptime={uptimeStr}
                />

                {/* B3 — Fault Diagnostics (error state only) */}
                {selectedCrane.status === 'error' && (
                  <CraneFaultPanel
                    crane={selectedCrane}
                    userRole={userRole}
                  />
                )}

                {/* B4 — Sensor Status (always visible) */}
                <div className="border-t border-scada-border pt-3">
                  <p className="text-text-muted text-xs font-mono uppercase tracking-wide mb-2">
                    Sensor Status
                  </p>
                  <CraneSensorStatus crane={selectedCrane} />
                </div>
              </div>
            </Card>
          </div>

          {/* ── Section C — Control Panel (40%) ────────────────────────────── */}
          <div className="col-span-2 p-4">
            <Card title="Control Panel" accent="gold" noPadding>
              <div className="p-4">
                <CraneControlPanel
                  crane={selectedCrane}
                  job={currentJob}
                  userRole={userRole}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Section D — Movement History ─────────────────────────────────────── */}
      <Card title="Movement History" accent="primary" noPadding>
        <CraneMovementTable
          craneName={selectedCrane.name}
          movements={movements}
        />
      </Card>
    </div>
  )
}


