import type { Metadata } from 'next'
import { AlarmsClient } from '@/components/modules/alarms'

export const metadata: Metadata = {
  title: 'Active Alarms — Industrial Ops UI',
}

export default function AlarmsPage() {
  return <AlarmsClient />
}
