export default function EditRecipeLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-32 bg-scada-surface rounded-scada animate-pulse" />
          <div className="h-6 w-56 bg-scada-surface rounded-scada animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-scada-surface rounded-scada animate-pulse" />
          <div className="h-8 w-28 bg-scada-surface rounded-scada animate-pulse" />
          <div className="h-8 w-28 bg-scada-surface rounded-scada animate-pulse" />
        </div>
      </div>

      {/* Two-panel skeleton */}
      <div className="grid grid-cols-[55fr_45fr] gap-6">
        <div className="h-64 bg-scada-surface border border-scada-border rounded-scada animate-pulse" />
        <div className="h-64 bg-scada-surface border border-scada-border rounded-scada animate-pulse" />
      </div>

      {/* Step builder skeleton */}
      <div className="h-80 bg-scada-surface border border-scada-border rounded-scada animate-pulse" />
    </div>
  )
}

