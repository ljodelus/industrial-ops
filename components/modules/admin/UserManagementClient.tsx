'use client'

// Client component — full User Management page logic
// Requires 'use client': useState, useEffect, Redux hooks, event handlers

import { useState, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectAllUsersExtended, deactivateUser, reactivateUser } from '@/store/slices/usersSlice'
import { selectCurrentUser }   from '@/store/slices/authSlice'
import { pushNotification }    from '@/store/slices/uiSlice'
import { Card }      from '@/components/ui/Card'
import { Input }     from '@/components/ui/Input'
import { Select }    from '@/components/ui/Select'
import { Button }    from '@/components/ui/Button'
import { StatusDot } from '@/components/ui/StatusDot'
import { EmptyState } from '@/components/ui/EmptyState'
import { Search, Plus, Download, User } from '@/lib/icons'
import type { UserWithStatus } from '@/types'

import { UserRow }            from './UserRow'
import { UserDetailPanel }    from './UserDetailPanel'
import { AddUserModal }       from './AddUserModal'
import { EditUserModal }      from './EditUserModal'
import { ResetPasswordModal } from './ResetPasswordModal'
import { RoleMatrix }         from './RoleMatrix'

const ROLE_FILTER_OPTIONS = [
  { value: '',           label: 'All Roles'   },
  { value: 'operator',   label: 'Operator'    },
  { value: 'supervisor', label: 'Supervisor'  },
  { value: 'engineer',   label: 'Engineer'    },
  { value: 'admin',      label: 'Admin'       },
]

const STATUS_FILTER_OPTIONS = [
  { value: '',         label: 'All'      },
  { value: 'active',   label: 'Active'   },
  { value: 'inactive', label: 'Inactive' },
]

const TABLE_HEADERS = [
  'USER', 'ROLE', 'STATUS', 'LAST LOGIN', 'ONLINE', 'SESSIONS', 'CREATED', 'ACTIONS',
]

type ModalType = 'add' | 'edit' | 'reset' | null

