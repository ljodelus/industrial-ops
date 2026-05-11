import { Spinner } from '@/components/ui/Spinner'

export default function JobQueueLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <span className="text-text-muted text-xs font-mono uppercase tracking-wide">
          Loading job queue…
        </span>
      </div>
    </div>
  )
}

