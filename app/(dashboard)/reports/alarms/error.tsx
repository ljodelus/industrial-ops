'use client'

// Client component — required for error boundary (useEffect / reset button)

interface AlarmReportErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AlarmReportError({ error, reset }: AlarmReportErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-scada-bg text-text-primary p-8">
      <div className="text-status-alarm text-5xl font-mono">⚠</div>
      <div className="text-center">
        <h2 className="text-text-value text-lg font-mono uppercase tracking-widest mb-2">
          Alarm Report Error
        </h2>
        <p className="text-text-muted text-xs font-mono max-w-sm">
          {error.message ?? 'An unexpected error occurred while loading the alarm report.'}
        </p>
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 text-xs font-mono uppercase tracking-wide rounded-scada
          bg-scada-surface border border-scada-border text-text-primary
          hover:border-accent-primary hover:text-accent-primary transition-colors"
      >
        Try again
      </button>
    </div>
  )
}

