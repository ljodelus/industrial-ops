'use client'

// Client component — reads alarm counts from Redux to display the header stats bar
import { useAppSelector } from '@/store/hooks'
import { selectAllAlarms } from '@/store/slices/alarmsSlice'
import type { AlarmSeverity } from '@/types'

const SEVERITY_ORDER: AlarmSeverity[] = ['critical', 'high', 'medium', 'low', 'info']

const SEVERITY_LABELS: Record<AlarmSeverity, string> = {
  critical: 'Critical',
  high:     'High',
  medium:   'Medium',
  low:      'Low',
  info:     'Info',
}

const SEVERITY_VALUE_CLASS: Record<AlarmSeverity, string> = {
  critical: 'text-status-alarm',
  high:     'text-status-alarm',
  medium:   'text-status-warning',
  low:      'text-accent-gold',
  info:     'text-accent-primary',
}

interface StatItemProps {
  label:   string
  value:   number
  cls?:    string
  blink?:  boolean
}

function StatItem({ label, value, cls = 'text-text-value', blink = false }: StatItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-text-muted text-[10px] uppercase font-mono tracking-wide">
        {label}
      </span>
      <span className={`text-sm font-mono font-bold ${cls} ${blink && value > 0 ? 'alarm-blink' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function Divider() {
  return <span className="text-scada-border text-xs font-mono select-none">|</span>
}

export function AlarmStatsBar() {
  const alarms = useAppSelector(selectAllAlarms)

  const counts = SEVERITY_ORDER.reduce<Record<string, number>>((acc, sev) => {
    acc[sev] = alarms.filter(a => a.severity === sev).length
    return acc
  }, {})

  const total   = alarms.length
  const unacked = alarms.filter(a => !a.acknowledged).length

  return (
    <div className="flex items-center gap-3 flex-wrap mt-1">
      {SEVERITY_ORDER.map((sev, i) => (
        <span key={sev} className="flex items-center gap-3">
          {i > 0 && <Divider />}
          <StatItem
            label={SEVERITY_LABELS[sev]}
            value={counts[sev] ?? 0}
            cls={SEVERITY_VALUE_CLASS[sev]}
            blink={sev === 'critical'}
          />
        </span>
      ))}
      <Divider />
      <StatItem label="Total"  value={total}   />
      <Divider />
      <StatItem label="Unacked" value={unacked} cls="text-status-alarm" blink />
    </div>
  )
}

