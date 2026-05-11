'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AlarmBadge } from '@/components/ui/AlarmBadge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { StatusDot } from '@/components/ui/StatusDot'
import { Spinner } from '@/components/ui/Spinner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ValueDisplay } from '@/components/ui/ValueDisplay'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/Tooltip'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { TankCell } from '@/components/modules/overview/TankCell'
import { CraneIndicator } from '@/components/modules/overview/CraneIndicator'
import type { Column } from '@/types'

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockCrane = {
  id: 'crane-1',
  name: 'CRANE-1',
  status: 'moving' as const,
  position: 3200,
  load: 450,
  line: 'LINE-1',
}

const mockCraneIdle = {
  id: 'crane-2',
  name: 'CRANE-2',
  status: 'idle' as const,
  position: 800,
  load: 0,
  line: 'LINE-1',
}

const mockTanks = [
  { id: 't1', number: 1, name: 'LOAD',     occupied: false, dwellProgress: 0,  line: 'LINE-1' },
  { id: 't2', number: 2, name: 'DEGREASE', occupied: true,  dwellProgress: 60, currentPart: 'PART-0042', line: 'LINE-1' },
  { id: 't3', number: 3, name: 'RINSE 1',  occupied: true,  dwellProgress: 85, currentPart: 'PART-0039', line: 'LINE-1' },
  { id: 't4', number: 4, name: 'ZINC',     occupied: false, dwellProgress: 0,  line: 'LINE-1' },
  { id: 't5', number: 5, name: 'RINSE 2',  occupied: false, dwellProgress: 0,  line: 'LINE-1' },
  { id: 't6', number: 6, name: 'UNLOAD',   occupied: true,  dwellProgress: 45, currentPart: 'PART-0035', line: 'LINE-1' },
]

interface AlarmRow {
  id: string
  message: string
  severity: string
  source: string
  triggeredAt: string
  acknowledged: boolean
}

const mockTableData: AlarmRow[] = [
  { id: 'a1', message: 'Motion timeout — CRANE-1',  severity: 'critical', source: 'CRANE-1',   triggeredAt: '2026-05-09 08:14:22', acknowledged: false },
  { id: 'a2', message: 'PLC communication failure', severity: 'high',     source: 'PLC-LINE2', triggeredAt: '2026-05-09 08:10:05', acknowledged: false },
  { id: 'a3', message: 'Tank occupied too long',    severity: 'medium',   source: 'TANK-03',   triggeredAt: '2026-05-09 07:55:30', acknowledged: true  },
  { id: 'a4', message: 'Recipe mismatch detected',  severity: 'medium',   source: 'JOB-0091',  triggeredAt: '2026-05-09 07:40:12', acknowledged: true  },
  { id: 'a5', message: 'Sensor failure — T-ZONE-2', severity: 'low',      source: 'ZONE-2',    triggeredAt: '2026-05-09 07:20:00', acknowledged: true  },
]

const severityVariant: Record<string, 'alarm' | 'warning' | 'gold' | 'info'> = {
  critical: 'alarm',
  high:     'alarm',
  medium:   'warning',
  low:      'gold',
  info:     'info',
}

