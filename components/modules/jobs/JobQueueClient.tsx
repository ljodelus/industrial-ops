'use client'

// Client component — orchestrates the entire Job Queue page

import { useRef, useState }         from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectAllJobs,
  addJob,
  removeJob,
  reorderJobs,
  assignCrane,
  resetJobs,
  selectTerminalJobs,
}                                   from '@/store/slices/jobsSlice'
import { selectAllRecipes }         from '@/store/slices/recipesSlice'
import { selectAllCranes }          from '@/store/slices/cranesSlice'
import { selectUserRole }           from '@/store/slices/authSlice'
import { Card }                     from '@/components/ui/Card'
import { Button }                   from '@/components/ui/Button'
import { EmptyState }               from '@/components/ui/EmptyState'
import { Modal }                    from '@/components/ui/Modal'
import { Input }                    from '@/components/ui/Input'
import { JobFilterBar }             from './JobFilterBar'
import { JobRow }                   from './JobRow'
import { JobDetailPanel }           from './JobDetailPanel'
import { NewJobModal }              from './NewJobModal'
import { CraneAssignModal }         from './CraneAssignModal'
import { CompletedJobsTable }       from './CompletedJobsTable'
import { useJobSimulation }         from '@/lib/hooks/useJobSimulation'
import { RefreshCw, Filter, Plus, Boxes } from '@/lib/icons'
import type { Job }                 from '@/types'
import type { JobFormValues }       from '@/types/schemas'

// ─── Component ───────────────────────────────────────────────────────────────