function exportCSV(users: UserWithStatus[]) {
  const header = 'Name,Email,Role,Status,Last Login,Active Sessions,Created'
  const rows   = users.map(u =>
    [u.name, u.email, u.role, u.status, u.lastLogin, u.activeSessions, u.createdAt].join(',')
  )
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'users.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function UserManagementClient() {
  const dispatch    = useAppDispatch()
  const users       = useAppSelector(selectAllUsersExtended)
  const currentUser = useAppSelector(selectCurrentUser)

  const [search,       setSearch]       = useState('')
  const [roleFilter,   setRoleFilter]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserWithStatus | null>(null)
  const [modal,        setModal]        = useState<ModalType>(null)
  const [editTarget,   setEditTarget]   = useState<UserWithStatus | null>(null)
  const [resetTarget,  setResetTarget]  = useState<UserWithStatus | null>(null)
  const [confirmDeact, setConfirmDeact] = useState<UserWithStatus | null>(null)
  const [confirmReact, setConfirmReact] = useState<UserWithStatus | null>(null)

  // ── Stats ────────────────────────────────────────────────────────────────────
  const total    = users.length
  const active   = users.filter(u => u.status === 'active').length
  const inactive = users.filter(u => u.status === 'inactive').length
  const online   = users.filter(u => u.online).length

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter(u => {
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
      if (roleFilter   && u.role   !== roleFilter)   return false
      if (statusFilter && u.status !== statusFilter) return false
      return true
    })
  }, [users, search, roleFilter, statusFilter])

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleEdit = (user: UserWithStatus) => {
    setEditTarget(user)
    setModal('edit')
  }

  const handleReset = (user: UserWithStatus) => {
    setResetTarget(user)
    setModal('reset')
  }

  const handleDeactivate = (user: UserWithStatus) => setConfirmDeact(user)
  const handleReactivate = (user: UserWithStatus) => setConfirmReact(user)

  const confirmDeactivate = () => {
    if (!confirmDeact) return
    dispatch(deactivateUser(confirmDeact.id))
    dispatch(pushNotification({
      id:      `toast-${Date.now()}`,
      type:    'success',
      message: `${confirmDeact.name} has been deactivated`,
    }))
    if (selectedUser?.id === confirmDeact.id) {
      setSelectedUser(prev => prev ? { ...prev, status: 'inactive', activeSessions: 0, online: false } : null)
    }
    setConfirmDeact(null)
  }

  const confirmReactivate = () => {
    if (!confirmReact) return
    dispatch(reactivateUser(confirmReact.id))
    dispatch(pushNotification({
      id:      `toast-${Date.now()}`,
      type:    'success',
      message: `${confirmReact.name} has been reactivated`,
    }))
    if (selectedUser?.id === confirmReact.id) {
      setSelectedUser(prev => prev ? { ...prev, status: 'active' } : null)
    }
    setConfirmReact(null)
  }

  const clearFilters = () => {
    setSearch('')
    setRoleFilter('')
    setStatusFilter('')
  }

  return (
    <div className="flex flex-col gap-4 p-4">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-text-value text-xl font-mono uppercase tracking-wide">
            User Management
          </h1>
          <p className="text-text-muted text-xs font-mono mt-0.5">
            System access control and role assignment
          </p>
        </div>

        <div className="w-72">
          <Input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search size={14} />}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => exportCSV(users)}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setModal('add')}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* ── Section A — Stats Bar ────────────────────────────────────────────── */}
      <div className="bg-scada-surface border border-scada-border rounded-scada px-6 py-3 flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs font-mono uppercase tracking-wide">Total Users</span>
          <span className="text-text-value font-mono font-bold text-sm">{total}</span>
        </div>
        <div className="w-px h-4 bg-scada-border" />
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs font-mono uppercase tracking-wide">Active</span>
          <span className="text-status-ok font-mono font-bold text-sm">{active}</span>
        </div>
        <div className="w-px h-4 bg-scada-border" />
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs font-mono uppercase tracking-wide">Inactive</span>
          <span className="text-status-offline font-mono font-bold text-sm">{inactive}</span>
        </div>
        <div className="w-px h-4 bg-scada-border" />
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs font-mono uppercase tracking-wide">Online Now</span>
          <span className="text-accent-primary font-mono font-bold text-sm">{online}</span>
          {online > 0 && <StatusDot status="ok" animated size="sm" />}
        </div>
      </div>

      {/* ── Section B — User Table ───────────────────────────────────────────── */}
      <Card
        title="Users"
        accent="primary"
        noPadding
        action={
          <div className="flex items-center gap-2">
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              options={ROLE_FILTER_OPTIONS}
              className="w-36"
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_FILTER_OPTIONS}
              className="w-28"
            />
            <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-scada-border bg-scada-panel">
                {TABLE_HEADERS.map(h => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-xs font-mono text-text-muted uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8">
                    <EmptyState
                      icon={<User size={40} />}
                      message="No users match the current filters"
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isSelected={selectedUser?.id === user.id}
                    isCurrentUser={user.id === currentUser?.id}
                    onClick={() => setSelectedUser(user)}
                    onEdit={() => handleEdit(user)}
                    onReset={() => handleReset(user)}
                    onDeactivate={() => handleDeactivate(user)}
                    onReactivate={() => handleReactivate(user)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Sections C + D ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4">
        <UserDetailPanel
          user={selectedUser}
          onEdit={handleEdit}
          onReset={handleReset}
          onDeactivate={handleDeactivate}
          onReactivate={handleReactivate}
          currentUserId={currentUser?.id}
        />
        <RoleMatrix />
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <AddUserModal
        open={modal === 'add'}
        onClose={() => setModal(null)}
      />
      <EditUserModal
        open={modal === 'edit'}
        onClose={() => { setModal(null); setEditTarget(null) }}
        user={editTarget}
      />
      <ResetPasswordModal
        open={modal === 'reset'}
        onClose={() => { setModal(null); setResetTarget(null) }}
        user={resetTarget}
      />

      {/* ── Deactivate Confirmation ──────────────────────────────────────────── */}
      {confirmDeact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-scada-panel border border-scada-border rounded-scada p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-text-primary text-sm font-medium uppercase tracking-wide">
              Deactivate {confirmDeact.name}?
            </h2>
            <p className="text-text-muted text-xs font-mono">
              This will end all active sessions and prevent this user from logging in.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDeact(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDeactivate}>Deactivate User</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reactivate Confirmation ──────────────────────────────────────────── */}
      {confirmReact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-scada-panel border border-scada-border rounded-scada p-6 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-text-primary text-sm font-medium uppercase tracking-wide">
              Reactivate {confirmReact.name}?
            </h2>
            <p className="text-text-muted text-xs font-mono">
              This will restore the user&apos;s access to the system.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmReact(null)}>Cancel</Button>
              <Button variant="primary" onClick={confirmReactivate}>Reactivate User</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



