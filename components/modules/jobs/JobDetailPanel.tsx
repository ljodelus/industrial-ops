'use client'

// Client component — right panel showing job details and a step stepper

import { Card }       from '@/components/ui/Card'
import { Badge }      from '@/components/ui/Badge'
import { Button }     from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  ListOrdered,
  CheckCircle,
  Play,
  Circle,
} from '@/lib/icons'
import type { Job, JobStatus, Recipe, JobSimState } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

type BadgeVariant = 'alarm' | 'warning' | 'ok' | 'offline' | 'idle' | 'info'

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

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: '2-digit',
  }) + ' ' + formatTimestamp(iso)
}

function formatSecs(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// ─── Info row ────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-scada-border last:border-0">
      <span className="text-text-muted text-xs uppercase font-mono tracking-wide">{label}</span>
      <span className="text-text-primary text-sm">{value}</span>
    </div>
  )
}

// ─── Step row ────────────────────────────────────────────────────────────────

interface StepRowProps {
  stepNumber: number
  tankName:   string
  status:     'completed' | 'in_progress' | 'pending'
  elapsedSec: number
  progress:   number
  preferredTime: number
}

function StepRow({ stepNumber, tankName, status, elapsedSec, progress, preferredTime }: StepRowProps) {
  const remainingSec = Math.max(0, Math.round(preferredTime * (1 - progress / 100)))

  return (
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className="flex flex-col items-center mt-0.5">
        {status === 'completed' && (
          <CheckCircle size={16} className="text-status-ok flex-shrink-0" />
        )}
        {status === 'in_progress' && (
          <Play size={16} className="text-accent-primary alarm-blink flex-shrink-0" />
        )}
        {status === 'pending' && (
          <Circle size={16} className="text-status-idle flex-shrink-0" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono ${status === 'pending' ? 'text-text-muted' : 'text-text-primary'}`}>
              STEP {stepNumber}
            </span>
            <span className={`text-sm font-medium ${status === 'pending' ? 'text-text-muted' : 'text-text-primary'}`}>
              {tankName.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-text-muted uppercase">
              {status === 'completed' && 'Completed'}
              {status === 'in_progress' && 'In progress'}
              {status === 'pending' && 'Pending'}
            </span>
            <span className="value-display text-xs min-w-[50px] text-right">
              {status === 'completed'   && formatSecs(elapsedSec)}
              {status === 'in_progress' && `${formatSecs(remainingSec)} rem`}
              {status === 'pending'     && '—'}
            </span>
          </div>
        </div>

        {/* Progress bar for in_progress */}
        {status === 'in_progress' && (
          <div className="mt-1.5 h-1 bg-scada-border rounded-scada overflow-hidden">
            <div
              className="h-full bg-accent-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

interface JobDetailPanelProps {
  job:            Job | null
  recipe:         Recipe | null
  simState:       JobSimState | null
  canManage:      boolean
  onAssignCrane:  () => void
  onEditPriority: () => void
  onCancel:       () => void
}

export function JobDetailPanel({
  job,
  recipe,
  simState,
  canManage,
  onAssignCrane,
  onEditPriority,
  onCancel,
}: JobDetailPanelProps) {
  return (
    <Card accent="primary" className="h-full flex flex-col" noPadding>
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-scada-border px-4 py-3">
        <span className="text-text-primary text-sm font-medium uppercase tracking-wide">
          Job Detail
        </span>
      </div>

      {!job ? (
        /* Placeholder */
        <div className="flex-1 p-4 flex items-center justify-center">
          <EmptyState
            icon={<ListOrdered size={40} />}
            message="Select a job to view details"
          />
        </div>
      ) : (
        /* Detail view */
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-accent-gold font-mono text-sm block">{job.id.toUpperCase()}</span>
              <span className="text-text-value text-base font-medium">{job.recipeName}</span>
              <span className="text-text-muted text-xs font-mono block mt-0.5">
                Created {formatDate(job.createdAt)}
              </span>
            </div>
            <Badge variant={STATUS_VARIANT[job.status]} label={STATUS_LABEL[job.status]} />
          </div>

          {/* Assignment section */}
          <div className="bg-scada-bg border border-scada-border rounded-scada p-3">
            <span className="text-text-muted text-xs uppercase font-mono tracking-wide block mb-2">
              Assignment
            </span>
            <InfoRow
              label="Assigned Crane"
              value={
                job.assignedCrane
                  ? <span className="text-accent-primary font-mono">{job.assignedCrane.replace('crane-', 'CRANE-').toUpperCase()}</span>
                  : <span className="text-text-muted">—</span>
              }
            />
            <InfoRow label="Line" value={job.line} />
            <InfoRow
              label="Priority"
              value={<span className="text-accent-gold font-mono">#{job.priority}</span>}
            />
            {job.startedAt && (
              <InfoRow label="Started At" value={
                <span className="font-mono text-xs">{formatTimestamp(job.startedAt)}</span>
              } />
            )}
          </div>

          {/* Steps stepper */}
          {recipe && simState && (
            <div>
              <span className="text-text-muted text-xs uppercase font-mono tracking-wide block mb-3">
                Recipe Steps — {recipe.name}
              </span>
              <div className="relative">
                {/* Connector line */}
                <div className="absolute left-2 top-4 bottom-4 border-l border-scada-border" />
                <div className="flex flex-col">
                  {recipe.steps.map((step, i) => {
                    const stepSim = simState.steps[i]
                    const status  = stepSim?.status ?? 'pending'
                    return (
                      <StepRow
                        key={i}
                        stepNumber={i + 1}
                        tankName={step.tankName}
                        status={status}
                        elapsedSec={stepSim?.elapsedSec ?? 0}
                        progress={stepSim?.progress ?? 0}
                        preferredTime={step.preferredTime}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* No recipe/sim state fallback */}
          {(!recipe || !simState) && job.status !== 'pending' && (
            <p className="text-text-muted text-xs font-mono">Step data unavailable.</p>
          )}

          {/* Notes */}
          {job.notes && (
            <div className="bg-scada-bg border border-scada-border rounded-scada p-3">
              <span className="text-text-muted text-xs uppercase font-mono tracking-wide block mb-1">Notes</span>
              <p className="text-text-primary text-sm">{job.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions footer */}
      {job && canManage && (
        <div className="border-t border-scada-border p-3 flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={onAssignCrane}>
            Reassign Crane
          </Button>
          <Button variant="secondary" size="sm" onClick={onEditPriority}>
            Edit Priority
          </Button>
          <Button variant="danger" size="sm" onClick={onCancel}>
            Cancel Job
          </Button>
        </div>
      )}
    </Card>
  )
}

