import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'
import type { IOSignal, IOLogEntry, IOLogEntryType, PLCLine } from '@/types'
import { mockIOLine1, mockIOLine2, mockIOLog } from '@/lib/mock/io'

// ─── State ────────────────────────────────────────────────────────────────────

interface IOState {
  selectedPlc:        PLCLine
  signalsLine1:       IOSignal[]
  signalsLine2:       IOSignal[]
  forcedOutputs:      Record<string, number>      // address → forced value (0/1 or analog)
  monitoredAddresses: string[]                    // up to 6 signal addresses
  log:                IOLogEntry[]
  logCounter:         number                      // for unique IDs
}

const initialState: IOState = {
  selectedPlc:        'LINE-1',
  signalsLine1:       mockIOLine1,
  signalsLine2:       mockIOLine2,
  forcedOutputs:      {},
  monitoredAddresses: [],
  log:                mockIOLog,
  logCounter:         100,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nowTimestamp(): string {
  const d = new Date()
  return [
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
    String(d.getSeconds()).padStart(2, '0'),
  ].join(':')
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const ioSlice = createSlice({
  name: 'io',
  initialState,
  reducers: {
    selectPlc(state, action: PayloadAction<PLCLine>) {
      state.selectedPlc = action.payload
    },

    updateSignalValue(state, action: PayloadAction<{ address: string; value: number }>) {
      const { address, value } = action.payload
      const updateInList = (list: IOSignal[]) => {
        const sig = list.find(s => s.address === address)
        if (sig) sig.value = value
      }
      updateInList(state.signalsLine1)
      updateInList(state.signalsLine2)
    },

    updateSignalStatus(state, action: PayloadAction<{ address: string; plc: PLCLine; status: IOSignal['status'] }>) {
      const { address, plc, status } = action.payload
      const list = plc === 'LINE-1' ? state.signalsLine1 : state.signalsLine2
      const sig  = list.find(s => s.address === address)
      if (sig) sig.status = status
    },

    forceOutput(state, action: PayloadAction<{ address: string; plc: PLCLine; value: number; userName: string; signalName: string }>) {
      const { address, plc, value, userName, signalName } = action.payload
      const list = plc === 'LINE-1' ? state.signalsLine1 : state.signalsLine2
      const sig  = list.find(s => s.address === address)
      if (sig) {
        sig.status = 'FORCED'
        if (sig.value !== undefined) sig.value = value
      }
      state.forcedOutputs[`${plc}:${address}`] = value
      state.logCounter++
      const entry: IOLogEntry = {
        id:         String(state.logCounter),
        timestamp:  nowTimestamp(),
        type:       'FORCE',
        address,
        signalName,
        detail:     `→ forced ${value === 1 ? 'HIGH' : value === 0 ? 'LOW' : `${value}`} by ${userName}`,
      }
      state.log.unshift(entry)
    },

    releaseForce(state, action: PayloadAction<{ address: string; plc: PLCLine; signalName: string }>) {
      const { address, plc, signalName } = action.payload
      const list = plc === 'LINE-1' ? state.signalsLine1 : state.signalsLine2
      const sig  = list.find(s => s.address === address)
      if (sig) {
        // Restore previous status based on signal type
        sig.status = sig.value && sig.value > 0 ? 'HIGH' : 'LOW'
      }
      delete state.forcedOutputs[`${plc}:${address}`]
      state.logCounter++
      const entry: IOLogEntry = {
        id:         String(state.logCounter),
        timestamp:  nowTimestamp(),
        type:       'RELEASE',
        address,
        signalName,
        detail:     '→ force released',
      }
      state.log.unshift(entry)
    },

    addToMonitor(state, action: PayloadAction<{ address: string; signalName: string }>) {
      const { address, signalName } = action.payload
      if (state.monitoredAddresses.length >= 6) return
      if (state.monitoredAddresses.includes(address)) return
      state.monitoredAddresses.push(address)
      state.logCounter++
      const entry: IOLogEntry = {
        id:         String(state.logCounter),
        timestamp:  nowTimestamp(),
        type:       'MONITOR',
        address,
        signalName,
        detail:     'Added to signal monitor',
      }
      state.log.unshift(entry)
    },

    removeFromMonitor(state, action: PayloadAction<string>) {
      state.monitoredAddresses = state.monitoredAddresses.filter(a => a !== action.payload)
    },

    clearMonitor(state) {
      state.monitoredAddresses = []
    },

    appendLogEntry(state, action: PayloadAction<Omit<IOLogEntry, 'id' | 'timestamp'>>) {
      state.logCounter++
      const entry: IOLogEntry = {
        id:        String(state.logCounter),
        timestamp: nowTimestamp(),
        ...action.payload,
      }
      state.log.unshift(entry)
      // Keep max 200 entries
      if (state.log.length > 200) state.log = state.log.slice(0, 200)
    },

    clearLog(state) {
      state.log = []
    },
  },
})

// ─── Actions ─────────────────────────────────────────────────────────────────

export const {
  selectPlc,
  updateSignalValue,
  updateSignalStatus,
  forceOutput,
  releaseForce,
  addToMonitor,
  removeFromMonitor,
  clearMonitor,
  appendLogEntry,
  clearLog,
} = ioSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectSelectedPlc        = (state: RootState) => state.io.selectedPlc
export const selectSignalsLine1       = (state: RootState) => state.io.signalsLine1
export const selectSignalsLine2       = (state: RootState) => state.io.signalsLine2
export const selectActiveSignals      = (state: RootState) =>
  state.io.selectedPlc === 'LINE-1' ? state.io.signalsLine1 : state.io.signalsLine2
export const selectForcedOutputs      = (state: RootState) => state.io.forcedOutputs
export const selectMonitoredAddresses = (state: RootState) => state.io.monitoredAddresses
export const selectIOLog              = (state: RootState) => state.io.log

// ─── Reducer ─────────────────────────────────────────────────────────────────

export default ioSlice.reducer

