'use client'

// Client component — Recharts BarChart is client-only

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { mockLineEfficiency, mockLineSummary } from '@/lib/mock/reports'
import { Card } from '@/components/ui'

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface PayloadEntry {
  name:    string
  value:   number
  color:   string
  payload: { metric: string; line1Label: string; line2Label: string }
}

interface CustomTooltipProps {
  active?:  boolean
  payload?: PayloadEntry[]
  label?:   string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const isCycleTime = label === 'Cycle Time %'
  return (
    <div className="bg-scada-panel border border-scada-border p-2 rounded-scada text-xs font-mono">
      <div className="text-text-primary mb-1">{label}</div>
      {payload.map(p => {
        const rawLabel = p.name === 'LINE-1' ? p.payload.line1Label : p.payload.line2Label
        const extra = isCycleTime
          ? ` (${rawLabel} of 60 min target)`
          : ''
        return (
          <div key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}%{extra}
          </div>
        )
      })}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LineEfficiencyChart() {
  return (
    <Card title="LINE EFFICIENCY" accent="primary">
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={mockLineEfficiency} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1f2433" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="metric"
            tick={{ fill: '#6b738a', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#6b738a', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            width={28}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: '#6b738a' }}
            iconType="circle"
          />
          <Bar dataKey="line1" name="LINE-1" fill="#4fc3f7" maxBarSize={22} />
          <Bar dataKey="line2" name="LINE-2" fill="#e8a23a" maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary table */}
      <div className="mt-3 border-t border-scada-border pt-3">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr>
              <th className="text-left text-text-muted pb-1 font-normal" />
              <th className="text-right text-accent-primary pb-1 font-medium">LINE-1</th>
              <th className="text-right text-accent-gold   pb-1 font-medium pl-4">LINE-2</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-scada-border">
            {[
              { label: 'UTILIZATION',       v1: mockLineSummary.line1.utilization,     v2: mockLineSummary.line2.utilization     },
              { label: 'ON-TIME RATE',       v1: mockLineSummary.line1.onTimeRate,       v2: mockLineSummary.line2.onTimeRate       },
              { label: 'AVG CYCLE TIME',     v1: mockLineSummary.line1.avgCycleTime,     v2: mockLineSummary.line2.avgCycleTime     },
              { label: 'BATCHES COMPLETED',  v1: mockLineSummary.line1.batchesCompleted, v2: mockLineSummary.line2.batchesCompleted },
              { label: 'BEST RECIPE',        v1: mockLineSummary.line1.bestRecipe,       v2: mockLineSummary.line2.bestRecipe       },
            ].map(row => (
              <tr key={row.label} className="hover:bg-scada-panel transition-colors">
                <td className="py-1 text-text-muted">{row.label}</td>
                <td className="py-1 text-text-primary text-right">{String(row.v1)}</td>
                <td className="py-1 text-text-primary text-right pl-4">{String(row.v2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

