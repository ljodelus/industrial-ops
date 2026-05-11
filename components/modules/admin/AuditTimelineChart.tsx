'use client'
// Client component — stacked area chart showing 7-day activity timeline using Recharts

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { Card } from '@/components/ui'
import { auditTimelineData } from '@/lib/mock/audit'

// Hex values from globals.css theme
const COLORS = {
  auth:     '#4fc3f7',  // accent-primary
  alarm:    '#ffa726',  // status-warning
  config:   '#ef5350',  // status-alarm
  recipe:   '#e8a23a',  // accent-gold
  security: '#ef5350',  // status-alarm (higher opacity)
  other:    '#78909c',  // status-idle
}

interface CustomTooltipProps {
  active?:  boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?:   string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0)
  return (
    <div className="bg-scada-panel border border-scada-border rounded-scada px-4 py-3 text-xs font-mono">
      <p className="text-text-value font-bold mb-2">{label}, 2026 — {total} events</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="capitalize">
          {p.name.charAt(0).toUpperCase() + p.name.slice(1)}: {p.value}
        </p>
      ))}
    </div>
  )
}

export function AuditTimelineChart() {
  return (
    <Card title="ACTIVITY TIMELINE" accent="primary">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={auditTimelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2433" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b738a', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#1f2433' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b738a', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#1f2433' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: '#6b738a', paddingTop: 8 }}
          />

          <ReferenceLine
            x="May 09"
            stroke="#e8a23a"
            strokeDasharray="4 2"
            label={{ value: 'PEAK — 57 events', position: 'insideTopRight', fill: '#e8a23a', fontSize: 9, fontFamily: 'monospace' }}
          />

          <Area type="monotone" dataKey="auth"     name="Authentication" stackId="1" stroke={COLORS.auth}     fill={COLORS.auth}     fillOpacity={0.3} />
          <Area type="monotone" dataKey="alarm"    name="Alarm Actions"  stackId="1" stroke={COLORS.alarm}    fill={COLORS.alarm}    fillOpacity={0.3} />
          <Area type="monotone" dataKey="config"   name="Configuration"  stackId="1" stroke={COLORS.config}   fill={COLORS.config}   fillOpacity={0.3} />
          <Area type="monotone" dataKey="recipe"   name="Recipe / Job"   stackId="1" stroke={COLORS.recipe}   fill={COLORS.recipe}   fillOpacity={0.3} />
          <Area type="monotone" dataKey="security" name="Security"       stackId="1" stroke={COLORS.security} fill={COLORS.security} fillOpacity={0.6} />
          <Area type="monotone" dataKey="other"    name="Other"          stackId="1" stroke={COLORS.other}    fill={COLORS.other}    fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}

