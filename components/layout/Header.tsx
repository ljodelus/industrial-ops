'use client'

// Client component — uses useState/useEffect for clock, Redux for auth state and logout

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectCurrentUser, logout } from '@/store/slices/authSlice'
import { Badge } from '@/components/ui/Badge'
import { LogOut } from '@/lib/icons'
import type { UserRole } from '@/types'

const roleBadgeVariant: Record<UserRole, 'ok' | 'info' | 'gold' | 'warning'> = {
  operator:   'ok',
  supervisor: 'info',
  engineer:   'gold',
  admin:      'warning',
}

export function Header({ title = '' }: { title?: string }) {
  const dispatch = useAppDispatch()
  const router   = useRouter()
  const user     = useAppSelector(selectCurrentUser)
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  const userRole = (user?.role ?? 'operator') as UserRole
  const userName = user?.name ?? 'Operator'

  return (
    <header className="h-14 bg-scada-surface border-b border-scada-border flex items-center justify-between px-6">
      <span className="text-text-primary font-medium text-base uppercase tracking-wide">
        {title}
      </span>

      <div className="flex items-center gap-3 text-sm">
        <span className="value-display text-text-muted text-sm">{time}</span>
        <span className="text-scada-border">|</span>
        <Badge variant={roleBadgeVariant[userRole]} label={userRole.toUpperCase()} />
        <span className="text-text-primary">{userName}</span>
        <span className="text-scada-border">|</span>
        <button
          onClick={handleLogout}
          className="text-text-muted hover:text-status-alarm transition-colors"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
