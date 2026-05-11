import type { Metadata } from 'next'
import { AdminGuard } from '@/components/modules/admin'
import { UserTable }  from '@/components/modules/admin'

export const metadata: Metadata = {
  title: 'Admin — Industrial Ops UI',
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <div className="flex flex-col gap-6">
        {/* Page header */}
        <div>
          <h1 className="text-text-primary text-lg font-mono font-semibold uppercase tracking-wide">
            Admin
          </h1>
          <p className="text-text-muted text-xs font-mono mt-0.5">
            User management and role assignment
          </p>
        </div>

        {/* User table */}
        <UserTable />
      </div>
    </AdminGuard>
  )
}
