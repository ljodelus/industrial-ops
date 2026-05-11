export default function IOTestingLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-48 bg-scada-surface rounded-scada" />
        <div className="h-3 w-64 bg-scada-surface rounded-scada" />
        <div className="h-10 bg-scada-surface rounded-scada border border-scada-border" />
      </div>
      {/* IO Map card skeleton */}
      <div className="bg-scada-surface border-t-2 border-t-accent-primary border border-scada-border rounded-scada p-4">
        <div className="h-4 w-48 bg-scada-panel rounded-scada mb-4" />
        <div className="h-8 bg-scada-panel rounded-scada mb-4" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-7 bg-scada-panel rounded-scada" />
          ))}
        </div>
      </div>
      {/* Bottom panels skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
        <div className="h-64 bg-scada-surface border border-scada-border rounded-scada" />
        <div className="h-64 bg-scada-surface border border-scada-border rounded-scada" />
      </div>
    </div>
  )
}

