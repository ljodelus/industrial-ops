import type { Metadata } from 'next'
import { DowntimeReportClient } from '@/components/modules/reports'

export const metadata: Metadata = {
  title: 'Downtime Report — Industrial Ops UI',
}

export default function DowntimeReportPage() {
  return <DowntimeReportClient />
}
