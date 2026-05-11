export default function AlarmsLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-scada-surface rounded-scada animate-pulse" />

      {/* Filters skeleton */}
      <div className="flex gap-3">
        <div className="flex-1 h-9 bg-scada-surface rounded-scada animate-pulse" />
        <div className="w-44 h-9 bg-scada-surface rounded-scada animate-pulse" />
        <div className="w-44 h-9 bg-scada-surface rounded-scada animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="bg-scada-surface border border-scada-border rounded-scada overflow-hidden">
        <div className="h-10 bg-scada-panel border-b border-scada-border" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 border-b border-scada-border px-4 flex items-center gap-4">
            <div className="w-20 h-5 bg-scada-panel rounded-scada animate-pulse" />
            <div className="w-24 h-4 bg-scada-panel rounded-scada animate-pulse" />
            <div className="flex-1 h-4 bg-scada-panel rounded-scada animate-pulse" />
            <div className="w-20 h-4 bg-scada-panel rounded-scada animate-pulse" />
            <div className="w-32 h-4 bg-scada-panel rounded-scada animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
