'use client'

// Client component — hides admin content from non-admin roles

import { useAppSelector } from '@/store/hooks'
import { selectUserRole } from '@/store/slices/authSlice'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const role = useAppSelector(selectUserRole)

  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <span className="text-status-alarm text-xs font-mono uppercase tracking-wide">
          Access denied
        </span>
        <span className="text-text-muted text-xs font-mono">
          This section is restricted to administrators.
        </span>
      </div>
    )
  }

  return <>{children}</>
}
