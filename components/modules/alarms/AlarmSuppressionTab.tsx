'use client'

// Client component — uses useState for suppression rules, modal open/close, form fields

import { useState } from 'react'
import { Pencil, Trash2, Plus } from '@/lib/icons'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'

interface SuppressionRule {
  id: string
  name: string
  categories: string[]
  sources: string[]
  days: string[]
  startTime: string
  endTime: string
  reason: string
  active: boolean
}

const INITIAL_RULES: SuppressionRule[] = [
  {
    id: 'rule-1',
    name: 'MAINTENANCE WINDOW — LINE-1',
    categories: ['Motion', 'Sensor'],
    sources: ['CRANE-1', 'CRANE-2'],
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '06:00',
    endTime: '07:00',
    reason: 'Daily pre-shift maintenance check',
    active: true,
  },
  {
    id: 'rule-2',
    name: 'WEEKEND REDUCED MONITORING',
    categories: ['Process', 'Recipe'],
    sources: ['All'],
    days: ['Sat', 'Sun'],
    startTime: '00:00',
    endTime: '23:59',
    reason: 'Reduced production on weekends',
    active: false,
  },
]

const ALL_CATEGORIES = ['Motion', 'Communication', 'Process', 'Recipe', 'Sensor', 'Collision']
const ALL_SOURCES    = ['All', 'CRANE-1', 'CRANE-2', 'CRANE-3', 'CRANE-4', 'PLC-LINE1', 'PLC-LINE2']
const ALL_DAYS       = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface RuleFormData {
  name: string
  categories: string[]
  sources: string[]
  days: string[]
  startTime: string
  endTime: string
  reason: string
}

const EMPTY_FORM: RuleFormData = {
  name: '',
  categories: [],
  sources: [],
  days: [],
  startTime: '',
  endTime: '',
  reason: '',
}

function toFormData(rule: SuppressionRule): RuleFormData {
  return {
    name:       rule.name,
    categories: rule.categories,
    sources:    rule.sources,
    days:       rule.days,
    startTime:  rule.startTime,
    endTime:    rule.endTime,
    reason:     rule.reason,
  }
}

interface MultiCheckboxProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

