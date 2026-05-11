export default function DiagnosticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-scada-surface rounded-scada" />
          <div className="h-4 w-72 bg-scada-surface rounded-scada" />
        </div>
        <div className="h-20 w-48 bg-scada-surface rounded-scada" />
      </div>

      {/* Section A tiles skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-24 bg-scada-surface border border-scada-border rounded-scada" />
        ))}
      </div>

      {/* Sections B+C skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-scada-surface border border-scada-border rounded-scada" />
        <div className="h-80 bg-scada-surface border border-scada-border rounded-scada" />
      </div>

      {/* Section D skeleton */}
      <div className="h-72 bg-scada-surface border border-scada-border rounded-scada" />

      {/* Section E skeleton */}
      <div className="h-64 bg-scada-surface border border-scada-border rounded-scada" />

      {/* Section F skeleton */}
      <div className="h-48 bg-scada-surface border border-scada-border rounded-scada" />
    </div>
  )
}

