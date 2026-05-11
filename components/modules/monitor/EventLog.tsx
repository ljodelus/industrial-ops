'use client'

// Client component: renders scrollable event list; Clear button mutates local state (passed via onClear)
// Slide-in animation uses .event-slide-in CSS class defined in globals.css

import type { LiveEvent, EventType } from '@/lib/hooks/useMonitorSimulation'
import { Card }       from '@/components/ui/Card'
import { Button }     from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  Play,
  Circle,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Square,
} from '@/lib/icons'

// ─── Event type config ────────────────────────────────────────────────────────

interface EventConfig {
  icon:      React.ReactNode
  colorClass: string
}

const EVENT_CONFIG: Record<EventType, EventConfig> = {
  transfer_start: { icon: <Play          size={12} />, colorClass: 'text-accent-primary'  },
  part_placed:    { icon: <Circle        size={12} />, colorClass: 'text-status-ok'       },
  warning:        { icon: <AlertTriangle size={12} />, colorClass: 'text-status-warning'  },
  job_assigned:   { icon: <Play          size={12} />, colorClass: 'text-accent-gold'     },
  dwell_complete: { icon: <CheckCircle   size={12} />, colorClass: 'text-status-ok'       },
  alarm:          { icon: <AlertCircle   size={12} />, colorClass: 'text-status-alarm'    },
  crane_stopped:  { icon: <Square        size={12} />, colorClass: 'text-status-offline'  },
}

// ─── Component ────────────────────────────────────────────────────────────────

interface EventLogProps {
  events:  LiveEvent[]
  onClear: () => void
}

export function EventLog({ events, onClear }: EventLogProps) {
  return (
    <Card
      title="EVENT LOG"
      accent="primary"
      action={
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      }
      noPadding
    >
      <div className="max-h-72 overflow-y-auto">
        {events.length === 0 ? (
          <div className="p-4">
            <EmptyState message="No events recorded." />
          </div>
        ) : (
          <div className="divide-y divide-scada-border">
            {events.map((event, index) => {
              const config   = EVENT_CONFIG[event.type]
              const isNewest = index === 0

              return (
                <div
                  key={event.id}
                  className={`flex items-center gap-3 px-4 py-2.5 ${isNewest ? 'event-slide-in' : ''}`}
                >
                  {/* Timestamp */}
                  <span className="text-text-muted font-mono text-[10px] w-13 shrink-0 tabular-nums">
                    {event.timestamp}
                  </span>

                  {/* Event icon */}
                  <span className={`shrink-0 flex items-center ${config.colorClass}`}>
                    {config.icon}
                  </span>

                  {/* Message */}
                  <span className="text-text-primary text-xs flex-1 min-w-0 truncate">
                    {event.message}
                  </span>

                  {/* Source */}
                  <span className="text-text-muted font-mono text-[10px] shrink-0 hidden sm:block">
                    {event.source}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}


