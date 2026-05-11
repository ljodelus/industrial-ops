export default function ProductionReportLoading() {
  return (
    <div className="flex flex-col gap-4 p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-56 bg-scada-surface rounded-scada" />
          <div className="h-3 w-40 bg-scada-surface rounded-scada" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-scada-surface rounded-scada" />
          <div className="h-8 w-24 bg-scada-surface rounded-scada" />
          <div className="h-8 w-20 bg-scada-surface rounded-scada" />
        </div>
      </div>
      {/* KPI row skeleton */}
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-scada-surface border border-scada-border rounded-scada" />
        ))}
      </div>
      {/* Volume chart skeleton */}
      <div className="h-64 bg-scada-surface border border-scada-border rounded-scada" />
      {/* Charts row skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="h-60 bg-scada-surface border border-scada-border rounded-scada" />
        <div className="h-60 bg-scada-surface border border-scada-border rounded-scada" />
      </div>
      {/* Table skeleton */}
      <div className="h-80 bg-scada-surface border border-scada-border rounded-scada" />
    </div>
  )
}

