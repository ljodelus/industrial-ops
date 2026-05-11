'use client'

// Client component — uses Recharts (client-only library)

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { LatencyPoint } from '@/types'

interface LatencyChartProps {
  data: LatencyPoint[]
}

export function LatencyChart({ data }: LatencyChartProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-muted text-[10px] font-mono uppercase">Latency — Last 60s</span>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-0.5 bg-accent-primary" />
            <span className="text-accent-primary">PLC LINE-1</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-0.5 bg-accent-gold" />
            <span className="text-accent-gold">PLC LINE-2</span>
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <XAxis dataKey="second" hide />
          <YAxis
            domain={[0, 80]}
            tick={{ fill: '#6b738a', fontSize: 9, fontFamily: 'monospace' }}
            tickCount={5}
            width={32}
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
            formatter={(value: unknown, name: unknown) => [
              `${value} ms`,
              name === 'plc1' ? 'PLC LINE-1' : 'PLC LINE-2',
            ]}
          />
          <ReferenceLine
            y={50}
            stroke="#ef5350"
            strokeDasharray="4 2"
            label={{
              value: 'THRESHOLD 50ms',
              position: 'insideTopRight',
              fill: '#ef5350',
              fontSize: 9,
              fontFamily: 'monospace',
            }}
          />
          <Line
            type="monotone"
            dataKey="plc1"
            stroke="#4fc3f7"
            dot={false}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="plc2"
            stroke="#e8a23a"
            dot={false}
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


