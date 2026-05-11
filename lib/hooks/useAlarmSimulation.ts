'use client'

// Client hook — dispatches simulated alarms and returns the latest new alarm for UI feedback
import { useEffect, useState } from 'react'
import { useAppDispatch }      from '@/store/hooks'
import { addAlarm }            from '@/store/slices/alarmsSlice'
import type { Alarm }          from '@/types'

const RANDOM_ALARMS: Omit<Alarm, 'id' | 'triggeredAt' | 'acknowledged'>[] = [
  { severity: 'critical', category: 'Motion',        message: 'Motion timeout — CRANE-1',             source: 'CRANE-1'  },
  { severity: 'high',     category: 'Communication', message: 'PLC-LINE1 — communication timeout',    source: 'PLC-LINE1' },
  { severity: 'medium',   category: 'Sensor',        message: 'Temperature deviation — TANK-02',      source: 'TANK'     },
  { severity: 'low',      category: 'Process',       message: 'Crane speed reduced — CRANE-2',        source: 'CRANE-2'  },
  { severity: 'high',     category: 'Collision',     message: 'Zone conflict detected — ZONE-3',      source: 'ZONE'     },
  { severity: 'critical', category: 'Collision',     message: 'Emergency stop triggered — CRANE-4',   source: 'CRANE-4'  },
  { severity: 'medium',   category: 'Recipe',        message: 'Dwell time exceeded — TANK-09 step 2', source: 'TANK'     },
]

/**
 * Injects a simulated alarm every 15 seconds.
 * Returns the latest injected alarm so callers can show banners / pills.
 */
export function useAlarmSimulation(): Alarm | null {
  const dispatch                    = useAppDispatch()
  const [latest, setLatest]         = useState<Alarm | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const template = RANDOM_ALARMS[Math.floor(Math.random() * RANDOM_ALARMS.length)]
      const alarm: Alarm = {
        id:           `alarm-sim-${Date.now()}`,
        severity:     template.severity,
        category:     template.category,
        message:      template.message,
        source:       template.source,
        acknowledged: false,
        triggeredAt:  new Date().toISOString(),
      }
      dispatch(addAlarm(alarm))
      setLatest(alarm)
    }, 15_000)

    return () => clearInterval(interval)
  }, [dispatch])

  return latest
}

