'use client'

// Client component: uses useAppSelector (Redux) and useRouter

import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { selectAllJobs } from '@/store/slices/jobsSlice'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { Job, JobStatus } from '@/types'

const STATUS_VARIANT: Record<JobStatus, 'ok' | 'warning' | 'alarm' | 'offline' | 'idle' | 'info' | 'gold'> = {
  in_progress: 'ok',
  pending:     'idle',
  completed:   'info',
  failed:      'alarm',
  cancelled:   'offline',
}

const STATUS_LABEL: Record<JobStatus, string> = {
  in_progress: 'IN PROGRESS',
  pending:     'PENDING',
  completed:   'COMPLETED',
  failed:      'FAILED',
  cancelled:   'CANCELLED',
}

export function JobQueueSnapshot() {
  const router  = useRouter()
  const allJobs = useAppSelector(selectAllJobs)

  const top5 = allJobs
    .filter(j => j.status === 'pending' || j.status === 'in_progress')
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)

  const navigateToJobs = () => router.push('/jobs')

  return (
    <Card
      title="JOB QUEUE"
      accent="gold"
      action={
        <Button variant="ghost" size="sm" onClick={navigateToJobs}>
          Manage →
        </Button>
      }
      noPadding
    >
      <div className="divide-y divide-scada-border">
        {top5.map((job, idx) => (
          <JobRow key={job.id} job={job} rank={idx + 1} onClick={navigateToJobs} />
        ))}
        {top5.length === 0 && (
          <div className="px-4 py-6 text-center text-text-muted text-xs font-mono">
            No active or pending jobs
          </div>
        )}
      </div>
    </Card>
  )
}

function JobRow({ job, rank, onClick }: { job: Job; rank: number; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 hover:bg-scada-panel cursor-pointer transition-colors"
    >
      <span className="text-accent-gold font-mono text-xs w-6 shrink-0">#{rank}</span>
      <span className="text-text-primary text-xs flex-1 truncate">{job.recipeName}</span>
      <Badge variant={STATUS_VARIANT[job.status]} label={STATUS_LABEL[job.status]} />
      <span className={`font-mono text-xs shrink-0 ${job.assignedCrane ? 'text-accent-primary' : 'text-text-muted'}`}>
        {job.assignedCrane ? job.assignedCrane.toUpperCase() : '—'}
      </span>
    </div>
  )
}
