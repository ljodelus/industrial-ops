'use client'

// Client component — reads jobs from Redux, dispatches status and priority updates

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectAllJobs,
  updateStatus,
  removeJob,
} from '@/store/slices/jobsSlice'
import { selectUserRole } from '@/store/slices/authSlice'
import type { Job, JobStatus } from '@/types'
import { Badge }      from '@/components/ui/Badge'
import { Button }     from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

type BadgeVariant = 'alarm' | 'warning' | 'ok' | 'offline' | 'idle' | 'info' | 'gold'

const STATUS_VARIANT: Record<JobStatus, BadgeVariant> = {
  pending:     'idle',
  in_progress: 'info',
  completed:   'ok',
  failed:      'alarm',
  cancelled:   'offline',
}

const STATUS_LABEL: Record<JobStatus, string> = {
  pending:     'Pending',
  in_progress: 'In Progress',
  completed:   'Completed',
  failed:      'Failed',
  cancelled:   'Cancelled',
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

interface JobRowProps {
  job:      Job
  canManage: boolean
  onStart:  (id: string) => void
  onCancel: (id: string) => void
  onRemove: (id: string) => void
}

function JobRow({ job, canManage, onStart, onCancel, onRemove }: JobRowProps) {
  const isActive    = job.status === 'in_progress'
  const isPending   = job.status === 'pending'
  const isTerminal  = job.status === 'completed' || job.status === 'cancelled' || job.status === 'failed'

  return (
    <tr className={`border-b border-scada-border transition-colors hover:bg-scada-panel
      ${isActive ? 'bg-accent-primary/5' : ''}`}
    >
      {/* Priority */}
      <td className="px-4 py-3 text-center">
        <span className="value-display text-xs font-mono text-text-value font-semibold">
          {isTerminal ? '—' : job.priority}
        </span>
      </td>

      {/* Recipe */}
      <td className="px-4 py-3 font-mono text-sm text-text-primary">
        {job.recipeName}
      </td>

      {/* Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        <Badge variant={STATUS_VARIANT[job.status]} label={STATUS_LABEL[job.status]} />
      </td>

      {/* Crane */}
      <td className="px-4 py-3 text-xs font-mono text-text-muted">
        {job.assignedCrane ?? '—'}
      </td>

      {/* Started */}
      <td className="px-4 py-3 text-xs font-mono text-text-muted value-display">
        {job.startedAt ? formatDateTime(job.startedAt) : '—'}
      </td>

      {/* Completed */}
      <td className="px-4 py-3 text-xs font-mono text-text-muted value-display">
        {job.completedAt ? formatDateTime(job.completedAt) : '—'}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 whitespace-nowrap">
        {canManage && (
          <div className="flex gap-2 justify-end">
            {isPending && (
              <Button variant="secondary" size="sm" onClick={() => onStart(job.id)}>
                Start
              </Button>
            )}
            {(isPending || isActive) && (
              <Button variant="ghost" size="sm" onClick={() => onCancel(job.id)}>
                Cancel
              </Button>
            )}
            {isTerminal && (
              <Button variant="danger" size="sm" onClick={() => onRemove(job.id)}>
                Remove
              </Button>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

export function JobTable() {
  const dispatch = useAppDispatch()
  const jobs     = useAppSelector(selectAllJobs)
  const role     = useAppSelector(selectUserRole)

  // Engineers and admins can manage jobs
  const canManage = role === 'engineer' || role === 'admin'

  const handleStart  = (id: string) => dispatch(updateStatus({ id, status: 'in_progress' }))
  const handleCancel = (id: string) => dispatch(updateStatus({ id, status: 'cancelled' }))
  const handleRemove = (id: string) => dispatch(removeJob(id))

  // Sort: active first, then pending by priority, then terminal
  const sorted = [...jobs].sort((a, b) => {
    const order: Record<JobStatus, number> = {
      in_progress: 0, pending: 1, failed: 2, cancelled: 3, completed: 4,
    }
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
    return a.priority - b.priority
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
      <div className="flex gap-4 text-xs font-mono text-text-muted">
        <span>{jobs.filter(j => j.status === 'in_progress').length} active</span>
        <span>·</span>
        <span>{jobs.filter(j => j.status === 'pending').length} pending</span>
        <span>·</span>
        <span>{jobs.filter(j => j.status === 'completed').length} completed</span>
      </div>

      {/* Table */}
      <div className="bg-scada-surface border border-scada-border rounded-scada overflow-x-auto">
        {jobs.length === 0 ? (
          <div className="p-8">
            <EmptyState message="No jobs in the queue." />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-scada-border bg-scada-panel">
                <th className="px-4 py-2 text-center text-xs font-mono text-text-muted uppercase tracking-wide">Priority</th>
                <th className="px-4 py-2 text-left   text-xs font-mono text-text-muted uppercase tracking-wide">Recipe</th>
                <th className="px-4 py-2 text-left   text-xs font-mono text-text-muted uppercase tracking-wide">Status</th>
                <th className="px-4 py-2 text-left   text-xs font-mono text-text-muted uppercase tracking-wide">Crane</th>
                <th className="px-4 py-2 text-left   text-xs font-mono text-text-muted uppercase tracking-wide">Started</th>
                <th className="px-4 py-2 text-left   text-xs font-mono text-text-muted uppercase tracking-wide">Completed</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {sorted.map(job => (
                <JobRow
                  key={job.id}
                  job={job}
                  canManage={canManage}
                  onStart={handleStart}
                  onCancel={handleCancel}
                  onRemove={handleRemove}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
