import type { Metadata } from 'next'
import { AlarmSettingsClient } from '@/components/modules/alarms'

export const metadata: Metadata = {
  title: 'Alarm Settings — Industrial Ops UI',
}

export default function AlarmSettingsPage() {
  return <AlarmSettingsClient />
}
