import type { Metadata } from 'next'
import { DiagnosticsClient } from '@/components/modules/maintenance'

export const metadata: Metadata = {
  title: 'Diagnostics — Industrial Ops UI',
}

export default function DiagnosticsPage() {
  return <DiagnosticsClient />
}
