import type { Metadata } from 'next'
import { JobTable } from '@/components/modules/jobs'

export const metadata: Metadata = {
  title: 'Jobs — Industrial Ops UI',
}

export default function JobsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-text-primary text-lg font-mono font-semibold uppercase tracking-wide">
          Jobs
        </h1>
        <p className="text-text-muted text-xs font-mono mt-0.5">
          Production queue — manage job execution and priorities
        </p>
      </div>

      {/* Job table */}
      <JobTable />
    </div>
  )
}
