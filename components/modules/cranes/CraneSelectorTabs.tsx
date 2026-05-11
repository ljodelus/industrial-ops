'use client'

// Client component — uses event handlers for tab switching
import type { Crane, CraneStatus } from '@/types'
import { StatusDot } from '@/components/ui'

interface Props {
  cranes:           Crane[]
  selectedCraneId:  string
  onSelect:         (id: string) => void
}

function craneStatusDot(status: CraneStatus): {
  dotStatus: 'ok' | 'warning' | 'alarm' | 'offline' | 'idle'
  animated:  boolean
} {
  switch (status) {
    case 'moving':  return { dotStatus: 'ok',      animated: true  }
    case 'loading': return { dotStatus: 'ok',      animated: true  }
    case 'idle':    return { dotStatus: 'idle',    animated: false }
    case 'error':   return { dotStatus: 'alarm',   animated: true  }
    case 'offline': return { dotStatus: 'offline', animated: false }
  }
}

const STATUS_LABEL: Record<CraneStatus, string> = {
  moving:  'MOVING',
  loading: 'LOADING',
  idle:    'IDLE',
  error:   'ERROR',
  offline: 'OFFLINE',
}

export function CraneSelectorTabs({ cranes, selectedCraneId, onSelect }: Props) {
  return (
    <div className="flex gap-0 border-b border-scada-border">
      {cranes.map(crane => {
        const isSelected = crane.id === selectedCraneId
        const isError    = crane.status === 'error'
        const { dotStatus, animated } = craneStatusDot(crane.status)

        const tabClasses = [
          'flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wide cursor-pointer transition-colors border-b-2',
          isSelected
            ? isError
              ? 'border-status-alarm text-status-alarm bg-scada-surface'
              : 'border-accent-primary text-accent-primary bg-scada-surface'
            : 'border-transparent text-text-muted bg-scada-bg hover:text-text-primary hover:bg-scada-surface',
        ].join(' ')

        return (
          <button
            key={crane.id}
            onClick={() => onSelect(crane.id)}
            className={tabClasses}
          >
            <StatusDot
              status={dotStatus}
              animated={animated}
              size="sm"
              className={isError && isSelected ? 'alarm-blink' : ''}
            />
            <span>{crane.name}</span>
            <span
              className={
                isSelected
                  ? isError
                    ? 'text-status-alarm'
                    : 'text-accent-primary'
                  : 'text-text-muted'
              }
            >
              {STATUS_LABEL[crane.status]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

