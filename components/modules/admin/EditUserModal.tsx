'use client'

// Client component — edit user form, pre-filled with existing data

import { useEffect } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { updateUser }     from '@/store/slices/usersSlice'
import { pushNotification } from '@/store/slices/uiSlice'
import { Modal }  from '@/components/ui/Modal'
import { Input }  from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useZodForm }       from '@/lib/hooks/useZodForm'
import { editUserSchema }   from '@/types/schemas'
import type { EditUserFormValues } from '@/types/schemas'
import type { UserWithStatus }     from '@/types'

const ROLE_OPTIONS = [
  { value: 'operator',   label: 'Operator' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'engineer',   label: 'Engineer' },
  { value: 'admin',      label: 'Admin' },
]

interface EditUserModalProps {
  open:    boolean
  onClose: () => void
  user:    UserWithStatus | null
}

export function EditUserModal({ open, onClose, user }: EditUserModalProps) {
  const dispatch = useAppDispatch()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useZodForm(editUserSchema)

  useEffect(() => {
    if (open && user) {
      reset({ name: user.name, email: user.email, role: user.role })
    } else {
      reset()
    }
  }, [open, user, reset])

  const onSubmit = (data: EditUserFormValues) => {
    if (!user) return
    const tid = crypto.randomUUID()
    dispatch(updateUser({ id: user.id, ...data }))
    dispatch(pushNotification({
      id:      tid,
      type:    'success',
      message: `User ${data.name} updated successfully`,
    }))
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit User — ${user?.name ?? ''}`}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Full Name"
          type="text"
          register={register('name')}
          error={errors.name?.message}
        />
        <Input
          label="Email"
          type="text"
          register={register('email')}
          error={errors.email?.message}
        />
        <Select
          label="Role"
          options={ROLE_OPTIONS}
          register={register('role')}
          error={errors.role?.message}
        />
        <p className="text-text-muted text-xs italic font-mono">
          PASSWORD — Not changed. Use Reset Password to change.
        </p>
      </form>
    </Modal>
  )
}


