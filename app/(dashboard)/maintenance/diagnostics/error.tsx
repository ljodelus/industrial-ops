'use client'

// Client component — Next.js error boundary requires 'use client'

interface ErrorProps {
  error:  Error & { digest?: string }
  reset:  () => void
}

export default function DiagnosticsError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-status-alarm text-sm font-mono uppercase tracking-widest">
        Diagnostics Error
      </div>
      <div className="text-text-muted text-xs font-mono text-center max-w-md">
        {error.message || 'An unexpected error occurred while loading the diagnostics page.'}
      </div>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 text-xs font-mono uppercase bg-scada-surface border border-scada-border rounded-scada text-text-primary hover:border-accent-primary hover:text-accent-primary transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}

