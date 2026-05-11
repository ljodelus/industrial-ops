'use client'

// Client component — mode selector, manual controls, quick commands, assignment info
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Crane, CraneMode, Job, UserRole } from '@/types'
import { Button, Modal, Input, ProgressBar, EmptyState } from '@/components/ui'
import { Play, Pause, Square, RotateCcw, Lock, ArrowLeft, ArrowRight } from '@/lib/icons'
import { useAppDispatch } from '@/store/hooks'
import { updatePosition, updateStatus, setMode } from '@/store/slices/cranesSlice'
import { addAlarm } from '@/store/slices/alarmsSlice'

interface Props {
  crane:    Crane
  job:      Job | undefined
  userRole: UserRole | null
}

type ConfirmType = 'manual' | 'maintenance' | 'estop' | null

const MODE_LABELS: Record<CraneMode, string> = {
  auto:        'AUTO',
  manual:      'MANUAL',
  maintenance: 'MAINTENANCE',
}

const RAIL_MAX = 8000

// Compute a rough job progress (in percent) for assignment info display
function computeJobProgress(job: Job): { pct: number; step: number; total: number } {
  if (!job.startedAt) return { pct: 0, step: 0, total: 6 }
  const elapsed    = (Date.now() - new Date(job.startedAt).getTime()) / 1000 / 60 // minutes
  const estimated  = 65  // mock: 65-minute recipe
  const totalSteps = 6
  const pct        = Math.min(99, Math.round((elapsed / estimated) * 100))
  const step       = Math.max(1, Math.ceil((pct / 100) * totalSteps))
  return { pct, step, total: totalSteps }
}

