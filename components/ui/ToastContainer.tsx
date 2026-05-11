'use client'

// Client component — reads notifications from Redux and renders Toast list

import { useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectNotifications, dismissNotification } from '@/store/slices/uiSlice'
import { Toast } from './Toast'

export function ToastContainer() {
  const dispatch       = useAppDispatch()
  const notifications  = useAppSelector(selectNotifications)

  const handleDismiss = useCallback((id: string) => {
    dispatch(dismissNotification(id))
  }, [dispatch])

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map(n => (
        <div key={n.id} className="pointer-events-auto">
          <Toast
            id={n.id}
            type={n.type}
            message={n.message}
            onDismiss={handleDismiss}
          />
        </div>
      ))}
    </div>
  )
}

