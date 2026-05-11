import type { ValueDisplayProps } from '@/types'

const trendIcon: Record<string, string> = {
  up:     '↑',
  down:   '↓',
  stable: '→',
}

const trendColor: Record<string, string> = {
  up:     'text-status-ok',
  down:   'text-status-alarm',
  stable: 'text-text-muted',
}

export function ValueDisplay({
  label,
  value,
  unit,
  trend,
  layout = 'vertical',
  className = '',
}: ValueDisplayProps) {
  const isHorizontal = layout === 'horizontal'

  return (
    <div className={`${isHorizontal ? 'flex items-center gap-4' : 'flex flex-col gap-0.5'} ${className}`}>
      <span className="text-text-muted text-xs uppercase tracking-wider font-mono whitespace-nowrap">
        {label}
      </span>
      <span className="inline-flex items-baseline gap-1">
        <span className="text-text-value text-xl font-mono value-display">{value}</span>
        {unit && <span className="text-text-muted text-sm font-mono">{unit}</span>}
        {trend && (
          <span className={`text-sm font-mono ${trendColor[trend]}`}>
            {trendIcon[trend]}
          </span>
        )}
      </span>
    </div>
  )
}
