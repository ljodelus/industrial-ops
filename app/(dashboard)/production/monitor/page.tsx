import type { Metadata } from 'next'
import { LiveMonitorClient } from '@/components/modules/monitor/LiveMonitorClient'

export const metadata: Metadata = {
  title: 'Live Monitor — Industrial Ops UI',
}

export default function LiveMonitorPage() {
  return <LiveMonitorClient />
}
