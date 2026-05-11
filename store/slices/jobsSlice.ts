import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { Job, JobStatus } from '@/types'
import { mockJobs } from '@/lib/mock/jobs'

interface JobsState {
  items:  Job[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error:  string | null
}

const initialState: JobsState = {
  items:  mockJobs,
  status: 'succeeded',
  error:  null,
}

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    addJob(state, action: PayloadAction<Job>) {
      state.items.push(action.payload)
    },
    removeJob(state, action: PayloadAction<string>) {
      state.items = state.items.filter(j => j.id !== action.payload)
    },
    updateStatus(state, action: PayloadAction<{ id: string; status: JobStatus }>) {
      const job = state.items.find(j => j.id === action.payload.id)
      if (job) {
        job.status = action.payload.status
        if (action.payload.status === 'in_progress') job.startedAt   = new Date().toISOString()
        if (action.payload.status === 'completed')   job.completedAt = new Date().toISOString()
      }
    },
    updatePriority(state, action: PayloadAction<{ id: string; priority: number }>) {
      const job = state.items.find(j => j.id === action.payload.id)
      if (job) job.priority = action.payload.priority
    },
    reorderJobs(state, action: PayloadAction<Job[]>) {
      state.items = action.payload
    },
    assignCrane(state, action: PayloadAction<{ jobId: string; craneId: string }>) {
      const job = state.items.find(j => j.id === action.payload.jobId)
      if (job) job.assignedCrane = action.payload.craneId
    },
    resetJobs(state) {
      state.items  = mockJobs
      state.status = 'succeeded'
      state.error  = null
    },
  },
})

export const {
  addJob,
  removeJob,
  updateStatus,
  updatePriority,
  reorderJobs,
  assignCrane,
  resetJobs,
} = jobsSlice.actions

// Selectors
export const selectAllJobs       = (state: RootState) => state.jobs.items
export const selectPendingJobs   = (state: RootState) =>
  state.jobs.items.filter(j => j.status === 'pending').sort((a, b) => a.priority - b.priority)
export const selectActiveJobs    = (state: RootState) =>
  state.jobs.items.filter(j => j.status === 'in_progress')
export const selectCompletedJobs = (state: RootState) =>
  state.jobs.items.filter(j => j.status === 'completed')
export const selectTerminalJobs  = (state: RootState) =>
  state.jobs.items
    .filter(j => ['completed', 'failed', 'cancelled'].includes(j.status))
    .sort((a, b) => {
      const aT = a.completedAt ?? a.createdAt
      const bT = b.completedAt ?? b.createdAt
      return new Date(bT).getTime() - new Date(aT).getTime()
    })

export default jobsSlice.reducer
