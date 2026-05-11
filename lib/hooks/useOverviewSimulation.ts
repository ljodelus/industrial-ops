'use client'

import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updatePosition } from '@/store/slices/cranesSlice'
import { updateDwellProgress, setOccupied, setFreeTicks, decrementFreeTicks } from '@/store/slices/tanksSlice'
import { addAlarm } from '@/store/slices/alarmsSlice'
import { selectAllCranes } from '@/store/slices/cranesSlice'
import { selectAllTanks } from '@/store/slices/tanksSlice'
import type { Alarm } from '@/types'

// Crane oscillation boundaries (mm)
const CRANE_BOUNDS: Record<string, { min: number; max: number; step: number; fixed?: boolean }> = {
  'crane-1': { min: 2800, max: 4200, step: 150 },
  'crane-2': { min: 800,  max: 800,  step: 0, fixed: true },
  'crane-3': { min: 5500, max: 6800, step: 150 },
  'crane-4': { min: 2400, max: 2400, step: 0, fixed: true },
}

const RANDOM_ALARMS: Omit<Alarm, 'id' | 'triggeredAt' | 'acknowledged' | 'category'>[] = [
  { severity: 'low',    message: 'Temperature deviation — TANK-02', source: 'TANK-02' },
  { severity: 'medium', message: 'Crane speed reduced — CRANE-1',   source: 'CRANE-1' },
  { severity: 'high',   message: 'Zone conflict detected',           source: 'ZONE-3'  },
]

export function useOverviewSimulation() {
  const dispatch = useAppDispatch()
  const cranes   = useAppSelector(selectAllCranes)
  const tanks    = useAppSelector(selectAllTanks)

  // Track crane directions in a ref to avoid stale closures
  const craneDirections = useRef<Record<string, 1 | -1>>({
    'crane-1': 1,
    'crane-3': 1,
  })

  // Keep latest cranes/tanks in refs so intervals always see fresh data
  const cranesRef = useRef(cranes)
  const tanksRef  = useRef(tanks)
  useEffect(() => { cranesRef.current = cranes }, [cranes])
  useEffect(() => { tanksRef.current  = tanks  }, [tanks])

  useEffect(() => {
    // Interval 1: every 2000ms — crane positions + tank dwell
    const interval1 = setInterval(() => {
      // Update crane positions
      cranesRef.current.forEach(crane => {
        const bounds = CRANE_BOUNDS[crane.id]
        if (!bounds || bounds.fixed) return

        const dir = craneDirections.current[crane.id] ?? 1
        let next  = crane.position + dir * bounds.step

        if (next >= bounds.max) {
          next = bounds.max
          craneDirections.current[crane.id] = -1
        } else if (next <= bounds.min) {
          next = bounds.min
          craneDirections.current[crane.id] = 1
        }

        dispatch(updatePosition({ id: crane.id, position: next }))
      })

      // Update tank dwell progress
      tanksRef.current.forEach(tank => {
        if (!tank.occupied) {
          // Count down free ticks before re-occupying
          if (tank.freeTicksRemaining !== undefined && tank.freeTicksRemaining > 0) {
            dispatch(decrementFreeTicks(tank.id))
          } else if (tank.freeTicksRemaining === 0) {
            // Re-occupy with a new part
            const partId = `PART-${String(Math.floor(Math.random() * 9000) + 1000)}`
            dispatch(setOccupied({ id: tank.id, occupied: true, currentPart: partId }))
          }
          return
        }

        const increment = 1 + Math.random()
        const next      = tank.dwellProgress + increment

        if (next >= 100) {
          // Tank reaches 100% — free it for 3 ticks
          dispatch(setOccupied({ id: tank.id, occupied: false, currentPart: undefined }))
          dispatch(setFreeTicks({ id: tank.id, ticks: 3 }))
        } else {
          dispatch(updateDwellProgress({ id: tank.id, dwellProgress: Math.min(100, next) }))
        }
      })
    }, 2000)

    // Interval 2: every 15000ms — add a random alarm
    const interval2 = setInterval(() => {
      const template = RANDOM_ALARMS[Math.floor(Math.random() * RANDOM_ALARMS.length)]
      const alarm: Alarm = {
        id:          `alarm-sim-${Date.now()}`,
        severity:    template.severity,
        category:    'Simulation',
        message:     template.message,
        source:      template.source,
        acknowledged: false,
        triggeredAt: new Date().toISOString(),
      }
      dispatch(addAlarm(alarm))
    }, 15000)

    return () => {
      clearInterval(interval1)
      clearInterval(interval2)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])
}
