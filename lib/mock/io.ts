import type { IOSignal, IOLogEntry } from '@/types'

// ─── PLC LINE-1 IO Map ────────────────────────────────────────────────────────

export const mockIOLine1: IOSignal[] = [
  // Digital Inputs — Crane 1
  { address: '%I0.0', name: 'CRANE-1_END_LIMIT_LEFT',   type: 'DI', status: 'HIGH',    device: 'CRANE-1', plc: 'LINE-1' },
  { address: '%I0.1', name: 'CRANE-1_END_LIMIT_RIGHT',  type: 'DI', status: 'LOW',     device: 'CRANE-1', plc: 'LINE-1' },
  { address: '%I0.2', name: 'CRANE-1_LOAD_CELL_OK',     type: 'DI', status: 'HIGH',    device: 'CRANE-1', plc: 'LINE-1' },
  { address: '%I0.3', name: 'CRANE-1_ENCODER_OK',       type: 'DI', status: 'HIGH',    device: 'CRANE-1', plc: 'LINE-1' },
  // Digital Inputs — Crane 2
  { address: '%I0.4', name: 'CRANE-2_END_LIMIT_LEFT',   type: 'DI', status: 'HIGH',    device: 'CRANE-2', plc: 'LINE-1' },
  { address: '%I0.5', name: 'CRANE-2_END_LIMIT_RIGHT',  type: 'DI', status: 'LOW',     device: 'CRANE-2', plc: 'LINE-1' },
  { address: '%I0.6', name: 'CRANE-2_LOAD_CELL_OK',     type: 'DI', status: 'HIGH',    device: 'CRANE-2', plc: 'LINE-1' },
  { address: '%I0.7', name: 'CRANE-2_ENCODER_OK',       type: 'DI', status: 'FAULT',   device: 'CRANE-2', plc: 'LINE-1' },
  // Digital Inputs — Tanks
  { address: '%I1.0', name: 'TANK_1_OCCUPIED',          type: 'DI', status: 'LOW',     device: 'TANK-1',  plc: 'LINE-1' },
  { address: '%I1.1', name: 'TANK_2_OCCUPIED',          type: 'DI', status: 'HIGH',    device: 'TANK-2',  plc: 'LINE-1' },
  { address: '%I1.2', name: 'TANK_3_OCCUPIED',          type: 'DI', status: 'HIGH',    device: 'TANK-3',  plc: 'LINE-1' },
  { address: '%I1.3', name: 'TANK_4_OCCUPIED',          type: 'DI', status: 'LOW',     device: 'TANK-4',  plc: 'LINE-1' },
  { address: '%I1.4', name: 'TANK_5_OCCUPIED',          type: 'DI', status: 'LOW',     device: 'TANK-5',  plc: 'LINE-1' },
  { address: '%I1.5', name: 'TANK_6_OCCUPIED',          type: 'DI', status: 'LOW',     device: 'TANK-6',  plc: 'LINE-1' },
  // Digital Inputs — Zones & Safety
  { address: '%I2.0', name: 'ZONE_A_CLEAR',             type: 'DI', status: 'HIGH',    device: 'ZONE-A',  plc: 'LINE-1' },
  { address: '%I2.1', name: 'ZONE_B_CLEAR',             type: 'DI', status: 'CAUTION', device: 'ZONE-B',  plc: 'LINE-1' },
  { address: '%I2.2', name: 'EMERGENCY_STOP_LINE1',     type: 'DI', status: 'LOW',     device: 'SYSTEM',  plc: 'LINE-1' },
  { address: '%I2.3', name: 'SAFETY_GATE_CLOSED',       type: 'DI', status: 'HIGH',    device: 'SYSTEM',  plc: 'LINE-1' },

  // Digital Outputs — Crane 1
  { address: '%Q0.0', name: 'CRANE-1_TRAVEL_FWD',       type: 'DO', status: 'LOW',     device: 'CRANE-1', plc: 'LINE-1' },
  { address: '%Q0.1', name: 'CRANE-1_TRAVEL_REV',       type: 'DO', status: 'LOW',     device: 'CRANE-1', plc: 'LINE-1' },
  { address: '%Q0.2', name: 'CRANE-1_HOIST_UP',         type: 'DO', status: 'LOW',     device: 'CRANE-1', plc: 'LINE-1' },
  { address: '%Q0.3', name: 'CRANE-1_HOIST_DOWN',       type: 'DO', status: 'LOW',     device: 'CRANE-1', plc: 'LINE-1' },
  { address: '%Q0.4', name: 'CRANE-1_BRAKE_RELEASE',    type: 'DO', status: 'HIGH',    device: 'CRANE-1', plc: 'LINE-1' },
  // Digital Outputs — Crane 2
  { address: '%Q0.5', name: 'CRANE-2_TRAVEL_FWD',       type: 'DO', status: 'LOW',     device: 'CRANE-2', plc: 'LINE-1' },
  { address: '%Q0.6', name: 'CRANE-2_TRAVEL_REV',       type: 'DO', status: 'LOW',     device: 'CRANE-2', plc: 'LINE-1' },
  { address: '%Q0.7', name: 'CRANE-2_HOIST_UP',         type: 'DO', status: 'LOW',     device: 'CRANE-2', plc: 'LINE-1' },
  { address: '%Q1.0', name: 'CRANE-2_HOIST_DOWN',       type: 'DO', status: 'LOW',     device: 'CRANE-2', plc: 'LINE-1' },
  { address: '%Q1.1', name: 'CRANE-2_BRAKE_RELEASE',    type: 'DO', status: 'HIGH',    device: 'CRANE-2', plc: 'LINE-1' },
  // Digital Outputs — System
  { address: '%Q2.0', name: 'ALARM_BEACON_LINE1',       type: 'DO', status: 'LOW',     device: 'SYSTEM',  plc: 'LINE-1' },
  { address: '%Q2.1', name: 'ALARM_HORN_LINE1',         type: 'DO', status: 'LOW',     device: 'SYSTEM',  plc: 'LINE-1' },
  { address: '%Q2.2', name: 'SAFETY_GATE_LOCK',         type: 'DO', status: 'HIGH',    device: 'SYSTEM',  plc: 'LINE-1' },
  { address: '%Q2.3', name: 'LINE1_RUNNING_INDICATOR',  type: 'DO', status: 'HIGH',    device: 'SYSTEM',  plc: 'LINE-1' },

  // Analog Inputs — Crane 1
  { address: '%IW0',  name: 'CRANE-1_ENCODER_POSITION', type: 'AI', status: 'HIGH', device: 'CRANE-1', value: 3200.0, unit: 'mm',    min: 0,  max: 6000, plc: 'LINE-1' },
  { address: '%IW2',  name: 'CRANE-1_LOAD_CELL',        type: 'AI', status: 'HIGH', device: 'CRANE-1', value: 450.0,  unit: 'kg',    min: 0,  max: 2000, plc: 'LINE-1' },
  { address: '%IW4',  name: 'CRANE-1_SPEED_FEEDBACK',   type: 'AI', status: 'HIGH', device: 'CRANE-1', value: 12.0,   unit: 'm/min', min: 0,  max: 18,   plc: 'LINE-1' },
  // Analog Inputs — Crane 2
  { address: '%IW6',  name: 'CRANE-2_ENCODER_POSITION', type: 'AI', status: 'HIGH', device: 'CRANE-2', value: 800.0,  unit: 'mm',    min: 0,  max: 6000, plc: 'LINE-1' },
  { address: '%IW8',  name: 'CRANE-2_LOAD_CELL',        type: 'AI', status: 'HIGH', device: 'CRANE-2', value: 0.0,    unit: 'kg',    min: 0,  max: 2000, plc: 'LINE-1' },
  { address: '%IW10', name: 'CRANE-2_SPEED_FEEDBACK',   type: 'AI', status: 'HIGH', device: 'CRANE-2', value: 0.0,    unit: 'm/min', min: 0,  max: 18,   plc: 'LINE-1' },
  // Analog Inputs — Tanks & VFDs
  { address: '%IW12', name: 'TANK-2_TEMP_SENSOR',       type: 'AI', status: 'HIGH', device: 'TANK-2',  value: 24.3,   unit: '°C',    min: 10, max: 80,   plc: 'LINE-1' },
  { address: '%IW14', name: 'TANK-3_TEMP_SENSOR',       type: 'AI', status: 'HIGH', device: 'TANK-3',  value: 25.1,   unit: '°C',    min: 10, max: 80,   plc: 'LINE-1' },
  { address: '%IW16', name: 'CRANE-1_VFD_TEMP',         type: 'AI', status: 'HIGH', device: 'CRANE-1', value: 42.0,   unit: '°C',    min: 10, max: 90,   plc: 'LINE-1' },
  { address: '%IW18', name: 'CRANE-2_VFD_TEMP',         type: 'AI', status: 'HIGH', device: 'CRANE-2', value: 38.0,   unit: '°C',    min: 10, max: 90,   plc: 'LINE-1' },
  // Analog Outputs — Speed Setpoints
  { address: '%QW0',  name: 'CRANE-1_SPEED_SETPOINT',   type: 'AO', status: 'HIGH', device: 'CRANE-1', value: 12.0,   unit: 'm/min', min: 0,  max: 18,   plc: 'LINE-1' },
  { address: '%QW2',  name: 'CRANE-2_SPEED_SETPOINT',   type: 'AO', status: 'LOW',  device: 'CRANE-2', value: 0.0,    unit: 'm/min', min: 0,  max: 18,   plc: 'LINE-1' },
]

