'use client'

// Client component: uses useAppSelector (Redux hooks) and router navigation

import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { selectCranesByLine } from '@/store/slices/cranesSlice'
import { selectTanksByLine } from '@/store/slices/tanksSlice'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TankCell } from './TankCell'
import type { Tank, Crane } from '@/types'

interface LineCardProps {
  line: 'LINE-1' | 'LINE-2'
  status: 'RUNNING' | 'FAULT'
}

type CraneStatus = 'idle' | 'moving' | 'loading' | 'error' | 'offline'

const STATUS_COLOR: Record<CraneStatus, string> = {
  idle:    '#546e7a',
  moving:  '#e8a23a',
  loading: '#4fc3f7',
  error:   '#ef5350',
  offline: '#37474f',
}

const STATUS_LABEL: Record<CraneStatus, string> = {
  idle:    'IDLE',
  moving:  'MOVING',
  loading: 'LOADING',
  error:   'ERROR',
  offline: 'OFFLINE',
}

const RAIL_LENGTH = 8000

function RailSVG({ cranes, tankCount }: { cranes: Crane[]; tankCount: number }) {
  const svgWidth  = 600
  const railY     = 40
  const craneW    = 64
  const craneH    = 20

  return (
    <svg
      viewBox={`0 0 ${svgWidth} 80`}
      width="100%"
      height={80}
      className="overflow-visible"
    >
      {/* Rail */}
      <line x1={0} y1={railY} x2={svgWidth} y2={railY} stroke="#1f2433" strokeWidth={3} />

      {/* Tick marks at each tank position */}
      {Array.from({ length: tankCount }).map((_, i) => {
        const x = (i / (tankCount - 1)) * svgWidth
        return (
          <line
            key={i}
            x1={x} y1={railY}
            x2={x} y2={railY + 10}
            stroke="#2a2f42"
            strokeWidth={1.5}
          />
        )
      })}

      {/* Cranes */}
      {cranes.map(crane => {
        const pct    = Math.min(1, Math.max(0, crane.position / RAIL_LENGTH))
        const craneX = pct * (svgWidth - craneW)
        const fill   = STATUS_COLOR[crane.status as CraneStatus] ?? STATUS_COLOR.idle

        return (
          <g
            key={crane.id}
            style={{ transition: 'transform 1000ms ease-in-out' }}
            transform={`translate(${craneX}, 0)`}
          >
            <rect
              x={0} y={railY - craneH}
              width={craneW} height={craneH}
              fill={fill}
              stroke={fill}
              strokeWidth={1}
              rx={2}
              opacity={0.9}
            />
            <text
              x={craneW / 2}
              y={railY - craneH / 2 + 4}
              textAnchor="middle"
              fill="#0d0f14"
              fontSize={8}
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="700"
            >
              {crane.name}
            </text>
            {/* Hook line */}
            <line
              x1={craneW / 2} y1={railY}
              x2={craneW / 2} y2={railY + 12}
              stroke={fill}
              strokeWidth={1.5}
            />
          </g>
        )
      })}
    </svg>
  )
}

function CraneStatusRow({ cranes }: { cranes: Crane[] }) {
  return (
    <div className="flex gap-6 mt-3 pt-3 border-t border-scada-border">
      {cranes.map(crane => {
        const isMoving  = crane.status === 'moving' || crane.status === 'loading'
        const isError   = crane.status === 'error'
        const isOffline = crane.status === 'offline'

        const dotClass = isError
          ? 'status-dot bg-status-alarm alarm-blink'
          : isOffline
          ? 'status-dot bg-status-offline'
          : isMoving
          ? 'status-dot bg-status-ok animate-ping'
          : 'status-dot bg-status-idle'

        const labelClass = isError
          ? 'text-status-alarm alarm-blink font-mono text-xs'
          : isOffline
          ? 'text-status-offline font-mono text-xs'
          : 'text-text-muted font-mono text-xs'

        return (
          <div key={crane.id} className="flex flex-col gap-1 min-w-[90px]">
            <span className="text-text-muted font-mono text-[10px] uppercase">{crane.name}</span>
            <div className="flex items-center gap-1">
              <span className={dotClass} />
              <span className={labelClass}>{STATUS_LABEL[crane.status as CraneStatus] ?? crane.status.toUpperCase()}</span>
            </div>
            <span className="value-display text-text-value font-mono text-xs">{crane.position.toLocaleString()} mm</span>
            <span className="value-display text-text-muted font-mono text-xs">{crane.load.toLocaleString()} kg</span>
          </div>
        )
      })}
    </div>
  )
}

export function LineCard({ line, status }: LineCardProps) {
  const router = useRouter()
  const cranes = useAppSelector(selectCranesByLine(line))
  const tanks  = useAppSelector(selectTanksByLine(line))

  const handleTankClick = (_tank: Tank) => {
    // Tooltip handled by TankCell — no navigation needed
  }

  const handleCraneClick = () => {
    router.push('/production/cranes')
  }

  return (
    <Card
      title={line}
      accent="primary"
      action={
        <Badge
          variant={status === 'RUNNING' ? 'ok' : 'alarm'}
          label={status}
        />
      }
    >
      {/* Rail + Crane SVG */}
      <div className="cursor-pointer" onClick={handleCraneClick}>
        <RailSVG cranes={cranes} tankCount={tanks.length} />
      </div>

      {/* Tank Grid */}
      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
        {tanks.map(tank => (
          <TankCell
            key={tank.id}
            tank={tank}
            dwellProgress={tank.dwellProgress}
            onClick={handleTankClick}
          />
        ))}
      </div>

      {/* Crane Status Row */}
      <CraneStatusRow cranes={cranes} />
    </Card>
  )
}
