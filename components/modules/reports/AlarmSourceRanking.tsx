'use client'

// Client component — uses useAppSelector, useAppDispatch; Recharts bar chart

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import {
  selectAlarmSources,
  selectAlarmSourceFilter,
  setSourceFilter,
} from '@/store/slices/alarmReportSlice'
import type { AlarmSourceType } from '@/types'
import { Card } from '@/components/ui'

// ─── Colors by source type (hex — Recharts SVG) ───────────────────────────────

const SOURCE_COLOR: Record<AlarmSourceType, string> = {
  crane:  '#4fc3f7',  // accent-primary
  plc:    '#e8a23a',  // accent-gold
  tank:   '#ffa726',  // status-warning
  zone:   '#78909c',  // status-idle
  system: '#6b738a',  // text-muted
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface BarPayloadItem {
  payload: {
    source: string; count: number; pct: number; type: AlarmSourceType
    critical: number; high: number; medium: number; low: number
  }
}
interface BarTooltipProps { active?: boolean; payload?: BarPayloadItem[] }

function SourceTooltip({ active, payload }: BarTooltipProps) {
  if (!active || !payload?.length) return null
  const s = payload[0].payload
  return (
    <div className="bg-scada-panel border border-scada-border p-2 rounded-scada text-xs font-mono min-w-42">
      <div className="text-text-primary font-bold">{s.source}</div>
      <div className="text-text-muted">{s.count} alarms · {s.pct}% of total</div>
      <div className="mt-1 grid grid-cols-2 gap-x-3">
        <span className="text-status-alarm">Critical: {s.critical}</span>
        <span className="text-status-warning">Medium: {s.medium}</span>
        <span style={{ color: 'rgba(239,83,80,0.65)' }}>High: {s.high}</span>
        <span className="text-accent-gold">Low: {s.low}</span>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AlarmSourceRanking() {
  const dispatch      = useAppDispatch()
  const sources       = useAppSelector(selectAlarmSources)
  const activeSource  = useAppSelector(selectAlarmSourceFilter)

  // Reversed for horizontal bar chart (bottom rank at top)
  // Pre-compute label string to avoid complex formatter type issues
  const chartData = [...sources].reverse().map(s => ({ ...s, barLabel: `${s.count} (${s.pct}%)` }))

  function handleSourceClick(source: string) {
    dispatch(setSourceFilter(activeSource === source ? 'all' : source))
  }

  return (
    <Card title="TOP ALARM SOURCES" accent="primary">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Left — Ranked list ─────────────────────────────────────────── */}
        <div className="lg:w-2/5 flex flex-col gap-1">
          {sources.map(src => {
            const isActive = activeSource === src.source || activeSource === 'all'
            const barWidth = `${src.pct}%`
            return (
              <div
                key={src.source}
                onClick={() => handleSourceClick(src.source)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-scada cursor-pointer transition-colors
                  ${activeSource === src.source ? 'bg-scada-panel' : 'hover:bg-scada-panel'}
                  ${isActive ? '' : 'opacity-50'}`}
              >
                {/* Rank */}
                <span className="text-accent-gold font-mono text-xs font-bold w-5 shrink-0">
                  #{src.rank}
                </span>
                {/* Source name */}
                <span className="text-text-primary font-mono text-sm w-20 shrink-0 truncate">
                  {src.source}
                </span>
                {/* Count */}
                <span className="text-accent-primary font-mono text-xs w-10 shrink-0 text-right">
                  {src.count}
                </span>
                {/* Mini bar */}
                <div className="flex-1 h-1.5 bg-scada-bg rounded-scada overflow-hidden">
                  <div
                    className="h-full bg-accent-primary rounded-scada"
                    style={{ width: barWidth }}
                  />
                </div>
                {/* Percentage */}
                <span className="text-text-muted text-xs font-mono w-10 shrink-0 text-right">
                  {src.pct}%
                </span>
              </div>
            )
          })}
        </div>

        {/* ── Right — Horizontal bar chart ──────────────────────────────── */}
        <div className="lg:w-3/5">
          <ResponsiveContainer width="100%" height={sources.length * 34 + 20}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 60, left: 60, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fill: '#6b738a', fontSize: 9, fontFamily: 'monospace' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="source"
                width={70}
                tick={{ fill: '#6b738a', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<SourceTooltip />} />
              <Bar dataKey="count" maxBarSize={18} radius={[0, 2, 2, 0]}>
                <LabelList
                  dataKey="barLabel"
                  position="right"
                  style={{ fill: '#6b738a', fontSize: 9, fontFamily: 'monospace' }}
                />
                {chartData.map(src => (
                  <Cell key={src.source} fill={SOURCE_COLOR[src.type]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Filter indicator ───────────────────────────────────────────────── */}
      {activeSource !== 'all' && (
        <div className="mt-3 flex items-center gap-2 border-t border-scada-border pt-2">
          <span className="text-text-muted text-xs font-mono">Filtered to:</span>
          <span className="text-accent-primary text-xs font-mono font-bold">{activeSource}</span>
          <button
            onClick={() => dispatch(setSourceFilter('all'))}
            className="text-text-muted text-xs font-mono hover:text-text-primary transition-colors underline"
          >
            Clear
          </button>
        </div>
      )}
    </Card>
  )
}



