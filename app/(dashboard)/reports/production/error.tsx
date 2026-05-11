'use client'

// Client component — required by Next.js error boundary (must be a Client Component)

interface ErrorProps {
  error:  Error & { digest?: string }
  reset:  () => void
}

export default function ProductionReportError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <div className="bg-scada-surface border border-status-alarm/30 rounded-scada p-6 max-w-md w-full text-center">
        <div className="text-status-alarm text-xs font-mono uppercase tracking-wide mb-2">
          Report Error
        </div>
        <p className="text-text-primary text-sm font-mono mb-1">
          Failed to load the Production Report.
        </p>
        <p className="text-text-muted text-xs font-mono mb-4">
          {error.message ?? 'An unexpected error occurred.'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 text-xs font-mono uppercase bg-scada-bg border border-scada-border text-text-primary rounded-scada hover:border-accent-primary hover:text-accent-primary transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

