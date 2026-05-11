'use client'

// Client component — error.tsx must be a Client Component (Next.js requirement)

import { Button } from '@/components/ui'
import { RefreshCw } from '@/lib/icons'

interface ErrorProps {
  error:  Error & { digest?: string }
  reset:  () => void
}

export default function CraneUtilizationError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 bg-scada-bg">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-status-alarm text-4xl font-mono alarm-blink">!</span>
        <h2 className="text-text-value text-lg font-mono uppercase tracking-widest">
          Report Unavailable
        </h2>
        <p className="text-text-muted text-xs font-mono max-w-sm">
          An error occurred while loading the crane utilization report.
          {error.digest && (
            <span className="block mt-1 text-status-alarm">Code: {error.digest}</span>
          )}
        </p>
      </div>
      <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={reset}>
        Retry
      </Button>
    </div>
  )
}

