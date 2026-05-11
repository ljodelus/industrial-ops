export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-32 bg-scada-surface rounded-scada animate-pulse" />
      <div className="bg-scada-surface border border-scada-border rounded-scada overflow-hidden">
        <div className="h-10 bg-scada-panel border-b border-scada-border" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-scada-border px-4 flex items-center gap-6">
            <div className="flex-1 h-4 bg-scada-panel rounded-scada animate-pulse" />
            <div className="w-48 h-4 bg-scada-panel rounded-scada animate-pulse" />
            <div className="w-24 h-5 bg-scada-panel rounded-scada animate-pulse" />
            <div className="w-16 h-7 bg-scada-panel rounded-scada animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