export function CraneControlPanel({ crane, job, userRole }: Props) {
  const dispatch = useAppDispatch()
  const router   = useRouter()

  const canControl  = userRole === 'engineer' || userRole === 'admin'
  const isReadOnly  = !canControl

  const [confirmType, setConfirmType] = useState<ConfirmType>(null)
  const [pendingMode, setPendingMode] = useState<CraneMode | null>(null)
  const [targetPos,   setTargetPos]   = useState<number>(0)
  const [speedOver,   setSpeedOver]   = useState<number>(80)
  const [isMoving,    setIsMoving]    = useState<boolean>(false)

  const currentMode = crane.mode ?? 'auto'

  // ─── Mode switching ───────────────────────────────────────────────────────────
  const requestModeChange = (mode: CraneMode) => {
    if (mode === currentMode) return
    if (mode === 'auto') {
      dispatch(setMode({ id: crane.id, mode: 'auto' }))
      return
    }
    setPendingMode(mode)
    setConfirmType(mode as 'manual' | 'maintenance')
  }

  const confirmModeChange = () => {
    if (pendingMode) dispatch(setMode({ id: crane.id, mode: pendingMode }))
    setPendingMode(null)
    setConfirmType(null)
  }

  // ─── Jog controls ─────────────────────────────────────────────────────────────
  const jog = (direction: 1 | -1) => {
    const next = Math.max(0, Math.min(RAIL_MAX, crane.position + direction * 50))
    dispatch(updatePosition({ id: crane.id, position: next }))
  }

  // ─── Move to position ─────────────────────────────────────────────────────────
  const handleMoveToPosition = () => {
    if (isMoving || targetPos === crane.position) return
    setIsMoving(true)
    const start = crane.position
    const end   = targetPos
    const steps = 20  // 20 steps × 100ms = 2 seconds
    let   step  = 0
    const interval = setInterval(() => {
      step++
      const progress = step / steps
      const pos      = Math.round(start + (end - start) * progress)
      dispatch(updatePosition({ id: crane.id, position: pos }))
      if (step >= steps) {
        clearInterval(interval)
        setIsMoving(false)
      }
    }, 100)
  }

  // ─── Quick commands ────────────────────────────────────────────────────────────
  const handleResume = () => {
    dispatch(updateStatus({ id: crane.id, status: 'moving' }))
  }

  const handlePause = () => {
    dispatch(updateStatus({ id: crane.id, status: 'idle' }))
  }

  const handleEmergencyStop = () => {
    setConfirmType('estop')
  }

  const confirmEmergencyStop = () => {
    dispatch(updateStatus({ id: crane.id, status: 'error' }))
    dispatch(addAlarm({
      id:           `estop-${Date.now()}`,
      severity:     'critical',
      category:     'Crane Control',
      message:      `Emergency stop triggered — ${crane.name}`,
      source:       crane.name,
      acknowledged: false,
      triggeredAt:  new Date().toISOString(),
    }))
    setConfirmType(null)
  }

  const handleResetFault = () => {
    dispatch(updateStatus({ id: crane.id, status: 'idle' }))
  }

  const cancelConfirm = () => {
    setConfirmType(null)
    setPendingMode(null)
  }

  // ─── Job progress ─────────────────────────────────────────────────────────────
  const jobProgress = job ? computeJobProgress(job) : null

  return (
    <>
      {/* ── Role guard banner ───────────────────────────────────────────────── */}
      {isReadOnly && (
        <div className="flex items-center gap-2 bg-scada-panel border border-scada-border rounded-scada px-3 py-2 mb-4">
          <Lock size={14} className="text-text-muted shrink-0" />
          <div>
            <p className="text-text-muted text-xs font-mono uppercase tracking-wide">
              Read-Only Access
            </p>
            <p className="text-text-muted text-xs">
              Control requires Engineer or Admin role.
            </p>
          </div>
        </div>
      )}

      {/* ── C1 — Mode Selector ─────────────────────────────────────────────── */}
      <div className="mb-4">
        <p className="text-text-muted text-xs font-mono uppercase tracking-wide mb-2">
          Operating Mode
        </p>
        <div className="flex gap-1">
          {(['auto', 'manual', 'maintenance'] as CraneMode[]).map(mode => {
            const isActive = currentMode === mode
            return (
              <button
                key={mode}
                onClick={() => !isReadOnly && requestModeChange(mode)}
                disabled={isReadOnly}
                className={[
                  'flex-1 px-2 py-1.5 text-xs font-mono uppercase rounded-scada border transition-colors',
                  isActive
                    ? 'bg-accent-primary text-scada-bg border-accent-primary font-bold'
                    : 'bg-scada-panel text-text-muted border-scada-border hover:border-accent-primary',
                  isReadOnly ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
              >
                {MODE_LABELS[mode]}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── C2 — Manual Position Control (MANUAL mode only) ────────────────── */}
      {currentMode === 'manual' && (
        <div className="mb-4 border border-scada-border rounded-scada p-3 bg-scada-bg flex flex-col gap-3">
          <p className="text-text-muted text-xs font-mono uppercase tracking-wide">
            Manual Position Control
          </p>
          <div className="flex gap-2">
            <Input
              label="Target Position"
              type="number"
              value={targetPos}
              onChange={e => setTargetPos(Math.max(0, Math.min(RAIL_MAX, Number(e.target.value))))}
              unit="mm"
              disabled={isReadOnly}
            />
            <Input
              label="Speed Override"
              type="number"
              value={speedOver}
              onChange={e => setSpeedOver(Math.max(10, Math.min(100, Number(e.target.value))))}
              unit="%"
              disabled={isReadOnly}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowLeft size={14} />}
              disabled={isReadOnly || crane.position <= 0}
              onClick={() => jog(-1)}
              className="flex-1"
            >
              Jog Left
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowRight size={14} />}
              disabled={isReadOnly || crane.position >= RAIL_MAX}
              onClick={() => jog(1)}
              className="flex-1"
            >
              Jog Right
            </Button>
          </div>
          <Button
            variant="primary"
            size="sm"
            loading={isMoving}
            disabled={isReadOnly || targetPos === crane.position || isMoving}
            onClick={handleMoveToPosition}
            className="w-full justify-center"
          >
            Move to Position
          </Button>
        </div>
      )}

      {/* ── C3 — Quick Commands ─────────────────────────────────────────────── */}
      <div className="mb-4">
        <p className="text-text-muted text-xs font-mono uppercase tracking-wide mb-2">
          Quick Commands
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Play size={14} />}
            disabled={isReadOnly || crane.status === 'moving' || crane.status === 'loading'}
            onClick={handleResume}
          >
            Resume
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Pause size={14} />}
            disabled={isReadOnly || crane.status === 'idle' || crane.status === 'offline'}
            onClick={handlePause}
          >
            Pause
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Square size={14} />}
            disabled={isReadOnly}
            onClick={handleEmergencyStop}
            className="col-span-2"
          >
            Emergency Stop
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<RotateCcw size={14} />}
            disabled={isReadOnly || crane.status !== 'error'}
            onClick={handleResetFault}
            className="col-span-2"
          >
            Reset Fault
          </Button>
        </div>
      </div>

      {/* ── C4 — Assignment Info ────────────────────────────────────────────── */}
      <div>
        <p className="text-text-muted text-xs font-mono uppercase tracking-wide mb-2">
          Assignment
        </p>
        {job && jobProgress ? (
          <div className="bg-scada-bg border border-scada-border rounded-scada p-3 flex flex-col gap-2">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              {[
                ['CURRENT JOB', job.id.toUpperCase(),          'text-accent-gold font-mono'],
                ['RECIPE',      job.recipeName,                 'text-text-primary'],
                ['STEP',        `${jobProgress.step} / ${jobProgress.total}`, 'text-text-value font-mono'],
              ].map(([label, value, cls]) => (
                <div key={label} className="contents">
                  <span className="text-text-muted text-xs font-mono uppercase">
                    {label}
                  </span>
                  <span className={`text-xs ${cls}`}>{value}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-text-muted text-xs font-mono uppercase">PROGRESS</span>
                <span className="value-display text-xs text-text-value">{jobProgress.pct}%</span>
              </div>
              <ProgressBar value={jobProgress.pct} max={100} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/production/jobs')}
            >
              View Job →
            </Button>
          </div>
        ) : (
          <EmptyState message="No job currently assigned" />
        )}
      </div>

      {/* ── Confirmation Modals ─────────────────────────────────────────────── */}
      <Modal
        open={confirmType === 'manual'}
        onClose={cancelConfirm}
        title="Switch to Manual Mode"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={cancelConfirm}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={confirmModeChange}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-text-muted text-sm">
          Switching to <span className="text-accent-primary font-mono">MANUAL</span> mode
          allows direct position commands. Automatic job execution will be paused.
        </p>
      </Modal>

      <Modal
        open={confirmType === 'maintenance'}
        onClose={cancelConfirm}
        title="Switch to Maintenance Mode"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={cancelConfirm}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmModeChange}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-text-muted text-sm">
          Switching to <span className="text-status-alarm font-mono">MAINTENANCE</span> mode
          will lock this crane. No automatic movement will be allowed until mode is reset to AUTO.
        </p>
      </Modal>

      <Modal
        open={confirmType === 'estop'}
        onClose={cancelConfirm}
        title="Emergency Stop"
        accentColor="border-t-2 border-t-status-alarm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={cancelConfirm}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={confirmEmergencyStop}>
              Confirm Stop
            </Button>
          </>
        }
      >
        <p className="text-text-muted text-sm">
          This will immediately halt{' '}
          <span className="text-status-alarm font-mono">{crane.name}</span>.
          A critical alarm will be dispatched. Confirm?
        </p>
      </Modal>
    </>
  )
}


