import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { AuditEntry } from '@/types'
import { mockAuditEntries } from '@/lib/mock/audit'

interface AuditState {
  entries: AuditEntry[]
  status:  'idle' | 'loading' | 'succeeded' | 'failed'
  error:   string | null
}

const initialState: AuditState = {
  entries: mockAuditEntries,
  status:  'succeeded',
  error:   null,
}

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {},
})

// Selectors
export const selectAllAuditEntries = (state: RootState) => state.audit.entries

export default auditSlice.reducer


