'use client'

// Client component — modal for assigning a crane to a job

import { useState }    from 'react'
import { Modal }       from '@/components/ui/Modal'
import { Button }      from '@/components/ui/Button'
import { Badge }       from '@/components/ui/Badge'
import type { Job, Crane, CraneStatus } from '@/types'

type StatusVariant = 'ok' | 'warning' | 'alarm' | 'offline' | 'idle' | 'info'

const CRANE_STATUS_VARIANT: Record<CraneStatus, StatusVariant> = {
  idle:    'idle',
  moving:  'info',
  loading: 'warning',
  error:   'alarm',
  offline: 'offline',
}

const CRANE_STATUS_LABEL: Record<CraneStatus, string> = {
  idle:    'Idle',
  moving:  'Moving',
  loading: 'Loading',
  error:   'Error',
  offline: 'Offline',
}

interface CraneAssignModalProps {
  open:     boolean
  onClose:  () => void
  job:      Job | null
  cranes:   Crane[]
  onAssign: (craneId: string) => void
}

export function CraneAssignModal({
  open,
  onClose,
  job,
  cranes,
  onAssign,
}: CraneAssignModalProps) {
  const [selectedCraneId, setSelectedCraneId] = useState<string | null>(null)

  const lineCranes = cranes.filter(c => !job || c.line === job.line)

  const handleAssign = () => {
    if (!selectedCraneId) return
    onAssign(selectedCraneId)
    setSelectedCraneId(null)
    onClose()
  }

  const isDisabled = (crane: Crane) =>
    crane.status === 'error' || crane.status === 'offline'

  return (
    <Modal
      open={open}
      onClose={() => { setSelectedCraneId(null); onClose() }}
      title="Assign Crane"
      accentColor="border-t-2 border-t-accent-gold"
      footer={
        <>
          <Button variant="ghost" onClick={() => { setSelectedCraneId(null); onClose() }}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!selectedCraneId}
            onClick={handleAssign}
          >
            Assign
          </Button>
        </>
      }
    >
      {job && (
        <div className="flex flex-col gap-4">
          {/* Job summary */}
          <div className="bg-scada-bg border border-scada-border rounded-scada px-3 py-2">
            <span className="text-accent-gold font-mono text-xs block">{job.id.toUpperCase()}</span>
            <span className="text-text-primary text-sm">{job.recipeName}</span>
            <span className="text-text-muted text-xs font-mono block">{job.line}</span>
          </div>

          {/* Crane list */}
          <div className="flex flex-col gap-2">
            <span className="text-text-muted text-xs uppercase font-mono tracking-wide">
              Available Cranes — {job.line}
            </span>
            {lineCranes.length === 0 && (
              <p className="text-text-muted text-xs font-mono">No cranes available for this line.</p>
            )}
            {lineCranes.map(crane => {
              const disabled  = isDisabled(crane)
              const selected  = selectedCraneId === crane.id
              return (
                <button
                  key={crane.id}
                  disabled={disabled}
                  onClick={() => !disabled && setSelectedCraneId(crane.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-scada border text-left transition-all
                    ${disabled
                      ? 'opacity-40 cursor-not-allowed border-scada-border bg-scada-bg'
                      : selected
                        ? 'border-accent-primary bg-scada-panel'
                        : 'border-scada-border bg-scada-bg hover:border-accent-primary/50 hover:bg-scada-surface cursor-pointer'
                    }`}
                >
                  {/* Radio indicator */}
                  <span className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                    selected ? 'border-accent-primary bg-accent-primary' : 'border-scada-border'
                  }`} />

                  {/* Crane id */}
                  <span className="text-text-primary font-mono text-sm flex-shrink-0 w-20">
                    {crane.name}
                  </span>

                  {/* Status badge */}
                  <Badge
                    variant={CRANE_STATUS_VARIANT[crane.status]}
                    label={CRANE_STATUS_LABEL[crane.status]}
                  />

                  {/* Line */}
                  <span className="text-text-muted text-xs flex-shrink-0">{crane.line}</span>

                  {/* Current job */}
                  <span className="text-text-muted text-xs font-mono ml-auto">
                    {crane.currentJob ? `Job: ${crane.currentJob.toUpperCase()}` : '—'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </Modal>
  )
}

