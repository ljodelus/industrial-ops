'use client'

// Client component — reads users from Redux, allows role changes (admin only)

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectAllUsers, updateRole, removeUser } from '@/store/slices/usersSlice'
import { selectCurrentUser, selectUserRole }       from '@/store/slices/authSlice'
import type { User, UserRole } from '@/types'
import { Badge }     from '@/components/ui/Badge'
import { Select }    from '@/components/ui/Select'
import { Button }    from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

type BadgeVariant = 'alarm' | 'warning' | 'ok' | 'offline' | 'idle' | 'info' | 'gold'

const ROLE_VARIANT: Record<UserRole, BadgeVariant> = {
  admin:      'alarm',
  engineer:   'info',
  supervisor: 'warning',
  operator:   'idle',
}

const ROLE_OPTIONS = [
  { value: 'operator',   label: 'Operator' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'engineer',   label: 'Engineer' },
  { value: 'admin',      label: 'Admin' },
]

interface UserRowProps {
  user:        User
  isCurrentUser: boolean
  canEdit:     boolean
  onRoleChange: (id: string, role: UserRole) => void
  onRemove:    (id: string) => void
}

function UserRow({ user, isCurrentUser, canEdit, onRoleChange, onRemove }: UserRowProps) {
  return (
    <tr className={`border-b border-scada-border transition-colors hover:bg-scada-panel
      ${isCurrentUser ? 'bg-accent-primary/5' : ''}`}
    >
      {/* Name */}
      <td className="px-4 py-3 font-mono text-sm text-text-primary">
        <div className="flex items-center gap-2">
          {user.name}
          {isCurrentUser && (
            <span className="text-accent-gold text-xs font-mono">(you)</span>
          )}
        </div>
      </td>

      {/* Email */}
      <td className="px-4 py-3 text-xs font-mono text-text-muted">
        {user.email}
      </td>

      {/* Role */}
      <td className="px-4 py-3 whitespace-nowrap">
        {canEdit && !isCurrentUser ? (
          <Select
            value={user.role}
            onChange={val => onRoleChange(user.id, val as UserRole)}
            options={ROLE_OPTIONS}
            className="w-36"
          />
        ) : (
          <Badge variant={ROLE_VARIANT[user.role]} label={user.role} />
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        {canEdit && !isCurrentUser && (
          <Button variant="danger" size="sm" onClick={() => onRemove(user.id)}>
            Remove
          </Button>
        )}
      </td>
    </tr>
  )
}

export function UserTable() {
  const dispatch    = useAppDispatch()
  const users       = useAppSelector(selectAllUsers)
  const currentUser = useAppSelector(selectCurrentUser)
  const role        = useAppSelector(selectUserRole)

  // Only admins can edit users
  const canEdit = role === 'admin'

  const handleRoleChange = (id: string, newRole: UserRole) => {
    dispatch(updateRole({ id, role: newRole }))
  }

  const handleRemove = (id: string) => {
    dispatch(removeUser(id))
  }

  return (
    <div className="bg-scada-surface border border-scada-border rounded-scada overflow-x-auto">
      {users.length === 0 ? (
        <div className="p-8">
          <EmptyState message="No users found." />
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-scada-border bg-scada-panel">
              <th className="px-4 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wide">Name</th>
              <th className="px-4 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wide">Email</th>
              <th className="px-4 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wide">Role</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <UserRow
                key={user.id}
                user={user}
                isCurrentUser={user.id === currentUser?.id}
                canEdit={canEdit}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
