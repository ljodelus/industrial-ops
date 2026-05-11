import type { Metadata } from 'next'
import { OverviewClient } from '@/components/modules/overview/OverviewClient'

export const metadata: Metadata = {
  title: 'Overview — Industrial Ops UI',
}

export default function OverviewPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-text-value text-xl font-mono uppercase tracking-wider">
          System Overview
        </h1>
        <p className="text-text-muted text-xs font-mono mt-1">
          Real-time monitoring — LINE-1 · LINE-2
        </p>
      </div>

      <OverviewClient />
    </div>
  )
}
