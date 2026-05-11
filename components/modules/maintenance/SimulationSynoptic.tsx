'use client'

// Client component — Section B: Live simulation synoptic view
// Displays crane rail + tank grid from local simulation state (NOT Redux)

import { ProgressBar, Badge, Tooltip } from '@/components/ui'
import type { SimCrane, SimTank } from '@/lib/simulation/engine'
import { formatDwellRemaining, getTankPositionsMm } from '@/lib/simulation/engine'

// ─── Constants ────────────────────────────────────────────────────────────────

const SVG_W   = 800
const SVG_H   = 110
const RAIL_Y  = 62
const CRANE_W = 62
const CRANE_H = 26
const MM_MAX  = 8000

function mmToSvg(mm: number): number {
  return (mm / MM_MAX) * SVG_W
}

const STATUS_FILL: Record<string, string> = {
  moving:  '#e8a23a',
  loading: '#4fc3f7',
  idle:    '#546e7a',
  error:   '#ef5350',
  offline: '#546e7a',
}

// ─── SimTankCell ──────────────────────────────────────────────────────────────

interface SimTankCellProps {
  tank:    SimTank
  faulted: boolean
}

function SimTankCell({ tank, faulted }: SimTankCellProps) {
  const progress = tank.dwellMax > 0
    ? Math.min(100, (tank.dwellElapsed / tank.dwellMax) * 100)
    : 0

  const remaining = formatDwellRemaining(tank.dwellElapsed, tank.dwellMax)

  const containerClass = faulted
    ? 'bg-status-alarm/10 border-status-alarm alarm-blink'
    : tank.occupied
      ? 'bg-accent-primary/5 border-accent-primary/40'
      : 'bg-scada-surface border-scada-border'

  const tooltipText = tank.occupied && tank.currentPartId
    ? `${tank.currentPartId} — ${Math.round(progress)}% dwell`
    : tank.name

  return (
    <Tooltip content={tooltipText} position="top">
      <div className={`w-28 h-32 flex flex-col justify-between p-2 border rounded-scada shrink-0 transition-colors ${containerClass}`}>
        <div>
          <div className="text-text-primary text-xs font-mono font-medium">
            T-{String(tank.number).padStart(2, '00')}
          </div>
          <div className="text-text-muted text-xs font-mono truncate">{tank.name}</div>
        </div>

        {tank.occupied ? (
          <div className="flex flex-col gap-1">
            {tank.currentPartId && (
              <div className="text-accent-primary text-[10px] font-mono truncate">
                {tank.currentPartId}
              </div>
            )}
            <ProgressBar value={progress} max={100} />
            <div className="text-text-muted text-[10px] font-mono">{remaining} rem</div>
            <div className="text-text-muted text-[9px] font-mono">{tank.stepLabel}</div>
          </div>
        ) : (
          <div>
            <Badge variant="idle" label="READY" className="text-[10px]" />
          </div>
        )}
      </div>
    </Tooltip>
  )
}

// ─── SimulationSynoptic ───────────────────────────────────────────────────────

interface SimulationSynopticProps {
  cranes:        SimCrane[]
  tanks:         SimTank[]
  faultedCraneId: string | null
  tankCount:     number
}

