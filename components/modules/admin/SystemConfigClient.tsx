'use client'

// Client component — main System Config page orchestrator
// Requires client hooks: useState, useAppSelector, useAppDispatch

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectUserRole } from '@/store/slices/authSlice'
import { pushNotification } from '@/store/slices/uiSlice'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Save, RotateCcw, TriangleAlert } from '@/lib/icons'
import { ConfigNav } from './ConfigNav'
import { SystemOverviewTab } from './SystemOverviewTab'
import { PLCConnectionsTab } from './PLCConnectionsTab'
import { CraneConfigTab } from './CraneConfigTab'
import { LineTankSetupTab } from './LineTankSetupTab'
import { NetworkSettingsTab } from './NetworkSettingsTab'
import { AppSettingsTab } from './AppSettingsTab'
import { SecuritySettingsTab } from './SecuritySettingsTab'

export function SystemConfigClient() {
  const role     = useAppSelector(selectUserRole)
  const dispatch = useAppDispatch()
  const router   = useRouter()

  const [activeTab,          setActiveTab]          = useState('overview')
  const [isDirty,            setIsDirty]            = useState(false)
  const [hasCriticalChanges, setHasCriticalChanges] = useState(false)
  const [isSaving,           setIsSaving]           = useState(false)
  const [resetKey,           setResetKey]           = useState(0)

  // Redirect non-admins
  useEffect(() => {
    if (role !== null && role !== 'admin') {
      router.replace('/overview')
    }
  }, [role, router])

  // Navigate-away guard
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const markDirty    = useCallback(() => setIsDirty(true), [])
  const markCritical = useCallback(() => { setIsDirty(true); setHasCriticalChanges(true) }, [])

  function handleSave() {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setIsDirty(false)
      setHasCriticalChanges(false)
      dispatch(pushNotification({
        id:      `cfg-saved-${Date.now()}`,
        type:    'success',
        message: 'Configuration saved',
      }))
    }, 800)
  }

  function handleReset() {
    const confirmed = window.confirm('Reset all changes? This will revert all unsaved settings.')
    if (!confirmed) return
    setIsDirty(false)
    setHasCriticalChanges(false)
    setResetKey(k => k + 1)
  }

  function handleTabChange(tab: string) {
    if (isDirty) {
      // Allow tab switching without blocking — user can navigate freely within the page
    }
    setActiveTab(tab)
  }

  if (role !== null && role !== 'admin') return null

  return (
    <div className="flex flex-col h-full">

      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-scada-border flex-shrink-0">
        <div>
          <p className="text-text-value font-mono text-xl uppercase tracking-widest">System Configuration</p>
          <p className="text-text-muted text-xs font-mono mt-0.5">Global system parameters and topology</p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && <Badge variant="warning" label="Unsaved Changes" />}
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw size={14} />}
            onClick={handleReset}
            disabled={!isDirty}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Save size={14} />}
            loading={isSaving}
            onClick={handleSave}
            disabled={!isDirty}
          >
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Critical Changes Banner */}
      {hasCriticalChanges && (
        <div className="mx-6 mt-3 flex items-start gap-3 px-4 py-3 bg-status-alarm/10 border border-status-alarm/30 rounded-scada flex-shrink-0">
          <TriangleAlert size={14} className="text-status-alarm mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-status-alarm text-xs font-mono uppercase tracking-wide">
              Critical Changes Detected
            </span>
            <p className="text-status-alarm text-xs font-mono mt-0.5">
              Saving will restart the PLC communication service. Active jobs may be interrupted.
            </p>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden mt-4">
        <ConfigNav activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {activeTab === 'overview'  && (
            <SystemOverviewTab onNavigateToTab={handleTabChange} />
          )}
          {activeTab === 'plc'       && (
            <PLCConnectionsTab key={resetKey} onDirty={markDirty} onCritical={markCritical} />
          )}
          {activeTab === 'cranes'    && (
            <CraneConfigTab key={resetKey} onDirty={markDirty} onCritical={markCritical} />
          )}
          {activeTab === 'lines'     && (
            <LineTankSetupTab key={resetKey} onDirty={markDirty} />
          )}
          {activeTab === 'network'   && (
            <NetworkSettingsTab key={resetKey} onDirty={markDirty} />
          )}
          {activeTab === 'app'       && (
            <AppSettingsTab key={resetKey} onDirty={markDirty} />
          )}
          {activeTab === 'security'  && (
            <SecuritySettingsTab key={resetKey} onDirty={markDirty} />
          )}
        </div>
      </div>
    </div>
  )
}


