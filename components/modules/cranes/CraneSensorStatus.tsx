'use client'

// Client component — sensor health indicators for the selected crane
import type { Crane } from '@/types'
import { StatusDot } from '@/components/ui'

interface Props {
  crane: Crane
}

interface SensorDef {
  id:    string
  label: string
}

const SENSORS: SensorDef[] = [
  { id: 'end-limit-left',  label: 'END LIMIT LEFT'  },
  { id: 'end-limit-right', label: 'END LIMIT RIGHT' },
  { id: 'load-cell',       label: 'LOAD CELL'       },
  { id: 'encoder',         label: 'ENCODER'         },
  { id: 'hoist-motor',     label: 'HOIST MOTOR'     },
  { id: 'travel-motor',    label: 'TRAVEL MOTOR'    },
]

// ENCODER shows WARNING for CRANE-4 when in error state
function getSensorStatus(
  sensorId: string,
  crane: Crane
): 'ok' | 'warning' | 'alarm' {
  if (crane.status === 'error' && sensorId === 'encoder') return 'warning'
  return 'ok'
}

const STATUS_DOT_MAP = {
  ok:      'ok',
  warning: 'warning',
  alarm:   'alarm',
} as const

const STATUS_TEXT: Record<'ok' | 'warning' | 'alarm', string> = {
  ok:      'OK',
  warning: 'WARNING',
  alarm:   'ALARM',
}

const STATUS_TEXT_CLASS: Record<'ok' | 'warning' | 'alarm', string> = {
  ok:      'text-status-ok',
  warning: 'text-status-warning',
  alarm:   'text-status-alarm',
}

export function CraneSensorStatus({ crane }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 py-2">
      {SENSORS.map(sensor => {
        const status  = getSensorStatus(sensor.id, crane)
        const dotStat = STATUS_DOT_MAP[status]
        return (
          <div key={sensor.id} className="flex items-center justify-between">
            <span className="text-text-muted text-xs uppercase font-mono tracking-wide">
              {sensor.label}
            </span>
            <div className="flex items-center gap-1.5">
              <StatusDot status={dotStat} size="sm" />
              <span className={`text-xs font-mono ${STATUS_TEXT_CLASS[status]}`}>
                {STATUS_TEXT[status]}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

