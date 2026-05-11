// lib/simulation/scenarios.ts
// Preset scenario configurations for the simulation mode

export interface ScenarioConfig {
  id:             string
  label:          string
  description:    string
  activeLine:     'LINE-1' | 'LINE-2'
  activeRecipeId: string
  crane1Enabled:  boolean
  crane2Enabled:  boolean
  tankCount:      number
}

export const SCENARIOS: ScenarioConfig[] = [
  {
    id:             'custom',
    label:          'Custom Scenario',
    description:    'Manual control — configure all settings below freely.',
    activeLine:     'LINE-1',
    activeRecipeId: 'recipe-1',
    crane1Enabled:  true,
    crane2Enabled:  true,
    tankCount:      6,
  },
  {
    id:             'normal-line1',
    label:          'Normal Production — LINE-1',
    description:    'Simulates normal single-line production with 2 cranes and 6 tanks. ZINC STANDARD recipe.',
    activeLine:     'LINE-1',
    activeRecipeId: 'recipe-1',
    crane1Enabled:  true,
    crane2Enabled:  false,
    tankCount:      6,
  },
  {
    id:             'normal-line2',
    label:          'Normal Production — LINE-2',
    description:    'Simulates normal production on LINE-2 with PHOSPHATE LIGHT recipe.',
    activeLine:     'LINE-2',
    activeRecipeId: 'recipe-2',
    crane1Enabled:  true,
    crane2Enabled:  false,
    tankCount:      5,
  },
  {
    id:             'full-production',
    label:          'Full Production — Both Lines',
    description:    'Both cranes active in parallel — maximum throughput simulation with ZINC STANDARD.',
    activeLine:     'LINE-1',
    activeRecipeId: 'recipe-1',
    crane1Enabled:  true,
    crane2Enabled:  true,
    tankCount:      6,
  },
  {
    id:             'fault-crane1-timeout',
    label:          'Fault Injection — CRANE-1 Timeout',
    description:    'CRANE-1 motion timeout fault injected at startup. Tests alarm escalation and recovery.',
    activeLine:     'LINE-1',
    activeRecipeId: 'recipe-1',
    crane1Enabled:  true,
    crane2Enabled:  true,
    tankCount:      6,
  },
  {
    id:             'fault-plc-loss',
    label:          'Fault Injection — PLC Comm Loss',
    description:    'PLC communication loss simulated. All cranes enter safe-stop mode. Tests failsafe logic.',
    activeLine:     'LINE-1',
    activeRecipeId: 'recipe-1',
    crane1Enabled:  true,
    crane2Enabled:  true,
    tankCount:      6,
  },
  {
    id:             'fault-zone-conflict',
    label:          'Fault Injection — Zone Conflict',
    description:    'Two cranes approach shared zone simultaneously. Zone conflict alarm is triggered.',
    activeLine:     'LINE-1',
    activeRecipeId: 'recipe-1',
    crane1Enabled:  true,
    crane2Enabled:  true,
    tankCount:      6,
  },
  {
    id:             'training-basic',
    label:          'Training — Operator Basic',
    description:    'Guided scenario for new operators. Reduced speed, single crane, detailed event logging.',
    activeLine:     'LINE-1',
    activeRecipeId: 'recipe-1',
    crane1Enabled:  true,
    crane2Enabled:  false,
    tankCount:      6,
  },
  {
    id:             'training-emergency',
    label:          'Training — Emergency Procedure',
    description:    'Emergency stop drill — tests operator response to critical alarm and recovery sequence.',
    activeLine:     'LINE-1',
    activeRecipeId: 'recipe-1',
    crane1Enabled:  true,
    crane2Enabled:  true,
    tankCount:      6,
  },
]

