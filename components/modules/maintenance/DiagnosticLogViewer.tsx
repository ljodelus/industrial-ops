'use client'

// Client component — requires useState for log level filter

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui'
import { Download } from '@/lib/icons'
import type { DiagnosticLogEntry, DiagnosticLogLevel } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterLevel = 'ALL' | DiagnosticLogLevel

const LEVEL_COLOR: Record<DiagnosticLogLevel, string> = {
  INFO:  'text-text-muted',
  WARN:  'text-status-warning',
  ERROR: 'text-status-alarm',
}

const LEVEL_LABEL: Record<DiagnosticLogLevel, string> = {
  INFO:  '[INFO ]',
  WARN:  '[WARN ]',
  ERROR: '[ERROR]',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface DiagnosticLogViewerProps {
  entries:  DiagnosticLogEntry[]
  clearLog: () => void
}

export function DiagnosticLogViewer({ entries, clearLog }: DiagnosticLogViewerProps) {
  const [filter, setFilter] = useState<FilterLevel>('ALL')

  const filtered = filter === 'ALL'
    ? entries
    : entries.filter(e => e.level === filter)

  const handleExport = useCallback(() => {
    const text = entries.map(e =>
      `[${e.timestamp}]  ${LEVEL_LABEL[e.level]}  ${e.message}`
    ).join('\n')

    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `diagnostics-${new Date().toISOString().slice(0, 10)}.log`
    a.click()
    URL.revokeObjectURL(url)
  }, [entries])

  const FILTERS: FilterLevel[] = ['ALL', 'INFO', 'WARN', 'ERROR']

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Level filter pills */}
        <div className="flex items-center gap-1">
          {FILTERS.map(lvl => (
            <button
              key={lvl}
              type="button"
              onClick={() => setFilter(lvl)}
              className={`
                px-2.5 py-1 text-[10px] font-mono uppercase rounded-scada transition-colors
                ${filter === lvl
                  ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/40'
                  : 'text-text-muted hover:text-text-primary border border-transparent'
                }
              `}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearLog}>
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Download size={12} />}
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Log viewer */}
      <div className="h-64 overflow-y-auto space-y-0.5 bg-scada-bg border border-scada-border rounded-scada p-3">
        {filtered.length === 0 ? (
          <div className="text-text-muted text-xs font-mono text-center py-8">
            No log entries.
          </div>
        ) : (
          filtered.map(entry => (
            <div
              key={entry.id}
              className="flex items-start gap-2 text-[11px] font-mono leading-snug event-slide-in"
            >
              <span className="text-accent-primary text-[10px] shrink-0 mt-px">
                [{entry.timestamp}]
              </span>
              <span className={`shrink-0 mt-px ${LEVEL_COLOR[entry.level]}`}>
                {LEVEL_LABEL[entry.level]}
              </span>
              <span className="text-text-primary break-all">
                {entry.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Entry count */}
      <div className="text-text-muted text-[10px] font-mono text-right">
        {filtered.length} entries{filter !== 'ALL' ? ` (filtered: ${filter})` : ''} · max 200
      </div>
    </div>
  )
}

