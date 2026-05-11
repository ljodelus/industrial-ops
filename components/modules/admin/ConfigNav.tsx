'use client'

// Client component — interactive vertical navigation with tab switching

import { Activity, Wifi, MoveHorizontal, Boxes, Route, SlidersHorizontal, Shield } from '@/lib/icons'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'System Overview',      icon: <Activity size={16} /> },
  { id: 'plc',      label: 'PLC Connections',      icon: <Wifi size={16} /> },
  { id: 'cranes',   label: 'Crane Configuration',  icon: <MoveHorizontal size={16} /> },
  { id: 'lines',    label: 'Line & Tank Setup',     icon: <Boxes size={16} /> },
  { id: 'network',  label: 'Network Settings',      icon: <Route size={16} /> },
  { id: 'app',      label: 'Application Settings',  icon: <SlidersHorizontal size={16} /> },
  { id: 'security', label: 'Security Settings',     icon: <Shield size={16} /> },
]

interface ConfigNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ConfigNav({ activeTab, onTabChange }: ConfigNavProps) {
  return (
    <nav className="w-48 flex-shrink-0 flex flex-col border-r border-scada-border">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          type="button"
          onClick={() => onTabChange(item.id)}
          className={`flex items-center gap-3 px-4 py-3 text-xs font-mono uppercase tracking-wide text-left transition-colors
            ${activeTab === item.id
              ? 'bg-scada-panel border-l-2 border-accent-primary text-text-primary'
              : 'border-l-2 border-transparent text-text-muted hover:text-text-primary hover:bg-scada-panel/50'
            }`}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

