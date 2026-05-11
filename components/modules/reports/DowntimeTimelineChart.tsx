'use client'

// Client component — Recharts is a client-only library

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useAppSelector } from '@/store/hooks'
import { selectDowntimeTimeline } from '@/store/slices/downtimeReportSlice'
import { Card } from '@/components/ui'

// ─── Chart colors (hex — Recharts cannot use Tailwind classes in SVG fill) ────

const COLORS = {
  motion:        '#ef5350',               // status-alarm
  communication: 'rgba(239,83,80,0.55)',  // status-alarm dimmed
  planned:       '#78909c',               // status-idle
  process:       '#ffa726',               // status-warning
  sensor:        '#e8a23a',               // accent-gold
} as const

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name:  string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?:  boolean
  payload?: TooltipPayloadItem[]
  label?:   string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const motion        = payload.find(p => p.name === 'Motion fault')?.value       ?? 0
  const communication = payload.find(p => p.name === 'Communication')?.value      ?? 0
  const planned       = payload.find(p => p.name === 'Planned maint.')?.value     ?? 0
  const process       = payload.find(p => p.name === 'Process fault')?.value      ?? 0
  const sensor        = payload.find(p => p.name === 'Sensor fault')?.value       ?? 0
  const total         = motion + communication + planned + process + sensor

  return (
    <div className="bg-scada-panel border border-scada-border p-2 rounded-scada text-xs font-mono min-w-45">
      <div className="text-text-primary mb-1">{label}, 2026 — Total: {total} min</div>
      {motion        > 0 && <div className="text-status-alarm">Motion fault:&nbsp;&nbsp;&nbsp;&nbsp;{motion} min</div>}
      {communication > 0 && <div style={{ color: COLORS.communication }}>Communication:&nbsp;&nbsp;{communication} min</div>}
      {planned       > 0 && <div className="text-status-idle">Planned maint.:&nbsp;{planned} min</div>}
      {process       > 0 && <div className="text-status-warning">Process fault:&nbsp;&nbsp;&nbsp;{process} min</div>}
      {sensor        > 0 && <div className="text-accent-gold">Sensor fault:&nbsp;&nbsp;&nbsp;&nbsp;{sensor} min</div>}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DowntimeTimelineChart() {
  const data = useAppSelector(selectDowntimeTimeline)

  return (
    <Card title="DOWNTIME TIMELINE" accent="alarm">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 40, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1f2433" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b738a', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b738a', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            width={32}
            unit=" m"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: '#6b738a' }}
            iconType="square"
          />
          <ReferenceLine
            y={30}
            stroke="#e8a23a"
            strokeDasharray="4 4"
            label={{
              value: 'TARGET: 30 min',
              fill: '#6b738a',
              fontSize: 10,
              fontFamily: 'monospace',
              position: 'right',
            }}
          />
          <Bar dataKey="motion"        name="Motion fault"    stackId="a" fill={COLORS.motion}        maxBarSize={32} />
          <Bar dataKey="communication" name="Communication"   stackId="a" fill={COLORS.communication} maxBarSize={32} />
          <Bar dataKey="planned"       name="Planned maint."  stackId="a" fill={COLORS.planned}       maxBarSize={32} />
          <Bar dataKey="process"       name="Process fault"   stackId="a" fill={COLORS.process}       maxBarSize={32} />
          <Bar dataKey="sensor"        name="Sensor fault"    stackId="a" fill={COLORS.sensor}        maxBarSize={32} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}


