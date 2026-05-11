'use client'

// Error boundary for the Crane Control page — requires 'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui'
import { AlertTriangle } from '@/lib/icons'

interface Props {
  error:  Error & { digest?: string }
  reset:  () => void
}

export default function CraneControlError({ error, reset }: Props) {
  useEffect(() => {
    // Log to console in dev; replace with error tracking in production
    console.error('[CraneControlError]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
      <AlertTriangle size={40} className="text-status-alarm opacity-60" />
      <div className="flex flex-col gap-1">
        <h2 className="text-text-primary font-mono text-sm uppercase tracking-wide">
          Crane Control Error
        </h2>
        <p className="text-text-muted text-xs font-mono max-w-sm">
          An unexpected error occurred while loading the Crane Control module.
          {error.digest && (
            <span className="block mt-1 text-text-muted opacity-60">
              Digest: {error.digest}
            </span>
          )}
        </p>
      </div>
      <Button variant="secondary" size="sm" onClick={reset}>
        Try Again
      </Button>
    </div>
  )
}

