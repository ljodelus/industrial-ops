'use client'

// Client component — manages local filter state with search, type, device, and status selects

import { useRef } from 'react'
import { Search, X } from '@/lib/icons'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IOFilters {
  search: string
  type:   string   // '' | 'DI' | 'DO' | 'AI' | 'AO'
  device: string   // '' | 'CRANE-1' | ...
  status: string   // '' | 'Active' | 'Inactive' | 'Forced' | 'Fault'
}

interface IOFilterBarProps {
  filters:    IOFilters
  onChange:   (filters: IOFilters) => void
  totalCount: number
  showCount:  number
}

const TYPE_OPTIONS = [
  { value: '',   label: 'All Types'    },
  { value: 'DI', label: 'Digital Input'  },
  { value: 'DO', label: 'Digital Output' },
  { value: 'AI', label: 'Analog Input'   },
  { value: 'AO', label: 'Analog Output'  },
]

const DEVICE_OPTIONS = [
  { value: '',        label: 'All Devices' },
  { value: 'CRANE-1', label: 'CRANE-1'     },
  { value: 'CRANE-2', label: 'CRANE-2'     },
  { value: 'TANK-1',  label: 'TANK-1'      },
  { value: 'TANK-2',  label: 'TANK-2'      },
  { value: 'TANK-3',  label: 'TANK-3'      },
  { value: 'TANK-4',  label: 'TANK-4'      },
  { value: 'TANK-5',  label: 'TANK-5'      },
  { value: 'TANK-6',  label: 'TANK-6'      },
  { value: 'ZONE-A',  label: 'ZONE-A'      },
  { value: 'ZONE-B',  label: 'ZONE-B'      },
  { value: 'SYSTEM',  label: 'SYSTEM'      },
]

const STATUS_OPTIONS = [
  { value: '',       label: 'All Status' },
  { value: 'Active', label: 'Active'     },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Forced', label: 'Forced'     },
  { value: 'Fault',  label: 'Fault'      },
]

const selectClass =
  'bg-scada-bg border border-scada-border rounded-scada text-text-primary text-xs font-mono px-2 py-1.5 focus:outline-none focus:border-accent-primary'

// ─── Component ────────────────────────────────────────────────────────────────

export function IOFilterBar({ filters, onChange, totalCount, showCount }: IOFilterBarProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  function set(patch: Partial<IOFilters>) {
    onChange({ ...filters, ...patch })
  }

  function clearAll() {
    onChange({ search: '', type: '', device: '', status: '' })
  }

  const hasActive = filters.search || filters.type || filters.device || filters.status

  return (
    <div className="flex flex-col gap-2 mb-4">
      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            ref={searchRef}
            id="io-signal-search"
            type="text"
            placeholder="Filter signals..."
            value={filters.search}
            onChange={e => set({ search: e.target.value })}
            className="w-full pl-7 pr-2 py-1.5 bg-scada-bg border border-scada-border rounded-scada text-text-primary text-xs font-mono placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
          />
        </div>

        {/* Type */}
        <select
          value={filters.type}
          onChange={e => set({ type: e.target.value })}
          className={selectClass}
        >
          {TYPE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Device */}
        <select
          value={filters.device}
          onChange={e => set({ device: e.target.value })}
          className={selectClass}
        >
          {DEVICE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status}
          onChange={e => set({ status: e.target.value })}
          className={selectClass}
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Clear */}
        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-text-muted text-xs font-mono hover:text-text-primary px-2 py-1.5 border border-scada-border rounded-scada"
          >
            <X size={10} />
            Clear
          </button>
        )}
      </div>

      {/* Count */}
      <div className="text-text-muted text-[10px] font-mono">
        Showing {showCount} of {totalCount} signals
        {hasActive && <span className="text-accent-primary"> (filtered)</span>}
      </div>
    </div>
  )
}

