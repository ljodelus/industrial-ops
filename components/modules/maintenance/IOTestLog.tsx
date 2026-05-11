'use client'

// Client component — IO Test Log viewer with type-based coloring and export

import { useCallback } from 'react'
import { Button } from '@/components/ui'
import { Download } from '@/lib/icons'
import type { IOLogEntry, IOLogEntryType } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<IOLogEntryType, string> = {
  READ:    'text-accent-primary',
  FORCE:   'text-status-warning',
  RELEASE: 'text-status-ok',
  FAULT:   'text-status-alarm',
  MONITOR: 'text-text-muted',
}

const TYPE_LABEL: Record<IOLogEntryType, string> = {
  READ:    '[READ   ]',
  FORCE:   '[FORCE  ]',
  RELEASE: '[RELEASE]',
  FAULT:   '[FAULT  ]',
  MONITOR: '[MONITOR]',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface IOTestLogProps {
  entries:  IOLogEntry[]
  onClear:  () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function IOTestLog({ entries, onClear }: IOTestLogProps) {
  const handleExport = useCallback(() => {
    const text = entries.map(e =>
      `[${e.timestamp}]  ${TYPE_LABEL[e.type]}  ${e.address}  ${e.signalName}  ${e.detail}`
    ).join('\n')

    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `io-test-log-${new Date().toISOString().slice(0, 10)}.log`
    a.click()
    URL.revokeObjectURL(url)
  }, [entries])

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClear}>Clear</Button>
        <Button variant="ghost" size="sm" icon={<Download size={12} />} onClick={handleExport}>Export</Button>
      </div>

      {/* Log viewer */}
      <div className="h-56 overflow-y-auto space-y-0.5 bg-scada-bg border border-scada-border rounded-scada p-3">
        {entries.length === 0 ? (
          <div className="text-text-muted text-xs font-mono text-center py-8">
            No log entries.
          </div>
        ) : (
          entries.map(entry => (
            <div
              key={entry.id}
              className="flex items-start gap-2 text-[11px] font-mono leading-snug"
            >
              {/* Timestamp */}
              <span className="text-accent-primary text-[10px] shrink-0 mt-px">
                [{entry.timestamp}]
              </span>
              {/* Type badge */}
              <span className={`shrink-0 mt-px ${TYPE_COLOR[entry.type]}`}>
                {TYPE_LABEL[entry.type]}
              </span>
              {/* Address */}
              <span className="text-text-muted shrink-0 mt-px w-14">
                {entry.address}
              </span>
              {/* Signal name */}
              <span className="text-text-primary shrink-0 mt-px truncate w-48">
                {entry.signalName}
              </span>
              {/* Detail */}
              <span className="text-text-muted mt-px break-all">
                {entry.detail}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Count */}
      <div className="text-text-muted text-[10px] font-mono text-right">
        {entries.length} entries · max 200
      </div>
    </div>
  )
}

