'use client'
// Client component — single audit row with inline expand detail

import { Badge } from '@/components/ui'
import { ChevronDown, ChevronUp } from '@/lib/icons'
import type { AuditEntry, AuditCategory } from '@/types'

const CATEGORY_BADGE: Record<AuditCategory, 'info' | 'gold' | 'ok' | 'warning' | 'alarm' | 'offline' | 'idle'> = {
  'Authentication':   'info',
  'User Management':  'gold',
  'Recipe':           'info',
  'Job':              'info',
  'Alarm':            'warning',
  'Configuration':    'alarm',
  'IO Force':         'alarm',
  'System':           'offline',
  'Security':         'alarm',
}

const CATEGORY_LABELS: Record<AuditCategory, string> = {
  'Authentication':  'Auth',
  'User Management': 'User Mgmt',
  'Recipe':          'Recipe',
  'Job':             'Job',
  'Alarm':           'Alarm',
  'Configuration':   'Config',
  'IO Force':        'IO Force',
  'System':          'System',
  'Security':        'Security',
}

function rowBg(entry: AuditEntry, isEven: boolean): string {
  if (entry.result === 'FAILURE' || entry.category === 'Security') return 'bg-status-alarm/5'
  if (entry.category === 'IO Force') return 'bg-accent-gold/5'
  if (entry.severity === 'warning') return 'bg-status-warning/5'
  return isEven ? 'bg-scada-surface' : 'bg-scada-bg'
}

interface AuditRowProps {
  entry:      AuditEntry
  isEven:     boolean
  isExpanded: boolean
  onToggle:   () => void
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-text-muted text-xs font-mono w-32 shrink-0">{label}</span>
      <span className="text-text-primary text-xs font-mono">{value}</span>
    </div>
  )
}

export function AuditRow({ entry, isEven, isExpanded, onToggle }: AuditRowProps) {
  const bg = rowBg(entry, isEven)
  const showBeforeAfter = ['Recipe', 'Configuration', 'User Management'].includes(entry.category)
  const showSecurity    = entry.category === 'Security'
  const showIOForce     = entry.category === 'IO Force'

  const resultVariant =
    entry.result === 'SUCCESS' ? 'ok' :
    entry.result === 'FAILURE' ? 'alarm' : 'warning'

  const severityVariant =
    entry.severity === 'info'     ? 'info' :
    entry.severity === 'warning'  ? 'warning' : 'alarm'

  const ts = new Date(entry.timestamp)
  const dateStr = ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr = ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <>
      <tr
        className={`${bg} hover:bg-scada-panel cursor-pointer border-b border-scada-border transition-colors`}
        onClick={onToggle}
      >
        <td className="px-3 py-2 font-mono text-xs text-text-muted whitespace-nowrap">
          {dateStr}<br />{timeStr}
        </td>
        <td className="px-3 py-2">
          <Badge variant={CATEGORY_BADGE[entry.category]} label={CATEGORY_LABELS[entry.category]} />
        </td>
        <td className="px-3 py-2 font-mono text-xs text-text-primary whitespace-nowrap">{entry.user}</td>
        <td className="px-3 py-2 text-xs text-text-primary max-w-xs truncate">{entry.action}</td>
        <td className="px-3 py-2 font-mono text-xs text-accent-primary whitespace-nowrap">{entry.target}</td>
        <td className="px-3 py-2 font-mono text-xs text-text-muted whitespace-nowrap">{entry.ipAddress}</td>
        <td className="px-3 py-2">
          <Badge variant={resultVariant} label={entry.result} />
        </td>
        <td className="px-3 py-2">
          <Badge variant={severityVariant} label={entry.severity.toUpperCase()} />
        </td>
        <td className="px-3 py-2">
          {isExpanded
            ? <ChevronUp size={14} className="text-text-muted" />
            : <ChevronDown size={14} className="text-text-muted" />}
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-scada-panel border-b border-scada-border">
          <td colSpan={9} className="px-6 py-4">
            <div className="border border-scada-border rounded-scada p-4 space-y-4">
              <div className="text-text-muted text-[10px] font-mono uppercase tracking-wider mb-2">Event Detail</div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <DetailField label="Event ID:"    value={entry.eventId} />
                <DetailField label="Session ID:"  value={entry.sessionId} />
                <DetailField label="User Agent:"  value={entry.userAgent} />
                <DetailField label="Duration:"    value={entry.duration} />
              </div>

              {showBeforeAfter && (entry.beforeState || entry.afterState) && (
                <div className="space-y-1 pt-2 border-t border-scada-border">
                  {entry.beforeState && (
                    <div className="flex gap-4">
                      <span className="text-text-muted text-xs font-mono w-32 shrink-0">BEFORE STATE</span>
                      <span className="text-status-alarm text-xs font-mono">{entry.beforeState}</span>
                    </div>
                  )}
                  {entry.afterState && (
                    <div className="flex gap-4">
                      <span className="text-text-muted text-xs font-mono w-32 shrink-0">AFTER STATE</span>
                      <span className="text-status-ok text-xs font-mono">{entry.afterState}</span>
                    </div>
                  )}
                  {entry.changes && (
                    <div className="flex gap-4">
                      <span className="text-text-muted text-xs font-mono w-32 shrink-0">Changes:</span>
                      <span className="text-text-primary text-xs font-mono">{entry.changes}</span>
                    </div>
                  )}
                </div>
              )}

              {showSecurity && (
                <div className="space-y-1 pt-2 border-t border-scada-border">
                  {entry.attemptCount !== undefined && (
                    <DetailField label="Attempt Count:" value={String(entry.attemptCount)} />
                  )}
                  {entry.geoHint && (
                    <DetailField label="Geo Hint:" value={entry.geoHint} />
                  )}
                </div>
              )}

              {showIOForce && (
                <div className="space-y-1 pt-2 border-t border-scada-border">
                  {entry.signalAddress && <DetailField label="Signal Address:" value={entry.signalAddress} />}
                  {entry.previousValue && <DetailField label="Previous Value:" value={entry.previousValue} />}
                  {entry.forcedValue   && <DetailField label="Forced Value:"   value={entry.forcedValue} />}
                  {entry.forceDuration && <DetailField label="Force Duration:"  value={entry.forceDuration} />}
                </div>
              )}

              {entry.additionalContext && (
                <div className="pt-2 border-t border-scada-border">
                  <div className="text-text-muted text-[10px] font-mono uppercase tracking-wider mb-1">Additional Context</div>
                  <p className="text-text-primary text-xs font-mono">{entry.additionalContext}</p>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  onClick={onToggle}
                  className="text-text-muted text-xs font-mono hover:text-text-primary transition-colors"
                >
                  Close ↑
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}


