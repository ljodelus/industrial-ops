// Pure presentational component — receives props from parent (no Redux connection here)

import type { EquipmentDowntimeStat } from '@/types'
import { MoveHorizontal, Wifi } from '@/lib/icons'
import { StatusDot } from '@/components/ui'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCardAccent(availability: number): string {
  if (availability >= 95) return 'border-t-status-ok'
  if (availability >= 90) return 'border-t-status-warning'
  return 'border-t-status-alarm'
}

function getBarColor(availability: number): string {
  if (availability >= 95) return 'bg-status-ok'
  if (availability >= 90) return 'bg-status-warning'
  return 'bg-status-alarm'
}

function getStatusDotStatus(availability: number): 'ok' | 'warning' | 'alarm' {
  if (availability >= 95) return 'ok'
  if (availability >= 90) return 'warning'
  return 'alarm'
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EquipmentDowntimeCardProps {
  equipment:    EquipmentDowntimeStat
  isSelected:   boolean
  onClick:      (id: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EquipmentDowntimeCard({ equipment, isSelected, onClick }: EquipmentDowntimeCardProps) {
  const { id, name, type, downtimeMinutes, eventCount, availability, mtbf, lastFault, lastFaultAt } = equipment

  const accent    = getCardAccent(availability)
  const barColor  = getBarColor(availability)
  const dotStatus = getStatusDotStatus(availability)

  const selectedBorder = isSelected
    ? 'border-accent-primary border-2'
    : 'border-scada-border border'

  return (
    <div
      className={`bg-scada-surface rounded-scada cursor-pointer transition-colors hover:bg-scada-panel
        border-t-2 ${accent} ${selectedBorder}`}
      onClick={() => onClick(id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(id)}
      aria-pressed={isSelected}
    >
      <div className="p-3 flex flex-col gap-2.5">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === 'crane'
              ? <MoveHorizontal size={14} className="text-accent-primary" />
              : <Wifi            size={14} className="text-accent-primary" />
            }
            <span className="text-text-primary text-sm font-mono uppercase font-medium">{name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot status={equipment.status === 'online' ? 'ok' : 'offline'} size="sm" />
            <span className="text-text-muted text-[10px] font-mono uppercase">
              {equipment.status}
            </span>
          </div>
        </div>

        {/* ── Stats ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <span className="text-text-muted text-[10px] font-mono uppercase block">DOWNTIME</span>
            <span className="text-text-value text-xs font-mono value-display">
              {downtimeMinutes} min
              <span className="text-text-muted ml-1">({eventCount} events)</span>
            </span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] font-mono uppercase block">AVAILABILITY</span>
            <span className="text-text-value text-xs font-mono value-display">{availability.toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] font-mono uppercase block">MTBF</span>
            <span className="text-text-value text-xs font-mono value-display">{mtbf}</span>
          </div>
          <div>
            <span className="text-text-muted text-[10px] font-mono uppercase block">LAST FAULT</span>
            <span className="text-text-muted text-[10px] font-mono">{lastFault}</span>
          </div>
        </div>

        {/* Last fault time */}
        <div>
          <span className="text-text-muted text-[10px] font-mono uppercase">LAST FAULT AT&nbsp;</span>
          <span className="text-text-muted text-[10px] font-mono">{lastFaultAt}</span>
        </div>

        {/* ── Availability bar ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <StatusDot status={dotStatus} size="sm" />
            <span className="text-text-muted text-[10px] font-mono">{availability.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-scada-border rounded-scada overflow-hidden">
            <div
              className={`h-full rounded-scada transition-all duration-500 ${barColor}`}
              style={{ width: `${availability}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

