'use client'

// Client component — displays live telemetry values for the selected crane
import type { Crane, CraneStatus, Job } from '@/types'

interface Props {
  crane:    Crane
  job:      Job | undefined
  speed:    number
  uptime:   string
}

const STATUS_LABEL: Record<CraneStatus, string> = {
  moving:  'MOVING',
  loading: 'LOADING',
  idle:    'IDLE',
  error:   'ERROR',
  offline: 'OFFLINE',
}

const STATUS_CLASS: Record<CraneStatus, string> = {
  moving:  'text-status-ok',
  loading: 'text-accent-primary',
  idle:    'text-status-idle',
  error:   'text-status-alarm',
  offline: 'text-status-offline',
}

interface TelemetryCell {
  label: string
  value: string
  accent?: string
}

export function CraneTelemetryGrid({ crane, job, speed, uptime }: Props) {
  const cells: TelemetryCell[] = [
    {
      label: 'POSITION',
      value: `${crane.position.toLocaleString()} mm`,
      accent: 'text-text-value',
    },
    {
      label: 'LOAD',
      value: crane.load > 0 ? `${crane.load} kg` : '0 kg',
      accent: 'text-text-value',
    },
    {
      label: 'SPEED',
      value: `${speed.toFixed(1)} m/min`,
      accent: 'text-text-value',
    },
    {
      label: 'STATUS',
      value: STATUS_LABEL[crane.status],
      accent: STATUS_CLASS[crane.status],
    },
    {
      label: 'CURRENT JOB',
      value: job?.id.toUpperCase() ?? 'NONE',
      accent: job ? 'text-accent-gold' : 'text-text-muted',
    },
    {
      label: 'RECIPE',
      value: job?.recipeName ?? '—',
      accent: 'text-text-primary',
    },
    {
      label: 'LINE',
      value: crane.line,
      accent: 'text-text-primary',
    },
    {
      label: 'UPTIME',
      value: uptime,
      accent: 'text-text-value',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-px bg-scada-border rounded-scada overflow-hidden border border-scada-border">
      {cells.map(cell => (
        <div key={cell.label} className="bg-scada-bg p-3 flex flex-col gap-1">
          <span className="text-text-muted text-xs font-mono uppercase tracking-wide leading-none">
            {cell.label}
          </span>
          <span className={`value-display text-sm font-mono ${cell.accent ?? 'text-text-value'}`}>
            {cell.value}
          </span>
        </div>
      ))}
    </div>
  )
}

