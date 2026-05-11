import type { Metadata } from 'next'
import { CraneUtilizationClient } from '@/components/modules/reports'

export const metadata: Metadata = {
  title: 'Crane Utilization — Industrial Ops UI',
}

export default function CraneUtilizationReportPage() {
  return <CraneUtilizationClient />
}


