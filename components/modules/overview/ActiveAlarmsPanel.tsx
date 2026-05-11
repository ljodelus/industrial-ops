'use client'

// Client component: uses useAppSelector (Redux), useRouter, and time-ago updates

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { selectAllAlarms } from '@/store/slices/alarmsSlice'
import { selectUnacknowledgedCount } from '@/store/slices/alarmsSlice'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { BellOff, AlertCircle, AlertOctagon, AlertTriangle, Info } from '@/lib/icons'
import type { Alarm, AlarmSeverity } from '@/types'

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)  return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

const SEVERITY_ICON: Record<AlarmSeverity, React.ReactNode> = {
  critical: <AlertCircle   size={14} className="text-status-alarm  shrink-0" />,
  high:     <AlertOctagon  size={14} className="text-status-alarm  shrink-0" />,
  medium:   <AlertTriangle size={14} className="text-status-warning shrink-0" />,
  low:      <Info          size={14} className="text-status-idle   shrink-0" />,
  info:     <Info          size={14} className="text-text-muted    shrink-0" />,
}

export function ActiveAlarmsPanel() {
  const router       = useRouter()
  const allAlarms    = useAppSelector(selectAllAlarms)
  const unackCount   = useAppSelector(selectUnacknowledgedCount)
  const [, setTick]  = useState(0)

  // Refresh time-ago labels every 30 seconds
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const top5 = allAlarms
    .filter(a => !a.acknowledged)
    .slice(0, 5)

  const navigateToAlarms = () => router.push('/alarms')

  return (
    <Card
      title="ACTIVE ALARMS"
      accent={unackCount > 0 ? 'alarm' : 'ok'}
      action={
        <Button variant="ghost" size="sm" onClick={navigateToAlarms}>
          View All →
        </Button>
      }
      noPadding
    >
      {top5.length === 0 ? (
        <div className="p-4">
          <EmptyState
            icon={<BellOff size={40} className="text-text-muted" />}
            message="No active alarms"
          />
        </div>
      ) : (
        <div className="divide-y divide-scada-border">
          {top5.map(alarm => (
            <AlarmRow key={alarm.id} alarm={alarm} onClick={navigateToAlarms} />
          ))}
        </div>
      )}
    </Card>
  )
}

function AlarmRow({ alarm, onClick }: { alarm: Alarm; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 hover:bg-scada-panel cursor-pointer transition-colors"
    >
      {SEVERITY_ICON[alarm.severity]}
      <div className="flex-1 min-w-0">
        <div className="text-text-primary text-xs truncate">{alarm.message}</div>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-text-muted text-xs font-mono">{alarm.source}</span>
        <span className="text-text-muted text-xs font-mono">{timeAgo(alarm.triggeredAt)}</span>
      </div>
    </div>
  )
}
