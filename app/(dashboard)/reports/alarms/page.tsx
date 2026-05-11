import type { Metadata } from 'next'
import { AlarmReportClient } from '@/components/modules/reports'

export const metadata: Metadata = {
  title: 'Alarm Report — Industrial Ops UI',
}

export default function AlarmReportPage() {
  return <AlarmReportClient />
}
