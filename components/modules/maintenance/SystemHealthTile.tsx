'use client'

// Client component — requires onClick handler and scanning animation

import { StatusDot } from '@/components/ui'
import {
  Wifi, MoveHorizontal, Activity, QrCode, AlertOctagon,
} from '@/lib/icons'

const ICON_MAP: Record<string, React.ReactNode> = {
  Wifi:            <Wifi size={20} />,
  MoveHorizontal:  <MoveHorizontal size={20} />,
  Activity:        <Activity size={20} />,
  QrCode:          <QrCode size={20} />,
  AlertOctagon:    <AlertOctagon size={20} />,
}

const STATUS_ICON_COLOR: Record<string, string> = {
  ok:      'text-status-ok',
  warning: 'text-status-warning',
  alarm:   'text-status-alarm',
  offline: 'text-status-offline',
}

const STATUS_BORDER: Record<string, string> = {
  ok:      'border-t-2 border-t-status-ok',
  warning: 'border-t-2 border-t-status-warning',
  alarm:   'border-t-2 border-t-status-alarm',
  offline: 'border-t-2 border-t-status-offline',
}

const STATUS_LABEL: Record<string, string> = {
  ok:      'OK',
  warning: 'WARNING',
  alarm:   'ERROR',
  offline: 'OFFLINE',
}

interface SystemHealthTileProps {
  iconName: string
  name:     string
  detail:   string
  status:   'ok' | 'warning' | 'alarm' | 'offline'
  scanning?: boolean
  onClick?: () => void
}

export function SystemHealthTile({
  iconName,
  name,
  detail,
  status,
  scanning = false,
  onClick,
}: SystemHealthTileProps) {
  const icon    = ICON_MAP[iconName] ?? <Activity size={20} />
  const isAlarm = status === 'alarm'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        bg-scada-surface border border-scada-border rounded-scada
        ${STATUS_BORDER[status]}
        ${isAlarm ? 'alarm-blink' : ''}
        ${scanning ? 'opacity-50 transition-opacity duration-200' : ''}
        p-3 text-left w-full cursor-pointer
        hover:border-scada-border hover:bg-scada-panel transition-colors
      `}
    >
      <div className={`mb-2 ${STATUS_ICON_COLOR[status]}`}>
        {icon}
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <StatusDot status={status} size="sm" animated={isAlarm} />
        <span className={`text-[10px] font-mono uppercase font-bold ${STATUS_ICON_COLOR[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>
      <div className="text-text-primary text-xs font-mono font-bold uppercase leading-tight">
        {name}
      </div>
      <div className="text-text-muted text-[10px] font-mono mt-0.5 leading-tight">
        {detail}
      </div>
    </button>
  )
}

