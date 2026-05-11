'use client'

// Client component — event listeners on click-to-scroll
import { ArrowUp } from '@/lib/icons'

interface NewAlarmPillProps {
  count:   number
  onClick: () => void
}

export function NewAlarmPill({ count, onClick }: NewAlarmPillProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 bg-status-alarm text-white text-xs font-mono px-3 py-1 rounded-scada transition-opacity hover:opacity-90 mx-auto"
    >
      <ArrowUp size={12} />
      <span>
        ↑ {count} new alarm{count > 1 ? 's' : ''} — click to scroll up
      </span>
    </button>
  )
}

