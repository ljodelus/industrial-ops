'use client'

// Client component — user detail panel shown when a user row is selected

import { useState, useEffect } from 'react'
import { Card }       from '@/components/ui/Card'
import { Badge }      from '@/components/ui/Badge'
import { Button }     from '@/components/ui/Button'
import { StatusDot }  from '@/components/ui/StatusDot'
import { EmptyState } from '@/components/ui/EmptyState'
import { User, LogIn, CheckCircle, ClipboardList, Play } from '@/lib/icons'
import type { UserWithStatus, UserActivity, UserRole } from '@/types'
import { ROLE_BADGE_VARIANT, ROLE_AVATAR_CLASS, getInitials } from './userHelpers'
import type { CardProps } from '@/types'

type CardAccent = CardProps['accent']

const ROLE_CARD_ACCENT: Record<UserRole, CardAccent> = {
  operator:   'primary',
  supervisor: 'gold',
  engineer:   'warning',
  admin:      'alarm',
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function elapsedSince(sessionStart: string): string {
  const [hh, mm, ss] = sessionStart.split(':').map(Number)
  const startSeconds = hh * 3600 + mm * 60 + ss
  const nowDate      = new Date()
  const nowSeconds   = nowDate.getHours() * 3600 + nowDate.getMinutes() * 60 + nowDate.getSeconds()
  let elapsed        = nowSeconds - startSeconds
  if (elapsed < 0) elapsed += 86400
  const eh = Math.floor(elapsed / 3600)
  const em = Math.floor((elapsed % 3600) / 60)
  const es = elapsed % 60
  return `${pad2(eh)}:${pad2(em)}:${pad2(es)}`
}

function ActivityIcon({ type }: { type: UserActivity['type'] }) {
  switch (type) {
    case 'login':  return <LogIn         size={12} className="text-accent-primary flex-shrink-0" />
    case 'ack':    return <CheckCircle   size={12} className="text-status-ok flex-shrink-0"       />
    case 'recipe': return <ClipboardList size={12} className="text-accent-gold flex-shrink-0"     />
    case 'job':    return <Play          size={12} className="text-status-warning flex-shrink-0"  />
    default:       return <User          size={12} className="text-text-muted flex-shrink-0"      />
  }
}

interface UserDetailPanelProps {
  user:       UserWithStatus | null
  onEdit:     (user: UserWithStatus) => void
  onReset:    (user: UserWithStatus) => void
  onDeactivate: (user: UserWithStatus) => void
  onReactivate: (user: UserWithStatus) => void
  currentUserId: string | undefined
}

export function UserDetailPanel({
  user,
  onEdit,
  onReset,
  onDeactivate,
  onReactivate,
  currentUserId,
}: UserDetailPanelProps) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    if (!user?.online || !user.sessionStart) return
    const update = () => setElapsed(elapsedSince(user.sessionStart!))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [user])

  const accent = user ? ROLE_CARD_ACCENT[user.role] : 'primary'

  return (
    <Card title={user?.name ?? 'User Detail'} accent={accent} className="h-full">
      {!user ? (
        <EmptyState
          icon={<User size={40} />}
          message="Select a user to view details"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-scada flex items-center justify-center font-mono font-bold text-sm flex-shrink-0
                ${ROLE_AVATAR_CLASS[user.role]}`}
            >
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-text-primary font-medium text-sm">{user.name}</span>
              <span className="text-text-muted text-xs font-mono">{user.email}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusDot status={user.online ? 'ok' : 'offline'} animated={user.online} size="sm" />
                <Badge
                  variant={user.status === 'active' ? 'ok' : 'offline'}
                  label={user.status.toUpperCase()}
                />
                <span className="text-text-muted text-xs font-mono">·</span>
                <Badge variant={ROLE_BADGE_VARIANT[user.role]} label={user.role} />
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono border-t border-scada-border pt-3">
            {([
              ['CREATED',           user.createdAt],
              ['LAST LOGIN',        user.lastLogin],
              ['LAST LOGIN IP',     user.lastLoginIP],
              ['ACTIVE SESSIONS',   String(user.activeSessions)],
              ['TOTAL LOGINS',      String(user.totalLogins)],
              ['PASSWORD LAST SET', user.createdAt],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <p className="text-text-muted uppercase tracking-wide">{label}</p>
                <p className="text-text-value">{value}</p>
              </div>
            ))}
          </div>

          {/* Session info */}
          {user.online && user.sessionStart && (
            <div className="border border-scada-border rounded-scada px-3 py-2 flex flex-col gap-1 text-xs font-mono">
              <p className="text-text-muted uppercase tracking-wide mb-1">Current Session</p>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Started:</span>
                <span className="text-text-value">{user.sessionStart}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Duration:</span>
                <span className="text-accent-primary value-display">{elapsed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">IP Address:</span>
                <span className="text-text-value">{user.lastLoginIP}</span>
              </div>
              {user.browser && (
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Browser:</span>
                  <span className="text-text-value">{user.browser}</span>
                </div>
              )}
            </div>
          )}

          {/* Recent activity */}
          {user.activities.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-text-muted text-xs font-mono uppercase tracking-wide">Recent Activity</p>
              <div className="border-t border-scada-border pt-2 flex flex-col gap-1.5">
                {user.activities.map((act, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ActivityIcon type={act.type} />
                    <span className="text-text-muted text-xs font-mono">
                      <span className="text-text-value mr-2">{act.timestamp}</span>
                      {act.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-scada-border flex-wrap">
            <Button variant="secondary" size="sm" onClick={() => onEdit(user)}>
              Edit User
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onReset(user)}>
              Reset Password
            </Button>
            {user.status === 'active' ? (
              <Button
                variant="danger"
                size="sm"
                disabled={user.id === currentUserId}
                onClick={() => onDeactivate(user)}
              >
                Deactivate
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => onReactivate(user)}>
                Reactivate
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}




