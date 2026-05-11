import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type {
  AlarmFrequencyEntry, HourlyAlarmEntry, AlarmSourceStat,
  AlarmHeatmapCell, RecurringAlarm, AlarmReportKpis,
  ResponseTimeStat, ResponseTimeBucket,
} from '@/types'
import {
  mockAlarmReportKpis,
  mockAlarmFrequencyDaily,
  mockHourlyAlarms,
  mockAlarmSources,
  mockAlarmHeatmap,
  mockResponseTimeBuckets,
  mockResponseTimeStats,
  mockRecurringAlarms,
} from '@/lib/mock/reports'

// ─── State ────────────────────────────────────────────────────────────────────

interface AlarmReportState {
  kpis:             AlarmReportKpis
  frequencyDaily:   AlarmFrequencyEntry[]
  frequencyHourly:  HourlyAlarmEntry[]
  sources:          AlarmSourceStat[]
  heatmap:          AlarmHeatmapCell[]
  responseBuckets:  ResponseTimeBucket[]
  responseStats:    ResponseTimeStat
  recurringAlarms:  RecurringAlarm[]
  // Filters / UI state stored in Redux (filters applied to lists → Redux)
  periodFrom:       string
  periodTo:         string
  sourceFilter:     string                                           // 'all' | source name
  heatmapSeverity:  'total' | 'critical' | 'high' | 'medium' | 'low'
  minTriggers:      number
  status:           'idle' | 'loading' | 'succeeded' | 'failed'
  error:            string | null
}

const initialState: AlarmReportState = {
  kpis:            mockAlarmReportKpis,
  frequencyDaily:  mockAlarmFrequencyDaily,
  frequencyHourly: mockHourlyAlarms,
  sources:         mockAlarmSources,
  heatmap:         mockAlarmHeatmap,
  responseBuckets: mockResponseTimeBuckets,
  responseStats:   mockResponseTimeStats,
  recurringAlarms: mockRecurringAlarms,
  periodFrom:      '2026-05-03',
  periodTo:        '2026-05-09',
  sourceFilter:    'all',
  heatmapSeverity: 'total',
  minTriggers:     2,
  status:          'succeeded',
  error:           null,
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const alarmReportSlice = createSlice({
  name: 'alarmReport',
  initialState,
  reducers: {
    setPeriodFrom(state, action: PayloadAction<string>) {
      state.periodFrom = action.payload
    },
    setPeriodTo(state, action: PayloadAction<string>) {
      state.periodTo = action.payload
    },
    setSourceFilter(state, action: PayloadAction<string>) {
      state.sourceFilter = action.payload
    },
    setHeatmapSeverity(state, action: PayloadAction<AlarmReportState['heatmapSeverity']>) {
      state.heatmapSeverity = action.payload
    },
    setMinTriggers(state, action: PayloadAction<number>) {
      state.minTriggers = action.payload
    },
    clearFilters(state) {
      state.sourceFilter    = 'all'
      state.minTriggers     = 2
      state.heatmapSeverity = 'total'
    },
  },
})

// ─── Actions ──────────────────────────────────────────────────────────────────

export const {
  setPeriodFrom,
  setPeriodTo,
  setSourceFilter,
  setHeatmapSeverity,
  setMinTriggers,
  clearFilters,
} = alarmReportSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAlarmReportKpis         = (state: RootState) => state.alarmReport.kpis
export const selectAlarmFrequencyDaily     = (state: RootState) => state.alarmReport.frequencyDaily
export const selectAlarmFrequencyHourly    = (state: RootState) => state.alarmReport.frequencyHourly
export const selectAlarmSources            = (state: RootState) => state.alarmReport.sources
export const selectAlarmHeatmap            = (state: RootState) => state.alarmReport.heatmap
export const selectResponseBuckets         = (state: RootState) => state.alarmReport.responseBuckets
export const selectResponseStats           = (state: RootState) => state.alarmReport.responseStats
export const selectAlarmReportPeriodFrom   = (state: RootState) => state.alarmReport.periodFrom
export const selectAlarmReportPeriodTo     = (state: RootState) => state.alarmReport.periodTo
export const selectAlarmSourceFilter       = (state: RootState) => state.alarmReport.sourceFilter
export const selectAlarmHeatmapSeverity    = (state: RootState) => state.alarmReport.heatmapSeverity
export const selectAlarmMinTriggers        = (state: RootState) => state.alarmReport.minTriggers

/** Derived selector — applies sourceFilter + minTriggers to recurringAlarms */
export const selectFilteredRecurringAlarms = (state: RootState) => {
  const { recurringAlarms, sourceFilter, minTriggers } = state.alarmReport
  return recurringAlarms.filter(alarm => {
    const matchesSource   = sourceFilter === 'all' || alarm.source === sourceFilter
    const meetsThreshold  = alarm.triggers >= minTriggers
    return matchesSource && meetsThreshold
  })
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

export default alarmReportSlice.reducer

