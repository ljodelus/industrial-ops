'use client'

// Client component — custom SVG heatmap with hover tooltip state (useState, event listeners)

import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  selectHeatmapData,
  selectSelectedHeatmapCrane,
  selectHeatmapCrane,
} from '@/store/slices/craneUtilizationSlice'
import { Card } from '@/components/ui'
import type { HeatmapCell } from '@/types'

const CRANE_OPTIONS = [
  { id: 'all',     label: 'All Cranes' },
  { id: 'CRANE-1', label: 'CRANE-1'   },
  { id: 'CRANE-2', label: 'CRANE-2'   },
  { id: 'CRANE-3', label: 'CRANE-3'   },
  { id: 'CRANE-4', label: 'CRANE-4'   },
]

const PILL_BASE     = 'px-2.5 py-1 text-[10px] font-mono rounded-scada cursor-pointer transition-colors border'
const PILL_ACTIVE   = 'bg-accent-primary text-scada-bg border-accent-primary'
const PILL_INACTIVE = 'bg-transparent text-text-muted border-scada-border hover:text-text-primary'

const POSITIONS = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000]
const CRANES    = ['CRANE-1', 'CRANE-2', 'CRANE-3', 'CRANE-4']

const CELL_W = 44
const CELL_H = 28
const LABEL_W = 64
const HEADER_H = 24

interface TooltipData {
  cell: HeatmapCell
  x:   number
  y:   number
}

function intensityToOpacity(intensity: number): number {
  // Map 0–1 → subtle gradient for SVG fill
  return Math.max(0.05, Math.min(0.95, intensity))
}

function formatDwellTime(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m.toString().padStart(2, '0')}m`
}

function formatPct(hours: number): string {
  const total = 168   // 7 days × 24h
  return `(${((hours / total) * 100).toFixed(1)}% of period)`
}

export function MovementHeatmap() {
  const dispatch            = useAppDispatch()
  const allCells            = useAppSelector(selectHeatmapData)
  const selectedCrane       = useAppSelector(selectSelectedHeatmapCrane)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)

  const visibleCranes = selectedCrane === 'all' ? CRANES : [selectedCrane]

  const svgWidth  = LABEL_W + POSITIONS.length * CELL_W + 80   // +80 for legend
  const svgHeight = HEADER_H + visibleCranes.length * (CELL_H + 4) + 28  // +28 for x-axis labels

  function getCellData(craneId: string, positionMm: number): HeatmapCell | undefined {
    return allCells.find(c => c.craneId === craneId && c.positionMm === positionMm)
  }

  function handleMouseEnter(e: React.MouseEvent<SVGRectElement>, cell: HeatmapCell) {
    const rect = (e.currentTarget as SVGRectElement).closest('svg')!.getBoundingClientRect()
    setTooltip({
      cell,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const action = (
    <div className="flex flex-wrap gap-1">
      {CRANE_OPTIONS.map(opt => (
        <button
          key={opt.id}
          onClick={() => dispatch(selectHeatmapCrane(opt.id))}
          className={`${PILL_BASE} ${selectedCrane === opt.id ? PILL_ACTIVE : PILL_INACTIVE}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )

  return (
    <Card
      title="MOVEMENT HEATMAP"
      accent="gold"
      action={action}
    >
      <p className="text-text-muted text-[10px] font-mono mb-3">
        Rail position frequency — darker = more time spent at this position
      </p>

      <div className="relative overflow-x-auto">
        <svg
          width={svgWidth}
          height={svgHeight}
          className="font-mono"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* X-axis position headers */}
          {POSITIONS.map((pos, i) => (
            <text
              key={pos}
              x={LABEL_W + i * CELL_W + CELL_W / 2}
              y={16}
              textAnchor="middle"
              fill="#6b738a"
              fontSize={9}
              fontFamily="monospace"
            >
              {pos / 1000}m
            </text>
          ))}

          {/* Rows per visible crane */}
          {visibleCranes.map((craneId, rowIdx) => {
            const rowY = HEADER_H + rowIdx * (CELL_H + 4)
            return (
              <g key={craneId}>
                {/* Crane label */}
                <text
                  x={LABEL_W - 8}
                  y={rowY + CELL_H / 2 + 4}
                  textAnchor="end"
                  fill="#e8eaf6"
                  fontSize={10}
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {craneId}
                </text>

                {/* Cells */}
                {POSITIONS.map((pos, colIdx) => {
                  const cell    = getCellData(craneId, pos)
                  const opacity = cell ? intensityToOpacity(cell.intensity) : 0.03
                  const cx      = LABEL_W + colIdx * CELL_W + 2

                  return (
                    <rect
                      key={pos}
                      x={cx}
                      y={rowY}
                      width={CELL_W - 4}
                      height={CELL_H}
                      rx={1}
                      fill="#4fc3f7"
                      fillOpacity={opacity}
                      stroke="#1f2433"
                      strokeWidth={1}
                      className="cursor-pointer"
                      onMouseEnter={cell ? (e) => handleMouseEnter(e, cell) : undefined}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  )
                })}
              </g>
            )
          })}

          {/* X-axis tank labels */}
          {POSITIONS.map((pos, i) => {
            const tankLabel = allCells.find(c => c.positionMm === pos)?.tankLabel ?? `T${i + 1}`
            return (
              <text
                key={`tank-${pos}`}
                x={LABEL_W + i * CELL_W + CELL_W / 2}
                y={svgHeight - 4}
                textAnchor="middle"
                fill="#6b738a"
                fontSize={9}
                fontFamily="monospace"
              >
                {tankLabel}
              </text>
            )
          })}

          {/* Color scale legend */}
          {(() => {
            const legendX = LABEL_W + POSITIONS.length * CELL_W + 12
            const legendY = HEADER_H + 8
            const steps   = [0.05, 0.25, 0.5, 0.75, 0.95]
            const stepH   = 14
            return (
              <>
                <text x={legendX} y={legendY - 4} fill="#6b738a" fontSize={8} fontFamily="monospace">Low</text>
                {steps.map((op, i) => (
                  <rect
                    key={op}
                    x={legendX}
                    y={legendY + i * stepH}
                    width={14}
                    height={stepH - 2}
                    fill="#4fc3f7"
                    fillOpacity={op}
                    rx={1}
                  />
                ))}
                <text x={legendX} y={legendY + steps.length * stepH + 10} fill="#6b738a" fontSize={8} fontFamily="monospace">High</text>
              </>
            )
          })()}
        </svg>

        {/* SVG Tooltip overlay */}
        {tooltip && (
          <div
            className="absolute z-10 bg-scada-panel border border-scada-border rounded-scada p-2 text-[10px] font-mono pointer-events-none"
            style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
          >
            <div className="text-text-primary font-bold mb-1">
              {tooltip.cell.craneId} at {(tooltip.cell.positionMm).toLocaleString()}mm ({tooltip.cell.tankLabel})
            </div>
            <div className="text-text-muted">
              Time spent: <span className="value-display text-accent-primary">{formatDwellTime(tooltip.cell.dwellHours)}</span>{' '}
              <span className="text-text-muted">{formatPct(tooltip.cell.dwellHours)}</span>
            </div>
            <div className="text-text-muted">
              Transfers: <span className="value-display text-text-primary">{tooltip.cell.transfers}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}