// ─── PLC LINE-2 IO Map ────────────────────────────────────────────────────────

export const mockIOLine2: IOSignal[] = [
  // Digital Inputs — Crane 3
  { address: '%I0.0', name: 'CRANE-3_END_LIMIT_LEFT',   type: 'DI', status: 'HIGH',    device: 'CRANE-1', plc: 'LINE-2' },
  { address: '%I0.1', name: 'CRANE-3_END_LIMIT_RIGHT',  type: 'DI', status: 'LOW',     device: 'CRANE-1', plc: 'LINE-2' },
  { address: '%I0.2', name: 'CRANE-3_LOAD_CELL_OK',     type: 'DI', status: 'HIGH',    device: 'CRANE-1', plc: 'LINE-2' },
  { address: '%I0.3', name: 'CRANE-3_ENCODER_OK',       type: 'DI', status: 'HIGH',    device: 'CRANE-1', plc: 'LINE-2' },
  // Digital Inputs — Crane 4
  { address: '%I0.4', name: 'CRANE-4_END_LIMIT_LEFT',   type: 'DI', status: 'HIGH',    device: 'CRANE-2', plc: 'LINE-2' },
  { address: '%I0.5', name: 'CRANE-4_END_LIMIT_RIGHT',  type: 'DI', status: 'LOW',     device: 'CRANE-2', plc: 'LINE-2' },
  { address: '%I0.6', name: 'CRANE-4_LOAD_CELL_OK',     type: 'DI', status: 'LOW',     device: 'CRANE-2', plc: 'LINE-2' },
  { address: '%I0.7', name: 'CRANE-4_ENCODER_OK',       type: 'DI', status: 'FAULT',   device: 'CRANE-2', plc: 'LINE-2' },
  // Digital Inputs — Tanks
  { address: '%I1.0', name: 'TANK_7_OCCUPIED',          type: 'DI', status: 'LOW',     device: 'TANK-1',  plc: 'LINE-2' },
  { address: '%I1.1', name: 'TANK_8_OCCUPIED',          type: 'DI', status: 'HIGH',    device: 'TANK-2',  plc: 'LINE-2' },
  { address: '%I1.2', name: 'TANK_9_OCCUPIED',          type: 'DI', status: 'LOW',     device: 'TANK-3',  plc: 'LINE-2' },
  { address: '%I1.3', name: 'TANK_10_OCCUPIED',         type: 'DI', status: 'HIGH',    device: 'TANK-4',  plc: 'LINE-2' },
  // Digital Inputs — Zones & Safety
  { address: '%I2.0', name: 'ZONE_C_CLEAR',             type: 'DI', status: 'HIGH',    device: 'ZONE-A',  plc: 'LINE-2' },
  { address: '%I2.1', name: 'ZONE_D_CLEAR',             type: 'DI', status: 'HIGH',    device: 'ZONE-B',  plc: 'LINE-2' },
  { address: '%I2.2', name: 'EMERGENCY_STOP_LINE2',     type: 'DI', status: 'LOW',     device: 'SYSTEM',  plc: 'LINE-2' },
  { address: '%I2.3', name: 'SAFETY_GATE_LINE2_CLOSED', type: 'DI', status: 'HIGH',    device: 'SYSTEM',  plc: 'LINE-2' },

  // Digital Outputs — Crane 3
  { address: '%Q0.0', name: 'CRANE-3_TRAVEL_FWD',       type: 'DO', status: 'LOW',     device: 'CRANE-1', plc: 'LINE-2' },
  { address: '%Q0.1', name: 'CRANE-3_TRAVEL_REV',       type: 'DO', status: 'LOW',     device: 'CRANE-1', plc: 'LINE-2' },
  { address: '%Q0.2', name: 'CRANE-3_HOIST_UP',         type: 'DO', status: 'LOW',     device: 'CRANE-1', plc: 'LINE-2' },
  { address: '%Q0.3', name: 'CRANE-3_HOIST_DOWN',       type: 'DO', status: 'LOW',     device: 'CRANE-1', plc: 'LINE-2' },
  { address: '%Q0.4', name: 'CRANE-3_BRAKE_RELEASE',    type: 'DO', status: 'HIGH',    device: 'CRANE-1', plc: 'LINE-2' },
  // Digital Outputs — Crane 4
  { address: '%Q0.5', name: 'CRANE-4_TRAVEL_FWD',       type: 'DO', status: 'LOW',     device: 'CRANE-2', plc: 'LINE-2' },
  { address: '%Q0.6', name: 'CRANE-4_TRAVEL_REV',       type: 'DO', status: 'LOW',     device: 'CRANE-2', plc: 'LINE-2' },
  { address: '%Q0.7', name: 'CRANE-4_HOIST_UP',         type: 'DO', status: 'LOW',     device: 'CRANE-2', plc: 'LINE-2' },
  { address: '%Q1.0', name: 'CRANE-4_HOIST_DOWN',       type: 'DO', status: 'LOW',     device: 'CRANE-2', plc: 'LINE-2' },
  { address: '%Q1.1', name: 'CRANE-4_BRAKE_RELEASE',    type: 'DO', status: 'HIGH',    device: 'CRANE-2', plc: 'LINE-2' },
  // Digital Outputs — System
  { address: '%Q2.0', name: 'ALARM_BEACON_LINE2',       type: 'DO', status: 'LOW',     device: 'SYSTEM',  plc: 'LINE-2' },
  { address: '%Q2.1', name: 'ALARM_HORN_LINE2',         type: 'DO', status: 'LOW',     device: 'SYSTEM',  plc: 'LINE-2' },
  { address: '%Q2.2', name: 'SAFETY_GATE_LINE2_LOCK',   type: 'DO', status: 'HIGH',    device: 'SYSTEM',  plc: 'LINE-2' },
  { address: '%Q2.3', name: 'LINE2_RUNNING_INDICATOR',  type: 'DO', status: 'HIGH',    device: 'SYSTEM',  plc: 'LINE-2' },

  // Analog Inputs — Crane 3
  { address: '%IW0',  name: 'CRANE-3_ENCODER_POSITION', type: 'AI', status: 'HIGH', device: 'CRANE-1', value: 1500.0, unit: 'mm',    min: 0,  max: 6000, plc: 'LINE-2' },
  { address: '%IW2',  name: 'CRANE-3_LOAD_CELL',        type: 'AI', status: 'HIGH', device: 'CRANE-1', value: 220.0,  unit: 'kg',    min: 0,  max: 2000, plc: 'LINE-2' },
  { address: '%IW4',  name: 'CRANE-3_SPEED_FEEDBACK',   type: 'AI', status: 'HIGH', device: 'CRANE-1', value: 8.0,    unit: 'm/min', min: 0,  max: 18,   plc: 'LINE-2' },
  // Analog Inputs — Crane 4 (FAULT — encoder lost)
  { address: '%IW6',  name: 'CRANE-4_ENCODER_POSITION', type: 'AI', status: 'FAULT', device: 'CRANE-2', value: 0.0,   unit: 'mm',    min: 0,  max: 6000, plc: 'LINE-2' },
  { address: '%IW8',  name: 'CRANE-4_LOAD_CELL',        type: 'AI', status: 'HIGH', device: 'CRANE-2', value: 0.0,    unit: 'kg',    min: 0,  max: 2000, plc: 'LINE-2' },
  { address: '%IW10', name: 'CRANE-4_SPEED_FEEDBACK',   type: 'AI', status: 'HIGH', device: 'CRANE-2', value: 0.0,    unit: 'm/min', min: 0,  max: 18,   plc: 'LINE-2' },
  // Analog — Temps
  { address: '%IW12', name: 'TANK-8_TEMP_SENSOR',       type: 'AI', status: 'HIGH', device: 'TANK-2',  value: 23.7,   unit: '°C',    min: 10, max: 80,   plc: 'LINE-2' },
  { address: '%IW14', name: 'CRANE-3_VFD_TEMP',         type: 'AI', status: 'HIGH', device: 'CRANE-1', value: 39.0,   unit: '°C',    min: 10, max: 90,   plc: 'LINE-2' },
  { address: '%IW16', name: 'CRANE-4_VFD_TEMP',         type: 'AI', status: 'HIGH', device: 'CRANE-2', value: 35.0,   unit: '°C',    min: 10, max: 90,   plc: 'LINE-2' },
  // Analog Outputs
  { address: '%QW0',  name: 'CRANE-3_SPEED_SETPOINT',   type: 'AO', status: 'HIGH', device: 'CRANE-1', value: 8.0,    unit: 'm/min', min: 0,  max: 18,   plc: 'LINE-2' },
  { address: '%QW2',  name: 'CRANE-4_SPEED_SETPOINT',   type: 'AO', status: 'LOW',  device: 'CRANE-2', value: 0.0,    unit: 'm/min', min: 0,  max: 18,   plc: 'LINE-2' },
]

