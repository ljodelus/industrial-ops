'use client'

// Client component required for error boundary: uses reset callback

import { Button } from '@/components/ui/Button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function LiveMonitorError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <p className="text-status-alarm font-mono text-sm uppercase tracking-wider">
        Monitor Error
      </p>
      <p className="text-text-muted text-xs font-mono max-w-sm">
        {error.message || 'Unable to load the live monitor.'}
      </p>
      <Button variant="ghost" size="sm" onClick={reset}>
        Retry
      </Button>
    </div>
  )
}

