'use client'

// Client component — error boundary for the Job Queue page

import { Button } from '@/components/ui/Button'

export default function JobQueueError({
  error,
  reset,
}: {
  error:  Error & { digest?: string }
  reset:  () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-center">
        <p className="text-status-alarm text-sm font-mono uppercase tracking-wide mb-1">
          Failed to load job queue
        </p>
        <p className="text-text-muted text-xs font-mono">
          {error.message ?? 'An unexpected error occurred.'}
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}

