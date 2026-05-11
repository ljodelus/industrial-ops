'use client'

// Client component: runs simulation hook, reads Redux state for KPIs, manages last-updated timestamp

import { useEffect, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectUnacknowledgedCount } from '@/store/slices/alarmsSlice'
import { selectActiveJobs, selectPendingJobs } from '@/store/slices/jobsSlice'
import { selectAllCranes } from '@/store/slices/cranesSlice'
import { StatCard } from '@/components/ui/StatCard'
import { LineCard } from './LineCard'
import { ActiveAlarmsPanel } from './ActiveAlarmsPanel'
import { JobQueueSnapshot } from './JobQueueSnapshot'
import { useOverviewSimulation } from '@/lib/hooks/useOverviewSimulation'

export function OverviewClient() {
  useOverviewSimulation()

  const unackCount  = useAppSelector(selectUnacknowledgedCount)
  const activeJobs  = useAppSelector(selectActiveJobs)
  const pendingJobs = useAppSelector(selectPendingJobs)
  const cranes      = useAppSelector(selectAllCranes)

  const cranesOnline = cranes.filter(c => c.status !== 'offline' && c.status !== 'error').length
  const totalCranes  = cranes.length

  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString('en-GB', { hour12: false })
    setLastUpdated(fmt())
    const id = setInterval(() => setLastUpdated(fmt()), 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="space-y-6">

      {/* Zone 1 — KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="ACTIVE JOBS"
          value={activeJobs.length}
          subtitle="jobs in progress"
          accent="primary"
          trend="stable"
        />
        <StatCard
          title="PENDING JOBS"
          value={pendingJobs.length}
          subtitle="awaiting assignment"
          accent="gold"
          trend="up"
        />
        <StatCard
          title="ACTIVE ALARMS"
          value={unackCount}
          subtitle="unacknowledged"
          accent={unackCount > 0 ? 'alarm' : 'ok'}
          trend="down"
        />
        <StatCard
          title="CRANES ONLINE"
          value={`${cranesOnline} / ${totalCranes}`}
          subtitle="LINE-1 · LINE-2"
          accent="ok"
          trend="stable"
        />
      </div>

      {/* Zone 2 — Production Lines */}
      <div className="space-y-4">
        <LineCard line="LINE-1" status="RUNNING" />
        <LineCard line="LINE-2" status="RUNNING" />
      </div>

      {/* Zone 3 + 4 — Alarms + Job Queue */}
      <div className="grid grid-cols-2 gap-4">
        <ActiveAlarmsPanel />
        <JobQueueSnapshot />
      </div>

      {/* Last updated timestamp */}
      <div className="flex justify-end">
        <span className="text-text-muted text-xs font-mono">
          Last updated: {lastUpdated}
        </span>
      </div>

    </div>
  )
}