function MultiCheckbox({ label, options, selected, onChange }: MultiCheckboxProps) {
  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-text-muted text-xs uppercase font-mono">{label}</span>
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map(opt => (
          <label
            key={opt}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-scada border cursor-pointer text-xs font-mono transition-colors
              ${selected.includes(opt)
                ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                : 'border-scada-border text-text-muted hover:border-text-muted'
              }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="sr-only"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  )
}

interface AlarmSuppressionTabProps {
  onDirty: () => void
}

export function AlarmSuppressionTab({ onDirty }: AlarmSuppressionTabProps) {
  const [rules, setRules]                 = useState<SuppressionRule[]>(INITIAL_RULES)
  const [modalOpen, setModalOpen]         = useState(false)
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [form, setForm]                   = useState<RuleFormData>(EMPTY_FORM)
  const [formError, setFormError]         = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(rule: SuppressionRule) {
    setForm(toFormData(rule))
    setEditingId(rule.id)
    setFormError(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setFormError(null)
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      setFormError('Rule name is required.')
      return
    }
    if (form.categories.length === 0) {
      setFormError('Select at least one category.')
      return
    }
    if (form.sources.length === 0) {
      setFormError('Select at least one source.')
      return
    }
    if (form.days.length === 0) {
      setFormError('Select at least one day.')
      return
    }
    if (!form.startTime || !form.endTime) {
      setFormError('Start and end times are required.')
      return
    }

    if (editingId) {
      setRules(prev =>
        prev.map(r =>
          r.id === editingId
            ? { ...r, ...form }
            : r
        )
      )
    } else {
      const newRule: SuppressionRule = {
        id: `rule-${Date.now()}`,
        ...form,
        active: true,
      }
      setRules(prev => [...prev, newRule])
    }

    onDirty()
    closeModal()
  }

  function toggleActive(id: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r))
    onDirty()
  }

  function confirmDelete(id: string) {
    setDeleteConfirmId(id)
  }

  function handleDelete() {
    if (!deleteConfirmId) return
    setRules(prev => prev.filter(r => r.id !== deleteConfirmId))
    setDeleteConfirmId(null)
    onDirty()
  }

  function updateForm<K extends keyof RuleFormData>(key: K, value: RuleFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setFormError(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-text-value text-sm font-mono uppercase font-bold mb-1">
            Suppression Rules
          </h2>
          <p className="text-text-muted text-sm">
            Define time windows when specific alarms are suppressed (e.g. planned maintenance).
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={openAdd}
        >
          Add Rule
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {rules.length === 0 && (
          <p className="text-text-muted text-sm font-mono text-center py-8">
            No suppression rules configured.
          </p>
        )}

        {rules.map((rule) => (
          <Card
            key={rule.id}
            className={rule.active ? 'border-accent-primary/40' : 'opacity-60'}
            accent={rule.active ? 'primary' : 'offline'}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-text-value text-sm font-mono font-bold uppercase">
                  {rule.name}
                </span>
                <Badge
                  variant={rule.active ? 'ok' : 'offline'}
                  label={rule.active ? 'ACTIVE' : 'INACTIVE'}
                />
              </div>
              <div className="flex items-center gap-2">
                <Toggle
                  checked={rule.active}
                  onChange={() => toggleActive(rule.id)}
                />
                <button
                  type="button"
                  onClick={() => openEdit(rule)}
                  className="p-1.5 text-text-muted hover:text-accent-primary transition-colors rounded-scada hover:bg-scada-panel"
                  aria-label="Edit rule"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => confirmDelete(rule.id)}
                  className="p-1.5 text-text-muted hover:text-status-alarm transition-colors rounded-scada hover:bg-scada-panel"
                  aria-label="Delete rule"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div className="flex gap-2">
                <span className="text-text-muted text-xs uppercase font-mono w-24 shrink-0">Category</span>
                <span className="text-text-primary text-xs font-mono">{rule.categories.join(', ')}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-text-muted text-xs uppercase font-mono w-24 shrink-0">Source</span>
                <span className="text-text-primary text-xs font-mono">{rule.sources.join(', ')}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-text-muted text-xs uppercase font-mono w-24 shrink-0">Days</span>
                <span className="text-text-primary text-xs font-mono">{rule.days.join(', ')}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-text-muted text-xs uppercase font-mono w-24 shrink-0">Time Window</span>
                <span className="text-text-primary text-xs font-mono value-display">
                  {rule.startTime} → {rule.endTime}
                </span>
              </div>
              {rule.reason && (
                <div className="flex gap-2 col-span-2">
                  <span className="text-text-muted text-xs uppercase font-mono w-24 shrink-0">Reason</span>
                  <span className="text-text-muted text-xs">{rule.reason}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Suppression Rule' : 'New Suppression Rule'}
        accentColor="border-t-2 border-t-accent-gold"
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {editingId ? 'Save Changes' : 'Create Rule'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {formError && (
            <div className="px-3 py-2 bg-status-alarm/10 border border-status-alarm/30 rounded-scada text-status-alarm text-xs font-mono">
              {formError}
            </div>
          )}

          <Input
            label="Rule Name"
            type="text"
            placeholder="e.g. MAINTENANCE WINDOW — LINE-1"
            value={form.name}
            onChange={(e) => updateForm('name', e.target.value)}
          />

          <MultiCheckbox
            label="Categories"
            options={ALL_CATEGORIES}
            selected={form.categories}
            onChange={(val) => updateForm('categories', val)}
          />

          <MultiCheckbox
            label="Sources"
            options={ALL_SOURCES}
            selected={form.sources}
            onChange={(val) => updateForm('sources', val)}
          />

          <MultiCheckbox
            label="Days"
            options={ALL_DAYS}
            selected={form.days}
            onChange={(val) => updateForm('days', val)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-text-muted text-xs uppercase tracking-wide font-mono">
                Start Time
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => updateForm('startTime', e.target.value)}
                className="w-full bg-scada-bg border border-scada-border text-text-primary text-sm px-3 py-2 rounded-scada outline-none focus:border-accent-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-text-muted text-xs uppercase tracking-wide font-mono">
                End Time
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => updateForm('endTime', e.target.value)}
                className="w-full bg-scada-bg border border-scada-border text-text-primary text-sm px-3 py-2 rounded-scada outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <Input
            label="Reason (optional)"
            type="text"
            placeholder="Describe why this suppression rule exists"
            value={form.reason}
            onChange={(e) => updateForm('reason', e.target.value)}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Suppression Rule"
        accentColor="border-t-2 border-t-status-alarm"
        maxWidth="max-w-sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-text-muted text-sm">
          Are you sure you want to delete this suppression rule? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}

