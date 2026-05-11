'use client'

// Client component — required by Next.js error boundary convention

export default function JobsError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <span className="text-status-alarm text-xs font-mono uppercase tracking-wide">
        Error loading jobs
      </span>
      <button
        onClick={reset}
        className="text-accent-primary text-xs font-mono hover:underline"
      >
        Try again
      </button>
    </div>
  )
}
