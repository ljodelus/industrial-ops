import type { BadgeProps } from '@/types'

const variantMap: Record<string, string> = {
  ok:      'bg-status-ok/15 text-status-ok border border-status-ok/30',
  warning: 'bg-status-warning/15 text-status-warning border border-status-warning/30',
  alarm:   'bg-status-alarm/15 text-status-alarm border border-status-alarm/30',
  offline: 'bg-status-offline/15 text-status-offline border border-status-offline/30',
  idle:    'bg-status-idle/15 text-status-idle border border-status-idle/30',
  info:    'bg-accent-primary/15 text-accent-primary border border-accent-primary/30',
  gold:    'bg-accent-gold/15 text-accent-gold border border-accent-gold/30',
}

export function Badge({ variant, label, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-mono uppercase rounded-scada ${variantMap[variant]} ${className}`}
    >
      {label}
    </span>
  )
}
