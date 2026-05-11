'use client'

// Client component — role-based redirect, simulation orchestration, section scroll

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { selectUserRole } from '@/store/slices/authSlice'
import { useDiagnosticsSimulation } from '@/lib/hooks/useDiagnosticsSimulation'
import { Card, Button, Toggle, StatusDot } from '@/components/ui'
import { RefreshCw } from '@/lib/icons'

import { SystemHealthTile }     from './SystemHealthTile'
import { PLCStatusPanel }       from './PLCStatusPanel'
import { LatencyChart }         from './LatencyChart'
import { NetworkStatsTable }    from './NetworkStatsTable'
import { CraneHardwarePanel }   from './CraneHardwarePanel'
import { HardwareDetailModal }  from './HardwareDetailModal'
import { SoftwareComponentList} from './SoftwareComponentList'
import { DiagnosticLogViewer }  from './DiagnosticLogViewer'

import type { CraneHardwareStatus } from '@/types'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CRANE_HARDWARE: CraneHardwareStatus[] = [
  {
    craneId:        'CRANE-1',
    craneName:      'CRANE-1',
    overall:        'ok',
    travelMotor:    'ok',
    hoistMotor:     'ok',
    vfdDrive:       'ok',
    encoder:        'ok',
    endLimitLeft:   'ok',
    endLimitRight:  'ok',
    loadCell:       'ok',
    brakeSystem:    'ok',
    tempVfd:        42,
    tempMotor:      38,
    operatingHours: 1247,
  },
  {
    craneId:        'CRANE-2',
    craneName:      'CRANE-2',
    overall:        'ok',
    travelMotor:    'ok',
    hoistMotor:     'ok',
    vfdDrive:       'ok',
    encoder:        'ok',
    endLimitLeft:   'ok',
    endLimitRight:  'ok',
    loadCell:       'ok',
    brakeSystem:    'ok',
    tempVfd:        38,
    tempMotor:      35,
    operatingHours: 892,
  },
  {
    craneId:        'CRANE-3',
    craneName:      'CRANE-3',
    overall:        'ok',
    travelMotor:    'ok',
    hoistMotor:     'ok',
    vfdDrive:       'ok',
    encoder:        'ok',
    endLimitLeft:   'ok',
    endLimitRight:  'ok',
    loadCell:       'ok',
    brakeSystem:    'ok',
    tempVfd:        45,
    tempMotor:      40,
    operatingHours: 1103,
  },
  {
    craneId:        'CRANE-4',
    craneName:      'CRANE-4',
    overall:        'alarm',
    travelMotor:    'warning',
    hoistMotor:     'ok',
    vfdDrive:       'ok',
    encoder:        'alarm',
    endLimitLeft:   'ok',
    endLimitRight:  'ok',
    loadCell:       'ok',
    brakeSystem:    'ok',
    tempVfd:        78,
    tempMotor:      62,
    operatingHours: 654,
  },
]

// ─── Section tile definitions ─────────────────────────────────────────────────

type TileStatus = 'ok' | 'warning' | 'alarm' | 'offline'

