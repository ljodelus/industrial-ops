export default function JobsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-32 bg-scada-surface rounded-scada animate-pulse" />
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-24 h-4 bg-scada-surface rounded-scada animate-pulse" />
        ))}
      </div>
      <div className="bg-scada-surface border border-scada-border rounded-scada overflow-hidden">
        <div className="h-10 bg-scada-panel border-b border-scada-border" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-scada-border px-4 flex items-center gap-6">
            <div className="w-10 h-4 bg-scada-panel rounded-scada animate-pulse" />
            <div className="flex-1 h-4 bg-scada-panel rounded-scada animate-pulse" />
            <div className="w-20 h-5 bg-scada-panel rounded-scada animate-pulse" />
            <div className="w-16 h-4 bg-scada-panel rounded-scada animate-pulse" />
            <div className="w-28 h-4 bg-scada-panel rounded-scada animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
