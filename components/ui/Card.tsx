import type { CardProps } from '@/types'

const accentMap: Record<string, string> = {
  ok:      'border-t-2 border-t-status-ok',
  warning: 'border-t-2 border-t-status-warning',
  alarm:   'border-t-2 border-t-status-alarm',
  offline: 'border-t-2 border-t-status-offline',
  primary: 'border-t-2 border-t-accent-primary',
  gold:    'border-t-2 border-t-accent-gold',
}

export function Card({ title, accent, action, children, className = '', noPadding = false }: CardProps) {
  return (
    <div
      className={`bg-scada-surface border border-scada-border rounded-scada ${accent ? accentMap[accent] : ''} ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-scada-border px-4 py-3">
          <span className="text-text-primary text-sm font-medium uppercase tracking-wide">
            {title}
          </span>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-4'}>
        {children}
      </div>
    </div>
  )
}
