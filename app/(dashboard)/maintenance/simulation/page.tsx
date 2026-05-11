import type { Metadata } from 'next'
import { SimulationClient } from '@/components/modules/maintenance'

export const metadata: Metadata = {
  title: 'Simulation Mode — Industrial Ops UI',
}

export default function SimulationModePage() {
  return <SimulationClient />
}
