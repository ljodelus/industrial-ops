'use client'

// Client component — requires onClick handler for interactive toggle

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
}

export function Toggle({ checked, onChange, disabled = false, id }: ToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center rounded-scada transition-colors duration-200 focus:outline-none
        w-11 h-5.5 shrink-0
        ${checked ? 'bg-status-ok' : 'bg-scada-border'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`absolute top-0.5 w-4.5 h-4.5 rounded-scada bg-white transition-transform duration-200
          ${checked ? 'translate-x-6' : 'translate-x-0.5'}`}
      />
    </button>
  )
}


