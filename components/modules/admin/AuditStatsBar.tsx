'use client'
// Client component — reads filtered entries and renders stats counters

import type { AuditEntry } from '@/types'

interface AuditStatsBarProps {
  entries: AuditEntry[]
}

interface StatItem {
  label: string
  value: number
  colorClass: string
}

export function AuditStatsBar({ entries }: AuditStatsBarProps) {
  const total    = entries.length
  const logins   = entries.filter(e => e.category === 'Authentication').length
  const configs  = entries.filter(e => e.category === 'Configuration').length
  const alarms   = entries.filter(e => e.category === 'Alarm').length
  const security = entries.filter(e => e.category === 'Security').length

  const stats: StatItem[] = [
    { label: 'TOTAL EVENTS',    value: total,    colorClass: 'text-text-value' },
    { label: 'LOGINS',          value: logins,   colorClass: 'text-accent-primary' },
    { label: 'CONFIG CHANGES',  value: configs,  colorClass: 'text-accent-gold' },
    { label: 'ALARM ACTIONS',   value: alarms,   colorClass: 'text-status-warning' },
    { label: 'SECURITY EVENTS', value: security, colorClass: 'text-status-alarm' },
  ]

  return (
    <div className="bg-scada-surface border border-scada-border rounded-scada px-6 py-3 flex items-center gap-0">
      {stats.map((stat, i) => (
        <div key={stat.label} className="flex items-center">
          {i > 0 && <div className="w-px h-8 bg-scada-border mx-6" />}
          <div className="flex flex-col gap-0.5">
            <span className="text-text-muted text-[10px] font-mono uppercase tracking-wider">
              {stat.label}
            </span>
            <span className={`font-mono text-xl font-bold ${stat.colorClass}`}>
              {stat.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

