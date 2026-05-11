export default function AlarmHistoryLoading() {
  return (
    <div className="flex flex-col gap-0 animate-pulse">
      {/* Header skeleton */}
      <div className="px-6 pt-4 pb-4 border-b border-scada-border flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-48 bg-scada-panel rounded-scada" />
          <div className="h-3 w-64 bg-scada-panel rounded-scada" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-28 bg-scada-panel rounded-scada" />
          <div className="h-8 w-28 bg-scada-panel rounded-scada" />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div className="px-6 py-4 border-b border-scada-border bg-scada-surface flex gap-3">
        <div className="h-9 w-56 bg-scada-panel rounded-scada" />
        <div className="h-9 w-36 bg-scada-panel rounded-scada" />
        <div className="h-9 w-36 bg-scada-panel rounded-scada" />
        <div className="h-9 w-36 bg-scada-panel rounded-scada" />
        <div className="h-9 w-36 bg-scada-panel rounded-scada" />
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-4 gap-3 px-6 py-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-scada-surface border border-scada-border rounded-scada p-4 flex flex-col gap-2">
            <div className="h-3 w-24 bg-scada-panel rounded-scada" />
            <div className="h-8 w-16 bg-scada-panel rounded-scada" />
            <div className="h-3 w-32 bg-scada-panel rounded-scada" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="px-6 pb-4">
        <div className="border border-scada-border rounded-scada overflow-hidden">
          <div className="h-10 bg-scada-panel border-b border-scada-border" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`h-12 border-b border-scada-border/50 ${i % 2 === 0 ? 'bg-scada-surface' : 'bg-scada-bg'}`} />
          ))}
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="px-6 pb-6">
        <div className="bg-scada-surface border border-scada-border rounded-scada p-4">
          <div className="h-52 bg-scada-panel rounded-scada" />
        </div>
      </div>
    </div>
  )
}

