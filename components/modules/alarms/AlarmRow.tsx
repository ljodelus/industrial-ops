'use client'

// Client component — event listeners (onClick), timeAgo uses Date.now()
// no Redux; receives data + callbacks from parent AlarmsClient
import type { Alarm, AlarmSeverity } from '@/types'
import { Badge }   from '@/components/ui/Badge'
import { Button }  from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { CheckCircle, Trash2 } from '@/lib/icons'

type BadgeVariant = 'alarm' | 'warning' | 'ok' | 'offline' | 'idle' | 'info' | 'gold'

const SEVERITY_VARIANT: Record<AlarmSeverity, BadgeVariant> = {
  critical: 'alarm',
  high:     'alarm',
  medium:   'warning',
  low:      'gold',
  info:     'info',
}

const STRIP_CLASS: Record<AlarmSeverity, string> = {
  critical: 'bg-status-alarm',
  high:     'bg-status-alarm opacity-70',
  medium:   'bg-status-warning',
  low:      'bg-accent-gold',
  info:     'bg-accent-primary',
}

export function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
}

interface AlarmRowProps {
  alarm:          Alarm
  selected:       boolean
  isNew:          boolean
  canDelete:      boolean
  onSelect:       (id: string) => void
  onAcknowledge:  (id: string) => void
  onDelete:       (id: string) => void
}

export function AlarmRow({
  alarm, selected, isNew, canDelete, onSelect, onAcknowledge, onDelete,
}: AlarmRowProps) {
  const unacked = !alarm.acknowledged

  return (
    <div
      onClick={() => onSelect(alarm.id)}
      className={[
        'relative flex items-stretch border-b border-scada-border cursor-pointer transition-colors',
        isNew ? 'alarm-row-enter' : '',
        selected
          ? 'bg-scada-panel border-r-2 border-r-accent-primary'
          : unacked
            ? 'bg-scada-surface hover:bg-scada-panel'
            : 'bg-scada-bg hover:bg-scada-panel',
      ].join(' ')}
    >
      {/* Left severity strip */}
      <div className={`w-1 flex-shrink-0 ${unacked ? STRIP_CLASS[alarm.severity] : `${STRIP_CLASS[alarm.severity]} opacity-30`}`} />

      {/* Severity badge */}
      <div className="flex items-center px-3 py-3 w-24 flex-shrink-0">
        <Badge
          variant={SEVERITY_VARIANT[alarm.severity]}
          label={alarm.severity}
          className={
            unacked && (alarm.severity === 'critical' || alarm.severity === 'high')
              ? 'alarm-blink'
              : ''
          }
        />
      </div>

      {/* Main content */}
      <div className={`flex-1 min-w-0 py-3 ${unacked ? '' : 'opacity-60'}`}>
        {/* Line 1: message + source + time */}
        <div className="flex items-center justify-between gap-4 min-w-0">
          <span className="text-text-primary text-sm font-medium truncate">
            {alarm.message}
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-accent-primary font-mono text-xs">{alarm.source}</span>
            <span className="text-text-muted text-xs">{timeAgo(alarm.triggeredAt)}</span>
          </div>
        </div>
        {/* Line 2: timestamp · category · status */}
        <div className="flex items-center gap-1.5 mt-0.5 text-text-muted text-xs font-mono">
          <span>{formatDateTime(alarm.triggeredAt)}</span>
          <span className="opacity-40">·</span>
          <span>{alarm.category}</span>
          <span className="opacity-40">·</span>
          {unacked
            ? <span className="text-status-alarm">Unacknowledged</span>
            : <span className="text-status-ok">Acknowledged</span>
          }
        </div>
      </div>

      {/* Right actions */}
      <div
        className="flex items-center gap-2 px-3 flex-shrink-0"
        onClick={e => e.stopPropagation()}
      >
        {unacked ? (
          <Tooltip content="Acknowledge">
            <Button variant="ghost" size="sm" onClick={() => onAcknowledge(alarm.id)}
              icon={<CheckCircle size={14} className="text-text-muted" />}
            >
              {''}
            </Button>
          </Tooltip>
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <CheckCircle size={14} className="text-status-ok" />
            {alarm.acknowledgedBy && (
              <span className="text-text-muted text-[10px] font-mono max-w-20 truncate">
                {alarm.acknowledgedBy}
              </span>
            )}
          </div>
        )}

        {canDelete && (
          <Tooltip content="Delete alarm">
            <Button variant="ghost" size="sm" onClick={() => onDelete(alarm.id)}
              icon={<Trash2 size={14} className="text-text-muted" />}
            >
              {''}
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  )
}


