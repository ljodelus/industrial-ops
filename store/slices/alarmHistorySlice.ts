import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { AlarmHistoryEntry } from '@/types'
import { mockAlarmHistory } from '@/lib/mock/alarms'

// 1. State interface
interface AlarmHistoryFilters {
  search:   string
  severity: string   // '' = all
  category: string   // '' = all
  source:   string   // '' = all
  status:   string   // '' = all | 'acknowledged' | 'unacknowledged'
  dateFrom: string   // YYYY-MM-DD
  dateTo:   string   // YYYY-MM-DD
}

interface AlarmHistoryState {
  items:   AlarmHistoryEntry[]
  status:  'idle' | 'loading' | 'succeeded' | 'failed'
  error:   string | null
  filters: AlarmHistoryFilters
}

// Default date range: last 7 days
function defaultDateFrom(): string {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString().slice(0, 10)
}

function defaultDateTo(): string {
  return new Date().toISOString().slice(0, 10)
}

// 2. Initial state
const initialState: AlarmHistoryState = {
  items:  mockAlarmHistory,
  status: 'succeeded',
  error:  null,
  filters: {
    search:   '',
    severity: '',
    category: '',
    source:   '',
    status:   '',
    dateFrom: defaultDateFrom(),
    dateTo:   defaultDateTo(),
  },
}

// 3. Slice
const alarmHistorySlice = createSlice({
  name: 'alarmHistory',
  initialState,
  reducers: {
    setHistorySearch(state, action: PayloadAction<string>) {
      state.filters.search = action.payload
    },
    setHistorySeverity(state, action: PayloadAction<string>) {
      state.filters.severity = action.payload
    },
    setHistoryCategory(state, action: PayloadAction<string>) {
      state.filters.category = action.payload
    },
    setHistorySource(state, action: PayloadAction<string>) {
      state.filters.source = action.payload
    },
    setHistoryStatus(state, action: PayloadAction<string>) {
      state.filters.status = action.payload
    },
    setHistoryDateFrom(state, action: PayloadAction<string>) {
      state.filters.dateFrom = action.payload
    },
    setHistoryDateTo(state, action: PayloadAction<string>) {
      state.filters.dateTo = action.payload
    },
    clearHistoryFilters(state) {
      state.filters = {
        search:   '',
        severity: '',
        category: '',
        source:   '',
        status:   '',
        dateFrom: defaultDateFrom(),
        dateTo:   defaultDateTo(),
      }
    },
  },
})

// 4. Actions
export const {
  setHistorySearch,
  setHistorySeverity,
  setHistoryCategory,
  setHistorySource,
  setHistoryStatus,
  setHistoryDateFrom,
  setHistoryDateTo,
  clearHistoryFilters,
} = alarmHistorySlice.actions

// 5. Selectors
export const selectAlarmHistoryItems   = (state: RootState) => state.alarmHistory.items
export const selectAlarmHistoryFilters = (state: RootState) => state.alarmHistory.filters

// 6. Reducer
export default alarmHistorySlice.reducer

