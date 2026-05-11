import type { Metadata } from 'next'
import { SystemConfigClient } from '@/components/modules/admin'

export const metadata: Metadata = {
  title: 'System Configuration — Industrial Ops UI',
}

export default function SystemConfigPage() {
  return <SystemConfigClient />
}
