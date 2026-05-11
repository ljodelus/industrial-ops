import type { Metadata } from 'next'
import { IOTestingClient } from '@/components/modules/maintenance'

export const metadata: Metadata = {
  title: 'IO Testing — Industrial Ops UI',
}

export default function IOTestingPage() {
  return <IOTestingClient />
}
