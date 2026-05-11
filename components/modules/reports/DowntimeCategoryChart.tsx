'use client'

// Client component — Recharts is a client-only library

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList, Cell,
} from 'recharts'
import { useAppSelector } from '@/store/hooks'
import { selectDowntimeCategories } from '@/store/slices/downtimeReportSlice'
import { Card } from '@/components/ui'

// ─── Category color map ───────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  'Planned maint.': '#78909c',               // status-idle
  'Motion fault':   '#ef5350',               // status-alarm
  'Communication':  'rgba(239,83,80,0.55)',  // status-alarm dimmed
  'Process fault':  '#ffa726',               // status-warning
  'Sensor fault':   '#e8a23a',               // accent-gold
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?:  boolean
  payload?: { value: number; payload: { category: string } }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-scada-panel border border-scada-border p-2 rounded-scada text-xs font-mono">
      <div className="text-text-primary">{item.payload.category}</div>
      <div className="text-text-value">{item.value} min</div>
    </div>
  )
}

// ─── Custom bar label ─────────────────────────────────────────────────────────

interface LabelProps {
  x?:     number
  y?:     number
  width?: number
  value?: number
}

function BarLabel({ x = 0, y = 0, width = 0, value = 0 }: LabelProps) {
  return (
    <text
      x={x + width + 6}
      y={y + 10}
      fill="#6b738a"
      fontSize={10}
      fontFamily="monospace"
    >
      {value} min
    </text>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DowntimeCategoryChart() {
  const categories = useAppSelector(selectDowntimeCategories)

  return (
    <Card title="BY CATEGORY" accent="gold">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={categories}
          layout="vertical"
          margin={{ top: 4, right: 72, left: 8, bottom: 4 }}
        >
          <CartesianGrid stroke="#1f2433" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#6b738a', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            unit=" m"
          />
          <YAxis
            type="category"
            dataKey="category"
            width={100}
            tick={{ fill: '#6b738a', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="totalMinutes" maxBarSize={18} radius={[0, 2, 2, 0]}>
            <LabelList content={<BarLabel />} />
            {categories.map(entry => (
              <Cell
                key={entry.category}
                fill={CATEGORY_COLORS[entry.category] ?? '#6b738a'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* ── Stats table ───────────────────────────────────────────────────── */}
      <div className="mt-2 border-t border-scada-border pt-2">
        <div className="grid grid-cols-4 gap-1 pb-1 border-b border-scada-border mb-1">
          <span className="text-text-muted text-[10px] font-mono uppercase">CATEGORY</span>
          <span className="text-text-muted text-[10px] font-mono uppercase text-right">EVENTS</span>
          <span className="text-text-muted text-[10px] font-mono uppercase text-right">TOTAL</span>
          <span className="text-text-muted text-[10px] font-mono uppercase text-right">AVG/EVENT</span>
        </div>
        {categories.map(cat => (
          <div key={cat.category} className="grid grid-cols-4 gap-1 py-0.5">
            <span className="text-text-muted text-xs font-mono truncate">{cat.category}</span>
            <span className="text-text-primary text-xs text-right font-mono">{cat.events}</span>
            <span className="text-text-primary text-xs text-right font-mono">{cat.totalMinutes} min</span>
            <span className="text-text-primary text-xs text-right font-mono">{cat.avgMinutes.toFixed(1)} min</span>
          </div>
        ))}
      </div>
    </Card>
  )
}



