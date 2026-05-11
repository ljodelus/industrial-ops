'use client'
// Client component — orchestrates entire Audit Log page
// Uses Redux hooks, router redirect, and manages all filter/pagination state

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectAllAuditEntries } from '@/store/slices/auditSlice'
import { selectCurrentUser } from '@/store/slices/authSlice'
import { pushNotification } from '@/store/slices/uiSlice'
import { Button } from '@/components/ui'
import { FileDown, FileText } from '@/lib/icons'
import { AuditStatsBar }       from './AuditStatsBar'
import { AuditFilterBar }      from './AuditFilterBar'
import { AuditTable }          from './AuditTable'
import { AuditTimelineChart }  from './AuditTimelineChart'
import { AuditTopUsersPanel }  from './AuditTopUsersPanel'
import type { AuditCategory, AuditResult, AuditSeverity, AuditEntry } from '@/types'

const QUICK_PERIODS = ['Today', 'Last 7d', 'Last 30d', 'This Month'] as const

function getPeriodDates(period: string): { from: string; to: string } {
  const now  = new Date()
  const to   = now.toISOString().slice(0, 10)
  const from = new Date(now)

  if (period === 'Today') {
    return { from: to, to }
  }
  if (period === 'Last 7d') {
    from.setDate(now.getDate() - 7)
    return { from: from.toISOString().slice(0, 10), to }
  }
  if (period === 'Last 30d') {
    from.setDate(now.getDate() - 30)
    return { from: from.toISOString().slice(0, 10), to }
  }
  // This Month
  from.setDate(1)
  return { from: from.toISOString().slice(0, 10), to }
}

function entriesToCsv(entries: AuditEntry[]): string {
  const header = ['ID', 'Timestamp', 'Category', 'User', 'Action', 'Target', 'IP Address', 'Result', 'Severity', 'Event ID', 'Session ID', 'User Agent', 'Duration']
  const rows = entries.map(e => [
    e.id, e.timestamp, e.category, e.user, e.action, e.target, e.ipAddress, e.result, e.severity,
    e.eventId, e.sessionId, e.userAgent, e.duration,
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  return [header.join(','), ...rows].join('\n')
}

export function AuditLogClient() {
  const router   = useRouter()
  const dispatch = useAppDispatch()
  const user     = useAppSelector(selectCurrentUser)
  const entries  = useAppSelector(selectAllAuditEntries)

  // Role guard
  if (user && user.role !== 'admin') {
    router.replace('/overview')
    return null
  }

  const defaultPeriod = 'Last 7d'
  const defaultDates  = getPeriodDates(defaultPeriod)

  const [quickPeriod, setQuickPeriod] = useState<string>(defaultPeriod)
  const [fromDate,    setFromDate]    = useState(defaultDates.from)
  const [toDate,      setToDate]      = useState(defaultDates.to)

  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState<AuditCategory | ''>('')
  const [userF,    setUserF]    = useState('')
  const [severity, setSeverity] = useState<AuditSeverity | ''>('')
  const [result,   setResult]   = useState<AuditResult | ''>('')
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const [page,        setPage]        = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  function applyQuickPeriod(p: string) {
    setQuickPeriod(p)
    const dates = getPeriodDates(p)
    setFromDate(dates.from)
    setToDate(dates.to)
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setCategory('')
    setUserF('')
    setSeverity('')
    setResult('')
    setSelectedUser(null)
    setPage(1)
  }

  const filteredEntries = useMemo(() => {
    const from = fromDate ? new Date(fromDate + 'T00:00:00Z').getTime() : 0
    const to   = toDate   ? new Date(toDate   + 'T23:59:59Z').getTime() : Infinity
    const q    = search.toLowerCase()

    return entries.filter(e => {
      const ts = new Date(e.timestamp).getTime()
      if (ts < from || ts > to) return false
      if (category && e.category !== category) return false
      if (userF     && e.user !== userF) return false
      if (severity  && e.severity !== severity) return false
      if (result    && e.result !== result) return false
      if (selectedUser && e.user !== selectedUser) return false
      if (q && !e.action.toLowerCase().includes(q) && !e.target.toLowerCase().includes(q) && !e.user.toLowerCase().includes(q)) return false
      return true
    })
  }, [entries, fromDate, toDate, search, category, userF, severity, result, selectedUser])

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / rowsPerPage))

  function exportCsv() {
    const csv  = entriesToCsv(filteredEntries)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportPdf() {
    dispatch(pushNotification({
      id:      `audit-pdf-${Date.now()}`,
      type:    'success',
      message: 'Audit log exported',
    }))
    // Simulate PDF download
    const blob = new Blob(['[Simulated PDF content]'], { type: 'application/pdf' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleUserClick(u: string | null) {
    setSelectedUser(u)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-text-value text-xl font-mono uppercase tracking-widest">Audit Log</h1>
          <p className="text-text-muted text-xs font-mono">System activity record — read-only</p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs font-mono">FROM</span>
            <input
              type="date"
              value={fromDate}
              onChange={e => { setFromDate(e.target.value); setQuickPeriod(''); setPage(1) }}
              className="bg-scada-surface border border-scada-border rounded-scada px-2 py-1 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted text-xs font-mono">TO</span>
            <input
              type="date"
              value={toDate}
              onChange={e => { setToDate(e.target.value); setQuickPeriod(''); setPage(1) }}
              className="bg-scada-surface border border-scada-border rounded-scada px-2 py-1 text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <div className="flex gap-1">
            {QUICK_PERIODS.map(p => (
              <button
                key={p}
                onClick={() => applyQuickPeriod(p)}
                className={`px-2 py-1 rounded-scada text-xs font-mono border transition-colors ${
                  quickPeriod === p
                    ? 'bg-accent-primary text-scada-bg border-accent-primary'
                    : 'text-text-muted border-scada-border hover:border-accent-primary'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<FileDown size={14} className="text-text-muted" />}
              onClick={exportCsv}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<FileText size={14} className="text-text-muted" />}
              onClick={exportPdf}
            >
              Export PDF
            </Button>
          </div>
          <p className="text-text-muted text-[10px] font-mono italic">
            Audit records are immutable and cannot be deleted or modified.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <AuditStatsBar entries={filteredEntries} />

      {/* Filter Bar */}
      <AuditFilterBar
        search={search}   category={category} user={userF}
        severity={severity} result={result}
        onSearch={v => { setSearch(v);   setPage(1) }}
        onCategory={v => { setCategory(v); setPage(1) }}
        onUser={v => { setUserF(v); setPage(1) }}
        onSeverity={v => { setSeverity(v); setPage(1) }}
        onResult={v => { setResult(v); setPage(1) }}
        onClear={clearFilters}
        shown={Math.min(rowsPerPage, filteredEntries.length)}
        total={filteredEntries.length}
        page={page}
        totalPages={totalPages}
      />

      {/* Audit Table */}
      <AuditTable
        entries={filteredEntries}
        page={page}
        rowsPerPage={rowsPerPage}
        onPage={setPage}
        onRowsPerPage={n => { setRowsPerPage(n); setPage(1) }}
      />

      {/* Bottom charts */}
      <div className="grid grid-cols-1 lg:grid-cols-[55%_1fr] gap-4">
        <AuditTimelineChart />
        <AuditTopUsersPanel selectedUser={selectedUser} onUserClick={handleUserClick} />
      </div>
    </div>
  )
}

