// Server-safe — no client hooks needed; interactivity via props only
// But onNavigateToTab requires click handlers → 'use client'
'use client'

import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { StatusDot } from '@/components/ui/StatusDot'

interface SystemOverviewTabProps {
  onNavigateToTab: (tab: string) => void
}

const IDENTITY_FIELDS = [
  { label: 'SYSTEM NAME',       value: 'industrial-ops-ui' },
  { label: 'VERSION',           value: 'v0.1.0' },
  { label: 'ENVIRONMENT',       value: 'Production' },
  { label: 'INSTANCE ID',       value: 'IOP-2026-001' },
  { label: 'LAST CONFIG SAVE',  value: 'May 08, 2026 17:30 by Admin User' },
  { label: 'CONFIG VERSION',    value: '14' },
]

interface HealthItem {
  label: string
  status: 'ok' | 'warning' | 'alarm' | 'offline' | 'idle'
  tab: string
}

const HEALTH_ITEMS: HealthItem[] = [
  { label: 'PLC LINE-1',   status: 'ok',      tab: 'plc' },
  { label: 'PLC LINE-2',   status: 'warning',  tab: 'plc' },
  { label: 'Database',     status: 'ok',      tab: 'network' },
  { label: 'MQTT Broker',  status: 'ok',      tab: 'network' },
]

export function SystemOverviewTab({ onNavigateToTab }: SystemOverviewTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-text-value font-mono text-base uppercase tracking-widest">System Overview</p>
        <p className="text-text-muted text-xs font-mono mt-0.5">Summary of current system configuration</p>
      </div>

      {/* Identity Card */}
      <Card title="System Identity" accent="primary">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          {IDENTITY_FIELDS.map(f => (
            <div key={f.label} className="flex flex-col gap-0.5">
              <span className="text-text-muted text-xs font-mono uppercase tracking-wide">{f.label}</span>
              <span className="text-text-value font-mono text-sm value-display">{f.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Stat Cards 3×2 */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Production Lines" value="2"  subtitle="LINE-1 · LINE-2"    accent="primary" />
        <StatCard title="Total Cranes"     value="4"  subtitle="2 per line"          accent="primary" />
        <StatCard title="Total Tanks"      value="11" subtitle="6 + 5 across lines"  accent="primary" />
        <StatCard title="PLC Connections"  value="2"  subtitle="Both connected"      accent="ok" />
        <StatCard title="Active Users"     value="4"  subtitle="2 online now"        accent="gold" />
        <StatCard title="Config Version"   value="14" subtitle="Last saved May 08"   accent="gold" />
      </div>

      {/* Health Check */}
      <Card title="Quick Health Check" accent="primary">
        <div className="flex items-center gap-8">
          {HEALTH_ITEMS.map(h => (
            <button
              key={h.label}
              type="button"
              onClick={() => onNavigateToTab(h.tab)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <StatusDot status={h.status} size="md" />
              <span className="text-text-muted text-xs font-mono uppercase">{h.label}</span>
              <span className={`text-xs font-mono uppercase ${
                h.status === 'ok' ? 'text-status-ok' :
                h.status === 'warning' ? 'text-status-warning' :
                h.status === 'alarm' ? 'text-status-alarm' : 'text-status-offline'
              }`}>
                {h.status === 'ok' ? 'OK' : h.status === 'warning' ? 'WARN' : h.status.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

