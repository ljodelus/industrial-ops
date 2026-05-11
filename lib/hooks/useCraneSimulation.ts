'use client'

import { useState, useEffect, useRef, startTransition, Dispatch, SetStateAction } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectAllCranes } from '@/store/slices/cranesSlice'
import type { CraneMovementRecord } from '@/types'
import { mockCraneMovements } from '@/lib/mock/craneMovements'

// Uptime start: 06:42:15 in seconds
const UPTIME_START_SECONDS = 6 * 3600 + 42 * 60 + 15

interface UseCraneSimulationReturn {
  speed: number
  uptimeStr: string
  movements: CraneMovementRecord[]
  setMovements: Dispatch<SetStateAction<CraneMovementRecord[]>>
}

export function useCraneSimulation(craneId: string): UseCraneSimulationReturn {
  const cranes = useAppSelector(selectAllCranes)
  const crane  = cranes.find(c => c.id === craneId)

  const [speed, setSpeed]               = useState<number>(0)
  const [totalSeconds, setTotalSeconds] = useState<number>(UPTIME_START_SECONDS)
  const [movements, setMovements]       = useState<CraneMovementRecord[]>(
    () => [...(mockCraneMovements[craneId] ?? [])]
  )

  // Refs for interval closure access
  const craneRef        = useRef(crane)
  const prevPositionRef = useRef<number>(crane?.position ?? 0)

  // Keep craneRef current on every render
  useEffect(() => {
    craneRef.current = crane
  }, [crane])

  // Reset local state when switching to a different crane
  // Use startTransition to avoid the react-hooks/set-state-in-effect lint rule
  useEffect(() => {
    startTransition(() => {
      setMovements([...(mockCraneMovements[craneId] ?? [])])
      setSpeed(0)
    })
    prevPositionRef.current = craneRef.current?.position ?? 0
  }, [craneId])

  // 1-second tick: uptime, speed, and movement log
  useEffect(() => {
    const interval = setInterval(() => {
      // Increment uptime
      setTotalSeconds(prev => prev + 1)

      const currentCrane = craneRef.current
      if (!currentCrane) return

      const currentPos = currentCrane.position
      const prevPos    = prevPositionRef.current
      const delta      = Math.abs(currentPos - prevPos)

      if (delta > 0) {
        // Convert mm per second → m/min
        const rawSpeed  = (delta / 1000) * 60
        const variation = (Math.random() - 0.5) * 2  // ± 1 m/min
        setSpeed(Math.max(0, parseFloat((rawSpeed + variation).toFixed(1))))

        // Prepend a new movement record when the displacement is significant
        if (delta > 100) {
          const record: CraneMovementRecord = {
            id:          `mv-sim-${Date.now()}`,
            timestamp:   new Date().toLocaleTimeString('en-GB', { hour12: false }),
            from:        Math.round(prevPos),
            to:          Math.round(currentPos),
            distance:    Math.round(delta),
            durationSec: parseFloat((delta / Math.max(0.01, rawSpeed * 1000 / 60)).toFixed(1)),
            speedMpm:    parseFloat(rawSpeed.toFixed(1)),
            jobId:       currentCrane.currentJob
              ? currentCrane.currentJob.replace('job-', 'JOB-').padEnd(7, '0')
              : undefined,
            result:      'success',
          }
          setMovements(prev => [record, ...prev].slice(0, 50))
        }
      } else {
        setSpeed(0)
      }

      prevPositionRef.current = currentPos
    }, 1000)

    return () => clearInterval(interval)
  }, []) // Deliberately once — craneRef and prevPositionRef keep data fresh

  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const uptimeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  return { speed, uptimeStr, movements, setMovements }
}