export function SimulationSynoptic({
  cranes,
  tanks,
  faultedCraneId,
  tankCount,
}: SimulationSynopticProps) {
  const visibleTanks = tanks.slice(0, tankCount)
  const tankMmPositions = getTankPositionsMm(visibleTanks.length)

  return (
    <div className="space-y-4 relative">

      {/* SIMULATION watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        aria-hidden="true"
      >
        <span
          className="text-scada-border text-6xl font-mono uppercase opacity-10 select-none"
          style={{ letterSpacing: '0.3em' }}
        >
          SIMULATION
        </span>
      </div>

      {/* Rail + Crane SVG */}
      <div className="relative z-10 bg-scada-bg border border-scada-border rounded-scada overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full"
          style={{ height: SVG_H, display: 'block' }}
          aria-label="Simulation crane rail"
        >
          {/* Decorative parallel rails */}
          <line x1={0} y1={RAIL_Y - 7} x2={SVG_W} y2={RAIL_Y - 7} stroke="#1f2433" strokeWidth={1.5} />
          <line x1={0} y1={RAIL_Y + 7} x2={SVG_W} y2={RAIL_Y + 7} stroke="#1f2433" strokeWidth={1.5} />
          {/* Main rail */}
          <line x1={0} y1={RAIL_Y} x2={SVG_W} y2={RAIL_Y} stroke="#2a3044" strokeWidth={3} />

          {/* Tank ticks */}
          {visibleTanks.map((tank, i) => {
            const x = mmToSvg(tankMmPositions[i])
            return (
              <g key={tank.id}>
                <line
                  x1={x} y1={RAIL_Y - 10}
                  x2={x} y2={RAIL_Y + 10}
                  stroke="#2a3044" strokeWidth={1}
                />
                <text
                  x={x} y={RAIL_Y + 22}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#6b738a"
                  fontFamily="monospace"
                >
                  T-{String(tank.number).padStart(2, '0')}
                </text>
              </g>
            )
          })}

          {/* Cranes */}
          {cranes.filter(c => c.enabled).map(crane => {
            const isFaulted  = crane.id === faultedCraneId || crane.faulted
            const cx         = mmToSvg(crane.position) - CRANE_W / 2
            const cy         = RAIL_Y - CRANE_H - 10
            const statusFill = isFaulted ? '#ef5350' : (STATUS_FILL[crane.status] ?? '#546e7a')
            const centerX    = cx + CRANE_W / 2

            return (
              <g
                key={crane.id}
                aria-label={`${crane.name} at ${crane.position}mm`}
              >
                {/* Drop line */}
                <line
                  x1={centerX} y1={cy + CRANE_H}
                  x2={centerX} y2={RAIL_Y - 2}
                  stroke="#2a3044" strokeWidth={1}
                  strokeDasharray="3,2"
                />
                {/* Hook */}
                <text
                  x={centerX} y={RAIL_Y + 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#6b738a"
                  fontFamily="monospace"
                >
                  ∧
                </text>
                {/* Crane body */}
                <rect
                  x={cx} y={cy}
                  width={CRANE_W} height={CRANE_H}
                  fill={isFaulted ? '#2a1a1a' : '#1a1d2e'}
                  stroke={isFaulted ? '#ef5350' : '#2a3044'}
                  strokeWidth={isFaulted ? 2 : 1}
                  rx={1}
                />
                {/* Status bar */}
                <rect
                  x={cx} y={cy + CRANE_H - 4}
                  width={CRANE_W} height={4}
                  fill={statusFill}
                  rx={1}
                />
                {/* Load indicator (if carrying) */}
                {crane.load > 0 && (
                  <text
                    x={centerX}
                    y={cy + (CRANE_H / 2) + 8}
                    textAnchor="middle"
                    fontSize={7}
                    fill="#aab4cc"
                    fontFamily="monospace"
                  >
                    {crane.load}kg
                  </text>
                )}
                {/* Crane label */}
                <text
                  x={centerX}
                  y={cy + (CRANE_H / 2) - 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={9}
                  fontWeight="bold"
                  fill={isFaulted ? '#ef5350' : '#ffffff'}
                  fontFamily="monospace"
                >
                  {crane.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Tank Grid */}
      <div className="relative z-10 flex gap-2 overflow-x-auto pb-1">
        {visibleTanks.map(tank => (
          <SimTankCell
            key={tank.id}
            tank={tank}
            faulted={false}
          />
        ))}
      </div>

      {/* Crane state cards */}
      <div className={`relative z-10 grid gap-4 ${cranes.filter(c => c.enabled).length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {cranes.filter(c => c.enabled).map(crane => {
          const isFaulted = crane.id === faultedCraneId || crane.faulted
          const statusColor =
            crane.status === 'moving'  ? 'text-status-warning' :
            crane.status === 'loading' ? 'text-accent-primary' :
            crane.status === 'error'   ? 'text-status-alarm' :
            crane.status === 'offline' ? 'text-status-offline' :
            'text-status-idle'

          return (
            <div
              key={crane.id}
              className={`bg-scada-surface border rounded-scada p-3 space-y-2
                ${isFaulted ? 'border-status-alarm alarm-blink' : 'border-scada-border'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-text-primary text-xs font-mono font-medium">{crane.name}</span>
                <span className={`text-[10px] font-mono uppercase ${statusColor}`}>
                  {crane.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-mono">
                <span className="text-text-muted">POSITION</span>
                <span className="value-display text-text-primary">{crane.position.toLocaleString()} mm</span>
                <span className="text-text-muted">LOAD</span>
                <span className="value-display text-text-primary">{crane.load} kg</span>
                <span className="text-text-muted">STEP</span>
                <span className="text-accent-primary truncate">{crane.currentStep}</span>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

