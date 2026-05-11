'use client'

// Client component — Next.js error boundary requires client directive

interface IOTestingErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function IOTestingError({ error, reset }: IOTestingErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <span className="text-status-alarm text-4xl">⚠</span>
      <h2 className="text-text-primary font-mono uppercase tracking-widest">IO Testing Error</h2>
      <p className="text-text-muted text-xs font-mono text-center max-w-md">
        {error.message || 'An unexpected error occurred in the IO Testing module.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 text-xs font-mono uppercase tracking-wide bg-accent-primary text-scada-bg rounded-scada hover:opacity-90"
      >
        Try Again
      </button>
    </div>
  )
}

