import type { EmptyStateProps } from '@/types'

export function EmptyState({ icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      {icon && (
        <span className="text-text-muted opacity-40 text-4xl">{icon}</span>
      )}
      <p className="text-text-muted text-sm font-mono">{message}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
