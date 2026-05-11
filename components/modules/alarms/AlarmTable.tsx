'use client'

// Client component — uses Redux for alarm data, dispatch for acknowledge actions

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectFilteredAlarms,
  selectUnacknowledgedCount,
  acknowledge,
  acknowledgeAll,
} from '@/store/slices/alarmsSlice'
import { selectCurrentUser, selectUserRole } from '@/store/slices/authSlice'
import type { Alarm, AlarmSeverity } from '@/types'
import { Badge }     from '@/components/ui/Badge'
import { Button }    from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

type BadgeVariant = 'alarm' | 'warning' | 'ok' | 'offline' | 'idle' | 'info' | 'gold'

const SEVERITY_VARIANT: Record<AlarmSeverity, BadgeVariant> = {
  critical: 'alarm',
  high:     'warning',
  medium:   'warning',
  low:      'idle',
  info:     'info',
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

interface AlarmRowProps {
  alarm:       Alarm
  canAck:      boolean
  onAcknowledge: (id: string) => void
}

function AlarmRow({ alarm, canAck, onAcknowledge }: AlarmRowProps) {
  return (
    <tr className={`border-b border-scada-border transition-colors hover:bg-scada-panel
      ${!alarm.acknowledged ? 'bg-status-alarm/5' : ''}`}
    >
      {/* Severity */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {!alarm.acknowledged && (
            <span className="status-dot alarm-blink bg-status-alarm" />
          )}
          <Badge variant={SEVERITY_VARIANT[alarm.severity]} label={alarm.severity} />
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-text-muted uppercase">
        {alarm.category}
      </td>

      {/* Message */}
      <td className="px-4 py-3 text-sm text-text-primary font-mono">
        {alarm.message}
      </td>

      {/* Source */}
      <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-text-muted">
        {alarm.source}
      </td>

      {/* Triggered */}
      <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-text-muted value-display">
        {formatDateTime(alarm.triggeredAt)}
      </td>

      {/* Acknowledged */}
      <td className="px-4 py-3 whitespace-nowrap text-xs font-mono">
        {alarm.acknowledged ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-status-ok">✓ {alarm.acknowledgedBy}</span>
            <span className="text-text-muted">{formatDateTime(alarm.acknowledgedAt!)}</span>
          </div>
        ) : (
          <span className="text-status-alarm">Pending</span>
        )}
      </td>

      {/* Action */}
      <td className="px-4 py-3 whitespace-nowrap">
        {!alarm.acknowledged && canAck && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onAcknowledge(alarm.id)}
          >
            ACK
          </Button>
        )}
      </td>
    </tr>
  )
}

export function AlarmTable() {
  const dispatch    = useAppDispatch()
  const alarms      = useAppSelector(selectFilteredAlarms)
  const unackCount  = useAppSelector(selectUnacknowledgedCount)
  const currentUser = useAppSelector(selectCurrentUser)
  const role        = useAppSelector(selectUserRole)

  // Operators and above can acknowledge alarms
  const canAck = role !== null

  const handleAcknowledge = (id: string) => {
    dispatch(acknowledge({ id, acknowledgedBy: currentUser?.name ?? 'Unknown' }))
  }

  const handleAcknowledgeAll = () => {
    dispatch(acknowledgeAll(currentUser?.name ?? 'Unknown'))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-text-muted text-xs font-mono uppercase tracking-wide">
            {alarms.length} alarm{alarms.length !== 1 ? 's' : ''}
          </span>
          {unackCount > 0 && (
            <span className="text-status-alarm text-xs font-mono">
              · {unackCount} unacknowledged
            </span>
          )}
        </div>

        {canAck && unackCount > 0 && (
          <Button variant="danger" size="sm" onClick={handleAcknowledgeAll}>
            ACK ALL ({unackCount})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-scada-surface border border-scada-border rounded-scada overflow-x-auto">
        {alarms.length === 0 ? (
          <div className="p-8">
            <EmptyState message="No alarms match the current filters." />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-scada-border bg-scada-panel">
                <th className="px-4 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wide">Severity</th>
                <th className="px-4 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wide">Category</th>
                <th className="px-4 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wide">Message</th>
                <th className="px-4 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wide">Source</th>
                <th className="px-4 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wide">Triggered</th>
                <th className="px-4 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wide">Acknowledged</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {alarms.map(alarm => (
                <AlarmRow
                  key={alarm.id}
                  alarm={alarm}
                  canAck={canAck}
                  onAcknowledge={handleAcknowledge}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
