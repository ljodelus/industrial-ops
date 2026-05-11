'use client'

// Client component: uses onClick (scrollToCard, navigation) + useAppSelector for Redux state

import { useRef }        from 'react'
import { useRouter }     from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { selectCranesByLine } from '@/store/slices/cranesSlice'
import { selectAllTanks }     from '@/store/slices/tanksSlice'
import { Badge }         from '@/components/ui/Badge'
import { ProgressBar }   from '@/components/ui/ProgressBar'
import { Tooltip }       from '@/components/ui/Tooltip'
import { CraneDetailCard } from './CraneDetailCard'
import type { Tank }     from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const SVG_W    = 800
const SVG_H    = 110
const RAIL_Y   = 62
const CRANE_W  = 62
const CRANE_H  = 26
const MM_MAX   = 8000

/** Map mm position to SVG x coordinate */
function mmToSvg(mm: number): number {
  return (mm / MM_MAX) * SVG_W
}

/** Distribute tanks evenly from 300mm to 7500mm across the virtual rail */
function getTankPositionMm(index: number, total: number): number {
  if (total <= 1) return MM_MAX / 2
  const start = 300
  const end   = 7500
  const step  = (end - start) / (total - 1)
  return Math.round(start + index * step)
}

/** Crane status → SVG fill color (raw hex — SVG doesn't support Tailwind tokens) */
const STATUS_FILL: Record<string, string> = {
  moving:  '#e8a23a',
  loading: '#4fc3f7',
  idle:    '#546e7a',
  error:   '#ef5350',
  offline: '#546e7a',
}

// ─── MonitorTankCell ──────────────────────────────────────────────────────────

interface MonitorTankCellProps {
  tank: Tank
}

