import type { StatusDotProps } from '@/types'

const colorMap: Record<string, string> = {
  ok:      'bg-status-ok',
  warning: 'bg-status-warning',
  alarm:   'bg-status-alarm',
  offline: 'bg-status-offline',
  idle:    'bg-status-idle',
}

const sizeMap: Record<string, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
}

const pingSizeMap: Record<string, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
}

export function StatusDot({ status, animated = false, size = 'md', className = '' }: StatusDotProps) {
  const color = colorMap[status]
  const dotSize = sizeMap[size]
  const pingSize = pingSizeMap[size]

  if (animated) {
    return (
      <span className={`relative inline-flex ${className}`}>
        <span className={`animate-ping absolute inline-flex ${pingSize} rounded-full ${color} opacity-75`} />
        <span className={`relative inline-flex rounded-full ${dotSize} ${color}`} />
      </span>
    )
  }

  return (
    <span className={`inline-block rounded-full ${dotSize} ${color} ${className}`} />
  )
}
