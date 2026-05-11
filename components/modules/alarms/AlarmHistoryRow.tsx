// Pure display component — single history row + inline expanded detail
// onClick / onClose passed as props from AlarmHistoryTable (client component)

import { Badge }  from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from '@/lib/icons'
import type { AlarmHistoryEntry, AlarmSeverity } from '@/types'

interface AlarmHistoryRowProps {
  entry:      AlarmHistoryEntry
  expanded:   boolean
  isOdd:      boolean
  onClick:    () => void
  onClose:    () => void
}

const severityIcon: Record<AlarmSeverity, React.ReactNode> = {
  critical: <AlertCircle  size={14} className="text-status-alarm"   />,
  high:     <AlertOctagon size={14} className="text-status-alarm"   />,
  medium:   <AlertTriangle size={14} className="text-status-warning" />,
  low:      <AlertTriangle size={14} className="text-accent-gold"    />,
  info:     <Info          size={14} className="text-accent-primary" />,
}

const severityBadgeVariant: Record<AlarmSeverity, 'alarm' | 'warning' | 'gold' | 'info'> = {
  critical: 'alarm',
  high:     'alarm',
  medium:   'warning',
  low:      'gold',
  info:     'info',
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return iso
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

export function AlarmHistoryRow({ entry, expanded, isOdd, onClick, onClose }: AlarmHistoryRowProps) {
  const rowBg = entry.severity === 'critical'
    ? 'bg-status-alarm/5'
    : isOdd
      ? 'bg-scada-surface'
      : 'bg-scada-bg'

  const unackedStrip = !entry.acknowledged ? 'border-l-2 border-status-alarm' : ''

  return (
    <>
      {/* ── Main row ──────────────────────────────────────────────────────── */}
      <tr
        onClick={onClick}
        className={`${rowBg} ${unackedStrip} hover:bg-scada-panel cursor-pointer transition-colors`}
      >
        {/* Severity */}
        <td className="px-3 py-2 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            {severityIcon[entry.severity]}
            <Badge variant={severityBadgeVariant[entry.severity]} label={entry.severity} />
          </div>
        </td>

        {/* Message */}
        <td className="px-3 py-2 max-w-60">
          <div className="flex items-center justify-between gap-2">
            <span className="text-text-primary text-xs truncate">{entry.message}</span>
            <span className="text-text-muted shrink-0">
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </span>
          </div>
        </td>

        {/* Source */}
        <td className="px-3 py-2 whitespace-nowrap">
          <span className="text-accent-primary font-mono text-xs">{entry.source}</span>
        </td>

        {/* Category */}
        <td className="px-3 py-2 whitespace-nowrap">
          <span className="text-text-muted text-xs">{entry.category}</span>
        </td>

        {/* Triggered At */}
        <td className="px-3 py-2 whitespace-nowrap">
          <div className="font-mono text-xs text-text-muted">
            <div>{formatDate(entry.triggeredAt)}</div>
            <div className="text-text-value">{formatTimestamp(entry.triggeredAt)}</div>
          </div>
        </td>

        {/* Duration */}
        <td className="px-3 py-2 whitespace-nowrap">
          <span className="value-display text-xs text-text-value">{entry.duration}</span>
        </td>

        {/* Acknowledged By */}
        <td className="px-3 py-2 whitespace-nowrap">
          <span className="text-text-muted text-xs">
            {entry.acknowledgedBy ?? '—'}
          </span>
        </td>

        {/* Acknowledged At */}
        <td className="px-3 py-2 whitespace-nowrap">
          <span className="font-mono text-xs text-text-muted">
            {entry.acknowledgedAt ? formatTimestamp(entry.acknowledgedAt) : '—'}
          </span>
        </td>

        {/* Status */}
        <td className="px-3 py-2 whitespace-nowrap">
          {entry.acknowledged
            ? <Badge variant="ok"    label="ACKED"   />
            : <Badge variant="alarm" label="UNACKED" />
          }
        </td>
      </tr>

      {/* ── Expanded detail row ───────────────────────────────────────────── */}
      {expanded && (
        <tr className="bg-scada-panel">
          <td colSpan={9} className="px-6 py-4">
            <div className="flex flex-col gap-3">

              <div className="flex items-center justify-between">
                <span className="text-text-muted text-[10px] uppercase font-mono tracking-widest">
                  Alarm Detail
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: message + fault code + recommendation */}
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="text-text-muted text-[10px] font-mono uppercase">Full Message</span>
                    <p className="text-text-primary text-xs mt-0.5">{entry.fullMessage}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] font-mono uppercase">Fault Code</span>
                    <p className="text-accent-gold font-mono text-xs mt-0.5">{entry.faultCode}</p>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] font-mono uppercase">Recommended Action</span>
                    <p className="text-text-primary text-xs mt-0.5">{entry.recommendation}</p>
                  </div>
                </div>

                {/* Right: timeline */}
                <div>
                  <span className="text-text-muted text-[10px] font-mono uppercase">Timeline</span>
                  <div className="flex flex-col gap-1 mt-1.5 border-l border-scada-border pl-3">
                    <span className="text-text-muted text-xs font-mono">
                      {formatTimestamp(entry.triggeredAt)} → Alarm triggered
                    </span>
                    <span className="text-text-muted text-xs font-mono">
                      {formatTimestamp(
                        new Date(new Date(entry.triggeredAt).getTime() + 3000).toISOString()
                      )} → Operator notified
                    </span>
                    {entry.acknowledgedAt && entry.acknowledgedBy ? (
                      <span className="text-status-ok text-xs font-mono">
                        {formatTimestamp(entry.acknowledgedAt)} → Acknowledged by {entry.acknowledgedBy}
                      </span>
                    ) : (
                      <span className="text-status-alarm text-xs font-mono">
                        — Not yet acknowledged
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Close ↑
                </Button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}