export function JobQueueClient() {
  const dispatch = useAppDispatch()
  const allJobs      = useAppSelector(selectAllJobs)
  const terminalJobs = useAppSelector(selectTerminalJobs)
  const recipes      = useAppSelector(selectAllRecipes)
  const cranes       = useAppSelector(selectAllCranes)
  const role         = useAppSelector(selectUserRole)

  // ─── Role flags ──────────────────────────────────────────────────────────
  const canManage = role === 'supervisor' || role === 'engineer' || role === 'admin'
  const canCreate = role === 'supervisor' || role === 'engineer' || role === 'admin'

  // ─── Simulation ──────────────────────────────────────────────────────────
  const simStates = useJobSimulation(allJobs, recipes)

  // ─── Queue (active + pending) ─────────────────────────────────────────────
  const queueJobs = [...allJobs]
    .filter(j => j.status === 'in_progress' || j.status === 'pending')
    .sort((a, b) => a.priority - b.priority)

  // ─── UI state ────────────────────────────────────────────────────────────
  const [filterOpen,      setFilterOpen]      = useState(false)
  const [newJobOpen,      setNewJobOpen]       = useState(false)
  const [assignJobId,     setAssignJobId]      = useState<string | null>(null)
  const [cancelJobId,     setCancelJobId]      = useState<string | null>(null)
  const [selectedJobId,   setSelectedJobId]    = useState<string | null>(null)
  const [flashIds,        setFlashIds]         = useState<Set<string>>(new Set())
  const [dragOverId,      setDragOverId]       = useState<string | null>(null)
  const [editPriorityId,  setEditPriorityId]   = useState<string | null>(null)
  const [editPriorityVal, setEditPriorityVal]  = useState('')

  // ─── Filters ─────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState('')
  const [lineFilter,   setLineFilter]   = useState('')
  const [recipeFilter, setRecipeFilter] = useState('')

  const filteredJobs = queueJobs.filter(j => {
    if (statusFilter && j.status !== statusFilter) return false
    if (lineFilter   && j.line   !== lineFilter)   return false
    if (recipeFilter && j.recipeName !== recipeFilter) return false
    return true
  })

  const isFiltered = !!(statusFilter || lineFilter || recipeFilter)

  // ─── Derived ──────────────────────────────────────────────────────────────
  const selectedJob = allJobs.find(j => j.id === selectedJobId) ?? null
  const selectedRecipe = selectedJob
    ? (recipes.find(r => r.id === selectedJob.recipeId) ?? null)
    : null
  const selectedSimState = selectedJobId ? (simStates[selectedJobId] ?? null) : null

  const assignJob = assignJobId ? (allJobs.find(j => j.id === assignJobId) ?? null) : null
  const cancelJob = cancelJobId ? (allJobs.find(j => j.id === cancelJobId) ?? null) : null

  // ─── Flash helpers ────────────────────────────────────────────────────────
  const flashRow = (id: string) => {
    setFlashIds(prev => new Set(prev).add(id))
    setTimeout(() => setFlashIds(prev => { const n = new Set(prev); n.delete(id); return n }), 800)
  }

  // ─── Drag & Drop ─────────────────────────────────────────────────────────
  const dragFromId = useRef<string | null>(null)

  const handleDragStart = (jobId: string) => {
    dragFromId.current = jobId
  }
  const handleDragOver = (e: React.DragEvent, jobId: string) => {
    e.preventDefault()
    setDragOverId(jobId)
  }
  const handleDrop = (toId: string) => {
    setDragOverId(null)
    const fromId = dragFromId.current
    if (!fromId || fromId === toId) return

    const terminalSet = new Set(terminalJobs.map(j => j.id))
    const activeQueue = [...allJobs]
      .filter(j => !terminalSet.has(j.id))
      .sort((a, b) => a.priority - b.priority)

    const fromIdx = activeQueue.findIndex(j => j.id === fromId)
    const toIdx   = activeQueue.findIndex(j => j.id === toId)
    if (fromIdx < 0 || toIdx < 0) return

    const reordered = [...activeQueue]
    const [moved]   = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)

    const updated = reordered.map((j, i) => ({ ...j, priority: i + 1 }))
    dispatch(reorderJobs([...updated, ...terminalJobs]))
    flashRow(fromId)
    dragFromId.current = null
  }

  // ─── Move up / down ───────────────────────────────────────────────────────
  const moveJob = (jobId: string, direction: 1 | -1) => {
    const terminalSet = new Set(terminalJobs.map(j => j.id))
    const activeQueue = [...allJobs]
      .filter(j => !terminalSet.has(j.id))
      .sort((a, b) => a.priority - b.priority)

    const idx = activeQueue.findIndex(j => j.id === jobId)
    const newIdx = idx + direction
    if (idx < 0 || newIdx < 0 || newIdx >= activeQueue.length) return

    const reordered = [...activeQueue]
    ;[reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]]

    const updated = reordered.map((j, i) => ({ ...j, priority: i + 1 }))
    dispatch(reorderJobs([...updated, ...terminalJobs]))
    flashRow(jobId)
  }

  // ─── Edit priority ────────────────────────────────────────────────────────
  const startEditPriority = (job: Job) => {
    setEditPriorityId(job.id)
    setEditPriorityVal(String(job.priority))
  }
  const submitEditPriority = () => {
    const val = parseInt(editPriorityVal, 10)
    if (editPriorityId && !isNaN(val) && val >= 1 && val <= 100) {
      const terminalSet = new Set(terminalJobs.map(j => j.id))
      const activeQueue = [...allJobs]
        .filter(j => !terminalSet.has(j.id))
        .sort((a, b) => a.priority - b.priority)

      // Remove the job being edited from the queue
      const withoutEdited = activeQueue.filter(j => j.id !== editPriorityId)
      // Insert at new position (1-based priority → 0-based insert)
      const insertAt = Math.min(val - 1, withoutEdited.length)
      withoutEdited.splice(insertAt, 0, activeQueue.find(j => j.id === editPriorityId)!)
      const updated = withoutEdited.map((j, i) => ({ ...j, priority: i + 1 }))
      dispatch(reorderJobs([...updated, ...terminalJobs]))
      flashRow(editPriorityId)
    }
    setEditPriorityId(null)
    setEditPriorityVal('')
  }

  // ─── New Job ──────────────────────────────────────────────────────────────
  const defaultPriority = Math.max(0, ...queueJobs.map(j => j.priority)) + 1

  const handleNewJob = (data: JobFormValues) => {
    const recipe = recipes.find(r => r.id === data.recipeId)
    if (!recipe) return
    const newJob: Job = {
      id:          `job-${Date.now()}`,
      recipeId:    data.recipeId,
      recipeName:  recipe.name,
      status:      'pending',
      priority:    data.priority,
      line:        data.line,
      createdAt:   new Date().toISOString(),
      notes:       data.notes,
    }
    dispatch(addJob(newJob))
    flashRow(newJob.id)
  }

  // ─── Cancel confirm ───────────────────────────────────────────────────────
  const handleCancelConfirm = () => {
    if (!cancelJobId) return
    dispatch(removeJob(cancelJobId))
    if (selectedJobId === cancelJobId) setSelectedJobId(null)
    setCancelJobId(null)
  }

  // ─── Assign crane ─────────────────────────────────────────────────────────
  const handleAssign = (craneId: string) => {
    if (!assignJobId) return
    dispatch(assignCrane({ jobId: assignJobId, craneId }))
    setAssignJobId(null)
  }

  // ─── Clear filters ────────────────────────────────────────────────────────
  const clearFilters = () => {
    setStatusFilter('')
    setLineFilter('')
    setRecipeFilter('')
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 p-4 min-h-full">
      {/* ─── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-text-value text-xl font-mono uppercase tracking-widest">
            Job Queue
          </h1>
          <p className="text-text-muted text-xs font-mono mt-0.5">
            Production job management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={14} />}
            onClick={() => dispatch(resetJobs())}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Filter size={14} />}
            onClick={() => setFilterOpen(v => !v)}
          >
            Filter
          </Button>
          {canCreate && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setNewJobOpen(true)}
            >
              New Job
            </Button>
          )}
        </div>
      </div>

      {/* ─── Main Content: Queue + Detail ────────────────────────────────────── */}
      <div className="flex gap-4 flex-1" style={{ minHeight: '420px' }}>
        {/* LEFT — Queue Panel */}
        <div className="flex flex-col" style={{ width: '55%' }}>
          <Card
            accent="primary"
            noPadding
            className="flex flex-col h-full"
            title="Active & Pending"
            action={
              <span className="text-text-muted text-xs font-mono">
                {queueJobs.length} job{queueJobs.length !== 1 ? 's' : ''}
              </span>
            }
          >
            {/* Filter bar */}
            <JobFilterBar
              open={filterOpen}
              statusFilter={statusFilter}
              lineFilter={lineFilter}
              recipeFilter={recipeFilter}
              onStatusChange={setStatusFilter}
              onLineChange={setLineFilter}
              onRecipeChange={setRecipeFilter}
              onClear={clearFilters}
            />

            {/* Job list */}
            <div className="flex-1 overflow-y-auto">
              {filteredJobs.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={<Boxes size={40} />}
                    message={
                      isFiltered
                        ? 'No jobs match the current filters.'
                        : 'No active or pending jobs.'
                    }
                    action={
                      isFiltered ? (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      ) : undefined
                    }
                  />
                </div>
              ) : (
                filteredJobs.map(job => {
                  const recipeSteps = recipes.find(r => r.id === job.recipeId)?.steps.length ?? 0
                  return (
                    <JobRow
                      key={job.id}
                      job={job}
                      recipeSteps={recipeSteps}
                      isSelected={selectedJobId === job.id}
                      isDragOver={dragOverId === job.id}
                      isFlashing={flashIds.has(job.id)}
                      canManage={canManage}
                      onSelect={() => setSelectedJobId(job.id)}
                      onDragStart={() => handleDragStart(job.id)}
                      onDragOver={(e) => handleDragOver(e, job.id)}
                      onDrop={() => handleDrop(job.id)}
                      onMoveUp={() => moveJob(job.id, -1)}
                      onMoveDown={() => moveJob(job.id, 1)}
                      onAssignCrane={() => setAssignJobId(job.id)}
                      onCancel={() => setCancelJobId(job.id)}
                      onEditPriority={() => startEditPriority(job)}
                    />
                  )
                })
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT — Detail Panel */}
        <div className="flex flex-col" style={{ width: '45%' }}>
          <JobDetailPanel
            job={selectedJob}
            recipe={selectedRecipe}
            simState={selectedSimState}
            canManage={canManage}
            onAssignCrane={() => selectedJobId && setAssignJobId(selectedJobId)}
            onEditPriority={() => selectedJob && startEditPriority(selectedJob)}
            onCancel={() => selectedJobId && setCancelJobId(selectedJobId)}
          />
        </div>
      </div>

      {/* ─── Bottom — Completed Table ─────────────────────────────────────────── */}
      <CompletedJobsTable jobs={terminalJobs} />

      {/* ─── Modals ───────────────────────────────────────────────────────────── */}

      {/* New Job Modal */}
      <NewJobModal
        open={newJobOpen}
        onClose={() => setNewJobOpen(false)}
        recipes={recipes}
        defaultPriority={defaultPriority}
        onSubmit={handleNewJob}
      />

      {/* Crane Assignment Modal */}
      <CraneAssignModal
        open={!!assignJobId}
        onClose={() => setAssignJobId(null)}
        job={assignJob}
        cranes={cranes}
        onAssign={handleAssign}
      />

      {/* Cancel Confirmation Modal */}
      <Modal
        open={!!cancelJobId}
        onClose={() => setCancelJobId(null)}
        title="Cancel Job"
        accentColor="border-t-2 border-t-status-alarm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelJobId(null)}>Keep job</Button>
            <Button variant="danger" onClick={handleCancelConfirm}>Cancel job</Button>
          </>
        }
      >
        {cancelJob && (
          <div className="flex flex-col gap-2">
            <p className="text-text-primary text-sm">
              Cancel <span className="text-accent-gold font-mono">{cancelJob.id.toUpperCase()}</span>{' '}
              — <span className="font-medium">{cancelJob.recipeName}</span>?
            </p>
            <p className="text-text-muted text-xs font-mono">
              This action will remove the job from the queue. It cannot be undone.
            </p>
          </div>
        )}
      </Modal>

      {/* Edit Priority Modal */}
      <Modal
        open={!!editPriorityId}
        onClose={() => setEditPriorityId(null)}
        title="Edit Priority"
        accentColor="border-t-2 border-t-accent-gold"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditPriorityId(null)}>Cancel</Button>
            <Button variant="primary" onClick={submitEditPriority}>Apply</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-text-muted text-xs font-mono">
            Set a new priority (1 = highest). The queue will be reordered.
          </p>
          <Input
            label="Priority"
            type="number"
            value={editPriorityVal}
            onChange={(e) => setEditPriorityVal(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}


