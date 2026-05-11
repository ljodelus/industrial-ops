'use client'

// Client component — Recharts (browser-only), useAppSelector for alarm data
import { useAppSelector } from '@/store/hooks'
import { selectAllAlarms } from '@/store/slices/alarmsSlice'
import { Card } from '@/components/ui/Card'
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'

// ─── Theme colours (must match globals.css) ────────────────────────────────
const C = {
  critical: '#ef5350',
  high:     '#ff7043',
  medium:   '#ffa726',
  low:      '#e8a23a',
  info:     '#4fc3f7',
  primary:  '#4fc3f7',
  muted:    '#6b738a',
  border:   '#1f2433',
  panel:    '#1a1d2e',
  text:     '#e8eaf6',
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: C.critical,
  high:     C.high,
  medium:   C.medium,
  low:      C.low,
  info:     C.info,
}

const ALL_CATEGORIES = ['Motion', 'Communication', 'Process', 'Recipe', 'Sensor', 'Collision']

// Simulated hourly alarm data for past 8 hours
const HOURLY_DATA = [
  { hour: '07:00', count: 1 },
  { hour: '08:00', count: 3 },
  { hour: '09:00', count: 2 },
  { hour: '10:00', count: 0 },
  { hour: '11:00', count: 1 },
  { hour: '12:00', count: 0 },
  { hour: '13:00', count: 2 },
  { hour: '14:00', count: 1 },
]

const customTooltipStyle = {
  backgroundColor: C.panel,
  border:          `1px solid ${C.border}`,
  borderRadius:    2,
  fontSize:        11,
  color:           C.text,
  fontFamily:      'JetBrains Mono, monospace',
}

const axisStyle = { fontSize: 10, fill: C.muted, fontFamily: 'JetBrains Mono, monospace' }

export function AlarmStatsPanel() {
  const alarms = useAppSelector(selectAllAlarms)

  // Pie chart: severity distribution
  const sevData = Object.entries(SEVERITY_COLORS).map(([sev, color]) => ({
    name:  sev,
    value: alarms.filter(a => a.severity === sev).length,
    color,
  })).filter(d => d.value > 0)

  // Bar chart: count per category
  const catData = ALL_CATEGORIES.map(cat => ({
    category: cat.substring(0, 5), // shorten labels
    full:     cat,
    count:    alarms.filter(a => a.category === cat).length,
  }))

  return (
    <Card title="Alarm Statistics" accent="gold" noPadding>
      <div className="p-4 flex flex-col gap-5">

        {/* Chart 1 — Severity Distribution (Donut) */}
        <div>
          <p className="text-text-muted text-[10px] uppercase font-mono tracking-wide mb-2">
            By Severity
          </p>
          <div className="h-28 relative">
            {sevData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-text-muted text-xs font-mono">
                No alarms
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sevData}
                    cx="40%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    dataKey="value"
                    stroke="none"
                  >
                    {sevData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <ReTooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Legend */}
            <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center gap-1 pr-1">
              {sevData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-text-muted text-[10px] font-mono capitalize">
                    {d.name} ({d.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 2 — By Category (Horizontal Bar) */}
        <div>
          <p className="text-text-muted text-[10px] uppercase font-mono tracking-wide mb-2">
            By Category
          </p>
          <div className="h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} layout="vertical" margin={{ left: -10, right: 8 }}>
                <CartesianGrid horizontal={false} stroke={C.border} strokeOpacity={0.3} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={axisStyle}
                  width={48}
                  axisLine={false}
                  tickLine={false}
                />
                <ReTooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="count" fill={C.primary} radius={1} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3 — Alarms Over Time (Line) */}
        <div>
          <p className="text-text-muted text-[10px] uppercase font-mono tracking-wide mb-2">
            Last 8 Hours
          </p>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HOURLY_DATA} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke={C.border} strokeOpacity={0.3} />
                <XAxis dataKey="hour" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={axisStyle} axisLine={false} tickLine={false} />
                <ReTooltip contentStyle={customTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={C.critical}
                  strokeWidth={2}
                  dot={{ fill: C.critical, r: 3 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </Card>
  )
}



