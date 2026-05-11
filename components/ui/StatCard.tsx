import type { StatCardProps } from '@/types'
import { Card } from './Card'

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

export function StatCard({ title, value, subtitle, accent, trend, className = '' }: StatCardProps) {
  return (
    <Card accent={accent} className={className}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-text-muted text-xs uppercase tracking-wide font-mono">{title}</span>
          {trend && (
            <span className={`text-sm font-mono ${trendColor[trend]}`}>{trendIcon[trend]}</span>
          )}
        </div>
        <span className="text-text-value text-3xl font-mono value-display">{value}</span>
        {subtitle && (
          <span className="text-text-muted text-xs font-mono">{subtitle}</span>
        )}
      </div>
    </Card>
  )
}
