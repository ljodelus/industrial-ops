'use client'

interface AuditErrorProps {
  error: Error
  reset: () => void
}

export default function AuditLogError({ error, reset }: AuditErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-status-alarm font-mono text-sm">
        Failed to load audit log: {error.message}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-scada-surface border border-scada-border rounded-scada text-text-primary text-xs font-mono hover:border-accent-primary transition-colors"
      >
        Retry
      </button>
    </div>
  )
}

