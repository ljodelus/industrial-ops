import type { Metadata } from 'next'
import { AlarmHistoryClient } from '@/components/modules/alarms'

export const metadata: Metadata = {
  title: 'Alarm History — Industrial Ops UI',
}

export default function AlarmHistoryPage() {
  return <AlarmHistoryClient />
}
