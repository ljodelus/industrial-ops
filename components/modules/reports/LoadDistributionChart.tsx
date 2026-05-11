'use client'

// Client component — Recharts (client-only) with custom cell colors + ReferenceArea

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceArea,
} from 'recharts'
import { useAppSelector } from '@/store/hooks'
import { selectLoadDistribution } from '@/store/slices/craneUtilizationSlice'
import { Card } from '@/components/ui'

const COLOR_MAP: Record<string, string> = {
  'status-idle':    '#78909c',
  'accent-primary': '#4fc3f7',
  'status-warning': '#ffa726',
  'status-alarm':   '#ef5350',
}

function getBarColor(range: string, color: string): string {
  // Reduce opacity for 100–300 range
  if (range === '100–200' || range === '200–300') return `${COLOR_MAP[color]}99`
  return COLOR_MAP[color] ?? '#4fc3f7'
}

interface CustomTooltipProps {
  active?:  boolean
  payload?: { value: number }[]
  label?:   string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const count = payload[0]?.value ?? 0
  const total = 1627
  const pct   = ((count / total) * 100).toFixed(1)
  return (
    <div className="bg-scada-panel border border-scada-border p-2 rounded-scada text-[10px] font-mono">
      <div className="text-text-muted mb-1">{label} kg</div>
      <div className="text-accent-primary">
        <span className="value-display">{count}</span> transfers
      </div>
      <div className="text-text-muted">
        <span className="value-display">{pct}%</span> of total
      </div>
    </div>
  )
}

export function LoadDistributionChart() {
  const data = useAppSelector(selectLoadDistribution)

  return (
    <Card title="LOAD DISTRIBUTION" accent="primary">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1f2433" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="range"
            tick={{ fill: '#6b738a', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b738a', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Optimal range shaded background — indexes 3,4,5 = 300–600 */}
          <ReferenceArea
            x1="300–400"
            x2="500–600"
            fill="#4fc3f7"
            fillOpacity={0.06}
            label={{
              value: 'OPTIMAL RANGE',
              fill: '#4fc3f7',
              fontSize: 9,
              fontFamily: 'monospace',
              position: 'insideTop',
            }}
          />

          <Bar dataKey="transfers" maxBarSize={24} radius={[1, 1, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.range}
                fill={getBarColor(entry.range, entry.color)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary stats below chart */}
      <div className="border-t border-scada-border mt-3 pt-3 flex flex-col gap-1.5 px-1">
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-xs font-mono">OVERWEIGHT TRANSFERS</span>
          <span className="value-display text-xs text-status-alarm">23 (2.0%)</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-xs font-mono">UNDERLOAD TRANSFERS</span>
          <span className="value-display text-xs text-text-primary">134 (11.5%)</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-muted text-xs font-mono">OPTIMAL TRANSFERS</span>
          <span className="value-display text-xs text-status-ok">1,040 (89.5%)</span>
        </div>
      </div>
    </Card>
  )
}

