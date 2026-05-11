'use client'

// Client component — uses useState for expand/collapse toggle

import { useState } from 'react'
import type { RecipeVersionRecord } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { ChevronDown, ChevronUp } from '@/lib/icons'

interface RecipeVersionHistoryProps {
  history: RecipeVersionRecord[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day:   '2-digit',
    year:  'numeric',
  })
}

export function RecipeVersionHistory({ history }: RecipeVersionHistoryProps) {
  const [expanded, setExpanded] = useState(false)

  if (!history || history.length === 0) return null

  return (
    <div className="border border-scada-border rounded-scada overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-2 bg-scada-panel text-text-muted hover:text-text-primary transition-colors text-xs font-mono uppercase tracking-wider"
      >
        <span>Version History</span>
        {expanded
          ? <ChevronUp size={14} className="text-text-muted" />
          : <ChevronDown size={14} className="text-text-muted" />
        }
      </button>

      {/* History rows */}
      {expanded && (
        <div className="divide-y divide-scada-border">
          {history.map((entry) => (
            <div
              key={entry.version}
              className="flex items-start gap-3 px-4 py-2 bg-scada-bg hover:bg-scada-surface transition-colors"
            >
              <div className="shrink-0 pt-0.5">
                <Badge variant="gold" label={`v${entry.version}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-text-muted text-xs font-mono">
                    {formatDate(entry.date)}
                  </span>
                  <span className="text-text-primary text-xs font-mono">
                    {entry.author}
                  </span>
                </div>
                <p className="text-text-muted text-xs font-mono italic mt-0.5 truncate">
                  &ldquo;{entry.note}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


