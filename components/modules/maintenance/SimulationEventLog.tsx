'use client'

// Client component — Section D: Simulation Event Log with type filters + export
import { Button } from '@/components/ui'
import { Download, Trash2 } from '@/lib/icons'
import type { SimEvent, SimEventType } from '@/lib/simulation/engine'

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterType = 'ALL' | SimEventType

const FILTERS: FilterType[] = ['ALL', 'MOVEMENT', 'DWELL', 'FAULT', 'SYSTEM', 'COMPLETE']

const EVENT_COLOR: Record<SimEventType, string> = {
  MOVEMENT: 'text-accent-primary',
  DWELL:    'text-accent-gold',
  FAULT:    'text-status-alarm',
  SYSTEM:   'text-text-muted',
  COMPLETE: 'text-status-ok',
}

const EVENT_LABEL: Record<SimEventType, string> = {
  MOVEMENT: '[MOVEMENT]',
  DWELL:    '[DWELL   ]',
  FAULT:    '[FAULT   ]',
  SYSTEM:   '[SYSTEM  ]',
  COMPLETE: '[COMPLETE]',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SimulationEventLogProps {
  events:          SimEvent[]
  eventFilter:     FilterType
  setEventFilter:  (f: FilterType) => void
  clearEvents:     () => void
  exportEvents:    () => void
}

export function SimulationEventLog({
  events,
  eventFilter,
  setEventFilter,
  clearEvents,
  exportEvents,
}: SimulationEventLogProps) {
  const filtered = eventFilter === 'ALL'
    ? events
    : events.filter(e => e.type === eventFilter)

  return (
    <div className="space-y-3">

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">

        {/* Filter pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setEventFilter(f)}
              className={`px-2.5 py-1 text-[10px] font-mono uppercase rounded-scada transition-colors
                ${eventFilter === f
                  ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/40'
                  : 'text-text-muted hover:text-text-primary border border-transparent'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={12} />}
            onClick={clearEvents}
          >
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Download size={12} />}
            onClick={exportEvents}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Log viewer */}
      <div className="h-96 overflow-y-auto space-y-0.5 bg-scada-bg border border-scada-border rounded-scada p-3">
        {filtered.length === 0 ? (
          <div className="text-text-muted text-xs font-mono text-center py-8">
            No events. Start the simulation to see activity.
          </div>
        ) : (
          filtered.map(evt => (
            <div
              key={evt.id}
              className="flex items-start gap-2 text-[11px] font-mono leading-snug"
            >
              <span className="text-accent-primary text-[10px] shrink-0 mt-px">
                [{evt.timestamp}]
              </span>
              <span className={`shrink-0 mt-px ${EVENT_COLOR[evt.type]}`}>
                {EVENT_LABEL[evt.type]}
              </span>
              <span className="text-text-primary break-all">
                {evt.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Entry count */}
      <div className="text-text-muted text-[10px] font-mono text-right">
        {filtered.length} entries{eventFilter !== 'ALL' ? ` (filter: ${eventFilter})` : ''} · max 500
      </div>
    </div>
  )
}

