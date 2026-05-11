import type { ProgressBarProps } from '@/types'

function getFillColor(pct: number): string {
  if (pct <= 60) return 'bg-status-ok'
  if (pct <= 85) return 'bg-status-warning'
  return 'bg-status-alarm'
}

export function ProgressBar({ value, max, unit, showLabel = false, className = '' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const fillColor = getFillColor(pct)

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-end">
          <span className="value-display text-text-muted text-xs">
            {value} / {max}{unit ? ` ${unit}` : ''}
          </span>
        </div>
      )}
      <div className="w-full h-1.5 bg-scada-border rounded-scada overflow-hidden">
        <div
          className={`h-full rounded-scada transition-all duration-500 ${fillColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
