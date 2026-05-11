export default function SimulationLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header skeleton */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-3 flex-1">
          <div className="space-y-2">
            <div className="h-7 w-56 bg-scada-surface rounded-scada" />
            <div className="h-4 w-80 bg-scada-surface rounded-scada" />
          </div>
          <div className="h-10 w-full bg-scada-surface rounded-scada" />
        </div>
        <div className="flex items-center gap-2 pt-8">
          <div className="h-8 w-20 bg-scada-surface rounded-scada" />
          <div className="h-8 w-20 bg-scada-surface rounded-scada" />
          <div className="h-8 w-20 bg-scada-surface rounded-scada" />
          <div className="h-8 w-20 bg-scada-surface rounded-scada" />
        </div>
      </div>

      {/* Section A — Control Panel skeleton */}
      <div className="h-64 bg-scada-surface border border-scada-border rounded-scada" />

      {/* Section B — Live Simulation skeleton */}
      <div className="h-96 bg-scada-surface border border-scada-border rounded-scada" />

      {/* Sections C + D */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[600px] bg-scada-surface border border-scada-border rounded-scada" />
        <div className="h-[600px] bg-scada-surface border border-scada-border rounded-scada" />
      </div>
    </div>
  )
}

