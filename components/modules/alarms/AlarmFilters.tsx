'use client'

// Client component — uses Redux dispatch for filter actions and controlled inputs

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectAlarmFilter,
  setFilterSearch,
  setFilterSeverity,
  setFilterAcknowledged,
  clearFilters,
} from '@/store/slices/alarmsSlice'
import { Input }  from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

const SEVERITY_OPTIONS = [
  { value: '',         label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high',     label: 'High' },
  { value: 'medium',   label: 'Medium' },
  { value: 'low',      label: 'Low' },
  { value: 'info',     label: 'Info' },
]

const ACK_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'no',  label: 'Unacknowledged' },
  { value: 'yes', label: 'Acknowledged' },
]

export function AlarmFilters() {
  const dispatch = useAppDispatch()
  const filter   = useAppSelector(selectAlarmFilter)

  const hasActiveFilters =
    filter.search !== '' ||
    filter.severity !== null ||
    filter.acknowledged !== null

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-48">
        <Input
          label="Search"
          type="search"
          placeholder="Search messages…"
          value={filter.search}
          onChange={e => dispatch(setFilterSearch(e.target.value))}
        />
      </div>

      <div className="w-44">
        <Select
          label="Severity"
          value={filter.severity ?? ''}
          onChange={val => dispatch(setFilterSeverity(val === '' ? null : val))}
          options={SEVERITY_OPTIONS}
        />
      </div>

      <div className="w-44">
        <Select
          label="Status"
          value={
            filter.acknowledged === null ? 'all'
            : filter.acknowledged ? 'yes' : 'no'
          }
          onChange={val =>
            dispatch(setFilterAcknowledged(
              val === 'all' ? null : val === 'yes'
            ))
          }
          options={ACK_OPTIONS}
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => dispatch(clearFilters())}>
          Clear
        </Button>
      )}
    </div>
  )
}