const alarmColumns: Column<AlarmRow>[] = [
  { key: 'message',     header: 'Message',     sortable: true },
  { key: 'severity',    header: 'Severity',    sortable: true, render: (r) => <Badge variant={severityVariant[r.severity] ?? 'info'} label={r.severity.toUpperCase()} /> },
  { key: 'source',      header: 'Source',      sortable: true },
  { key: 'triggeredAt', header: 'Triggered',   sortable: true },
  { key: 'acknowledged',header: 'ACK',         render: (r) => <Badge variant={r.acknowledged ? 'ok' : 'alarm'} label={r.acknowledged ? 'YES' : 'NO'} /> },
]

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-text-muted text-xs uppercase tracking-widest font-mono border-b border-scada-border pb-2 mb-6">
        {title}
      </h2>
      <div className="flex flex-wrap gap-4 items-start">
        {children}
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [selectVal, setSelectVal] = useState('option1')

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-text-value text-2xl font-mono uppercase tracking-wider">
          Design System
        </h1>
        <p className="text-text-muted text-sm font-mono mt-1">
          Component showcase — industrial-ops-ui
        </p>
      </div>

      {/* ── Buttons ── */}
      <Section title="Buttons">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary" size="sm">Primary SM</Button>
            <Button variant="primary" size="md">Primary MD</Button>
            <Button variant="primary" size="lg">Primary LG</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="secondary" size="sm">Secondary SM</Button>
            <Button variant="secondary" size="md">Secondary MD</Button>
            <Button variant="secondary" size="lg">Secondary LG</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="ghost" size="sm">Ghost SM</Button>
            <Button variant="ghost" size="md">Ghost MD</Button>
            <Button variant="ghost" size="lg">Ghost LG</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="danger" size="sm">Danger SM</Button>
            <Button variant="danger" size="md">Danger MD</Button>
            <Button variant="danger" size="lg">Danger LG</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary" loading>Loading</Button>
            <Button variant="secondary" disabled>Disabled</Button>
            <Button variant="danger" disabled>Disabled Danger</Button>
          </div>
        </div>
      </Section>

      {/* ── Badges ── */}
      <Section title="Badges">
        <Badge variant="ok"      label="OK" />
        <Badge variant="warning" label="WARNING" />
        <Badge variant="alarm"   label="ALARM" />
        <Badge variant="offline" label="OFFLINE" />
        <Badge variant="idle"    label="IDLE" />
        <Badge variant="info"    label="INFO" />
        <Badge variant="gold"    label="GOLD" />
      </Section>

      {/* ── Inputs ── */}
      <Section title="Inputs">
        <Input placeholder="Default input" className="w-56" value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
        <Input label="With Label" placeholder="Enter value" className="w-56" value="" onChange={() => {}} />
        <Input
          label="With Icon"
          placeholder="Search..."
          className="w-56"
          value=""
          onChange={() => {}}
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          }
        />
        <Input label="With Unit" placeholder="0" type="number" unit="mm" className="w-40" value="" onChange={() => {}} />
        <Input label="Error State" placeholder="Enter value" error="This field is required" className="w-56" value="" onChange={() => {}} />
        <Input label="Disabled" placeholder="Disabled" disabled className="w-56" value="" onChange={() => {}} />
      </Section>

      {/* ── Select ── */}
      <Section title="Select">
        <Select
          label="Default Select"
          value={selectVal}
          onChange={setSelectVal}
          options={[
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
          ]}
          className="w-56"
        />
        <Select
          label="Disabled"
          value="option1"
          onChange={() => {}}
          options={[{ value: 'option1', label: 'Option 1' }]}
          disabled
          className="w-56"
        />
        <Select
          label="With Error"
          value=""
          onChange={() => {}}
          options={[{ value: '', label: 'Select...' }, { value: 'a', label: 'Choice A' }]}
          error="Selection required"
          className="w-56"
        />
      </Section>

      {/* ── Status Dots ── */}
      <Section title="Status Dots">
        {(['ok', 'warning', 'alarm', 'offline', 'idle'] as const).map((s) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <StatusDot status={s} size="sm" />
              <StatusDot status={s} size="md" />
              <StatusDot status={s} size="lg" />
            </div>
            <div className="flex items-center gap-2">
              <StatusDot status={s} size="sm" animated />
              <StatusDot status={s} size="md" animated />
              <StatusDot status={s} size="lg" animated />
            </div>
            <span className="text-text-muted text-xs font-mono uppercase">{s}</span>
          </div>
        ))}
      </Section>

      {/* ── Alarm Badge ── */}
      <Section title="Alarm Badge">
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs font-mono">count=0:</span>
          <AlarmBadge count={0} />
          <span className="text-text-muted text-xs font-mono ml-2">(renders nothing)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs font-mono">count=3 unacknowledged:</span>
          <AlarmBadge count={3} unacknowledged />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-muted text-xs font-mono">count=5 acknowledged:</span>
          <AlarmBadge count={5} unacknowledged={false} />
        </div>
      </Section>

      {/* ── Spinner ── */}
      <Section title="Spinner">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="sm" />
            <span className="text-text-muted text-xs font-mono">SM</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size="md" />
            <span className="text-text-muted text-xs font-mono">MD</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <span className="text-text-muted text-xs font-mono">LG</span>
          </div>
        </div>
      </Section>

      {/* ── Progress Bar ── */}
      <Section title="Progress Bar">
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <div>
            <span className="text-text-muted text-xs font-mono mb-1 block">30% — OK</span>
            <ProgressBar value={30} max={100} unit="%" showLabel />
          </div>
          <div>
            <span className="text-text-muted text-xs font-mono mb-1 block">70% — Warning</span>
            <ProgressBar value={70} max={100} unit="%" showLabel />
          </div>
          <div>
            <span className="text-text-muted text-xs font-mono mb-1 block">95% — Alarm</span>
            <ProgressBar value={95} max={100} unit="%" showLabel />
          </div>
        </div>
      </Section>

      {/* ── Value Display ── */}
      <Section title="Value Display">
        <ValueDisplay label="Position"    value="1 247.5" unit="mm"  trend="up" />
        <ValueDisplay label="Load"        value="450"     unit="kg"  trend="stable" />
        <ValueDisplay label="Speed"       value="0.8"     unit="m/s" trend="down" />
        <ValueDisplay label="Temperature" value="23.4"    unit="°C"  layout="horizontal" />
      </Section>

      {/* ── Stat Cards ── */}
      <Section title="Stat Cards">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <StatCard title="Active Jobs"       value={12}  subtitle="jobs in queue"       accent="primary" trend="up" />
          <StatCard title="Active Alarms"     value={3}   subtitle="unacknowledged"       accent="alarm"   trend="up" />
          <StatCard title="Crane Utilization" value="87%" subtitle="last 8 hours"         accent="gold"    trend="stable" />
          <StatCard title="Batches Today"     value={24}  subtitle="completed batches"    accent="ok"      trend="up" />
        </div>
      </Section>

      {/* ── Card ── */}
      <Section title="Card">
        <Card className="w-48">
          <span className="text-text-muted text-xs font-mono">Default card</span>
        </Card>
        <Card title="With Title" className="w-48">
          <span className="text-text-muted text-xs font-mono">Card body</span>
        </Card>
        <Card title="With Action" action={<Badge variant="ok" label="LIVE" />} className="w-48">
          <span className="text-text-muted text-xs font-mono">Card body</span>
        </Card>
        {(['ok', 'warning', 'alarm', 'offline', 'primary', 'gold'] as const).map((a) => (
          <Card key={a} title={a.toUpperCase()} accent={a} className="w-36">
            <span className="text-text-muted text-xs font-mono">accent</span>
          </Card>
        ))}
      </Section>

      {/* ── Tooltip ── */}
      <Section title="Tooltip">
        <Tooltip content="Tooltip on top" position="top">
          <Button variant="secondary" size="sm">Hover — Top</Button>
        </Tooltip>
        <Tooltip content="Tooltip on bottom" position="bottom">
          <Button variant="secondary" size="sm">Hover — Bottom</Button>
        </Tooltip>
        <Tooltip content="Tooltip on left" position="left">
          <Button variant="secondary" size="sm">Hover — Left</Button>
        </Tooltip>
        <Tooltip content="Tooltip on right" position="right">
          <Button variant="secondary" size="sm">Hover — Right</Button>
        </Tooltip>
      </Section>

      {/* ── Empty State ── */}
      <Section title="Empty State">
        <Card className="w-80">
          <EmptyState
            icon={<span>🔔</span>}
            message="No alarms found."
            action={<Button variant="ghost" size="sm">Clear filters</Button>}
          />
        </Card>
        <Card className="w-80">
          <EmptyState
            icon={<span>📋</span>}
            message="No jobs in queue."
          />
        </Card>
      </Section>

      {/* ── Modal ── */}
      <Section title="Modal">
        <Button variant="primary" onClick={() => setModalOpen(true)}>Open Demo Modal</Button>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Confirm Action"
          accentColor="border-t-2 border-t-accent-primary"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>Confirm</Button>
            </>
          }
        >
          <p className="text-text-primary text-sm font-mono">
            Are you sure you want to proceed with this action?
          </p>
          <p className="text-text-muted text-xs font-mono mt-2">
            This operation cannot be undone. All related records will be updated.
          </p>
        </Modal>
      </Section>

      {/* ── Table ── */}
      <Section title="Table">
        <div className="w-full flex flex-col gap-6">
          <div>
            <span className="text-text-muted text-xs font-mono mb-2 block">Populated table — sortable columns, row click</span>
            <Card noPadding>
              <Table<AlarmRow>
                columns={alarmColumns}
                data={mockTableData}
                keyExtractor={(r) => r.id}
                onRowClick={(r) => alert(`Clicked: ${r.message}`)}
              />
            </Card>
          </div>
          <div>
            <span className="text-text-muted text-xs font-mono mb-2 block">Empty table — empty state</span>
            <Card noPadding>
              <Table<AlarmRow>
                columns={alarmColumns}
                data={[]}
                keyExtractor={(r) => r.id}
                emptyMessage="No alarms match the current filters."
              />
            </Card>
          </div>
        </div>
      </Section>

      {/* ── Tank Cells ── */}
      <Section title="Tank Cells">
        <div className="flex flex-wrap gap-3">
          {mockTanks.map((tank) => (
            <TankCell key={tank.id} tank={tank} onClick={(t) => alert(`Tank: ${t.name}`)} />
          ))}
        </div>
      </Section>

      {/* ── Crane Indicator ── */}
      <Section title="Crane Indicator">
        <div className="flex flex-col gap-6 w-full">
          <Card title="CRANE-1 — Moving" accent="gold" className="w-full">
            <CraneIndicator crane={mockCrane} railLength={6000} />
          </Card>
          <Card title="CRANE-2 — Idle" accent="offline" className="w-full">
            <CraneIndicator crane={mockCraneIdle} railLength={6000} />
          </Card>
        </div>
      </Section>

      {/* ── Layout Components ── */}
      <Section title="TopBar / Header / Sidebar">
        <div className="w-full">
          <p className="text-text-muted text-sm font-mono mb-4">
            These layout components are visible in the main app shell (Sidebar on the left, TopBar at the very top, Header below TopBar).
          </p>
          {/* Static mockup */}
          <div className="border border-scada-border rounded-scada overflow-hidden w-full max-w-2xl">
            {/* TopBar mockup */}
            <div className="h-8 bg-scada-bg border-b border-scada-border/50 flex items-center px-4 gap-4 text-xs font-mono text-text-muted">
              <span className="flex items-center gap-1.5"><StatusDot status="ok" size="sm" /> PLC LINE-1</span>
              <span className="flex items-center gap-1.5"><StatusDot status="ok" size="sm" /> PLC LINE-2</span>
              <span>| ⚠ 3 Active Alarms |</span>
              <span className="flex items-center gap-1.5 text-status-ok"><StatusDot status="ok" animated size="sm" /> LIVE</span>
              <span className="ml-auto">09-05-2026</span>
            </div>
            <div className="flex">
              {/* Sidebar mockup */}
              <div className="w-40 bg-scada-surface border-r border-scada-border p-3 flex flex-col gap-1">
                <div className="text-accent-primary text-xs font-mono font-semibold mb-2">INDUSTRIAL OPS</div>
                {['Overview', 'Recipes', 'Jobs', 'Alarms', 'Reports', 'Admin'].map((item) => (
                  <div key={item} className={`text-xs font-mono px-2 py-1 rounded-scada ${item === 'Overview' ? 'text-accent-primary bg-scada-panel border-l-2 border-accent-primary' : 'text-text-muted'}`}>
                    {item}
                  </div>
                ))}
              </div>
              {/* Content area */}
              <div className="flex-1">
                {/* Header mockup */}
                <div className="h-10 bg-scada-surface border-b border-scada-border flex items-center justify-between px-4">
                  <span className="text-text-primary text-xs font-medium uppercase tracking-wide">Overview</span>
                  <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                    <span>08:14:22</span>
                    <span>|</span>
                    <Badge variant="ok" label="OPERATOR" />
                    <span className="text-text-primary">J. Operator</span>
                  </div>
                </div>
                <div className="p-4 bg-scada-bg h-24 flex items-center justify-center">
                  <span className="text-text-muted text-xs font-mono">Main content area</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
