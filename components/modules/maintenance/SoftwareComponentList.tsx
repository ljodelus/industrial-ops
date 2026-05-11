'use client'

// Client component — requires event handlers and dynamic rendered content
import { Badge } from '@/components/ui'
import { Activity } from '@/lib/icons'

// ─── Service definitions ──────────────────────────────────────────────────────

interface ServiceDef {
  name:        string
  status:      'ok' | 'warning' | 'alarm' | 'idle'
  badgeLabel:  string
  metric1:     string
  metric2:     (extra: number) => string  // dynamic (e.g. uptime)
  version:     string
}

const BASE_UPTIME_SECONDS = {
  web:     6 * 86400 + 14 * 3600 + 32 * 60,  // 6d 14h 32m
  opcua:   6 * 86400 + 14 * 3600 + 28 * 60,
  mqtt:    6 * 86400 + 14 * 3600 + 25 * 60,
  db:      6 * 86400 + 14 * 3600 + 20 * 60,
  sim:     2 * 86400 + 7  * 3600 + 10 * 60,
  auth:    6 * 86400 + 14 * 3600 + 32 * 60,
  alarm:   6 * 86400 + 14 * 3600 + 32 * 60,
  report:  6 * 86400 + 14 * 3600 + 32 * 60,
}

function fmtUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${d}d ${h}h ${m}m`
}

// ─── Resource bar ─────────────────────────────────────────────────────────────

interface ResourceBarProps {
  label:   string
  value:   number  // 0–100
  detail?: string
  alarm?:  boolean
}

function ResourceBar({ label, value, detail, alarm }: ResourceBarProps) {
  const barColor = alarm ? 'bg-status-alarm' : 'bg-accent-primary'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-text-muted uppercase text-[10px]">{label}</span>
        <span className={`value-display ${alarm ? 'text-status-alarm' : 'text-text-primary'}`}>
          {value.toFixed(1)}%{detail ? `  (${detail})` : ''}
        </span>
      </div>
      <div className="w-full h-1.5 bg-scada-border rounded-scada overflow-hidden">
        <div
          className={`h-full rounded-scada transition-all duration-500 ${barColor}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SoftwareComponentListProps {
  cpu:           number
  uptimeSeconds: number
}

export function SoftwareComponentList({ cpu, uptimeSeconds }: SoftwareComponentListProps) {
  const SERVICES: ServiceDef[] = [
    {
      name:       'WEB SERVER',
      status:     'ok',
      badgeLabel: 'RUNNING',
      metric1:    'Port 3000',
      metric2:    (t) => `Uptime: ${fmtUptime(BASE_UPTIME_SECONDS.web + t)}`,
      version:    'v1.0.0',
    },
    {
      name:       'OPC UA CLIENT',
      status:     'ok',
      badgeLabel: 'RUNNING',
      metric1:    'Connected',
      metric2:    (t) => `Uptime: ${fmtUptime(BASE_UPTIME_SECONDS.opcua + t)}  Nodes: 248`,
      version:    'v2.1.4',
    },
    {
      name:       'MQTT SERVICE',
      status:     'ok',
      badgeLabel: 'RUNNING',
      metric1:    'Broker OK',
      metric2:    (t) => `Uptime: ${fmtUptime(BASE_UPTIME_SECONDS.mqtt + t)}`,
      version:    'v3.0.1',
    },
    {
      name:       'DATABASE',
      status:     'ok',
      badgeLabel: 'RUNNING',
      metric1:    'PostgreSQL',
      metric2:    (t) => `Uptime: ${fmtUptime(BASE_UPTIME_SECONDS.db + t)}  Latency: 24ms`,
      version:    'v15.2',
    },
    {
      name:       'SIMULATION ENGINE',
      status:     'ok',
      badgeLabel: 'RUNNING',
      metric1:    'Active',
      metric2:    (t) => `Uptime: ${fmtUptime(BASE_UPTIME_SECONDS.sim + t)}  Tick: 2s`,
      version:    'v1.0.0',
    },
    {
      name:       'AUTH SERVICE',
      status:     'ok',
      badgeLabel: 'RUNNING',
      metric1:    'JWT Active',
      metric2:    (t) => `Uptime: ${fmtUptime(BASE_UPTIME_SECONDS.auth + t)}  Sessions: 3`,
      version:    'v1.0.0',
    },
    {
      name:       'ALARM ENGINE',
      status:     'ok',
      badgeLabel: 'RUNNING',
      metric1:    'Monitoring',
      metric2:    (t) => `Uptime: ${fmtUptime(BASE_UPTIME_SECONDS.alarm + t)}  Queue: 0`,
      version:    'v1.0.0',
    },
    {
      name:       'REPORT ENGINE',
      status:     'idle',
      badgeLabel: 'IDLE',
      metric1:    'Standby',
      metric2:    () => 'Last run: 06:00',
      version:    'v1.0.0',
    },
  ]

  const iconColor: Record<string, string> = {
    ok:      'text-status-ok',
    warning: 'text-status-warning',
    alarm:   'text-status-alarm',
    idle:    'text-status-idle',
  }

  return (
    <div className="space-y-4">
      {/* Service rows */}
      <div>
        {SERVICES.map((svc, idx) => (
          <div
            key={svc.name}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-scada
              ${idx % 2 === 0 ? '' : 'bg-scada-panel'}
              hover:bg-scada-panel transition-colors
            `}
          >
            <Activity size={16} className={iconColor[svc.status]} />
            <span className="text-text-primary font-mono text-xs font-bold uppercase w-36 shrink-0">
              {svc.name}
            </span>
            <Badge variant={svc.status as 'ok' | 'warning' | 'alarm' | 'idle'} label={svc.badgeLabel} />
            <span className="text-text-muted text-xs font-mono flex-1">{svc.metric1}</span>
            <span className="text-text-muted text-xs font-mono hidden md:block">{svc.metric2(uptimeSeconds)}</span>
            <span className="text-text-muted text-[10px] font-mono shrink-0">{svc.version}</span>
          </div>
        ))}
      </div>

      {/* Resource bars */}
      <div className="border-t border-scada-border pt-4 space-y-3">
        <ResourceBar
          label="CPU USAGE"
          value={cpu}
          alarm={cpu > 80}
        />
        <ResourceBar
          label="MEMORY"
          value={61.4}
          detail="2.46 GB / 4 GB"
          alarm={61.4 > 85}
        />
        <ResourceBar
          label="DISK"
          value={42.1}
          detail="210 GB / 500 GB"
          alarm={42.1 > 85}
        />
      </div>
    </div>
  )
}


