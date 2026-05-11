'use client'

// Client component — add user form with Zod validation + role preview

import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { addUser }        from '@/store/slices/usersSlice'
import { pushNotification } from '@/store/slices/uiSlice'
import { Modal }   from '@/components/ui/Modal'
import { Input }   from '@/components/ui/Input'
import { Select }  from '@/components/ui/Select'
import { Button }  from '@/components/ui/Button'
import { CheckCircle, XCircle } from '@/lib/icons'
import { useZodForm }  from '@/lib/hooks/useZodForm'
import { userSchema }  from '@/types/schemas'
import type { UserFormValues } from '@/types/schemas'
import type { UserRole, UserWithStatus } from '@/types'
import { ROLE_PERMISSIONS } from './userHelpers'

const ROLE_OPTIONS = [
  { value: 'operator',   label: 'Operator' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'engineer',   label: 'Engineer' },
  { value: 'admin',      label: 'Admin' },
]

interface AddUserModalProps {
  open:    boolean
  onClose: () => void
}

export function AddUserModal({ open, onClose }: AddUserModalProps) {
  const dispatch = useAppDispatch()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useZodForm(userSchema, {
    defaultValues: {
      name:            '',
      email:           '',
      role:            'operator',
      password:        '',
      confirmPassword: '',
    },
  })

  const selectedRole = (watch('role') ?? 'operator') as UserRole

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const onSubmit = (data: UserFormValues) => {
    const uid = crypto.randomUUID()
    const tid = crypto.randomUUID()
    const newUser: UserWithStatus = {
      id:             uid,
      name:           data.name,
      email:          data.email,
      role:           data.role as UserWithStatus['role'],
      status:         'active',
      lastLogin:      '—',
      lastLoginIP:    '—',
      activeSessions: 0,
      totalLogins:    0,
      createdAt:      new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      online:         false,
      activities:     [],
    }
    dispatch(addUser(newUser))
    dispatch(pushNotification({
      id:      tid,
      type:    'success',
      message: `User ${data.name} created successfully`,
    }))
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New User"
      maxWidth="max-w-lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            type="submit"
            loading={isSubmitting}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={handleSubmit(onSubmit as any)}
          >
            Create User
          </Button>
        </>
      }
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit as any)}>
        <Input
          label="Full Name"
          type="text"
          placeholder="John Carter"
          register={register('name')}
          error={errors.name?.message}
        />
        <Input
          label="Email"
          type="text"
          placeholder="user@ops.com"
          register={register('email')}
          error={errors.email?.message}
        />
        <Select
          label="Role"
          options={ROLE_OPTIONS}
          register={register('role')}
          error={errors.role?.message}
        />

        {/* Role preview */}
        <div className="bg-scada-bg border border-scada-border rounded-scada p-3">
          <p className="text-text-muted text-xs font-mono uppercase tracking-wide mb-2">
            {selectedRole.toUpperCase()} can access:
          </p>
          <ul className="flex flex-col gap-1">
            {ROLE_PERMISSIONS.map(perm => {
              const allowed = perm.roles.includes(selectedRole)
              return (
                <li key={perm.label} className="flex items-center gap-2 text-xs text-text-muted font-mono">
                  {allowed
                    ? <CheckCircle size={12} className="text-status-ok flex-shrink-0" />
                    : <XCircle    size={12} className="text-status-offline flex-shrink-0" />
                  }
                  {perm.label}
                </li>
              )
            })}
          </ul>
        </div>

        <Input
          label="Password"
          type="password"
          placeholder="Min 6 characters"
          register={register('password')}
          error={errors.password?.message}
        />
        <Input
          label="Confirm Password"
          type="password"
          placeholder="Repeat password"
          register={register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
      </form>
    </Modal>
  )
}



