'use client'

import { createContext, useContext, useState } from 'react'
import type { Alarm } from '@/types'
import { mockAlarms } from '@/lib/mock/alarms'

interface AlarmContextValue {
  alarms: Alarm[]
  unacknowledgedCount: number
  acknowledge: (id: string, by: string) => void
}

const AlarmContext = createContext<AlarmContextValue | null>(null)

export function AlarmProvider({ children }: { children: React.ReactNode }) {
  const [alarms, setAlarms] = useState<Alarm[]>(mockAlarms)

  const unacknowledgedCount = alarms.filter((a) => !a.acknowledged).length

  const acknowledge = (id: string, by: string) => {
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, acknowledged: true, acknowledgedBy: by, acknowledgedAt: new Date().toISOString() }
          : a
      )
    )
  }

  return (
    <AlarmContext.Provider value={{ alarms, unacknowledgedCount, acknowledge }}>
      {children}
    </AlarmContext.Provider>
  )
}

export function useAlarms() {
  const ctx = useContext(AlarmContext)
  if (!ctx) throw new Error('useAlarms must be used within AlarmProvider')
  return ctx
}
