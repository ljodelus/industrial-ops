'use client'

// Client component — movement history table with expandable sparkline rows
import { useState, Fragment } from 'react'
import type { CraneMovementRecord } from '@/types'
import { Badge } from '@/components/ui'
import { FileDown, ChevronRight, ChevronDown } from '@/lib/icons'
import { Button } from '@/components/ui'

interface Props {
  craneName: string
  movements: CraneMovementRecord[]
}

const RESULT_BADGE: Record<CraneMovementRecord['result'], 'ok' | 'alarm' | 'warning'> = {
  success: 'ok',
  fault:   'alarm',
  aborted: 'warning',
}

// Generate sparkline data points from a movement record (position at every 500ms)
function generateSparkline(record: CraneMovementRecord): number[] {
  const samples = Math.max(2, Math.round((record.durationSec / 0.5)))
  return Array.from({ length: samples }, (_, i) => {
    const t   = i / Math.max(1, samples - 1)
    return Math.round(record.from + (record.to - record.from) * t)
  })
}

// Render an inline SVG sparkline from position samples
function SparklineSVG({ points, from, to }: { points: number[]; from: number; to: number }) {
  const svgW = 220
  const svgH = 32
  const minP  = Math.min(from, to)
  const maxP  = Math.max(from, to)
  const range = maxP - minP || 1

  const coords = points.map((p, i) => ({
    x: (i / Math.max(1, points.length - 1)) * svgW,
    y: svgH - ((p - minP) / range) * (svgH - 6) - 3,
  }))

  const d = coords
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={svgW}
      height={svgH}
      className="block"
      aria-label="Position sparkline"
    >
      <path
        d={d}
        fill="none"
        stroke="var(--color-accent-primary)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Start and end dots */}
      <circle cx={coords[0].x} cy={coords[0].y} r={2} fill="var(--color-accent-primary)" />
      <circle
        cx={coords[coords.length - 1].x}
        cy={coords[coords.length - 1].y}
        r={2}
        fill="var(--color-accent-primary)"
      />
    </svg>
  )
}

// Export movement history as CSV
function exportCSV(craneName: string, movements: CraneMovementRecord[]) {
  const header  = 'TIMESTAMP,FROM (mm),TO (mm),DISTANCE (mm),DURATION (s),SPEED (m/min),JOB ID,RESULT\n'
  const rows    = movements
    .map(m =>
      `${m.timestamp},${m.from},${m.to},${m.distance},${m.durationSec},${m.speedMpm},${m.jobId ?? ''},${m.result}`
    )
    .join('\n')

  const blob = new Blob([header + rows], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `movement-history-${craneName.toLowerCase()}-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function CraneMovementTable({ craneName, movements }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-2 border-b border-scada-border">
        <p className="text-text-muted text-xs font-mono">
          Showing last {movements.length} movements for {craneName}
        </p>
        <Button
          variant="ghost"
          size="sm"
          icon={<FileDown size={14} />}
          onClick={() => exportCSV(craneName, movements)}
        >
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-scada-panel border-b border-scada-border">
              {['', 'TIMESTAMP', 'FROM', 'TO', 'DISTANCE', 'DURATION', 'SPEED', 'JOB', 'RESULT'].map(h => (
                <th
                  key={h}
                  className="px-3 py-2.5 text-left text-text-muted font-mono uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-text-muted font-mono text-xs">
                  No movement records for this crane.
                </td>
              </tr>
            )}
            {movements.map((mv, i) => {
              const isExpanded    = expandedId === mv.id
              const isFaultRow    = mv.result !== 'success'
              const sparklineData = isExpanded ? generateSparkline(mv) : []

              return (
                <Fragment key={mv.id}>
                  <tr
                    key={mv.id}
                    onClick={() => toggleRow(mv.id)}
                    className={[
                      'cursor-pointer transition-colors border-l-2',
                      isFaultRow
                        ? 'bg-status-alarm/5 border-l-status-alarm/30'
                        : i % 2 === 0
                          ? 'bg-scada-bg border-l-transparent'
                          : 'bg-scada-surface border-l-transparent',
                      'hover:bg-scada-panel hover:border-l-accent-primary',
                    ].join(' ')}
                  >
                    {/* Expand chevron */}
                    <td className="px-3 py-2.5 text-text-muted w-6">
                      {isExpanded
                        ? <ChevronDown size={12} />
                        : <ChevronRight size={12} />
                      }
                    </td>
                    <td className="px-3 py-2.5 font-mono text-text-muted">
                      {mv.timestamp}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="value-display text-text-value">{mv.from.toLocaleString()} mm</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="value-display text-text-value">{mv.to.toLocaleString()} mm</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="value-display text-text-value">{mv.distance.toLocaleString()} mm</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="value-display text-text-value">{mv.durationSec.toFixed(1)} s</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="value-display text-text-value">{mv.speedMpm} m/min</span>
                    </td>
                    <td className="px-3 py-2.5">
                      {mv.jobId ? (
                        <span className="text-accent-gold font-mono">{mv.jobId}</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={RESULT_BADGE[mv.result]} label={mv.result} />
                    </td>
                  </tr>

                  {/* Expanded sparkline row */}
                  {isExpanded && (
                    <tr
                      key={`${mv.id}-expanded`}
                      className={isFaultRow ? 'bg-status-alarm/5' : 'bg-scada-panel'}
                    >
                      <td colSpan={9} className="px-6 py-3">
                        <div className="flex items-start gap-6">
                          <div>
                            <p className="text-text-muted text-xs font-mono uppercase mb-2">
                              Position Trace (500ms intervals)
                            </p>
                            <SparklineSVG
                              points={sparklineData}
                              from={mv.from}
                              to={mv.to}
                            />
                            <div className="flex justify-between mt-1">
                              <span className="value-display text-text-muted text-xs">{mv.from.toLocaleString()} mm</span>
                              <span className="value-display text-text-muted text-xs">{mv.to.toLocaleString()} mm</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 text-xs font-mono">
                            <span className="text-text-muted">SAMPLES: <span className="text-text-value">{sparklineData.length}</span></span>
                            <span className="text-text-muted">DELTA: <span className="text-text-value">{mv.distance.toLocaleString()} mm</span></span>
                            <span className="text-text-muted">AVG SPEED: <span className="text-text-value">{mv.speedMpm} m/min</span></span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}




