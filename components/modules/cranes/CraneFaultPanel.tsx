'use client'

// Client component — fault details + acknowledge button (engineer/admin only)
import type { Crane, UserRole } from '@/types'
import { Button } from '@/components/ui'
import { Cpu } from '@/lib/icons'
import { useAppDispatch } from '@/store/hooks'
import { updateStatus } from '@/store/slices/cranesSlice'
import { addAlarm } from '@/store/slices/alarmsSlice'

interface Props {
  crane:    Crane
  userRole: UserRole | null
}

// Static fault data keyed by crane ID for the error state
const FAULT_DATA: Record<string, {
  code:        string
  type:        string
  time:        string
  description: string
  recommended: string
}> = {
  'crane-4': {
    code:        'E-0x4A12',
    type:        'Motion Timeout',
    time:        '08:14:22',
    description: 'Crane did not reach target position within allowed time. Last known position: 2,400 mm. Target: 4,800 mm.',
    recommended: 'Check motor drive VFD-04. Inspect rail section 2,400–4,800 mm.',
  },
}

const DEFAULT_FAULT = {
  code:        'E-0xFFFF',
  type:        'Unknown Fault',
  time:        '--:--:--',
  description: 'An unspecified fault has been detected. Please run diagnostics.',
  recommended: 'Inspect crane hardware and check PLC logs.',
}

export function CraneFaultPanel({ crane, userRole }: Props) {
  const dispatch = useAppDispatch()

  const canControl = userRole === 'engineer' || userRole === 'admin'
  const fault      = FAULT_DATA[crane.id] ?? DEFAULT_FAULT

  const handleAcknowledge = () => {
    dispatch(updateStatus({ id: crane.id, status: 'idle' }))
    dispatch(addAlarm({
      id:           `fault-ack-${Date.now()}`,
      severity:     'info',
      category:     'Crane Control',
      message:      `Fault acknowledged — ${crane.name}`,
      source:       crane.name,
      acknowledged: false,
      triggeredAt:  new Date().toISOString(),
    }))
  }

  return (
    <div className="bg-status-alarm/5 border border-status-alarm/30 rounded-scada p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Cpu size={14} className="text-status-alarm" />
        <span className="text-status-alarm font-mono text-sm font-bold uppercase tracking-wide">
          FAULT DETECTED — {crane.name}
        </span>
      </div>

      {/* Fault details */}
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        {[
          ['FAULT CODE',  fault.code],
          ['FAULT TYPE',  fault.type],
          ['FAULT TIME',  fault.time],
        ].map(([label, value]) => (
          <div key={label} className="contents">
            <span className="text-text-muted text-xs uppercase font-mono">
              {label}
            </span>
            <span className="text-text-primary text-xs font-mono">
              {value}
            </span>
          </div>
        ))}

        <span className="text-text-muted text-xs uppercase font-mono">
          DESCRIPTION
        </span>
        <span className="text-text-muted text-xs leading-relaxed">
          {fault.description}
        </span>

        <span className="text-text-muted text-xs uppercase font-mono">
          RECOMMENDED
        </span>
        <span className="text-text-muted text-xs leading-relaxed">
          {fault.recommended}
        </span>
      </div>

      {/* Acknowledge button — engineer/admin only */}
      {canControl && (
        <div className="pt-1">
          <Button
            variant="danger"
            size="sm"
            onClick={handleAcknowledge}
          >
            Acknowledge Fault
          </Button>
        </div>
      )}
    </div>
  )
}

