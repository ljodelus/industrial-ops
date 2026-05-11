'use client'

// Client component — uses Modal (client-only)

import { Modal, StatusDot, Badge } from '@/components/ui'
import type { CraneHardwareStatus, DiagComponentStatus } from '@/types'

interface FaultEntry {
  date:    string
  message: string
}

const FAULT_HISTORY: Record<string, FaultEntry[]> = {
  'CRANE-4': [
    { date: '2026-04-28 08:14', message: 'Encoder feedback lost' },
    { date: '2026-04-15 14:32', message: 'VFD overtemperature alarm' },
    { date: '2026-03-22 09:11', message: 'Emergency stop triggered' },
    { date: '2026-02-10 16:45', message: 'Load cell calibration error' },
    { date: '2026-01-18 11:20', message: 'Travel limit switch fault' },
  ],
  default: [
    { date: '2026-03-15 10:00', message: 'Scheduled maintenance inspection' },
    { date: '2026-01-20 09:30', message: 'Encoder zero-point calibration' },
  ],
}

const STATUS_LABEL: Record<DiagComponentStatus, string> = {
  ok:      'OK',
  warning: 'WARNING',
  alarm:   'FAULT',
  offline: 'OFFLINE',
}

const STATUS_BADGE: Record<DiagComponentStatus, 'ok' | 'warning' | 'alarm' | 'offline'> = {
  ok:      'ok',
  warning: 'warning',
  alarm:   'alarm',
  offline: 'offline',
}

interface HardwareDetailModalProps {
  crane:   CraneHardwareStatus
  onClose: () => void
}

type ComponentEntry = { label: string; status: DiagComponentStatus }

export function HardwareDetailModal({ crane, onClose }: HardwareDetailModalProps) {
  const components: ComponentEntry[] = [
    { label: 'TRAVEL MOTOR',    status: crane.travelMotor   },
    { label: 'HOIST MOTOR',     status: crane.hoistMotor    },
    { label: 'VFD DRIVE',       status: crane.vfdDrive      },
    { label: 'ENCODER',         status: crane.encoder       },
    { label: 'END LIMIT LEFT',  status: crane.endLimitLeft  },
    { label: 'END LIMIT RIGHT', status: crane.endLimitRight },
    { label: 'LOAD CELL',       status: crane.loadCell      },
    { label: 'BRAKE SYSTEM',    status: crane.brakeSystem   },
  ]

  const faults  = FAULT_HISTORY[crane.craneId] ?? FAULT_HISTORY.default
  const accentClass =
    crane.overall === 'alarm'   ? 'border-t-2 border-t-status-alarm' :
    crane.overall === 'warning' ? 'border-t-2 border-t-status-warning' :
    'border-t-2 border-t-status-ok'

  const nextServiceHours = 2000 - (crane.operatingHours % 500)

  return (
    <Modal
      open
      onClose={onClose}
      title={`${crane.craneName} — Hardware Detail`}
      maxWidth="max-w-2xl"
      accentColor={accentClass}
    >
      <div className="space-y-6">

        {/* Component Status */}
        <div>
          <div className="text-text-muted text-[10px] font-mono uppercase mb-3 flex items-center justify-between border-b border-scada-border pb-2">
            <span>Component Status</span>
            <Badge variant={STATUS_BADGE[crane.overall]} label={STATUS_LABEL[crane.overall]} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {components.map(comp => (
              <div
                key={comp.label}
                className="flex items-center justify-between bg-scada-bg border border-scada-border rounded-scada px-3 py-2"
              >
                <span className="text-text-muted text-[10px] font-mono uppercase">{comp.label}</span>
                <div className="flex items-center gap-1.5">
                  <StatusDot
                    status={comp.status}
                    size="sm"
                    animated={comp.status === 'alarm'}
                  />
                  <Badge variant={STATUS_BADGE[comp.status]} label={STATUS_LABEL[comp.status]} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Temperatures */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-scada-bg border border-scada-border rounded-scada p-3 text-center">
            <div className="text-text-muted text-[10px] font-mono uppercase mb-1">VFD TEMP</div>
            <div className={`text-xl font-mono font-bold value-display ${crane.tempVfd > 75 ? 'text-status-alarm alarm-blink' : crane.tempVfd > 60 ? 'text-status-warning' : 'text-status-ok'}`}>
              {crane.tempVfd}°C
            </div>
          </div>
          <div className="bg-scada-bg border border-scada-border rounded-scada p-3 text-center">
            <div className="text-text-muted text-[10px] font-mono uppercase mb-1">MOTOR TEMP</div>
            <div className={`text-xl font-mono font-bold value-display ${crane.tempMotor > 75 ? 'text-status-alarm alarm-blink' : crane.tempMotor > 60 ? 'text-status-warning' : 'text-status-ok'}`}>
              {crane.tempMotor}°C
            </div>
          </div>
          <div className="bg-scada-bg border border-scada-border rounded-scada p-3 text-center">
            <div className="text-text-muted text-[10px] font-mono uppercase mb-1">OPERATING HRS</div>
            <div className="text-xl font-mono font-bold value-display text-text-value">
              {crane.operatingHours.toLocaleString()} h
            </div>
          </div>
        </div>

        {/* Fault History */}
        <div>
          <div className="text-text-muted text-[10px] font-mono uppercase mb-2 border-b border-scada-border pb-2">
            Fault History
          </div>
          <div className="space-y-1">
            {faults.map((f, i) => (
              <div key={i} className="flex items-start gap-3 py-1.5 border-b border-scada-border/50">
                <span className="text-accent-primary text-[10px] font-mono shrink-0">{f.date}</span>
                <span className="text-text-primary text-xs font-mono">{f.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Schedule */}
        <div className="bg-scada-bg border border-scada-border rounded-scada p-4">
          <div className="text-text-muted text-[10px] font-mono uppercase mb-3">Maintenance Schedule</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-mono">
            <span className="text-text-muted uppercase text-[10px]">Next Service Due</span>
            <span className="value-display text-accent-primary">{nextServiceHours} hours remaining</span>
            <span className="text-text-muted uppercase text-[10px]">Last Service</span>
            <span className="value-display text-text-primary">Jan 15, 2026</span>
            <span className="text-text-muted uppercase text-[10px]">Service Interval</span>
            <span className="value-display text-text-primary">500 h</span>
          </div>
        </div>

      </div>
    </Modal>
  )
}

