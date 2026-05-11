'use client'

// Client component — Recharts is client-only

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useAppSelector } from '@/store/hooks'
import { selectResponseBuckets, selectResponseStats } from '@/store/slices/alarmReportSlice'
import { Card } from '@/components/ui'

// ─── Colors (hex — Recharts SVG cannot use Tailwind classes) ──────────────────

const COLOR_MAP: Record<string, string> = {
  ok:      '#00e676',   // status-ok
  primary: '#4fc3f7',   // accent-primary (target range)
  gold:    '#e8a23a',   // accent-gold
  warning: '#ffa726',   // status-warning
  alarm:   '#ef5350',   // status-alarm
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadItem { name: string; value: number; payload: { label: string; count: number; colorKey: string } }
interface CustomTooltipProps { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const { label, count } = payload[0].payload
  const total = 48 // total alarms in period
  return (
    <div className="bg-scada-panel border border-scada-border p-2 rounded-scada text-xs font-mono">
      <div className="text-text-primary">{label}</div>
      <div className="text-accent-primary">{count} alarms ({((count / total) * 100).toFixed(1)}%)</div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ResponseTimeChart() {
  const buckets = useAppSelector(selectResponseBuckets)
  const stats   = useAppSelector(selectResponseStats)

  const withinPct = stats.withinTargetPct
  const targetColor = withinPct >= 80
    ? 'text-status-ok'
    : withinPct >= 60
      ? 'text-status-warning'
      : 'text-status-alarm'

  return (
    <Card title="RESPONSE TIME DISTRIBUTION" accent="gold">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={buckets} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1f2433" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#6b738a', fontSize: 9, fontFamily: 'monospace' }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b738a', fontSize: 10, fontFamily: 'monospace' }}
            axisLine={false} tickLine={false} width={24}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" name="Alarms" maxBarSize={40} radius={[2, 2, 0, 0]}>
            {buckets.map(b => (
              <Cell key={b.label} fill={COLOR_MAP[b.colorKey]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* ── Response stats row ───────────────────────────────────────────── */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-scada-border pt-3">
        <div className="flex justify-between gap-2">
          <span className="text-text-muted text-xs font-mono">FASTEST ACK</span>
          <span className="value-display text-xs text-text-primary">{stats.fastestAck}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-text-muted text-xs font-mono">SLOWEST ACK</span>
          <span className="value-display text-xs text-text-primary">{stats.slowestAck}</span>
        </div>
        <div className="col-span-2 text-[10px] text-text-muted font-mono truncate">
          Fastest: {stats.fastestBy}
        </div>
        <div className="col-span-2 text-[10px] text-text-muted font-mono truncate">
          Slowest: {stats.slowestBy}
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-text-muted text-xs font-mono">MEDIAN</span>
          <span className="value-display text-xs text-text-primary">{stats.median}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-text-muted text-xs font-mono">WITHIN TARGET</span>
          <span className={`value-display text-xs font-bold ${targetColor}`}>
            {stats.withinTargetPct.toFixed(1)}%
          </span>
        </div>
        <div className="col-span-2 text-[10px] text-text-muted font-mono">
          TARGET = acknowledged within 5 min
        </div>
      </div>
    </Card>
  )
}

