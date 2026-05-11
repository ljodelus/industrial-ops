import type { Metadata } from 'next'
import { AuditLogClient } from '@/components/modules/admin'

export const metadata: Metadata = {
  title: 'Audit Log — Industrial Ops UI',
}

export default function AuditLogPage() {
  return <AuditLogClient />
}