function MonitorTankCell({ tank }: MonitorTankCellProps) {
  const isOccupied = tank.occupied
  // Estimate remaining dwell: full cycle ≈ 10 min (600s)
  const dwellSeconds = isOccupied
    ? Math.round(((100 - tank.dwellProgress) / 100) * 600)
    : 0
  const m           = Math.floor(dwellSeconds / 60)
  const s           = dwellSeconds % 60
  const timeStr     = `${m}:${String(s).padStart(2, '0')} remaining`
  const TOTAL_STEPS = 6
  const stepNum     = Math.max(1, Math.ceil((tank.dwellProgress / 100) * TOTAL_STEPS))

  const containerClass = isOccupied
    ? 'bg-accent-primary/5 border-accent-primary/40'
    : 'bg-scada-surface border-scada-border'

  const tooltipText = isOccupied && tank.currentPart
    ? `${tank.currentPart} — ${Math.round(tank.dwellProgress)}% dwell`
    : tank.name

  return (
    <Tooltip content={tooltipText} position="top">
      <div
        className={`w-28 h-32 flex flex-col justify-between p-2 border rounded-scada shrink-0 transition-colors ${containerClass}`}
      >
        <div>
          <div className="text-text-primary text-xs font-mono font-medium">
            T-{String(tank.number).padStart(2, '0')}
          </div>
          <div className="text-text-muted text-xs font-mono truncate">{tank.name}</div>
        </div>

        {isOccupied ? (
          <div className="flex flex-col gap-1">
            {tank.currentPart && (
              <div className="text-accent-primary text-[10px] font-mono truncate">
                {tank.currentPart}
              </div>
            )}
            <ProgressBar value={tank.dwellProgress} max={100} />
            <div className="text-text-muted text-[10px] font-mono">{timeStr}</div>
            <div className="text-text-muted text-[9px] font-mono">
              STEP {stepNum}/{TOTAL_STEPS}
            </div>
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

// ─── LineSynoptic ─────────────────────────────────────────────────────────────

interface LineSynopticProps {
  line: string
}

export function LineSynoptic({ line }: LineSynopticProps) {
  const cranes  = useAppSelector(selectCranesByLine(line))
  const allTanks = useAppSelector(selectAllTanks)
  const tanks   = allTanks.filter(t => t.line === line)
  const router  = useRouter()

  // Refs to crane detail cards for scroll-on-click
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const scrollToCard = (craneId: string) => {
    cardRefs.current[craneId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  // Pre-compute tank positions in mm → stored by index
  const tankPositions = tanks.map((_, i) => getTankPositionMm(i, tanks.length))

  // Detect collision zones on this line (cranes within 500mm)
  type CollisionZone = { x1: number; x2: number; midX: number }
  const collisionZones: CollisionZone[] = []
  for (let i = 0; i < cranes.length; i++) {
    for (let j = i + 1; j < cranes.length; j++) {
      const diff = Math.abs(cranes[i].position - cranes[j].position)
      if (diff < 500) {
        const minMm = Math.min(cranes[i].position, cranes[j].position)
        const maxMm = Math.max(cranes[i].position, cranes[j].position)
        const x1    = mmToSvg(minMm)
        const x2    = mmToSvg(maxMm) + CRANE_W
        collisionZones.push({ x1, x2, midX: (x1 + x2) / 2 })
      }
    }
  }

  const craneColumns = cranes.length <= 2 ? 'grid-cols-2' : 'grid-cols-4'

  return (
    <div className="space-y-4">

      {/* A1 — Rail + Cranes SVG */}
      <div className="bg-scada-bg border border-scada-border rounded-scada overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full"
          style={{ height: SVG_H, display: 'block' }}
          aria-label={`${line} crane rail`}
        >
          {/* Decorative parallel rails */}
          <line x1={0} y1={RAIL_Y - 7} x2={SVG_W} y2={RAIL_Y - 7} stroke="#1f2433" strokeWidth={1.5} />
          <line x1={0} y1={RAIL_Y + 7} x2={SVG_W} y2={RAIL_Y + 7} stroke="#1f2433" strokeWidth={1.5} />
          {/* Main rail */}
          <line x1={0} y1={RAIL_Y} x2={SVG_W} y2={RAIL_Y} stroke="#2a3044" strokeWidth={3} />

          {/* Tank ticks */}
          {tanks.map((tank, i) => {
            const x = mmToSvg(tankPositions[i])
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

          {/* Collision zone indicators */}
          {collisionZones.map((z, i) => (
            <g key={`collision-${i}`}>
              <rect
                x={z.x1} y={RAIL_Y - 14}
                width={z.x2 - z.x1} height={28}
                fill="#ef5350" opacity={0.18}
              />
              <text
                x={z.midX} y={RAIL_Y - 20}
                textAnchor="middle"
                fontSize={9}
                fill="#ef5350"
                fontFamily="monospace"
                fontWeight="bold"
              >
                COLLISION RISK
              </text>
            </g>
          ))}

          {/* Cranes */}
          {cranes.map(crane => {
            const cx          = mmToSvg(crane.position) - CRANE_W / 2
            const cy          = RAIL_Y - CRANE_H - 10
            const statusFill  = STATUS_FILL[crane.status] ?? '#546e7a'
            const dropCenterX = cx + CRANE_W / 2

            return (
              <g
                key={crane.id}
                onClick={() => scrollToCard(crane.id)}
                style={{ cursor: 'pointer' }}
                role="button"
                aria-label={`${crane.name} at ${crane.position}mm — click to scroll to card`}
              >
                {/* Drop line (dashed) */}
                <line
                  x1={dropCenterX} y1={cy + CRANE_H}
                  x2={dropCenterX} y2={RAIL_Y - 2}
                  stroke="#2a3044" strokeWidth={1}
                  strokeDasharray="3,2"
                />
                {/* Hook symbol */}
                <text
                  x={dropCenterX} y={RAIL_Y + 4}
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
                  fill="#1a1d2e" stroke="#2a3044" strokeWidth={1}
                  rx={1}
                />
                {/* Status color bar (bottom 4px) */}
                <rect
                  x={cx} y={cy + CRANE_H - 4}
                  width={CRANE_W} height={4}
                  fill={statusFill}
                  rx={1}
                />
                {/* Crane label */}
                <text
                  x={cx + CRANE_W / 2}
                  y={cy + (CRANE_H / 2) - 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={9}
                  fontWeight="bold"
                  fill="#ffffff"
                  fontFamily="monospace"
                >
                  {crane.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* A2 — Detailed Tank Grid */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tanks.map(tank => (
          <MonitorTankCell key={tank.id} tank={tank} />
        ))}
      </div>

      {/* A3 — Crane Detail Cards */}
      <div className={`grid gap-4 ${cranes.length === 1 ? 'grid-cols-1' : craneColumns}`}>
        {cranes.map(crane => (
          <div
            key={crane.id}
            ref={el => { cardRefs.current[crane.id] = el }}
          >
            <CraneDetailCard
              crane={crane}
              onDetails={() => router.push('/production/cranes')}
            />
          </div>
        ))}
      </div>
    </div>
  )
}


