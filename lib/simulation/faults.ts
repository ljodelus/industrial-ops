// lib/simulation/faults.ts
// Fault injection definitions for the simulation mode

import type { AlarmSeverity } from '@/types'

export type FaultId =
  | 'motion-timeout'
  | 'plc-comm-loss'
  | 'zone-conflict'
  | 'encoder-failure'
  | 'emergency-stop'
  | 'tank-overflow'
  | 'load-cell-fault'

export interface FaultDefinition {
  id:              FaultId
  label:           string
  requiresCrane:   boolean
  alarmSeverity:   AlarmSeverity
  alarmCategory:   string
  getAlarmMessage: (crane?: string) => string
  getLogMessage:   (crane?: string) => string
}

export const FAULT_DEFINITIONS: FaultDefinition[] = [
  {
    id:              'motion-timeout',
    label:           'Motion Timeout — CRANE-X',
    requiresCrane:   true,
    alarmSeverity:   'critical',
    alarmCategory:   'Motion',
    getAlarmMessage: (crane = 'CRANE-1') => `${crane}: Motion timeout — target position not reached within 30s`,
    getLogMessage:   (crane = 'CRANE-1') => `Motion Timeout — ${crane}`,
  },
  {
    id:              'plc-comm-loss',
    label:           'PLC Communication Loss',
    requiresCrane:   false,
    alarmSeverity:   'critical',
    alarmCategory:   'Communication',
    getAlarmMessage: () => 'PLC LINE-1: Communication lost — all cranes entering safe-stop mode',
    getLogMessage:   () => 'PLC Communication Loss',
  },
  {
    id:              'zone-conflict',
    label:           'Zone Conflict',
    requiresCrane:   false,
    alarmSeverity:   'high',
    alarmCategory:   'Safety',
    getAlarmMessage: () => 'Zone conflict detected — CRANE-1 and CRANE-2 within 200mm in shared zone',
    getLogMessage:   () => 'Zone Conflict (CRANE-1 / CRANE-2)',
  },
  {
    id:              'encoder-failure',
    label:           'Sensor Failure — CRANE-X Encoder',
    requiresCrane:   true,
    alarmSeverity:   'high',
    alarmCategory:   'Sensor',
    getAlarmMessage: (crane = 'CRANE-1') => `${crane}: Encoder feedback lost — absolute position unknown`,
    getLogMessage:   (crane = 'CRANE-1') => `Sensor Failure — ${crane} Encoder`,
  },
  {
    id:              'emergency-stop',
    label:           'Emergency Stop — CRANE-X',
    requiresCrane:   true,
    alarmSeverity:   'critical',
    alarmCategory:   'Safety',
    getAlarmMessage: (crane = 'CRANE-1') => `${crane}: Emergency stop activated — manual reset required`,
    getLogMessage:   (crane = 'CRANE-1') => `Emergency Stop — ${crane}`,
  },
  {
    id:              'tank-overflow',
    label:           'Tank Overflow',
    requiresCrane:   false,
    alarmSeverity:   'high',
    alarmCategory:   'Process',
    getAlarmMessage: () => 'Tank T4 ZINC BATH: Maximum dwell time exceeded — part quality risk',
    getLogMessage:   () => 'Tank Overflow — T4 ZINC BATH (max dwell exceeded)',
  },
  {
    id:              'load-cell-fault',
    label:           'Load Cell Fault',
    requiresCrane:   true,
    alarmSeverity:   'medium',
    alarmCategory:   'Sensor',
    getAlarmMessage: (crane = 'CRANE-1') => `${crane}: Load cell reading out of range — 0.0 kg (fault code: LC-ERR-004)`,
    getLogMessage:   (crane = 'CRANE-1') => `Load Cell Fault — ${crane}`,
  },
]

