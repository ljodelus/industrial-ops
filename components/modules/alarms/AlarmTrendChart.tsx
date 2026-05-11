'use client'

// Client component — Recharts bar/line trend chart with toggles
// useState for chartType and stackBySeverity

import { useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import type { TrendDataPoint } from '@/lib/mock/alarms'

// Hex values matching globals.css theme tokens
const COLORS = {
  critical: '#ef5350',
  high:     '#ef5350',  // slightly transparent via opacity in the stacked variant
  medium:   '#ffa726',
  low:      '#e8a23a',
  info:     '#4fc3f7',
  grid:     '#1f2433',
  tick:     '#6b738a',
  panel:    '#1a1d2e',
  border:   '#1f2433',
}

interface ChartTooltipProps {
  active?:  boolean
  payload?: { name: string; value: number; fill: string }[]
  label?:   string
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0)
  return (
    <div className="bg-scada-panel border border-scada-border p-2 rounded-scada text-xs font-mono">
      <p className="text-text-primary mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.fill }} className="capitalize">
          {p.name}: {p.value}
        </p>
      ))}
      <p className="text-text-primary mt-1 border-t border-scada-border pt-1">Total: {total}</p>
    </div>
  )
}

const tickStyle  = { fill: COLORS.tick, fontSize: 10, fontFamily: 'monospace' }
const gridProps  = { stroke: COLORS.grid, strokeDasharray: '3 3' }

interface AlarmTrendChartProps {
  data: TrendDataPoint[]
}

export function AlarmTrendChart({ data }: AlarmTrendChartProps) {
  const [chartType,       setChartType]       = useState<'bar' | 'line'>('bar')
  const [stackBySeverity, setStackBySeverity] = useState(false)

  const typeBase    = 'px-3 py-1 text-xs font-mono uppercase rounded-scada border cursor-pointer transition-colors'
  const typeActive  = 'bg-accent-primary text-scada-bg border-accent-primary'
  const typeInactive = 'bg-scada-panel text-text-muted border-scada-border hover:text-text-primary'

  const chartAction = (
    <div className="flex items-center gap-2">
      {/* Bar / Line toggle */}
      <div className="flex gap-1">
        <button
          className={`${typeBase} ${chartType === 'bar'  ? typeActive : typeInactive}`}
          onClick={() => setChartType('bar')}
        >
          Bar
        </button>
        <button
          className={`${typeBase} ${chartType === 'line' ? typeActive : typeInactive}`}
          onClick={() => setChartType('line')}
        >
          Line
        </button>
      </div>

      {/* Stack by severity (bar only) */}
      {chartType === 'bar' && (
        <label className="flex items-center gap-1.5 text-text-muted text-xs font-mono cursor-pointer select-none">
          <input
            type="checkbox"
            checked={stackBySeverity}
            onChange={e => setStackBySeverity(e.target.checked)}
            className="accent-accent-primary"
          />
          Stack by severity
        </label>
      )}
    </div>
  )

  return (
    <Card title="ALARM TREND" accent="primary" action={chartAction}>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="date" tick={tickStyle} />
              <YAxis tick={tickStyle} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              {stackBySeverity ? (
                <>
                  <Legend
                    wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', paddingTop: 8 }}
                    formatter={v => <span style={{ color: COLORS.tick }}>{v}</span>}
                  />
                  <Bar dataKey="critical" fill={COLORS.critical} stackId="a" name="critical" />
                  <Bar dataKey="high"     fill={COLORS.high}     stackId="a" name="high"     opacity={0.7} />
                  <Bar dataKey="medium"   fill={COLORS.medium}   stackId="a" name="medium"   />
                  <Bar dataKey="low"      fill={COLORS.low}      stackId="a" name="low"      />
                  <Bar dataKey="info"     fill={COLORS.info}     stackId="a" name="info"     />
                </>
              ) : (
                <Bar dataKey="total" fill={COLORS.info} name="total" radius={[2, 2, 0, 0]} />
              )}
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="date" tick={tickStyle} />
              <YAxis tick={tickStyle} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke={COLORS.info}
                strokeWidth={2}
                dot={{ fill: COLORS.info, r: 3 }}
                activeDot={{ r: 5 }}
                name="total"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

