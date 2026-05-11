'use client'

import { useState, useEffect } from 'react'
import { StatusDot } from '@/components/ui/StatusDot'
import { Wifi, WifiOff, Activity, AlertTriangle } from '@/lib/icons'

interface PlcStatus {
  name: string
  connected: boolean
}

const PLC_STATUSES: PlcStatus[] = [
  { name: 'PLC LINE-1', connected: true },
  { name: 'PLC LINE-2', connected: true },
]

interface TopBarProps {
  activeAlarms?: number
}

export function TopBar({ activeAlarms = 0 }: TopBarProps) {
  const [date, setDate] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setDate(now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }))
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="h-8 bg-scada-bg border-b border-scada-border/50 flex items-center px-4 gap-4 text-xs font-mono">
      {PLC_STATUSES.map((plc) => (
        <span key={plc.name} className="flex items-center gap-1.5 text-text-muted">
          {plc.connected
            ? <Wifi size={10} className="text-status-ok" />
            : <WifiOff size={10} className="text-status-alarm" />}
          {plc.name}
        </span>
      ))}

      <span className="text-scada-border/50">|</span>

      <span className={`flex items-center gap-1.5 ${activeAlarms > 0 ? 'text-status-warning' : 'text-text-muted'}`}>
        <AlertTriangle size={10} />
        {activeAlarms} Active Alarm{activeAlarms !== 1 ? 's' : ''}
      </span>

      <span className="text-scada-border/50">|</span>

      <span className="flex items-center gap-1.5 text-status-ok">
        <Activity size={10} className="text-status-ok" />
        LIVE
      </span>

      <span className="ml-auto text-text-muted">{date}</span>
    </div>
  )
}
