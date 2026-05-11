'use client'

// Client component — orchestrates alarm settings page:
// reads auth state from Redux, manages active tab, dirty state, saving flow, and reset confirmation.

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from '@/lib/icons'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectUserRole } from '@/store/slices/authSlice'
import { pushNotification } from '@/store/slices/uiSlice'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { AlarmSettingsNav } from './AlarmSettingsNav'
import { AlarmCategoriesTab } from './AlarmCategoriesTab'
import { AlarmThresholdsTab } from './AlarmThresholdsTab'
import { AlarmTimeLimitsTab } from './AlarmTimeLimitsTab'
import { AlarmSuppressionTab } from './AlarmSuppressionTab'
import { AlarmEscalationTab } from './AlarmEscalationTab'
import { AlarmSystemDefaultsTab } from './AlarmSystemDefaultsTab'

type TabId = 'categories' | 'thresholds' | 'timeLimits' | 'suppression' | 'escalation' | 'systemDefaults'

export function AlarmSettingsClient() {
  const router   = useRouter()
  const dispatch = useAppDispatch()
  const role     = useAppSelector(selectUserRole)

  const [activeTab,         setActiveTab]         = useState<TabId>('categories')
  const [isDirty,           setIsDirty]           = useState(false)
  const [isSaving,          setIsSaving]          = useState(false)
  const [showResetConfirm,  setShowResetConfirm]  = useState(false)

  // Role guard — redirect operator/supervisor to /alarms
  useEffect(() => {
    if (role === 'operator' || role === 'supervisor') {
      router.replace('/alarms')
    }
  }, [role, router])

  // Navigate-away dirty check
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const markDirty = useCallback(() => {
    setIsDirty(true)
  }, [])

  function handleSave() {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setIsDirty(false)
      dispatch(
        pushNotification({
          id:      `alarm-settings-saved-${Date.now()}`,
          type:    'success',
          message: 'Alarm settings saved successfully',
        })
      )
    }, 600)
  }

  function handleResetConfirm() {
    setShowResetConfirm(false)
    setIsDirty(false)
    // Re-mount tabs by forcing a key remount via a reset key if needed.
    // For the mock, we simply mark as clean — actual tab state resets on remount.
    dispatch(
      pushNotification({
        id:      `alarm-settings-reset-${Date.now()}`,
        type:    'info',
        message: 'Settings reverted to last saved state',
      })
    )
  }

  // If role is restricted, render nothing while redirect happens
  if (role === 'operator' || role === 'supervisor') {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-scada-border bg-scada-surface shrink-0">
        <div>
          <h1 className="text-text-value text-xl font-mono uppercase">Alarm Settings</h1>
          <p className="text-text-muted text-xs font-mono mt-0.5">
            Configure alarm behavior and thresholds
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <Badge variant="warning" label="UNSAVED CHANGES" />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResetConfirm(true)}
            disabled={!isDirty || isSaving}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={isSaving ? undefined : <Save size={14} />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Spinner size="sm" /> : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Nav */}
        <div className="w-52 shrink-0 bg-scada-surface border-r border-scada-border overflow-y-auto">
          <AlarmSettingsNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-scada-bg overflow-y-auto p-6">
          {activeTab === 'categories'     && <AlarmCategoriesTab     onDirty={markDirty} />}
          {activeTab === 'thresholds'     && <AlarmThresholdsTab     onDirty={markDirty} />}
          {activeTab === 'timeLimits'     && <AlarmTimeLimitsTab     onDirty={markDirty} />}
          {activeTab === 'suppression'    && <AlarmSuppressionTab    onDirty={markDirty} />}
          {activeTab === 'escalation'     && <AlarmEscalationTab     onDirty={markDirty} />}
          {activeTab === 'systemDefaults' && <AlarmSystemDefaultsTab onDirty={markDirty} />}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Discard Changes"
        accentColor="border-t-2 border-t-status-warning"
        maxWidth="max-w-sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)}>
              Keep Editing
            </Button>
            <Button variant="danger" size="sm" onClick={handleResetConfirm}>
              Discard Changes
            </Button>
          </>
        }
      >
        <p className="text-text-muted text-sm">
          Discard all unsaved changes? All modified fields will revert to their last saved values.
        </p>
      </Modal>
    </div>
  )
}

