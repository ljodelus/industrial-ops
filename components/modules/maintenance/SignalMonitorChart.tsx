'use client'

// Client component — rolling 60-second waveform chart using Recharts
// Requires: useState, useEffect (rolling data), useRef (chart data)

import { useState, useEffect, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Button, EmptyState } from '@/components/ui'
import { Activity, X, Download } from '@/lib/icons'
import type { IOSignal, MonitorDataPoint } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_POINTS = 60

// Chart line colors (hex — Recharts doesn't support CSS variables)
const CHART_COLORS = [
  '#4fc3f7',   // accent-primary
  '#e8a23a',   // accent-gold
  '#00e676',   // status-ok
  '#ffa726',   // status-warning
  '#ef5350',   // status-alarm
  '#78909c',   // status-idle
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface SignalMonitorChartProps {
  monitoredAddresses: string[]
  signals:            IOSignal[]
  onRemove:           (address: string) => void
  onClearAll:         () => void
}

type SeriesData = Record<string, MonitorDataPoint[]>

// ─── Component ────────────────────────────────────────────────────────────────

export function SignalMonitorChart({ monitoredAddresses, signals, onRemove, onClearAll }: SignalMonitorChartProps) {
  const [seriesData, setSeriesData] = useState<SeriesData>({})

  // Get monitored signal objects
  const monitored = monitoredAddresses
    .map(addr => signals.find(s => s.address === addr))
    .filter((s): s is IOSignal => s !== undefined)

  // Rolling update: append one data point per second per monitored signal
  useEffect(() => {
    if (monitored.length === 0) return

    const id = setInterval(() => {
      setSeriesData(prev => {
        const next = { ...prev }
        for (const sig of monitored) {
          const existing = next[sig.address] ?? []
          const rawValue  = sig.value ?? (sig.status === 'HIGH' ? 1 : 0)
          const newPoint: MonitorDataPoint = { second: existing.length, value: rawValue }
          const updated   = [...existing, newPoint].slice(-MAX_POINTS)
          next[sig.address] = updated
        }
        return next
      })
    }, 1000)

    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredAddresses.join(','), signals])

  // Initialize data for newly added signals
  useEffect(() => {
    setSeriesData(prev => {
      const next = { ...prev }
      for (const sig of monitored) {
        if (!next[sig.address]) next[sig.address] = []
      }
      // Remove de-monitored signals
      for (const key of Object.keys(next)) {
        if (!monitoredAddresses.includes(key)) delete next[key]
      }
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredAddresses.join(',')])

  // Merge series into chart data array (aligned by index)
  const chartData = (() => {
    let maxLen = 0
    for (const addr of monitoredAddresses) {
      maxLen = Math.max(maxLen, (seriesData[addr] ?? []).length)
    }
    return Array.from({ length: maxLen }, (_, i) => {
      const pt: Record<string, number> = { t: i }
      for (const addr of monitoredAddresses) {
        const pts = seriesData[addr] ?? []
        if (pts[i] !== undefined) pt[addr] = pts[i].value
      }
      return pt
    })
  })()

  const handleExport = useCallback(() => {
    const header = ['second', ...monitoredAddresses].join(',')
    const rows   = chartData.map(row =>
      [row.t, ...monitoredAddresses.map(a => row[a] ?? '')].join(',')
    )
    const csv    = [header, ...rows].join('\n')
    const blob   = new Blob([csv], { type: 'text/csv' })
    const url    = URL.createObjectURL(blob)
    const a      = document.createElement('a')
    a.href       = url
    a.download   = `io-monitor-${new Date().toISOString().slice(0, 16)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [chartData, monitoredAddresses])

  if (monitored.length === 0) {
    return (
      <EmptyState
        icon={<Activity size={40} />}
        message='Click [Monitor] on any signal to add it to the waveform chart.'
      />
    )
  }

  return (
    <div className="space-y-3">
      {/* Monitored signal legend + controls */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {monitored.map((sig, idx) => (
            <div
              key={sig.address}
              className="flex items-center gap-1.5 bg-scada-bg border border-scada-border rounded-scada px-2 py-1"
            >
              {/* Color swatch */}
              <span
                className="inline-block w-4 h-0.5 shrink-0"
                style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
              />
              <span className="text-text-primary font-mono text-[10px] truncate max-w-[140px]">
                {sig.name}
              </span>
              <button
                type="button"
                onClick={() => onRemove(sig.address)}
                className="text-text-muted hover:text-text-primary ml-0.5"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClearAll}>Clear All</Button>
          <Button variant="ghost" size="sm" icon={<Download size={12} />} onClick={handleExport}>Export</Button>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-scada-bg border border-scada-border rounded-scada p-2">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="t"
              hide
              domain={[0, MAX_POINTS]}
            />
            <YAxis
              tick={{ fill: '#6b738a', fontSize: 9, fontFamily: 'monospace' }}
              width={36}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1d2e',
                border: '1px solid #1f2433',
                borderRadius: '2px',
                fontSize: '10px',
                fontFamily: 'monospace',
              }}
              labelStyle={{ color: '#6b738a' }}
              formatter={(value: unknown, name: unknown) => {
                const sig = signals.find(s => s.address === name)
                return [`${value}${sig?.unit ? ` ${sig.unit}` : ''}`, sig?.name ?? String(name)]
              }}
            />
            {monitored.map((sig, idx) => {
              const isDigital = sig.type === 'DI' || sig.type === 'DO'
              return (
                <Line
                  key={sig.address}
                  type={isDigital ? 'stepAfter' : 'monotone'}
                  dataKey={sig.address}
                  stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Current values row */}
      <div className="flex flex-wrap gap-4 border-t border-scada-border pt-2">
        {monitored.map(sig => {
          const val = sig.value ?? (sig.status === 'HIGH' ? 1 : 0)
          return (
            <div key={sig.address} className="flex flex-col">
              <span className="text-text-muted text-[10px] uppercase font-mono truncate max-w-[140px]">
                {sig.name.replace(/_/g, ' ')}
              </span>
              <span className="value-display text-xs text-text-value">
                {typeof val === 'number'
                  ? sig.type === 'AI' || sig.type === 'AO'
                    ? `${val.toFixed(1)} ${sig.unit ?? ''}`
                    : val === 1 ? 'HIGH' : 'LOW'
                  : String(val)
                }
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

