'use client'

import type { AlarmBadgeProps } from '@/types'

export function AlarmBadge({ count, unacknowledged = false }: AlarmBadgeProps) {
  if (count === 0) return null

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-mono font-medium text-white bg-status-alarm rounded-scada ${unacknowledged ? 'alarm-blink' : ''}`}
    >
      {count}
    </span>
  )
}
