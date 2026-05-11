'use client'

// Client-only hook — simulates step progression for in_progress jobs (local state only)
// When all steps complete, dispatches updateStatus to Redux to mark the job as completed.

import { useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { updateStatus } from '@/store/slices/jobsSlice'
import type { Job, Recipe, JobSimState, JobStepSimState, JobStepStatus } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitialStepIdx(jobId: string, stepCount: number): number {
  const code = jobId.charCodeAt(jobId.length - 1)
  return Math.min(Math.floor(code % 3), stepCount - 1)
}

function getInitialProgress(jobId: string): number {
  const code = jobId.charCodeAt(jobId.length - 1)
  return 25 + (code % 4) * 15
}

function buildInitialState(job: Job, recipe: Recipe): JobSimState {
  const startIdx      = getInitialStepIdx(job.id, recipe.steps.length)
  const startProgress = getInitialProgress(job.id)

  const steps: JobStepSimState[] = recipe.steps.map((step, i): JobStepSimState => {
    if (i < startIdx) {
      return { status: 'completed' as JobStepStatus, progress: 100, elapsedSec: step.preferredTime }
    }
    if (i === startIdx) {
      const elapsed = Math.round(step.preferredTime * (startProgress / 100))
      return { status: 'in_progress' as JobStepStatus, progress: startProgress, elapsedSec: elapsed }
    }
    return { status: 'pending' as JobStepStatus, progress: 0, elapsedSec: 0 }
  })

  return { currentStepIndex: startIdx, steps }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useJobSimulation(
  jobs: Job[],
  recipes: Recipe[],
): Record<string, JobSimState> {
  const dispatch = useAppDispatch()

  // Use refs so the interval always has up-to-date values without re-creating itself
  const jobsRef    = useRef<Job[]>(jobs)
  const recipesRef = useRef<Recipe[]>(recipes)

  useEffect(() => { jobsRef.current    = jobs    }, [jobs])
  useEffect(() => { recipesRef.current = recipes }, [recipes])

  // Track jobs dispatched as completed (avoid double-dispatch)
  const completedRef = useRef<Set<string>>(new Set())

  // Initialize sim states from initial in_progress jobs only (on mount)
  const [simStates, setSimStates] = useState<Record<string, JobSimState>>(() => {
    const init: Record<string, JobSimState> = {}
    jobs.filter(j => j.status === 'in_progress').forEach(job => {
      const recipe = recipes.find(r => r.id === job.recipeId)
      if (recipe) init[job.id] = buildInitialState(job, recipe)
    })
    return init
  })

  // Progress simulation — fires every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const currentJobs    = jobsRef.current
      const currentRecipes = recipesRef.current

      setSimStates(prev => {
        const next    = { ...prev }
        let   changed = false

        currentJobs
          .filter(j => j.status === 'in_progress')
          .forEach(job => {
            const recipe = currentRecipes.find(r => r.id === job.recipeId)
            if (!recipe) return

            // Lazily initialize new in_progress jobs discovered during interval
            if (!next[job.id]) {
              next[job.id] = buildInitialState(job, recipe)
              changed = true
              return
            }

            const state = { ...next[job.id] }
            const steps = [...state.steps.map(s => ({ ...s }))]
            const idx   = state.currentStepIndex

            if (idx >= steps.length) {
              if (!completedRef.current.has(job.id)) {
                completedRef.current.add(job.id)
                dispatch(updateStatus({ id: job.id, status: 'completed' }))
              }
              return
            }

            const step        = steps[idx]
            const newProgress = Math.min(100, step.progress + 5)
            step.progress     = newProgress
            step.elapsedSec  += 8

            if (newProgress >= 100) {
              step.status   = 'completed'
              step.progress = 100
              const nextIdx = idx + 1
              if (nextIdx < steps.length) {
                steps[nextIdx] = { ...steps[nextIdx], status: 'in_progress', progress: 0 }
                state.currentStepIndex = nextIdx
              } else {
                state.currentStepIndex = steps.length
                if (!completedRef.current.has(job.id)) {
                  completedRef.current.add(job.id)
                  dispatch(updateStatus({ id: job.id, status: 'completed' }))
                }
              }
            } else {
              step.status = 'in_progress'
            }

            state.steps  = steps
            next[job.id] = state
            changed      = true
          })

        return changed ? next : prev
      })
    }, 8000)

    return () => clearInterval(interval)
  }, [dispatch])

  return simStates
}
