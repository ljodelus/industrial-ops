// Loading skeleton for the Alarm Report page
export default function AlarmReportLoading() {
  return (
    <div className="flex flex-col gap-6 p-6 bg-scada-bg min-h-screen animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-48 bg-scada-surface rounded-scada" />
          <div className="h-3 w-72 bg-scada-surface rounded-scada" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-24 bg-scada-surface rounded-scada" />
          <div className="h-7 w-24 bg-scada-surface rounded-scada" />
          <div className="h-7 w-20 bg-scada-surface rounded-scada" />
        </div>
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-scada-surface rounded-scada border border-scada-border" />
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-11 gap-4">
        <div className="col-span-6 h-72 bg-scada-surface rounded-scada border border-scada-border" />
        <div className="col-span-5 h-72 bg-scada-surface rounded-scada border border-scada-border" />
      </div>
      {/* Sources + Heatmap + Table */}
      {[80, 64, 96].map((h, i) => (
        <div key={i} className={`h-${h} bg-scada-surface rounded-scada border border-scada-border`} />
      ))}
    </div>
  )
}

