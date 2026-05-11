'use client'

// Client component — SVG rendering uses crane position from Redux (live-updated)
import type { Crane, CraneStatus } from '@/types'

interface Props {
  crane:         Crane
  cranesOnLine:  Crane[]
}

const RAIL_LENGTH = 8000  // mm
const SVG_W       = 800
const SVG_H       = 90
const RAIL_Y      = 62
const CRANE_H     = 22
const CRANE_W_SEL = 36
const CRANE_W_OTH = 24
const CRANE_TOP   = RAIL_Y - CRANE_H - 4  // top of crane block

// Tank tick-mark positions every 800mm
const TICK_POSITIONS = Array.from({ length: 11 }, (_, i) => i * 800)

function toSvg(mm: number): number {
  return (mm / RAIL_LENGTH) * SVG_W
}

// Use CSS custom properties so we can map CraneStatus → theme token colours
// (SVG fill/stroke accept CSS variables, satisfying the "use theme tokens" rule)
const STATUS_COLOR: Record<CraneStatus, string> = {
  moving:  'var(--color-status-ok)',
  loading: 'var(--color-accent-primary)',
  idle:    'var(--color-status-idle)',
  error:   'var(--color-status-alarm)',
  offline: 'var(--color-status-offline)',
}

export function CraneRailVisualizer({ crane, cranesOnLine }: Props) {
  const selX   = toSvg(crane.position)
  const hasTarget = crane.status === 'moving' && crane.targetPosition !== undefined

  return (
    <div className="w-full overflow-hidden rounded-scada bg-scada-bg border border-scada-border p-2">
      <p className="text-text-muted text-xs font-mono uppercase mb-1 px-1">
        Rail — {crane.line}  ·  0 – {RAIL_LENGTH.toLocaleString()} mm
      </p>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        height={SVG_H}
        className="block"
        aria-label={`Rail visualizer for ${crane.name}`}
      >
        {/* Rail background */}
        <line
          x1={0} y1={RAIL_Y} x2={SVG_W} y2={RAIL_Y}
          stroke="var(--color-scada-border)"
          strokeWidth={2}
        />

        {/* Tank tick marks */}
        {TICK_POSITIONS.map(mm => {
          const x = toSvg(mm)
          return (
            <g key={mm}>
              <line
                x1={x} y1={RAIL_Y}
                x2={x} y2={RAIL_Y + 8}
                stroke="var(--color-scada-border)"
                strokeWidth={1}
              />
              <text
                x={x} y={RAIL_Y + 18}
                textAnchor="middle"
                fontSize={5}
                fill="var(--color-text-muted)"
                fontFamily="monospace"
              >
                {mm > 0 ? `${(mm / 1000).toFixed(1)}k` : '0'}
              </text>
            </g>
          )
        })}

        {/* Target position ghost outline (when crane is moving to a target) */}
        {hasTarget && crane.targetPosition !== undefined && (() => {
          const tx = toSvg(crane.targetPosition)
          const cx = toSvg(crane.position)
          const arrowStart = cx < tx ? cx + CRANE_W_SEL / 2 : cx - CRANE_W_SEL / 2
          const arrowEnd   = cx < tx ? tx - CRANE_W_SEL / 2 : tx + CRANE_W_SEL / 2
          return (
            <g>
              {/* Dashed arrow between current and target */}
              <line
                x1={arrowStart} y1={RAIL_Y - CRANE_H / 2}
                x2={arrowEnd}   y2={RAIL_Y - CRANE_H / 2}
                stroke="var(--color-accent-gold)"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              {/* Ghost crane at target */}
              <rect
                x={tx - CRANE_W_SEL / 2}
                y={CRANE_TOP}
                width={CRANE_W_SEL}
                height={CRANE_H}
                rx={2}
                fill="none"
                stroke="var(--color-accent-gold)"
                strokeWidth={1}
                strokeDasharray="4 3"
                opacity={0.6}
              />
              <text
                x={tx} y={CRANE_TOP - 4}
                textAnchor="middle"
                fontSize={5.5}
                fill="var(--color-accent-gold)"
                fontFamily="monospace"
              >
                ▼ {crane.targetPosition.toLocaleString()} mm
              </text>
            </g>
          )
        })()}

        {/* Other cranes on the same line (muted) */}
        {cranesOnLine
          .filter(c => c.id !== crane.id)
          .map(other => {
            const ox = toSvg(other.position)
            return (
              <g key={other.id}>
                <rect
                  x={ox - CRANE_W_OTH / 2}
                  y={CRANE_TOP + 3}
                  width={CRANE_W_OTH}
                  height={CRANE_H - 3}
                  rx={2}
                  fill="var(--color-scada-panel)"
                  stroke="var(--color-scada-border)"
                  strokeWidth={1}
                />
                <text
                  x={ox} y={CRANE_TOP - 2}
                  textAnchor="middle"
                  fontSize={5}
                  fill="var(--color-text-muted)"
                  fontFamily="monospace"
                >
                  {other.name.replace('CRANE-', 'C')}
                </text>
              </g>
            )
          })
        }

        {/* Selected crane — highlighted with status colour */}
        <g>
          {/* Current position marker — dashed vertical line down */}
          <line
            x1={selX} y1={CRANE_TOP + CRANE_H}
            x2={selX} y2={RAIL_Y + 8}
            stroke={STATUS_COLOR[crane.status]}
            strokeWidth={1}
            strokeDasharray="3 2"
            opacity={0.6}
          />
          {/* Crane block */}
          <rect
            x={selX - CRANE_W_SEL / 2}
            y={CRANE_TOP}
            width={CRANE_W_SEL}
            height={CRANE_H}
            rx={2}
            fill="var(--color-scada-panel)"
            stroke={STATUS_COLOR[crane.status]}
            strokeWidth={2}
          />
          {/* Crane label inside block */}
          <text
            x={selX} y={CRANE_TOP + CRANE_H / 2 + 2}
            textAnchor="middle"
            fontSize={5.5}
            fill={STATUS_COLOR[crane.status]}
            fontFamily="monospace"
            fontWeight="bold"
          >
            {crane.name.replace('CRANE-', 'C')}
          </text>
          {/* Position label below the dashed line */}
          <text
            x={selX} y={RAIL_Y + 24}
            textAnchor="middle"
            fontSize={5.5}
            fill={STATUS_COLOR[crane.status]}
            fontFamily="monospace"
          >
            ▼ {crane.position.toLocaleString()} mm
          </text>
        </g>
      </svg>
    </div>
  )
}

