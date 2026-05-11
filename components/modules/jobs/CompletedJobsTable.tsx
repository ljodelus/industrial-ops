'use client'

// Client component — completed / failed / cancelled jobs table with CSV export

import { useState }    from 'react'
import { Card }        from '@/components/ui/Card'
import { Badge }       from '@/components/ui/Badge'
import { Button }      from '@/components/ui/Button'
import { Modal }       from '@/components/ui/Modal'
import { FileDown }    from '@/lib/icons'
import type { Job, JobStatus } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

type BadgeVariant = 'ok' | 'alarm' | 'offline' | 'idle' | 'warning' | 'info'

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  completed: 'ok',
  failed:    'alarm',
  cancelled: 'offline',
}

const STATUS_LABEL: Record<string, string> = {
  completed: 'Completed',
  failed:    'Failed',
  cancelled: 'Cancelled',
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function calcDuration(startedAt?: string, completedAt?: string): string {
  if (!startedAt || !completedAt) return '—'
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime()
  const h  = Math.floor(ms / 3_600_000)
  const m  = Math.floor((ms % 3_600_000) / 60_000)
  const s  = Math.floor((ms % 60_000) / 1_000)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatCrane(id?: string): string {
  if (!id) return '—'
  return id.replace('crane-', 'CRANE-').toUpperCase()
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportCsv(jobs: Job[]): void {
  const header = 'JOB ID,RECIPE,LINE,CRANE,STARTED,COMPLETED,DURATION,STATUS\n'
  const rows = jobs.map(j =>
    [
      j.id.toUpperCase(),
      j.recipeName,
      j.line,
      formatCrane(j.assignedCrane),
      j.startedAt    ? formatTime(j.startedAt)    : '',
      j.completedAt  ? formatTime(j.completedAt)  : '',
      calcDuration(j.startedAt, j.completedAt),
      j.status,
    ].join(',')
  ).join('\n')

  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `completed-jobs-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ─── Read-only detail modal ───────────────────────────────────────────────────

interface CompletedDetailModalProps {
  job:     Job | null
  onClose: () => void
}

function CompletedDetailModal({ job, onClose }: CompletedDetailModalProps) {
  return (
    <Modal
      open={!!job}
      onClose={onClose}
      title="Job History — Read Only"
      accentColor="border-t-2 border-t-accent-gold"
    >
      {job && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-accent-gold font-mono text-sm block">{job.id.toUpperCase()}</span>
              <span className="text-text-value text-base font-medium">{job.recipeName}</span>
            </div>
            <Badge
              variant={STATUS_VARIANT[job.status] ?? 'idle'}
              label={STATUS_LABEL[job.status] ?? job.status}
            />
          </div>

          <div className="bg-scada-bg border border-scada-border rounded-scada p-3 space-y-2">
            {[
              { label: 'Line',      value: job.line },
              { label: 'Crane',     value: formatCrane(job.assignedCrane) },
              { label: 'Started',   value: job.startedAt   ? formatTime(job.startedAt)   : '—' },
              { label: 'Completed', value: job.completedAt ? formatTime(job.completedAt) : '—' },
              { label: 'Duration',  value: calcDuration(job.startedAt, job.completedAt) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center border-b border-scada-border pb-2 last:border-0 last:pb-0">
                <span className="text-text-muted text-xs uppercase font-mono tracking-wide">{label}</span>
                <span className="text-text-primary text-sm font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CompletedJobsTableProps {
  jobs: Job[]
}

const COLUMNS = [
  'JOB ID', 'RECIPE', 'LINE', 'CRANE', 'STARTED', 'COMPLETED', 'DURATION', 'STATUS',
] as const

export function CompletedJobsTable({ jobs }: CompletedJobsTableProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  return (
    <>
      <Card
        title="Completed Jobs"
        accent="ok"
        noPadding
        action={
          <Button
            variant="ghost"
            size="sm"
            icon={<FileDown size={14} />}
            onClick={() => exportCsv(jobs)}
          >
            Export CSV
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-scada-panel border-b border-scada-border">
                {COLUMNS.map(col => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-text-muted text-xs uppercase tracking-wider font-mono whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-8 text-center text-text-muted text-sm font-mono">
                    No completed jobs.
                  </td>
                </tr>
              ) : (
                jobs.map((job, i) => {
                  const isFailed = job.status === 'failed'
                  return (
                    <tr
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`border-b border-scada-border cursor-pointer transition-colors hover:bg-scada-panel
                        ${isFailed ? 'bg-status-alarm/5' : i % 2 === 0 ? 'bg-scada-bg' : 'bg-scada-surface'}`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-accent-gold font-mono text-xs">{job.id.toUpperCase()}</span>
                      </td>
                      <td className="px-4 py-3 text-text-primary text-sm">{job.recipeName}</td>
                      <td className="px-4 py-3 text-text-primary text-sm">{job.line}</td>
                      <td className="px-4 py-3">
                        <span className="text-accent-primary font-mono text-xs">{formatCrane(job.assignedCrane)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-text-muted">
                          {job.startedAt ? formatTime(job.startedAt) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-text-muted">
                          {job.completedAt ? formatTime(job.completedAt) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="value-display text-xs">
                          {calcDuration(job.startedAt, job.completedAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={STATUS_VARIANT[job.status] ?? 'idle'}
                          label={STATUS_LABEL[job.status] ?? job.status}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CompletedDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </>
  )
}

