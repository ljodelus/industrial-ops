import type { Metadata } from 'next'
import { ProductionReportClient } from '@/components/modules/reports'

export const metadata: Metadata = {
  title: 'Production Report — Industrial Ops UI',
}

export default function ProductionReportPage() {
  return <ProductionReportClient />
}
