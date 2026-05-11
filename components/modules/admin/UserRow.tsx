'use client'

// Client component — individual user row with avatar, badges, and actions

import { Badge }     from '@/components/ui/Badge'
import { StatusDot } from '@/components/ui/StatusDot'
import { Tooltip }   from '@/components/ui/Tooltip'
import { Pencil, Lock, UserX, UserCheck } from '@/lib/icons'
import type { UserWithStatus } from '@/types'
import { ROLE_BADGE_VARIANT, ROLE_AVATAR_CLASS, getInitials } from './userHelpers'

interface UserRowProps {
  user:          UserWithStatus
  isSelected:    boolean
  isCurrentUser: boolean
  onClick:       () => void
  onEdit:        () => void
  onReset:       () => void
  onDeactivate:  () => void
  onReactivate:  () => void
}

export function UserRow({
  user,
  isSelected,
  isCurrentUser,
  onClick,
  onEdit,
  onReset,
  onDeactivate,
  onReactivate,
}: UserRowProps) {
  const isInactive = user.status === 'inactive'

  return (
    <tr
      onClick={onClick}
      className={`border-b border-scada-border cursor-pointer transition-colors
        ${user.online         ? 'border-l-2 border-l-status-ok'       : ''}
        ${isSelected          ? 'bg-scada-panel border-l-2 border-l-accent-primary' : 'hover:bg-scada-panel'}
        ${isInactive          ? 'opacity-60'                           : ''}
      `}
    >
      {/* USER — Avatar + name + email */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-scada flex items-center justify-center font-mono font-bold text-xs flex-shrink-0
              ${ROLE_AVATAR_CLASS[user.role]}`}
          >
            {getInitials(user.name)}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${isInactive ? 'text-text-muted' : 'text-text-primary'}`}>
              {user.name}
              {isCurrentUser && <span className="ml-2 text-accent-gold text-xs font-mono">(you)</span>}
            </span>
            <span className="text-xs font-mono text-text-muted">{user.email}</span>
          </div>
        </div>
      </td>

      {/* ROLE */}
      <td className="px-3 py-3">
        <Badge variant={ROLE_BADGE_VARIANT[user.role]} label={user.role} />
      </td>

      {/* STATUS */}
      <td className="px-3 py-3">
        <Badge
          variant={user.status === 'active' ? 'ok' : 'offline'}
          label={user.status.toUpperCase()}
        />
      </td>

      {/* LAST LOGIN */}
      <td className="px-3 py-3 font-mono text-xs text-text-muted whitespace-nowrap">
        {user.lastLogin}
      </td>

      {/* ONLINE */}
      <td className="px-3 py-3">
        <StatusDot
          status={user.online ? 'ok' : 'offline'}
          animated={user.online}
          size="sm"
        />
      </td>

      {/* SESSIONS */}
      <td className="px-3 py-3 font-mono text-xs text-accent-primary">
        {user.activeSessions}
      </td>

      {/* CREATED */}
      <td className="px-3 py-3 font-mono text-xs text-text-muted whitespace-nowrap">
        {user.createdAt}
      </td>

      {/* ACTIONS */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <Tooltip content="Edit user">
            <button
              onClick={onEdit}
              className="text-text-muted hover:text-accent-primary transition-colors"
              aria-label="Edit user"
            >
              <Pencil size={14} />
            </button>
          </Tooltip>

          <Tooltip content="Reset password">
            <button
              onClick={onReset}
              className="text-text-muted hover:text-accent-gold transition-colors"
              aria-label="Reset password"
            >
              <Lock size={14} />
            </button>
          </Tooltip>

          {user.status === 'active' ? (
            <Tooltip content={isCurrentUser ? 'Cannot deactivate your own account' : 'Deactivate user'}>
              <button
                onClick={isCurrentUser ? undefined : onDeactivate}
                disabled={isCurrentUser}
                className={`transition-colors ${
                  isCurrentUser
                    ? 'text-text-muted opacity-30 cursor-not-allowed'
                    : 'text-text-muted hover:text-status-alarm'
                }`}
                aria-label="Deactivate user"
              >
                <UserX size={14} />
              </button>
            </Tooltip>
          ) : (
            <Tooltip content="Reactivate user">
              <button
                onClick={onReactivate}
                className="text-text-muted hover:text-status-ok transition-colors"
                aria-label="Reactivate user"
              >
                <UserCheck size={14} />
              </button>
            </Tooltip>
          )}
        </div>
      </td>
    </tr>
  )
}

