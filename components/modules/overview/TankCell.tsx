'use client'

// Client component: uses onClick handler and Tooltip interaction

import type { Tank } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Tooltip } from '@/components/ui/Tooltip'

interface TankCellProps {
  tank: Tank
  dwellProgress?: number
  alarm?: boolean
  onClick?: (tank: Tank) => void
}

export function TankCell({ tank, dwellProgress, alarm = false, onClick }: TankCellProps) {
  const progress   = dwellProgress ?? tank.dwellProgress ?? 0
  const isAlarm    = alarm
  const isOccupied = tank.occupied && !isAlarm

  const containerClass = isAlarm
    ? 'bg-status-alarm/5 border-status-alarm/40'
    : isOccupied
    ? 'bg-accent-primary/5 border-accent-primary/40'
    : 'bg-scada-surface border-scada-border'

  const badgeVariant = isAlarm ? 'alarm' : isOccupied ? 'ok' : 'idle'
  const badgeLabel   = isAlarm ? 'ALARM' : isOccupied ? 'OCCUPIED' : 'FREE'

  const tooltipContent = isOccupied && tank.currentPart
    ? `${tank.currentPart} — ${Math.round(progress)}% dwell`
    : tank.name

  return (
    <Tooltip content={tooltipContent} position="top">
      <div
        onClick={() => onClick?.(tank)}
        className={`w-24 h-28 flex flex-col justify-between p-2 border rounded-scada transition-colors ${containerClass} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      >
        <div>
          <div className="text-text-primary text-xs font-mono font-medium">T-{String(tank.number).padStart(2, '0')}</div>
          <div className="text-text-muted text-xs font-mono truncate">{tank.name}</div>
        </div>

        <div className="flex flex-col gap-1">
          {isOccupied && tank.currentPart && (
            <div className="text-accent-primary text-xs font-mono truncate">{tank.currentPart}</div>
          )}
          {isOccupied && (
            <ProgressBar value={progress} max={100} showLabel />
          )}
          <Badge variant={badgeVariant} label={badgeLabel} className="text-[10px]" />
        </div>
      </div>
    </Tooltip>
  )
}
