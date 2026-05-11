export default function CraneUtilizationLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 bg-scada-bg min-h-screen animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-56 bg-scada-surface rounded-scada" />
          <div className="h-3 w-72 bg-scada-surface rounded-scada" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-28 bg-scada-surface rounded-scada" />
          <div className="h-7 w-28 bg-scada-surface rounded-scada" />
          <div className="h-7 w-22 bg-scada-surface rounded-scada" />
        </div>
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-scada-surface border border-scada-border rounded-scada p-4 flex flex-col gap-2">
            <div className="h-3 w-28 bg-scada-panel rounded-scada" />
            <div className="h-8 w-20 bg-scada-panel rounded-scada" />
            <div className="h-3 w-36 bg-scada-panel rounded-scada" />
          </div>
        ))}
      </div>

      {/* Section B skeleton */}
      <div className="bg-scada-surface border border-scada-border rounded-scada">
        <div className="px-4 py-3 border-b border-scada-border h-10 bg-scada-panel" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="px-4 py-4 border-b border-scada-border flex gap-4">
            <div className="w-36 flex flex-col gap-2">
              <div className="h-4 w-20 bg-scada-panel rounded-scada" />
              <div className="h-3 w-14 bg-scada-panel rounded-scada" />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-2 w-full bg-scada-panel rounded-scada" />
              <div className="h-2 w-3/4 bg-scada-panel rounded-scada" />
              <div className="h-2 w-1/4 bg-scada-panel rounded-scada" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-scada-surface border border-scada-border rounded-scada p-4 h-60" />
        <div className="lg:col-span-2 bg-scada-surface border border-scada-border rounded-scada p-4 h-60" />
      </div>

      {/* Table skeleton */}
      <div className="bg-scada-surface border border-scada-border rounded-scada p-4 h-64" />

      {/* Heatmap skeleton */}
      <div className="bg-scada-surface border border-scada-border rounded-scada p-4 h-40" />
    </div>
  )
}

