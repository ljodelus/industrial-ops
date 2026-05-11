import type { Metadata } from 'next'
import { CraneControlClient } from '@/components/modules/cranes'

export const metadata: Metadata = {
  title: 'Crane Control — Industrial Ops UI',
}

export default function CraneControlPage() {
  return <CraneControlClient />
}
