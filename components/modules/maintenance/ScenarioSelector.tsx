'use client'

// Client component — scenario dropdown + description display

import { Select } from '@/components/ui'
import { SCENARIOS } from '@/lib/simulation/scenarios'

interface ScenarioSelectorProps {
  value:    string
  onChange: (id: string) => void
}

export function ScenarioSelector({ value, onChange }: ScenarioSelectorProps) {
  const current = SCENARIOS.find(s => s.id === value)

  const options = SCENARIOS.map(s => ({ value: s.id, label: s.label }))

  return (
    <div className="space-y-2">
      <Select
        label="SCENARIO"
        value={value}
        onChange={onChange}
        options={options}
      />
      {current && (
        <p className="text-text-muted text-[10px] font-mono leading-relaxed">
          {current.description}
        </p>
      )}
    </div>
  )
}

