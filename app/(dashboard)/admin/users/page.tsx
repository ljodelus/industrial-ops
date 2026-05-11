import type { Metadata } from 'next'
import { AdminGuard, UserManagementClient } from '@/components/modules/admin'

export const metadata: Metadata = {
  title: 'User Management — Industrial Ops UI',
}

export default function UserManagementPage() {
  return (
    <AdminGuard>
      <UserManagementClient />
    </AdminGuard>
  )
}


