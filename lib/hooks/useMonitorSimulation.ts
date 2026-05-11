'use client'

// Client hook: manages local simulation state with useEffect + useState

import { useEffect, useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventType =
  | 'transfer_start'
  | 'part_placed'
  | 'warning'
  | 'job_assigned'
  | 'dwell_complete'
  | 'alarm'
  | 'crane_stopped'

export interface LiveEvent {
  id:        string
  timestamp: string
  type:      EventType
  message:   string
  source:    string
}

export interface ETARow {
  id:            string
  job:           string
  recipe:        string
  currentTank:   string
  nextTank:      string
  dwellSeconds:  number  // -1 = pending (no countdown)
  etaTransfer:   string
  crane:         string
  status:        'IN PROGRESS' | 'PENDING' | 'TRANSFERRING'
  flashing:      boolean
}

export interface ZoneStatus {
  id:        string
  name:      string
  cranePair: string
  distance:  number
}

// ─── Initial data ─────────────────────────────────────────────────────────────

const INITIAL_ETA_ROWS: ETARow[] = [
  { id: 'job-001', job: 'JOB-001', recipe: 'ZINC STANDARD',   currentTank: 'DEGREASE (T2)',  nextTank: 'RINSE 1 (T3)',   dwellSeconds: 272, etaTransfer: '05:10', crane: 'CRANE-1', status: 'IN PROGRESS', flashing: false },
  { id: 'job-003', job: 'JOB-003', recipe: 'ZINC STANDARD',   currentTank: 'RINSE 1 (T3)',   nextTank: 'ZINC BATH (T4)', dwellSeconds: 495, etaTransfer: '09:00', crane: 'CRANE-1', status: 'IN PROGRESS', flashing: false },
  { id: 'job-005', job: 'JOB-005', recipe: 'PHOSPHATE LIGHT', currentTank: 'LOAD (T1)',       nextTank: 'DEGREASE (T2)',  dwellSeconds: 130, etaTransfer: '02:45', crane: 'CRANE-3', status: 'IN PROGRESS', flashing: false },
  { id: 'job-006', job: 'JOB-006', recipe: 'PHOSPHATE LIGHT', currentTank: 'PHOSPHATE (T3)', nextTank: 'RINSE (T4)',     dwellSeconds: 45,  etaTransfer: '01:20', crane: 'CRANE-3', status: 'IN PROGRESS', flashing: false },
  { id: 'job-002', job: 'JOB-002', recipe: 'PHOSPHATE LIGHT', currentTank: '—',               nextTank: 'LOAD (T1)',      dwellSeconds: -1,  etaTransfer: '03:00', crane: '—',       status: 'PENDING',     flashing: false },
]

const INITIAL_EVENTS: LiveEvent[] = [
  { id: 'e1', timestamp: '08:14:32', type: 'transfer_start', message: 'CRANE-1 started transfer to RINSE 1',       source: 'CRANE-1'  },
  { id: 'e2', timestamp: '08:14:28', type: 'part_placed',    message: 'PART-0042 placed in DEGREASE (T2)',           source: 'TANK-02'  },
  { id: 'e3', timestamp: '08:14:15', type: 'warning',        message: 'Speed reduced — approaching shared zone',    source: 'CRANE-2'  },
  { id: 'e4', timestamp: '08:13:50', type: 'job_assigned',   message: 'JOB-003 assigned to CRANE-1',                source: 'SYSTEM'   },
  { id: 'e5', timestamp: '08:13:30', type: 'dwell_complete', message: 'PART-0039 dwell complete in RINSE 1',        source: 'TANK-03'  },
  { id: 'e6', timestamp: '08:12:55', type: 'alarm',          message: 'PLC communication retry — LINE-2',           source: 'PLC-LINE2'},
  { id: 'e7', timestamp: '08:12:10', type: 'transfer_start', message: 'CRANE-3 started transfer to PHOSPHATE',      source: 'CRANE-3'  },
  { id: 'e8', timestamp: '08:11:40', type: 'part_placed',    message: 'PART-0048 placed in PHOSPHATE (T3)',          source: 'TANK-03'  },
]

const INITIAL_ZONES: ZoneStatus[] = [
  { id: 'zone-a', name: 'ZONE-A', cranePair: 'CRANE-1 / CRANE-3', distance: 1850 },
  { id: 'zone-b', name: 'ZONE-B', cranePair: 'CRANE-2 / CRANE-3', distance: 620  },
  { id: 'zone-c', name: 'ZONE-C', cranePair: 'CRANE-1 / CRANE-4', distance: 2100 },
]

const EVENT_TEMPLATES: { type: EventType; message: string; source: string }[] = [
  { type: 'transfer_start', message: 'CRANE-2 started transfer to ZINC BATH',    source: 'CRANE-2'  },
  { type: 'part_placed',    message: 'PART-0053 placed in RINSE 1 (T3)',          source: 'TANK-03'  },
  { type: 'warning',        message: 'Dwell approaching maximum — TANK-04',       source: 'TANK-04'  },
  { type: 'job_assigned',   message: 'JOB-007 assigned to CRANE-2',               source: 'SYSTEM'   },
  { type: 'dwell_complete', message: 'PART-0044 dwell complete in ZINC BATH',     source: 'TANK-04'  },
  { type: 'alarm',          message: 'Encoder signal lost — CRANE-4',             source: 'CRANE-4'  },
  { type: 'crane_stopped',  message: 'CRANE-4 emergency stop triggered',           source: 'CRANE-4'  },
  { type: 'transfer_start', message: 'CRANE-1 started transfer to ZINC BATH',     source: 'CRANE-1'  },
  { type: 'part_placed',    message: 'PART-0061 placed in LOAD (T1)',              source: 'TANK-01'  },
  { type: 'dwell_complete', message: 'PART-0055 dwell complete in DEGREASE (T2)', source: 'TANK-02'  },
]

// ─── Utilities ────────────────────────────────────────────────────────────────

export function formatSeconds(s: number): string {
  if (s < 0) return '—'
  const m   = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function nowTimestamp(): string {
  const d = new Date()
  return [
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
    String(d.getSeconds()).padStart(2, '0'),
  ].join(':')
}

function randomDwell(): number {
  // Random dwell between 2:00 (120s) and 9:00 (540s)
  return Math.floor(Math.random() * (540 - 120 + 1)) + 120
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMonitorSimulation() {
  const [etaRows, setEtaRows] = useState<ETARow[]>(INITIAL_ETA_ROWS)
  const [events,  setEvents]  = useState<LiveEvent[]>(INITIAL_EVENTS)
  const [zones,   setZones]   = useState<ZoneStatus[]>(INITIAL_ZONES)

  const clearEvents = useCallback(() => setEvents([]), [])

  // ETA countdown — every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setEtaRows(prev =>
        prev.map(row => {
          if (row.dwellSeconds <= 0) return row

          const next = row.dwellSeconds - 1

          if (next === 0) {
            // Flash for 3 seconds then reset with new random dwell
            setTimeout(() => {
              setEtaRows(curr =>
                curr.map(r => {
                  if (r.id !== row.id) return r
                  return { ...r, dwellSeconds: randomDwell(), status: 'IN PROGRESS', flashing: false }
                }),
              )
            }, 3000)
            return { ...row, dwellSeconds: 0, status: 'TRANSFERRING', flashing: true }
          }

          return { ...row, dwellSeconds: next }
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Zone distance simulation — every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setZones(prev =>
        prev.map(zone => {
          if (zone.id === 'zone-b') {
            // Oscillate between 500mm and 800mm → always CAUTION/CLEAR transitions
            const delta   = (Math.random() - 0.5) * 80
            const clamped = Math.max(500, Math.min(800, zone.distance + delta))
            return { ...zone, distance: Math.round(clamped) }
          }
          // Other zones: subtle random drift (always > 1000mm → CLEAR)
          const delta = (Math.random() - 0.5) * 40
          return { ...zone, distance: Math.round(zone.distance + delta) }
        }),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Event log simulation — every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)]
      const newEvent: LiveEvent = {
        id:        `event-${Date.now()}`,
        timestamp: nowTimestamp(),
        type:      template.type,
        message:   template.message,
        source:    template.source,
      }
      setEvents(prev => [newEvent, ...prev].slice(0, 50))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return { etaRows, events, zones, clearEvents, formatSeconds }
}

