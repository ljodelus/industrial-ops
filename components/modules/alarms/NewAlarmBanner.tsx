'use client'

// Client component — event listeners on dismiss
import { TriangleAlert } from '@/lib/icons'

interface NewAlarmBannerProps {
  message: string
  onDismiss: () => void
}

export function NewAlarmBanner({ message, onDismiss }: NewAlarmBannerProps) {
  return (
    <div
      className="flex items-center gap-2 bg-status-alarm text-white text-xs font-mono px-4 py-2 cursor-pointer"
      onClick={onDismiss}
    >
      <TriangleAlert size={14} />
      <span className="font-bold uppercase tracking-wide">New Critical Alarm</span>
      <span className="opacity-80">—</span>
      <span>{message}</span>
      <span className="ml-auto opacity-70 text-[10px]">click to dismiss</span>
    </div>
  )
}

