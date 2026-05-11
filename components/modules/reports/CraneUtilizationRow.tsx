'use client'

// Client component — uses onClick (event listener) for row click interaction

import { StatusDot } from '@/components/ui'
import type { CraneUtilizationData } from '@/types'

const STATUS_DOT_MAP: Record<string, 'ok' | 'warning' | 'alarm' | 'offline' | 'idle'> = {
  moving:  'ok',
  loading: 'warning',
  idle:    'idle',
  error:   'alarm',
}

const STATUS_LABEL_MAP: Record<string, string> = {
  moving:  'MOVING',
  loading: 'LOADING',
  idle:    'IDLE',
  error:   'ERROR',
}

interface ProgressBarRowProps {
  label:     string
  pct:       number
  color:     string
  textColor: string
  blink?:    boolean
}

function ProgressBarRow({ label, pct, color, textColor, blink = false }: ProgressBarRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-text-muted text-[10px] font-mono w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-scada-panel rounded-scada overflow-hidden">
        <div
          className={`h-full ${color} rounded-scada transition-all`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={`value-display text-xs w-10 text-right flex-shrink-0 ${textColor}${blink ? ' alarm-blink' : ''}`}>
        {pct.toFixed(1)}%
      </span>
    </div>
  )
}

interface CraneUtilizationRowProps {
  crane:         CraneUtilizationData
  isHighlighted: boolean
  onClick:       (craneId: string) => void
}

export function CraneUtilizationRow({ crane, isHighlighted, onClick }: CraneUtilizationRowProps) {
  const isMoving  = crane.status === 'moving'
  const isError   = crane.status === 'error'
  const dotStatus = STATUS_DOT_MAP[crane.status]

  return (
    <div>
      <div
        className={`flex items-start gap-4 px-4 py-3 cursor-pointer transition-colors hover:bg-scada-panel ${
          isHighlighted ? 'bg-scada-panel ring-1 ring-accent-primary/60' : ''
        }`}
        onClick={() => onClick(crane.id)}
      >
        {/* Left column — crane info */}
        <div className="w-36 flex-shrink-0 flex flex-col gap-1">
          <span className="text-text-value text-sm font-mono font-bold">{crane.id}</span>
          <span className="text-text-muted text-xs font-mono">{crane.line}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StatusDot status={dotStatus} animated={isMoving} size="sm" />
            <span className={`text-[10px] font-mono ${isError ? 'text-status-alarm' : 'text-text-muted'}`}>
              {STATUS_LABEL_MAP[crane.status]}
            </span>
          </div>
        </div>

        {/* Right column — progress bars */}
        <div className="flex-1 flex flex-col gap-2">
          <ProgressBarRow
            label="Active"
            pct={crane.activePct}
            color="bg-accent-primary"
            textColor="text-accent-primary"
          />
          <ProgressBarRow
            label="Idle"
            pct={crane.idlePct}
            color="bg-status-idle"
            textColor="text-status-idle"
          />
          <ProgressBarRow
            label="Fault"
            pct={crane.faultPct}
            color="bg-status-alarm"
            textColor="text-status-alarm"
            blink={isError}
          />
        </div>
      </div>
      <div className="border-b border-scada-border" />
    </div>
  )
}

