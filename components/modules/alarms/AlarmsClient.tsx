'use client'

// Client component — orchestrates the full alarms page:
// useState (selectedAlarmId, sort option, modals, banner, pill, scroll)
// useEffect for new-alarm tracking + auto-scroll pill
// useRef for alarm list scroll container
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectAllAlarms,
  selectFilteredAlarms,
  selectUnacknowledgedCount,
  acknowledge,
  acknowledgeAll,
  removeAlarm,
  clearFilters,
} from '@/store/slices/alarmsSlice'
import { selectCurrentUser, selectUserRole } from '@/store/slices/authSlice'
import { useAlarmSimulation }  from '@/lib/hooks/useAlarmSimulation'
import type { Alarm, AlarmSeverity } from '@/types'

import { AlarmStatsBar }    from './AlarmStatsBar'
import { AlarmFilterBar }   from './AlarmFilterBar'
import { AlarmRow }         from './AlarmRow'
import { AlarmDetailPanel } from './AlarmDetailPanel'
import { AlarmStatsPanel }  from './AlarmStatsPanel'
import { NewAlarmBanner }   from './NewAlarmBanner'
import { NewAlarmPill }     from './NewAlarmPill'

import { Button }     from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal }      from '@/components/ui/Modal'
import { RefreshCw, CheckCircle, Clock, BellOff } from '@/lib/icons'

// ─── Severity sort order ─────────────────────────────────────────────────────
const SEVERITY_ORDER: Record<AlarmSeverity, number> = {
  critical: 0, high: 1, medium: 2, low: 3, info: 4,
}

type SortOption = 'severity' | 'time' | 'source' | 'category'

function sortAlarms(alarms: Alarm[], opt: SortOption): Alarm[] {
  const unacked = alarms.filter(a => !a.acknowledged)
  const acked   = alarms.filter(a =>  a.acknowledged)

  const cmp = (a: Alarm, b: Alarm): number => {
    if (opt === 'severity') {
      const d = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
      if (d !== 0) return d
      return new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
    }
    if (opt === 'time')     return new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
    if (opt === 'source')   return a.source.localeCompare(b.source)
    if (opt === 'category') return a.category.localeCompare(b.category)
    return 0
  }

  const byRecent = (a: Alarm, b: Alarm) =>
    new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()

  return [...unacked.sort(cmp), ...acked.sort(byRecent)]
}

const SORT_LABELS: Record<SortOption, string> = {
  severity: 'Severity',
  time:     'Time (newest first)',
  source:   'Source (A–Z)',
  category: 'Category',
}

