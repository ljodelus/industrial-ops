'use client'
// Client component — renders filter controls with event handlers

import { Input, Select } from '@/components/ui'
import { Button } from '@/components/ui'
import { X } from '@/lib/icons'
import type { AuditCategory, AuditResult, AuditSeverity } from '@/types'

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'Authentication',   label: 'Authentication' },
  { value: 'User Management',  label: 'User Management' },
  { value: 'Recipe',           label: 'Recipe' },
  { value: 'Job',              label: 'Job' },
  { value: 'Alarm',            label: 'Alarm' },
  { value: 'Configuration',    label: 'Configuration' },
  { value: 'IO Force',         label: 'IO Force' },
  { value: 'System',           label: 'System' },
  { value: 'Security',         label: 'Security' },
]

const USER_OPTIONS = [
  { value: '',            label: 'All Users' },
  { value: 'John Carter', label: 'John Carter' },
  { value: 'Sarah Mills', label: 'Sarah Mills' },
  { value: 'Marc Dupont', label: 'Marc Dupont' },
  { value: 'Admin User',  label: 'Admin User' },
  { value: 'SYSTEM',      label: 'SYSTEM' },
]

const SEVERITY_OPTIONS = [
  { value: '',         label: 'All Severities' },
  { value: 'info',     label: 'Info' },
  { value: 'warning',  label: 'Warning' },
  { value: 'critical', label: 'Critical' },
]

const RESULT_OPTIONS = [
  { value: '',        label: 'All Results' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAILURE', label: 'Failure' },
  { value: 'WARNING', label: 'Warning' },
]

interface AuditFilterBarProps {
  search:       string
  category:     AuditCategory | ''
  user:         string
  severity:     AuditSeverity | ''
  result:       AuditResult | ''
  onSearch:     (v: string) => void
  onCategory:   (v: AuditCategory | '') => void
  onUser:       (v: string) => void
  onSeverity:   (v: AuditSeverity | '') => void
  onResult:     (v: AuditResult | '') => void
  onClear:      () => void
  shown:        number
  total:        number
  page:         number
  totalPages:   number
}

export function AuditFilterBar({
  search, category, user, severity, result,
  onSearch, onCategory, onUser, onSeverity, onResult, onClear,
  shown, total, page, totalPages,
}: AuditFilterBarProps) {
  return (
    <div className="bg-scada-surface border-b border-scada-border px-6 py-3 flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <Input
            type="search"
            placeholder="Search action, target, details…"
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
        </div>

        <div className="w-44">
          <Select
            value={category}
            onChange={v => onCategory(v as AuditCategory | '')}
            options={CATEGORY_OPTIONS}
          />
        </div>

        <div className="w-36">
          <Select
            value={user}
            onChange={v => onUser(v)}
            options={USER_OPTIONS}
          />
        </div>

        <div className="w-36">
          <Select
            value={severity}
            onChange={v => onSeverity(v as AuditSeverity | '')}
            options={SEVERITY_OPTIONS}
          />
        </div>

        <div className="w-32">
          <Select
            value={result}
            onChange={v => onResult(v as AuditResult | '')}
            options={RESULT_OPTIONS}
          />
        </div>

        <Button variant="ghost" size="sm" icon={<X size={14} className="text-text-muted" />} onClick={onClear}>
          Clear
        </Button>
      </div>

      <span className="text-text-muted text-xs font-mono">
        Showing {shown} of {total} events · Page {page} of {totalPages}
      </span>
    </div>
  )
}

