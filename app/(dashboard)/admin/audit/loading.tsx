export default function AuditLogLoading() {
  return (
    <div className="flex flex-col gap-4 p-6 animate-pulse">
      <div className="h-10 bg-scada-surface rounded-scada w-64" />
      <div className="h-14 bg-scada-surface rounded-scada" />
      <div className="h-12 bg-scada-surface rounded-scada" />
      <div className="h-96 bg-scada-surface rounded-scada" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-scada-surface rounded-scada" />
        <div className="h-64 bg-scada-surface rounded-scada" />
      </div>
    </div>
  )
}

