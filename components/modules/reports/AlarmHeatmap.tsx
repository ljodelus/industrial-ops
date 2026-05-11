'use client'

// Client component — useState for hover tooltip; useAppSelector + useAppDispatch for data and severity toggle

import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  selectAlarmHeatmap,
  selectAlarmHeatmapSeverity,
  setHeatmapSeverity,
} from '@/store/slices/alarmReportSlice'
import type { AlarmHeatmapCell } from '@/types'
import { Card } from '@/components/ui'

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'total' | 'critical' | 'high' | 'medium' | 'low'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCount(cell: AlarmHeatmapCell, severity: Severity): number {
  if (severity === 'total')    return cell.total
  if (severity === 'critical') return cell.critical
  if (severity === 'high')     return cell.high
  if (severity === 'medium')   return cell.medium
  return cell.low
}

function getOpacity(count: number): number {
  if (count === 0) return 0
  if (count === 1) return 0.15
  if (count === 2) return 0.35
  if (count === 3) return 0.55
  if (count === 4) return 0.75
  return 1
}

// ─── Pill styles ──────────────────────────────────────────────────────────────

const PILL     = 'px-2.5 py-1 text-[10px] font-mono rounded-scada cursor-pointer transition-colors border'
const PILL_ON  = 'bg-accent-primary text-scada-bg border-accent-primary'
const PILL_OFF = 'bg-transparent text-text-muted border-scada-border hover:text-text-primary'

// ─── Cell hover tooltip ───────────────────────────────────────────────────────

interface TooltipState {
  cell: AlarmHeatmapCell
  x: number
  y: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AlarmHeatmap() {
  const dispatch  = useAppDispatch()
  const cells     = useAppSelector(selectAlarmHeatmap)
  const severity  = useAppSelector(selectAlarmHeatmapSeverity)

  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  // Build a lookup: [hour][day] → cell
  const cellMap: Record<string, AlarmHeatmapCell> = {}
  cells.forEach(c => { cellMap[`${c.hour}-${c.day}`] = c })

  const SEVERITIES: Severity[] = ['total', 'critical', 'high', 'medium', 'low']

  const toggle = (
    <div className="flex gap-1 flex-wrap">
      {SEVERITIES.map(sv => (
        <button
          key={sv}
          onClick={() => dispatch(setHeatmapSeverity(sv))}
          className={`${PILL} ${severity === sv ? PILL_ON : PILL_OFF}`}
        >
          {sv.charAt(0).toUpperCase() + sv.slice(1)}
        </button>
      ))}
    </div>
  )

  return (
    <Card
      title="ALARM FREQUENCY HEATMAP"
      accent="gold"
      action={toggle}
    >
      <p className="text-text-muted text-[10px] font-mono mb-3">
        Alarms by hour of day × day of week — darker = more alarms
      </p>

      <div className="relative overflow-x-auto">
        {/* Tooltip overlay */}
        {tooltip && (() => {
          const c = tooltip.cell
          const count = getCount(c, severity)
          if (count === 0) return null
          return (
            <div
              className="fixed z-50 bg-scada-panel border border-scada-border p-2 rounded-scada text-xs font-mono pointer-events-none shadow-lg"
              style={{ left: tooltip.x + 12, top: tooltip.y - 60 }}
            >
              <div className="text-text-primary">{DAYS[c.day]} {HOURS[c.hour]}</div>
              <div className="text-accent-primary">{count} alarm{count !== 1 ? 's' : ''} triggered</div>
              {c.total > 0 && (
                <div className="text-text-muted mt-0.5">
                  Crit: {c.critical} · High: {c.high} · Med: {c.medium} · Low: {c.low}
                </div>
              )}
            </div>
          )
        })()}

        {/* Grid */}
        <div className="inline-block min-w-full">
          {/* Header row — day names */}
          <div className="flex">
            {/* Hour label spacer */}
            <div className="w-10 shrink-0" />
            {DAYS.map(d => (
              <div
                key={d}
                className="flex-1 text-center text-[10px] font-mono text-text-muted pb-1"
                style={{ minWidth: 36 }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {HOURS.map((hr, hourIdx) => (
            <div key={hr} className="flex items-center" style={{ height: 18 }}>
              {/* Hour label */}
              <div className="w-10 shrink-0 text-[9px] font-mono text-text-muted text-right pr-2">
                {hr}
              </div>
              {/* Day cells */}
              {DAYS.map((_, dayIdx) => {
                const cell  = cellMap[`${hourIdx}-${dayIdx}`]
                const count = cell ? getCount(cell, severity) : 0
                return (
                  <div
                    key={dayIdx}
                    className="flex-1 h-full border border-scada-bg cursor-default"
                    style={{ minWidth: 36, position: 'relative' }}
                    onMouseEnter={e => {
                      if (cell) setTooltip({ cell, x: e.clientX, y: e.clientY })
                    }}
                    onMouseMove={e => {
                      if (cell) setTooltip({ cell, x: e.clientX, y: e.clientY })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: '#4fc3f7',
                        opacity: getOpacity(count),
                      }}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Color scale legend ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-scada-border">
        <span className="text-[9px] font-mono text-text-muted">0</span>
        {[0.15, 0.35, 0.55, 0.75, 1].map((op, i) => (
          <div
            key={i}
            className="w-8 h-3 rounded-scada"
            style={{ backgroundColor: '#4fc3f7', opacity: op }}
          />
        ))}
        <span className="text-[9px] font-mono text-text-muted">5+</span>
        <span className="text-[9px] font-mono text-text-muted ml-2">alarms</span>
      </div>
    </Card>
  )
}

