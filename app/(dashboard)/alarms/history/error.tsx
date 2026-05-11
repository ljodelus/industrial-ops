'use client'

// Error boundary for the Alarm History route
import { useEffect } from 'react'
import { Button }    from '@/components/ui/Button'
import { XCircle }   from '@/lib/icons'

interface AlarmHistoryErrorProps {
  error:  Error & { digest?: string }
  reset: () => void
}

export default function AlarmHistoryError({ error, reset }: AlarmHistoryErrorProps) {
  useEffect(() => {
    console.error('[AlarmHistory Error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-6 py-20">
      <XCircle size={40} className="text-status-alarm" />
      <div className="text-center">
        <p className="text-text-value text-sm font-mono uppercase tracking-wide">Failed to load Alarm History</p>
        <p className="text-text-muted text-xs font-mono mt-1">{error.message}</p>
      </div>
      <Button variant="secondary" size="sm" onClick={reset}>
        Try Again
      </Button>
    </div>
  )
}

