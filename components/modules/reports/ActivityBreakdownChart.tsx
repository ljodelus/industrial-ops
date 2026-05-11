'use client'

// Client component — Recharts (client-only library) + useAppDispatch for crane selector

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectActivityBreakdown, selectChartCrane, selectSelectedChartCrane } from '@/store/slices/craneUtilizationSlice'
import { Card } from '@/components/ui'

const CRANE_OPTIONS = [
  { id: 'fleet',   label: 'Fleet Total' },
  { id: 'CRANE-1', label: 'CRANE-1'    },
  { id: 'CRANE-2', label: 'CRANE-2'    },
  { id: 'CRANE-3', label: 'CRANE-3'    },
  { id: 'CRANE-4', label: 'CRANE-4'    },
]

const PILL_BASE     = 'px-2.5 py-1 text-[10px] font-mono rounded-scada cursor-pointer transition-colors border'
const PILL_ACTIVE   = 'bg-accent-primary text-scada-bg border-accent-primary'
const PILL_INACTIVE = 'bg-transparent text-text-muted border-scada-border hover:text-text-primary'

interface CustomTooltipProps {
  active?:  boolean
  payload?: { name: string; value: number; color: string }[]
  label?:   string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const active_h  = payload.find(p => p.name === 'active')?.value  ?? 0
  const idle_h    = payload.find(p => p.name === 'idle')?.value    ?? 0
  const fault_h   = payload.find(p => p.name === 'fault')?.value   ?? 0
  const maint_h   = payload.find(p => p.name === 'maintenance')?.value ?? 0
  const total     = active_h + idle_h + fault_h + maint_h

  const pct = (v: number) => total > 0 ? `(${((v / total) * 100).toFixed(1)}%)` : '—'

  return (
    <div className="bg-scada-panel border border-scada-border p-2 rounded-scada text-[10px] font-mono min-w-45">
      <div className="text-text-primary mb-1.5 border-b border-scada-border pb-1">{label}, 2026</div>
      <div className="flex justify-between gap-3 text-accent-primary">
        <span>Active:</span>
        <span className="value-display">{active_h}h {pct(active_h)}</span>
      </div>
      <div className="flex justify-between gap-3 text-status-idle">
        <span>Idle:</span>
        <span className="value-display">{idle_h}h {pct(idle_h)}</span>
      </div>
      <div className="flex justify-between gap-3 text-status-alarm">
        <span>Fault:</span>
        <span className="value-display">{fault_h}h {pct(fault_h)}</span>
      </div>
      <div className="flex justify-between gap-3 text-text-muted">
        <span>Maintenance:</span>
        <span className="value-display">{maint_h}h {pct(maint_h)}</span>
      </div>
    </div>
  )
}

export function ActivityBreakdownChart() {
  const dispatch       = useAppDispatch()
  const allBreakdown   = useAppSelector(selectActivityBreakdown)
  const selectedCrane  = useAppSelector(selectSelectedChartCrane)

  const craneData = allBreakdown.find(d => d.craneId === selectedCrane)
  const chartData = craneData?.days ?? []

  const action = (
    <div className="flex flex-wrap gap-1">
      {CRANE_OPTIONS.map(opt => (
        <button
          key={opt.id}
          onClick={() => dispatch(selectChartCrane(opt.id))}
          className={`${PILL_BASE} ${selectedCrane === opt.id ? PILL_ACTIVE : PILL_INACTIVE}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )

  return (
    <Card title="DAILY ACTIVITY BREAKDOWN" accent="gold" action={action}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
            width={28}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="active"      name="active"      stackId="a" fill="#4fc3f7" maxBarSize={32} />
          <Bar dataKey="idle"        name="idle"        stackId="a" fill="#78909c" maxBarSize={32} />
          <Bar dataKey="fault"       name="fault"       stackId="a" fill="#ef5350" maxBarSize={32} />
          <Bar dataKey="maintenance" name="maintenance" stackId="a" fill="#1f2433" maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 mt-2 px-1">
        {[
          { color: 'bg-accent-primary', label: 'Active'      },
          { color: 'bg-status-idle',    label: 'Idle'        },
          { color: 'bg-status-alarm',   label: 'Fault'       },
          { color: 'bg-scada-border',   label: 'Maintenance' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-scada ${item.color} shrink-0`} />
            <span className="text-text-muted text-[10px] font-mono">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}