// ─── Initial IO Log Entries ───────────────────────────────────────────────────

export const mockIOLog: IOLogEntry[] = [
  { id: '1', timestamp: '08:14:32', type: 'READ',    address: '%IW0',  signalName: 'CRANE-1_ENCODER_POSITION', detail: '→ 3,200.0 mm' },
  { id: '2', timestamp: '08:14:30', type: 'READ',    address: '%IW2',  signalName: 'CRANE-1_LOAD_CELL',        detail: '→ 450.0 kg' },
  { id: '3', timestamp: '08:14:28', type: 'MONITOR', address: '%IW0',  signalName: 'CRANE-1_ENCODER_POSITION', detail: 'Added to signal monitor' },
  { id: '4', timestamp: '08:14:25', type: 'FAULT',   address: '%IW8',  signalName: 'CRANE-4_ENCODER_POSITION', detail: '→ signal lost' },
  { id: '5', timestamp: '08:14:20', type: 'FORCE',   address: '%Q0.4', signalName: 'CRANE-1_BRAKE_RELEASE',    detail: '→ forced HIGH by Marc Dupont' },
  { id: '6', timestamp: '08:14:15', type: 'READ',    address: '%I2.1', signalName: 'ZONE_B_CLEAR',             detail: '→ CAUTION (distance < 1000mm)' },
  { id: '7', timestamp: '08:14:10', type: 'RELEASE', address: '%Q0.4', signalName: 'CRANE-1_BRAKE_RELEASE',    detail: '→ force released' },
  { id: '8', timestamp: '08:14:05', type: 'READ',    address: '%I0.7', signalName: 'CRANE-2_ENCODER_OK',       detail: '→ FAULT detected' },
]

