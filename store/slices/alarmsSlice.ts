import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { Alarm } from '@/types'
import { mockAlarms } from '@/lib/mock/alarms'

interface AlarmsState {
  items:  Alarm[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error:  string | null
  filter: {
    severity:     string | null
    acknowledged: boolean | null
    search:       string
    category:     string | null
    source:       string | null
  }
}

const initialState: AlarmsState = {
  items:  mockAlarms,
  status: 'succeeded',
  error:  null,
  // Default: show unacknowledged alarms first (most critical for operators)
  filter: { severity: null, acknowledged: false, search: '', category: null, source: null },
}

const alarmsSlice = createSlice({
  name: 'alarms',
  initialState,
  reducers: {
    acknowledge(state, action: PayloadAction<{ id: string; acknowledgedBy: string }>) {
      const alarm = state.items.find(a => a.id === action.payload.id)
      if (alarm) {
        alarm.acknowledged   = true
        alarm.acknowledgedBy = action.payload.acknowledgedBy
        alarm.acknowledgedAt = new Date().toISOString()
      }
    },
    acknowledgeAll(state, action: PayloadAction<string>) {
      state.items.forEach(alarm => {
        if (!alarm.acknowledged) {
          alarm.acknowledged   = true
          alarm.acknowledgedBy = action.payload
          alarm.acknowledgedAt = new Date().toISOString()
        }
      })
    },
    addAlarm(state, action: PayloadAction<Alarm>) {
      state.items.unshift(action.payload)
    },
    removeAlarm(state, action: PayloadAction<string>) {
      state.items = state.items.filter(a => a.id !== action.payload)
    },
    setFilterSeverity(state, action: PayloadAction<string | null>) {
      state.filter.severity = action.payload
    },
    setFilterAcknowledged(state, action: PayloadAction<boolean | null>) {
      state.filter.acknowledged = action.payload
    },
    setFilterSearch(state, action: PayloadAction<string>) {
      state.filter.search = action.payload
    },
    setFilterCategory(state, action: PayloadAction<string | null>) {
      state.filter.category = action.payload
    },
    setFilterSource(state, action: PayloadAction<string | null>) {
      state.filter.source = action.payload
    },
    clearFilters(state) {
      state.filter = { severity: null, acknowledged: false, search: '', category: null, source: null }
    },
  },
})

export const {
  acknowledge,
  acknowledgeAll,
  addAlarm,
  removeAlarm,
  setFilterSeverity,
  setFilterAcknowledged,
  setFilterSearch,
  setFilterCategory,
  setFilterSource,
  clearFilters,
} = alarmsSlice.actions

// Selectors
export const selectAllAlarms           = (state: RootState) => state.alarms.items
export const selectAlarmFilter         = (state: RootState) => state.alarms.filter
export const selectUnacknowledgedCount = (state: RootState) =>
  state.alarms.items.filter(a => !a.acknowledged).length

export const selectFilteredAlarms = (state: RootState) => {
  const { items, filter } = state.alarms
  return items.filter(alarm => {
    if (filter.severity     && alarm.severity  !== filter.severity)                                return false
    if (filter.acknowledged !== null && alarm.acknowledged !== filter.acknowledged)                return false
    if (filter.search && !alarm.message.toLowerCase().includes(filter.search.toLowerCase())
        && !alarm.source.toLowerCase().includes(filter.search.toLowerCase()))                      return false
    if (filter.category && alarm.category !== filter.category)                                     return false
    if (filter.source   && alarm.source   !== filter.source)                                       return false
    return true
  })
}

export default alarmsSlice.reducer
