import { Spinner } from '@/components/ui'

export default function CraneControlLoading() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-48 bg-scada-surface rounded-scada animate-pulse" />
          <div className="h-3 w-64 bg-scada-surface rounded-scada animate-pulse" />
        </div>
        <div className="flex gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-4 w-24 bg-scada-surface rounded-scada animate-pulse" />
          ))}
        </div>
      </div>

      {/* Tabs + main section skeleton */}
      <div className="bg-scada-surface border border-scada-border rounded-scada overflow-hidden">
        <div className="flex h-12 border-b border-scada-border px-4 items-center gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-4 w-28 bg-scada-bg rounded-scada animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-5 gap-0 divide-x divide-scada-border">
          <div className="col-span-3 p-4 flex flex-col gap-4">
            <div className="h-24 bg-scada-bg rounded-scada animate-pulse" />
            <div className="h-32 bg-scada-bg rounded-scada animate-pulse" />
            <div className="h-20 bg-scada-bg rounded-scada animate-pulse" />
          </div>
          <div className="col-span-2 p-4">
            <div className="h-80 bg-scada-bg rounded-scada animate-pulse" />
          </div>
        </div>
      </div>

      {/* Movement history skeleton */}
      <div className="bg-scada-surface border border-scada-border rounded-scada">
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" />
        </div>
      </div>
    </div>
  )
}