interface TileSection {
  id:       string
  iconName: string
  name:     string
  status:   TileStatus
  detail:   string
  section:  'B' | 'C' | 'D' | 'E'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DiagnosticsClient() {
  const router = useRouter()
  const role   = useAppSelector(selectUserRole)

  // Role-based access: redirect operator / supervisor to overview
  useEffect(() => {
    if (role === 'operator' || role === 'supervisor') {
      router.replace('/overview')
    }
  }, [role, router])

  const sim = useDiagnosticsSimulation()

  const [selectedCrane, setSelectedCrane] = useState<CraneHardwareStatus | null>(null)

  // Section refs for scroll-to
  const sectionBRef = useRef<HTMLDivElement>(null)
  const sectionCRef = useRef<HTMLDivElement>(null)
  const sectionDRef = useRef<HTMLDivElement>(null)
  const sectionERef = useRef<HTMLDivElement>(null)

  const SECTION_REFS = {
    B: sectionBRef,
    C: sectionCRef,
    D: sectionDRef,
    E: sectionERef,
  }

  function scrollTo(section: keyof typeof SECTION_REFS) {
    SECTION_REFS[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // System health score color
  const healthColor =
    sim.healthScore >= 95 ? 'text-status-ok' :
    sim.healthScore >= 85 ? 'text-status-warning' :
    'text-status-alarm'

  // 12 system health tiles (some values dynamic from sim state)
  const TILES: TileSection[] = [
    { id: 'plc1',   iconName: 'Wifi',            name: 'PLC LINE-1',    status: 'ok',                                       detail: `Connected · ${sim.plc1Latency}ms`,    section: 'B' },
    { id: 'plc2',   iconName: 'Wifi',            name: 'PLC LINE-2',    status: 'warning',                                  detail: `High latency · ${sim.plc2Latency}ms`, section: 'B' },
    { id: 'crane1', iconName: 'MoveHorizontal',  name: 'CRANE-1',       status: 'ok',                                       detail: 'Online · Encoder OK',                 section: 'D' },
    { id: 'crane2', iconName: 'MoveHorizontal',  name: 'CRANE-2',       status: 'ok',                                       detail: 'Online · Encoder OK',                 section: 'D' },
    { id: 'crane3', iconName: 'MoveHorizontal',  name: 'CRANE-3',       status: 'ok',                                       detail: 'Online · Encoder OK',                 section: 'D' },
    { id: 'crane4', iconName: 'MoveHorizontal',  name: 'CRANE-4',       status: 'alarm',                                    detail: 'Encoder fault',                       section: 'D' },
    { id: 'mqtt',   iconName: 'Activity',        name: 'MQTT Broker',   status: 'ok',                                       detail: 'Connected · 12 topics',               section: 'C' },
    { id: 'opc',    iconName: 'Activity',        name: 'OPC UA Server', status: 'ok',                                       detail: '48 nodes active',                     section: 'C' },
    { id: 'db',     iconName: 'Activity',        name: 'Database',      status: 'ok',                                       detail: '24ms · 98% pool free',                section: 'E' },
    { id: 'web',    iconName: 'Activity',        name: 'Web Server',    status: 'ok',                                       detail: 'Running · Port 3000',                 section: 'E' },
    { id: 'qr',     iconName: 'QrCode',          name: 'QR Scanner',    status: sim.qrWarning ? 'warning' : 'ok',           detail: sim.qrWarning ? 'USB disconnect warn' : 'Connected', section: 'E' },
    { id: 'zone',   iconName: 'AlertOctagon',    name: 'Shared Zone',   status: 'warning',                                  detail: 'ZONE-B caution active',               section: 'D' },
  ]

  // Guard: do not render page content for unauthorized roles
  if (role === 'operator' || role === 'supervisor') return null

  return (
    <div className="space-y-6">

      {/* ── PAGE HEADER ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-text-value text-xl font-mono uppercase tracking-widest">
            DIAGNOSTICS
          </h1>
          <p className="text-text-muted text-xs font-mono mt-1">
            System health and component status monitoring
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-text-muted text-xs font-mono uppercase tracking-widest">
              System Health
            </div>
            <div className={`text-3xl font-mono font-bold ${healthColor} ${sim.scanning ? 'alarm-blink' : ''}`}>
              {sim.healthScore.toFixed(1)}%
            </div>
          </div>
          <div className="text-text-muted text-xs font-mono">
            Last scan: {sim.lastScanTime} · Auto-refresh: {sim.autoRefresh ? 'ON' : 'OFF'}
          </div>
          <div className="flex items-center gap-3">
            <Toggle checked={sim.autoRefresh} onChange={sim.setAutoRefresh} />
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={sim.triggerScan}
            >
              Run Scan
            </Button>
          </div>
        </div>
      </div>

      {/* ── SECTION A — System Health Overview ───────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {TILES.map(tile => (
          <SystemHealthTile
            key={tile.id}
            iconName={tile.iconName}
            name={tile.name}
            status={tile.status}
            detail={tile.detail}
            scanning={sim.scanning}
            onClick={() => scrollTo(tile.section)}
          />
        ))}
      </div>

      {/* ── SECTION B + C — PLC Status + Network Diagnostics ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* SECTION B */}
        <div ref={sectionBRef}>
          <Card title="PLC COMMUNICATIONS" accent="primary">
            <div className="space-y-4">
              <PLCStatusPanel
                plcId="PLC LINE-1"
                ip="192.168.1.10"
                protocol="OPC UA"
                rack="0 / 1"
                status="ok"
                latency={sim.plc1Latency}
                packetLoss={0.0}
                activeTags={124}
                totalTags={124}
                dataAge="0.3s"
                dataAgeStatus="fresh"
                lastResponse={sim.lastScanTime}
                isLine1
              />
              <PLCStatusPanel
                plcId="PLC LINE-2"
                ip="192.168.1.20"
                protocol="OPC UA"
                rack="0 / 1"
                status="warning"
                latency={sim.plc2Latency}
                packetLoss={sim.plc2PacketLoss}
                activeTags={sim.plc2ActiveTags}
                totalTags={124}
                dataAge="1.2s"
                dataAgeStatus="stale"
                lastResponse={sim.lastScanTime}
                isLine1={false}
              />
            </div>
          </Card>
        </div>

        {/* SECTION C */}
        <div ref={sectionCRef}>
          <Card title="NETWORK DIAGNOSTICS" accent="gold">
            <div className="space-y-4">

              {/* C1 — Latency History Chart */}
              <LatencyChart data={sim.latencyHistory} />

              {/* C2 — Network Stats Table */}
              <NetworkStatsTable
                plc1Latency={sim.plc1Latency}
                plc2Latency={sim.plc2Latency}
                mqttMsgPerSec={sim.mqttMsgPerSec}
              />

              {/* C3 — MQTT Broker Status */}
              <div className="border-t border-scada-border pt-3 space-y-2">
                <div className="text-text-muted text-[10px] font-mono uppercase mb-2">
                  MQTT Broker
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-mono">
                  <span className="text-text-muted uppercase text-[10px]">STATUS</span>
                  <span className="flex items-center gap-1.5">
                    <StatusDot status="ok" size="sm" />
                    <span className="text-status-ok">CONNECTED</span>
                  </span>
                  <span className="text-text-muted uppercase text-[10px]">HOST</span>
                  <span className="value-display text-text-primary">mqtt://192.168.1.100:1883</span>
                  <span className="text-text-muted uppercase text-[10px]">TOPICS</span>
                  <span className="value-display text-text-primary">12 subscribed / 48 total</span>
                  <span className="text-text-muted uppercase text-[10px]">MESSAGES/SEC</span>
                  <span className="value-display text-accent-primary">{sim.mqttMsgPerSec.toFixed(1)} msg/s</span>
                  <span className="text-text-muted uppercase text-[10px]">LAST MESSAGE</span>
                  <span className="value-display text-text-muted">{sim.lastScanTime}</span>
                </div>
              </div>

            </div>
          </Card>
        </div>
      </div>

      {/* ── SECTION D — Crane Hardware ────────────────────────────────────── */}
      <div ref={sectionDRef}>
        <Card title="CRANE HARDWARE" accent="primary">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CRANE_HARDWARE.map(crane => (
              <CraneHardwarePanel
                key={crane.craneId}
                hardware={crane}
                onClick={() => setSelectedCrane(crane)}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* ── SECTION E — Software Components ─────────────────────────────── */}
      <div ref={sectionERef}>
        <Card title="SOFTWARE COMPONENTS" accent="primary">
          <SoftwareComponentList
            cpu={sim.cpu}
            uptimeSeconds={sim.uptimeSeconds}
          />
        </Card>
      </div>

      {/* ── SECTION F — Diagnostic Log ───────────────────────────────────── */}
      <Card title="DIAGNOSTIC LOG" accent="primary">
        <DiagnosticLogViewer
          entries={sim.logEntries}
          clearLog={sim.clearLog}
        />
      </Card>

      {/* ── Hardware Detail Modal ────────────────────────────────────────── */}
      {selectedCrane && (
        <HardwareDetailModal
          crane={selectedCrane}
          onClose={() => setSelectedCrane(null)}
        />
      )}

    </div>
  )
}

