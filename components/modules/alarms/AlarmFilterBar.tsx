'use client'

// Client component — filter bar with search + 4 selects + active-filter counter
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectAlarmFilter,
  selectAllAlarms,
  selectFilteredAlarms,
  setFilterSearch,
  setFilterSeverity,
  setFilterAcknowledged,
  setFilterCategory,
  setFilterSource,
  clearFilters,
} from '@/store/slices/alarmsSlice'
import { Input }  from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Search } from '@/lib/icons'

const SEVERITY_OPTIONS = [
  { value: '',         label: 'All Severities' },
  { value: 'critical', label: 'Critical'       },
  { value: 'high',     label: 'High'           },
  { value: 'medium',   label: 'Medium'         },
  { value: 'low',      label: 'Low'            },
  { value: 'info',     label: 'Info'           },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'All'            },
  { value: 'no',  label: 'Unacknowledged' },
  { value: 'yes', label: 'Acknowledged'  },
]

const CATEGORY_OPTIONS = [
  { value: '',              label: 'All Categories' },
  { value: 'Motion',        label: 'Motion'         },
  { value: 'Communication', label: 'Communication'  },
  { value: 'Process',       label: 'Process'        },
  { value: 'Recipe',        label: 'Recipe'         },
  { value: 'Sensor',        label: 'Sensor'         },
  { value: 'Collision',     label: 'Collision'      },
]

const SOURCE_OPTIONS = [
  { value: '',         label: 'All Sources' },
  { value: 'CRANE-1',  label: 'CRANE-1'     },
  { value: 'CRANE-2',  label: 'CRANE-2'     },
  { value: 'CRANE-3',  label: 'CRANE-3'     },
  { value: 'CRANE-4',  label: 'CRANE-4'     },
  { value: 'PLC-LINE1',label: 'PLC-LINE1'   },
  { value: 'PLC-LINE2',label: 'PLC-LINE2'   },
  { value: 'TANK',     label: 'TANK'        },
  { value: 'ZONE',     label: 'ZONE'        },
]

export function AlarmFilterBar() {
  const dispatch    = useAppDispatch()
  const filter      = useAppSelector(selectAlarmFilter)
  const allAlarms   = useAppSelector(selectAllAlarms)
  const filtered    = useAppSelector(selectFilteredAlarms)

  const statusValue =
    filter.acknowledged === null ? 'all'
    : filter.acknowledged       ? 'yes'
    :                             'no'

  const hasActiveFilters =
    filter.search !== ''    ||
    filter.severity !== null ||
    filter.acknowledged !== false || // false is default
    filter.category !== null ||
    filter.source   !== null

  return (
    <div className="bg-scada-surface border-b border-scada-border px-6 py-3">
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="min-w-48 flex-1">
          <Input
            type="search"
            placeholder="Search alarms..."
            value={filter.search}
            onChange={e => dispatch(setFilterSearch(e.target.value))}
            icon={<Search size={14} className="text-text-muted" />}
          />
        </div>

        {/* Severity */}
        <div className="w-40">
          <Select
            value={filter.severity ?? ''}
            onChange={val => dispatch(setFilterSeverity(val === '' ? null : val))}
            options={SEVERITY_OPTIONS}
          />
        </div>

        {/* Status */}
        <div className="w-44">
          <Select
            value={statusValue}
            onChange={val =>
              dispatch(setFilterAcknowledged(val === 'all' ? null : val === 'yes'))
            }
            options={STATUS_OPTIONS}
          />
        </div>

        {/* Category */}
        <div className="w-40">
          <Select
            value={filter.category ?? ''}
            onChange={val => dispatch(setFilterCategory(val === '' ? null : val))}
            options={CATEGORY_OPTIONS}
          />
        </div>

        {/* Source */}
        <div className="w-36">
          <Select
            value={filter.source ?? ''}
            onChange={val => dispatch(setFilterSource(val === '' ? null : val))}
            options={SOURCE_OPTIONS}
          />
        </div>

        {/* Counter + Clear */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-text-muted text-xs font-mono whitespace-nowrap">
            Showing {filtered.length} of {allAlarms.length} alarms
          </span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={() => dispatch(clearFilters())}>
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

