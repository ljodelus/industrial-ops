'use client'

// Client component — Recharts is client-only; useState for Daily/Hourly toggle (UI-only state)

import { useState } from 'react'
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useAppSelector } from '@/store/hooks'
import { selectAlarmFrequencyDaily, selectAlarmFrequencyHourly } from '@/store/slices/alarmReportSlice'
import { Card } from '@/components/ui'

// ─── Colors (hex — Recharts SVG cannot use Tailwind classes) ──────────────────

const COLORS = {
  critical: '#ef5350',              // status-alarm
  high:     'rgba(239,83,80,0.65)', // status-alarm dimmed
  medium:   '#ffa726',              // status-warning
  low:      '#e8a23a',              // accent-gold
  area:     '#4fc3f7',              // accent-primary
} as const

// ─── Pill styles ──────────────────────────────────────────────────────────────

const PILL       = 'px-2.5 py-1 text-[10px] font-mono rounded-scada cursor-pointer transition-colors border'
const PILL_ON    = 'bg-accent-primary text-scada-bg border-accent-primary'
const PILL_OFF   = 'bg-transparent text-text-muted border-scada-border hover:text-text-primary'

// ─── Custom tooltips ──────────────────────────────────────────────────────────

interface DailyPayloadItem { name: string; value: number; color: string }
interface DailyTooltipProps { active?: boolean; payload?: DailyPayloadItem[]; label?: string }

function DailyTooltip({ active, payload, label }: DailyTooltipProps) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0)
  return (
    <div className="bg-scada-panel border border-scada-border p-2 rounded-scada text-xs font-mono min-w-36">
      <div className="text-text-primary mb-1">{label}, 2026</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name.padEnd(10)}: {p.value}
        </div>
      ))}
      <div className="text-text-muted border-t border-scada-border mt-1 pt-1">Total: {total}</div>
    </div>
  )
}

interface HourlyPayloadItem { value: number }
interface HourlyTooltipProps { active?: boolean; payload?: HourlyPayloadItem[]; label?: string }

function HourlyTooltip({ active, payload, label }: HourlyTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-scada-panel border border-scada-border p-2 rounded-scada text-xs font-mono">
      <div className="text-text-primary">{label}</div>
      <div className="text-accent-primary">{payload[0].value} alarms</div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AlarmFrequencyChart() {
  // Local state — view toggle is UI-only (which chart to display)
  const [view, setView] = useState<'daily' | 'hourly'>('daily')

  const dailyData  = useAppSelector(selectAlarmFrequencyDaily)
  const hourlyData = useAppSelector(selectAlarmFrequencyHourly)

  const toggle = (
    <div className="flex gap-1">
      <button className={`${PILL} ${view === 'daily'  ? PILL_ON : PILL_OFF}`} onClick={() => setView('daily')}>Daily</button>
      <button className={`${PILL} ${view === 'hourly' ? PILL_ON : PILL_OFF}`} onClick={() => setView('hourly')}>Hourly</button>
    </div>
  )

  return (
    <Card title="ALARM FREQUENCY BY SEVERITY" accent="alarm" action={toggle}>
      <ResponsiveContainer width="100%" height={220}>
        {view === 'daily' ? (
          <LineChart data={dailyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#1f2433" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b738a', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b738a', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false} tickLine={false} width={24}
            />
            <Tooltip content={<DailyTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: '#6b738a' }} />
            <Line dataKey="critical" name="Critical" stroke={COLORS.critical} strokeWidth={2} dot={false} />
            <Line dataKey="high"     name="High"     stroke={COLORS.high}     strokeWidth={1} strokeDasharray="4 2" dot={false} />
            <Line dataKey="medium"   name="Medium"   stroke={COLORS.medium}   strokeWidth={1} dot={false} />
            <Line dataKey="low"      name="Low"      stroke={COLORS.low}      strokeWidth={1} dot={false} />
          </LineChart>
        ) : (
          <AreaChart data={hourlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={COLORS.area} stopOpacity={0.2} />
                <stop offset="95%" stopColor={COLORS.area} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1f2433" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fill: '#6b738a', fontSize: 9, fontFamily: 'monospace' }}
              axisLine={false} tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fill: '#6b738a', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false} tickLine={false} width={24}
            />
            <Tooltip content={<HourlyTooltip />} />
            {/* Peak hours reference lines */}
            <ReferenceLine x="07:00" stroke="#ffa726" strokeDasharray="3 3"
              label={{ value: 'PEAK', fill: '#ffa726', fontSize: 9, fontFamily: 'monospace', position: 'top' }}
            />
            <ReferenceLine x="09:00" stroke="#ffa726" strokeDasharray="3 3" />
            <Area
              dataKey="count"
              name="Alarms"
              stroke={COLORS.area}
              fill="url(#areaGrad)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </Card>
  )
}

