'use client'

// Client component — Recharts is a client-only library; uses useState for chart type and line toggles

import { useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useAppSelector } from '@/store/hooks'
import { selectDailyVolume } from '@/store/slices/productionReportSlice'
import { Card } from '@/components/ui'

type LineToggle  = 'all' | 'LINE-1' | 'LINE-2'
type ChartType   = 'bar' | 'line'

interface CustomTooltipProps {
  active?:  boolean
  payload?: { name: string; value: number; color: string }[]
  label?:   string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const line1 = payload.find(p => p.name === 'LINE-1')?.value ?? 0
  const line2 = payload.find(p => p.name === 'LINE-2')?.value ?? 0
  return (
    <div className="bg-scada-panel border border-scada-border p-2 rounded-scada text-xs font-mono">
      <div className="text-text-primary mb-1">{label}, 2026</div>
      <div className="text-accent-primary">LINE-1: {line1} batches</div>
      <div className="text-accent-gold">LINE-2:  {line2} batches</div>
      <div className="text-text-muted border-t border-scada-border mt-1 pt-1">
        Total:&nbsp;&nbsp;{line1 + line2} batches
      </div>
    </div>
  )
}

const PILL_BASE    = 'px-3 py-1 text-xs font-mono rounded-scada cursor-pointer transition-colors border'
const PILL_ACTIVE  = 'bg-accent-primary text-scada-bg border-accent-primary'
const PILL_INACTIVE = 'bg-transparent text-text-muted border-scada-border hover:text-text-primary'

export function ProductionVolumeChart() {
  const data = useAppSelector(selectDailyVolume)
  const [lineToggle, setLineToggle]   = useState<LineToggle>('all')
  const [chartType,  setChartType]    = useState<ChartType>('bar')

  const showLine1 = lineToggle === 'all' || lineToggle === 'LINE-1'
  const showLine2 = lineToggle === 'all' || lineToggle === 'LINE-2'

  const action = (
    <div className="flex items-center gap-3">
      {/* Line selector */}
      <div className="flex gap-1">
        {(['all', 'LINE-1', 'LINE-2'] as LineToggle[]).map(t => (
          <button
            key={t}
            onClick={() => setLineToggle(t)}
            className={`${PILL_BASE} ${lineToggle === t ? PILL_ACTIVE : PILL_INACTIVE}`}
          >
            {t === 'all' ? 'All Lines' : t}
          </button>
        ))}
      </div>
      {/* Chart type toggle */}
      <div className="flex gap-1">
        {(['bar', 'line'] as ChartType[]).map(t => (
          <button
            key={t}
            onClick={() => setChartType(t)}
            className={`${PILL_BASE} ${chartType === t ? PILL_ACTIVE : PILL_INACTIVE}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Card title="DAILY PRODUCTION VOLUME" accent="primary" action={action}>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
          <Legend
            wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', color: '#6b738a' }}
            iconType="circle"
          />
          <ReferenceLine
            y={15}
            stroke="#e8a23a"
            strokeDasharray="4 4"
            label={{ value: 'TARGET: 15', fill: '#6b738a', fontSize: 10, fontFamily: 'monospace', position: 'right' }}
          />

          {chartType === 'bar' ? (
            <>
              {showLine1 && <Bar dataKey="line1" name="LINE-1" fill="#4fc3f7" maxBarSize={18} />}
              {showLine2 && <Bar dataKey="line2" name="LINE-2" fill="#e8a23a" maxBarSize={18} />}
            </>
          ) : (
            <>
              {showLine1 && (
                <Line
                  type="monotone"
                  dataKey="line1"
                  name="LINE-1"
                  stroke="#4fc3f7"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#4fc3f7' }}
                  activeDot={{ r: 5 }}
                />
              )}
              {showLine2 && (
                <Line
                  type="monotone"
                  dataKey="line2"
                  name="LINE-2"
                  stroke="#e8a23a"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#e8a23a' }}
                  activeDot={{ r: 5 }}
                />
              )}
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  )
}

