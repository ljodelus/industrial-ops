'use client'

// Client component — reset password form for a specific user

import { useEffect, useState } from 'react'
import { useAppDispatch }      from '@/store/hooks'
import { pushNotification }    from '@/store/slices/uiSlice'
import { Modal }  from '@/components/ui/Modal'
import { Input }  from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useZodForm }              from '@/lib/hooks/useZodForm'
import { resetPasswordSchema }     from '@/types/schemas'
import type { UserWithStatus }         from '@/types'

interface ResetPasswordModalProps {
  open:    boolean
  onClose: () => void
  user:    UserWithStatus | null
}

export function ResetPasswordModal({ open, onClose, user }: ResetPasswordModalProps) {
  const dispatch  = useAppDispatch()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useZodForm(resetPasswordSchema)

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  const onSubmit = () => {
    setLoading(true)
    const tid = crypto.randomUUID()
    setTimeout(() => {
      setLoading(false)
      dispatch(pushNotification({
        id:      tid,
        type:    'success',
        message: `Password reset for ${user?.name ?? 'user'}`,
      }))
      onClose()
    }, 600)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset Password"
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            loading={loading}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={handleSubmit(onSubmit as any)}
          >
            Reset Password
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-text-muted text-xs font-mono">
          You are resetting the password for:
          <br />
          <span className="text-text-primary font-bold">
            {user?.name} ({user?.email})
          </span>
        </p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit as any)}>
          <Input
            label="New Password"
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
      </div>
    </Modal>
  )
}