export function AlarmsClient() {
  const dispatch   = useAppDispatch()
  const router     = useRouter()
  const user       = useAppSelector(selectCurrentUser)
  const role       = useAppSelector(selectUserRole)
  const allAlarms  = useAppSelector(selectAllAlarms)
  const filtered   = useAppSelector(selectFilteredAlarms)
  const unackCount = useAppSelector(selectUnacknowledgedCount)

  const canDelete  = role === 'engineer' || role === 'admin'

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [selectedId,       setSelectedId]       = useState<string | null>(null)
  const [sortOption,       setSortOption]        = useState<SortOption>('severity')
  const [showSortMenu,     setShowSortMenu]      = useState(false)
  const [showAckAllModal,  setShowAckAllModal]   = useState(false)
  const [deleteTarget,     setDeleteTarget]      = useState<string | null>(null)
  const [criticalBanner,   setCriticalBanner]    = useState<Alarm | null>(null)
  const [newAlarmPillCount,setNewAlarmPillCount] = useState(0)
  const [hasScrolled,      setHasScrolled]       = useState(false)
  const [newAlarmIds,      setNewAlarmIds]        = useState<Set<string>>(new Set())

  const listRef      = useRef<HTMLDivElement>(null)
  const prevLenRef   = useRef(allAlarms.length)
  const bannerTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Simulation ─────────────────────────────────────────────────────────────
  useAlarmSimulation()

  // ── Detect new alarms arriving via simulation ──────────────────────────────
  useEffect(() => {
    if (allAlarms.length > prevLenRef.current) {
      const newest = allAlarms[0]  // addAlarm does unshift → index 0 is newest

      // Mark as new for slide-in animation (remove after 700ms)
      setNewAlarmIds(prev => new Set([...prev, newest.id]))
      setTimeout(() => {
        setNewAlarmIds(prev => { const n = new Set(prev); n.delete(newest.id); return n })
      }, 700)

      if (newest.severity === 'critical' || newest.severity === 'high') {
        if (newest.severity === 'critical') {
          if (bannerTimer.current) clearTimeout(bannerTimer.current)
          setCriticalBanner(newest)
          bannerTimer.current = setTimeout(() => setCriticalBanner(null), 2000)
        }
        if (hasScrolled) {
          setNewAlarmPillCount(c => c + 1)
        }
      }
    }
    prevLenRef.current = allAlarms.length
  }, [allAlarms, hasScrolled])

  // ── Scroll detection ───────────────────────────────────────────────────────
  const handleScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return
    setHasScrolled(el.scrollTop > 80)
  }, [])

  // ── Scroll to top + dismiss pill ───────────────────────────────────────────
  const scrollToTop = () => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    setNewAlarmPillCount(0)
    setHasScrolled(false)
  }

  // ── Sorted alarm list ──────────────────────────────────────────────────────
  const sorted = useMemo(() => sortAlarms(filtered, sortOption), [filtered, sortOption])

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleAcknowledge = (id: string) => {
    dispatch(acknowledge({ id, acknowledgedBy: user?.name ?? 'Unknown' }))
    if (selectedId === id) {
      // keep selected; detail panel will refresh via Redux
    }
  }

  const handleAcknowledgeAll = () => {
    dispatch(acknowledgeAll(user?.name ?? 'Unknown'))
    setShowAckAllModal(false)
  }

  const handleDeleteRequest = (id: string) => setDeleteTarget(id)

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    dispatch(removeAlarm(deleteTarget))
    if (selectedId === deleteTarget) setSelectedId(null)
    setDeleteTarget(null)
  }

  const handleRefresh = () => {
    // In a real app this would refetch; here it resets local sort
    setSortOption('severity')
  }

  const selectedAlarm = allAlarms.find(a => a.id === selectedId) ?? null
  const deleteAlarmMsg = deleteTarget
    ? allAlarms.find(a => a.id === deleteTarget)?.message
    : null

  return (
    <div className="flex flex-col gap-0 h-full">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between px-6 pt-4 pb-3 border-b border-scada-border">
        <div>
          <h1 className="text-text-value text-xl font-mono font-semibold uppercase tracking-wide">
            Active Alarms
          </h1>
          <p className="text-text-muted text-xs font-mono mt-0.5">
            Real-time alarm monitoring and acknowledgment
          </p>
          <AlarmStatsBar />
        </div>

        <div className="flex items-center gap-2 mt-1">
          <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={handleRefresh}>
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<CheckCircle size={14} />}
            disabled={unackCount === 0}
            onClick={() => setShowAckAllModal(true)}
          >
            Acknowledge All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Clock size={14} />}
            onClick={() => router.push('/alarms/history')}
          >
            History
          </Button>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────────────── */}
      <AlarmFilterBar />

      {/* ── Critical alarm banner ─────────────────────────────────────────── */}
      {criticalBanner && (
        <NewAlarmBanner
          message={criticalBanner.message}
          onDismiss={() => setCriticalBanner(null)}
        />
      )}

      {/* ── Main content (table + panels) ─────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* Sort indicator bar */}
        <div className="flex items-center gap-2 px-6 py-2 bg-scada-bg border-b border-scada-border relative">
          <span className="text-text-muted text-[10px] uppercase font-mono tracking-wide">
            Sorted by: {SORT_LABELS[sortOption]}
          </span>
          <span className="text-text-muted text-[10px] font-mono opacity-50 mx-1">·</span>
          <span className="text-text-muted text-[10px] font-mono">Unacknowledged first</span>
          <span className="text-text-muted text-[10px] font-mono opacity-50 mx-1">·</span>
          <button
            onClick={() => setShowSortMenu(s => !s)}
            className="text-accent-primary text-[10px] font-mono underline underline-offset-2 hover:opacity-80"
          >
            Change sort
          </button>

          {/* Sort dropdown */}
          {showSortMenu && (
            <div className="absolute left-64 top-full mt-1 z-30 bg-scada-panel border border-scada-border rounded-scada py-1 shadow-xl min-w-44">
              {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                <button
                  key={opt}
                  onClick={() => { setSortOption(opt); setShowSortMenu(false) }}
                  className={`block w-full text-left px-4 py-2 text-xs font-mono transition-colors
                    ${opt === sortOption
                      ? 'text-accent-primary bg-scada-surface'
                      : 'text-text-muted hover:text-text-primary hover:bg-scada-surface'
                    }`}
                >
                  {SORT_LABELS[opt]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* New alarm pill */}
        {newAlarmPillCount > 0 && (
          <div className="px-6 py-1.5 bg-scada-bg flex justify-center">
            <NewAlarmPill count={newAlarmPillCount} onClick={scrollToTop} />
          </div>
        )}

        {/* ── Alarm list + side panels ─────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Alarm list */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto min-w-0"
          >
            {sorted.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<BellOff size={40} className="text-status-ok" />}
                  message="No alarms match the current filters."
                  action={
                    <Button variant="ghost" size="sm"
                      onClick={() => dispatch(clearFilters())}
                    >
                      Clear filters
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="divide-y-0">
                {sorted.map(alarm => (
                  <AlarmRow
                    key={alarm.id}
                    alarm={alarm}
                    selected={alarm.id === selectedId}
                    isNew={newAlarmIds.has(alarm.id)}
                    canDelete={canDelete}
                    onSelect={setSelectedId}
                    onAcknowledge={handleAcknowledge}
                    onDelete={handleDeleteRequest}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Side panels — always visible, detail shown on alarm select ─── */}
          <div className="w-105 shrink-0 border-l border-scada-border flex flex-col gap-0 overflow-y-auto bg-scada-bg">
              {/* Detail panel — only when alarm selected */}
              {selectedAlarm ? (
                <div className="p-3">
                  <AlarmDetailPanel
                    alarm={selectedAlarm}
                    onAlarmDelete={handleDeleteRequest}
                  />
                </div>
              ) : (
                <div className="p-4 flex-1 flex items-center justify-center">
                  <p className="text-text-muted text-xs font-mono text-center">
                    Select an alarm to view details
                  </p>
                </div>
              )}

              {/* Stats panel — always visible */}
              <div className="p-3 border-t border-scada-border">
                <AlarmStatsPanel />
              </div>
            </div>
        </div>
      </div>

      {/* ── Acknowledge All Confirmation Modal ────────────────────────────── */}
      <Modal
        open={showAckAllModal}
        onClose={() => setShowAckAllModal(false)}
        title="Acknowledge All Alarms"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowAckAllModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAcknowledgeAll}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-text-primary text-sm font-mono">
          Acknowledge all{' '}
          <span className="text-status-alarm font-bold">{unackCount}</span>{' '}
          unacknowledged alarm{unackCount !== 1 ? 's' : ''}?
        </p>
        <p className="text-text-muted text-xs font-mono mt-2">
          This will mark all alarms as acknowledged by{' '}
          <span className="text-accent-primary">{user?.name ?? 'Unknown'}</span>.
        </p>
      </Modal>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Alarm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-text-primary text-sm font-mono">
          Permanently remove this alarm from the log?
        </p>
        {deleteAlarmMsg && (
          <p className="text-text-muted text-xs font-mono mt-2 border-l-2 border-status-alarm pl-3">
            {deleteAlarmMsg}
          </p>
        )}
      </Modal>

    </div>
  )
}





