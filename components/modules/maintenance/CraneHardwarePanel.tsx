'use client'

// Client component — requires onClick handler

import { StatusDot } from '@/components/ui'
import type { CraneHardwareStatus, DiagComponentStatus } from '@/types'

type ComponentRow = {
  label: string
  status: DiagComponentStatus
}

const STATUS_LABEL: Record<DiagComponentStatus, string> = {
  ok:      'OK',
  warning: 'WARNING',
  alarm:   'FAULT',
  offline: 'OFFLINE',
}

const STATUS_TEXT_COLOR: Record<DiagComponentStatus, string> = {
  ok:      'text-status-ok',
  warning: 'text-status-warning',
  alarm:   'text-status-alarm',
  offline: 'text-status-offline',
}

const ACCENT_BORDER: Record<DiagComponentStatus, string> = {
  ok:      'border-t-status-ok',
  warning: 'border-t-status-warning',
  alarm:   'border-t-status-alarm',
  offline: 'border-t-status-offline',
}

function TempValue({ temp }: { temp: number }) {
  const color =
    temp > 75 ? 'text-status-alarm alarm-blink' :
    temp > 60 ? 'text-status-warning' :
    'text-status-ok'
  return <span className={`value-display text-xs font-mono ${color}`}>{temp}°C</span>
}

interface CraneHardwarePanelProps {
  hardware: CraneHardwareStatus
  onClick?: () => void
}

export function CraneHardwarePanel({ hardware, onClick }: CraneHardwarePanelProps) {
  const rows: ComponentRow[] = [
    { label: 'TRAVEL MOTOR',    status: hardware.travelMotor   },
    { label: 'HOIST MOTOR',     status: hardware.hoistMotor    },
    { label: 'VFD DRIVE',       status: hardware.vfdDrive      },
    { label: 'ENCODER',         status: hardware.encoder       },
    { label: 'END LIMIT LEFT',  status: hardware.endLimitLeft  },
    { label: 'END LIMIT RIGHT', status: hardware.endLimitRight },
    { label: 'LOAD CELL',       status: hardware.loadCell      },
    { label: 'BRAKE SYSTEM',    status: hardware.brakeSystem   },
  ]

  const overallStatusLabel = STATUS_LABEL[hardware.overall]
  const overallTextColor   = STATUS_TEXT_COLOR[hardware.overall]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        bg-scada-surface border border-scada-border border-t-2 ${ACCENT_BORDER[hardware.overall]}
        rounded-scada p-3 text-left w-full
        hover:bg-scada-panel transition-colors cursor-pointer
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-primary text-xs font-mono font-bold uppercase tracking-wide">
          {hardware.craneName}
        </span>
        <div className="flex items-center gap-1.5">
          <StatusDot
            status={hardware.overall}
            size="sm"
            animated={hardware.overall === 'alarm'}
          />
          <span className={`text-[10px] font-mono uppercase ${overallTextColor}`}>
            {overallStatusLabel === 'OK' ? 'ONLINE' : overallStatusLabel}
          </span>
        </div>
      </div>

      {/* Component rows */}
      <div className="space-y-1 mb-3">
        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-text-muted text-[10px] font-mono uppercase">{row.label}</span>
            <div className="flex items-center gap-1">
              <StatusDot
                status={row.status}
                size="sm"
                animated={row.status === 'alarm'}
              />
              <span className={`text-[10px] font-mono ${STATUS_TEXT_COLOR[row.status]} ${row.status === 'alarm' ? 'alarm-blink' : ''}`}>
                {STATUS_LABEL[row.status]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Temperature + operating hours */}
      <div className="border-t border-scada-border pt-2 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-text-muted text-[10px] font-mono uppercase">TEMP VFD</span>
          <TempValue temp={hardware.tempVfd} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-muted text-[10px] font-mono uppercase">TEMP MOTOR</span>
          <TempValue temp={hardware.tempMotor} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-muted text-[10px] font-mono uppercase">OPERATING HRS</span>
          <span className="value-display text-text-muted text-xs font-mono">
            {hardware.operatingHours.toLocaleString()} h
          </span>
        </div>
      </div>
    </button>
  )
}

