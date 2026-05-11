'use client'

// Client component — requires onClick for tab switching

import { Bell, SlidersHorizontal, Timer, BellOff, Zap, Activity } from '@/lib/icons'

type TabId = 'categories' | 'thresholds' | 'timeLimits' | 'suppression' | 'escalation' | 'systemDefaults'

interface NavItem {
  id: TabId
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: 'categories',     label: 'Alarm Categories',  icon: <Bell size={16} /> },
  { id: 'thresholds',     label: 'Severity Thresholds', icon: <SlidersHorizontal size={16} /> },
  { id: 'timeLimits',     label: 'Time Limits',        icon: <Timer size={16} /> },
  { id: 'suppression',    label: 'Suppression Rules',  icon: <BellOff size={16} /> },
  { id: 'escalation',     label: 'Escalation Rules',   icon: <Zap size={16} /> },
  { id: 'systemDefaults', label: 'System Defaults',    icon: <Activity size={16} /> },
]

interface AlarmSettingsNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function AlarmSettingsNav({ activeTab, onTabChange }: AlarmSettingsNavProps) {
  return (
    <nav className="py-2">
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === activeTab
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-mono transition-colors
              border-l-2
              ${isActive
                ? 'border-accent-primary bg-scada-panel text-accent-primary'
                : 'border-transparent text-text-muted hover:bg-scada-panel hover:text-text-primary'
              }`}
          >
            <span className="shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

