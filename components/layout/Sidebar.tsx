'use client'

// Client component — uses Redux hooks, usePathname, useState for accordion, and hover flyout

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectSidebarOpen, toggleSidebar } from '@/store/slices/uiSlice'
import { selectUserRole } from '@/store/slices/authSlice'
import { selectUnacknowledgedCount } from '@/store/slices/alarmsSlice'
import { AlarmBadge } from '@/components/ui/AlarmBadge'
import { NAVIGATION } from '@/constants'
import type { NavItem, NavChild, NavRole } from '@/constants'
import {
  LayoutDashboard,
  Activity,
  ClipboardList,
  Bell,
  FileText,
  Wrench,
  Shield,
  Layers,
  Monitor,
  ListOrdered,
  MoveHorizontal,
  Table2,
  Plus,
  Download,
  BellRing,
  Clock,
  SlidersHorizontal,
  BarChart2,
  TrendingDown,
  Gauge,
  FlaskConical,
  Zap,
  User,
  ChevronDown,
  PanelLeft,
  PanelLeftClose,
} from '@/lib/icons'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Activity,
  ClipboardList,
  Bell,
  FileText,
  Wrench,
  Shield,
  Layers,
  Monitor,
  ListOrdered,
  MoveHorizontal,
  Table2,
  Plus,
  Download,
  BellRing,
  Clock,
  SlidersHorizontal,
  BarChart2,
  TrendingDown,
  Gauge,
  FlaskConical,
  Zap,
  User,
}

function NavIconEl({ name, size }: { name: string; size: number }) {
  const Icon = ICON_MAP[name]
  return Icon ? <Icon size={size} /> : null
}

interface FlyoutProps {
  item:            NavItem
  visibleChildren: NavChild[]
  pathname:        string
}

function Flyout({ item, visibleChildren, pathname }: FlyoutProps) {
  return (
    <div className="absolute left-full top-0 ml-1 z-50 min-w-[160px] bg-scada-panel border border-scada-border rounded-scada py-1">
      <div className="px-3 py-1.5 text-xs font-mono uppercase text-text-muted tracking-wider border-b border-scada-border mb-1">
        {item.label}
      </div>
      {visibleChildren.map((child) => {
        const isActive = pathname === child.path || pathname.startsWith(child.path + '/')
        return (
          <Link
            key={child.path}
            href={child.path}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs transition-colors
              ${isActive
                ? 'text-accent-primary bg-scada-panel'
                : 'text-text-muted hover:text-text-primary hover:bg-scada-panel'
              }`}
          >
            <NavIconEl name={child.icon} size={14} />
            {child.label}
          </Link>
        )
      })}
    </div>
  )
}

interface CollapsedItemProps {
  item:            NavItem
  visibleChildren: NavChild[]
  pathname:        string
  isActive:        boolean
}

function CollapsedItem({ item, visibleChildren, pathname, isActive }: CollapsedItemProps) {
  const [showFlyout, setShowFlyout] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setShowFlyout(true)
  }

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => setShowFlyout(false), 100)
  }

  const hasChildren = visibleChildren.length > 0

  const itemClass = `flex items-center justify-center h-10 w-full border-l-2 transition-colors
    ${isActive
      ? 'border-accent-primary bg-scada-panel text-accent-primary'
      : 'border-transparent text-text-muted hover:bg-scada-panel hover:text-text-primary'
    }`

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {item.path && !hasChildren ? (
        <Link href={item.path} className={itemClass}>
          <NavIconEl name={item.icon} size={16} />
        </Link>
      ) : (
        <button className={itemClass}>
          <NavIconEl name={item.icon} size={16} />
        </button>
      )}

      {showFlyout && hasChildren && (
        <Flyout item={item} visibleChildren={visibleChildren} pathname={pathname} />
      )}

      {showFlyout && !hasChildren && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-1 z-50 bg-scada-panel border border-scada-border text-text-primary text-xs font-mono px-2 py-1 rounded-scada whitespace-nowrap">
          {item.label}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const dispatch       = useAppDispatch()
  const pathname       = usePathname()
  const isOpen         = useAppSelector(selectSidebarOpen)
  const userRole       = useAppSelector(selectUserRole)
  const unacknowledged = useAppSelector(selectUnacknowledgedCount)

  // Local state — UI only, not Redux
  const [openKeys, setOpenKeys] = useState<string[]>([])

  const itemKey = (label: string) => label.toLowerCase().replace(/\s+/g, '-')

  // Filter items by role
  const visibleItems = NAVIGATION.filter((item) => {
    if (item.devOnly && process.env.NODE_ENV !== 'development') return false
    if (!userRole) return false
    return item.roles.includes(userRole as NavRole)
  })

  // Auto-expand parent of active route on pathname change
  useEffect(() => {
    visibleItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => pathname === child.path || pathname.startsWith(child.path + '/')
        )
        if (hasActiveChild) {
          const key = itemKey(item.label)
          setOpenKeys((prev) => prev.includes(key) ? prev : [...prev, key])
        }
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const toggleKey = (key: string) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const isParentActive = (item: NavItem): boolean => {
    if (item.path) return pathname === item.path || pathname.startsWith(item.path + '/')
    if (item.children) {
      return item.children.some(
        (child) => pathname === child.path || pathname.startsWith(child.path + '/')
      )
    }
    return false
  }

  return (
    <aside
      className={`h-screen bg-scada-surface border-r border-scada-border flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'w-56' : 'w-14'}`}
    >
      {/* ── App Identity + Collapse Toggle ── */}
      <div
        className={`h-14 flex items-center border-b border-scada-border flex-shrink-0
          ${isOpen ? 'px-4' : 'justify-center'}`}
      >
        {isOpen ? (
          <>
            <div className="flex flex-col flex-1">
              <span className="text-accent-primary text-sm font-mono font-semibold tracking-wider uppercase">
                Industrial Ops
              </span>
              <span className="text-text-muted text-xs font-mono">v0.1.0</span>
            </div>
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="text-text-muted hover:text-text-primary transition-colors"
            aria-label="Expand sidebar"
          >
            <PanelLeft size={16} />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {visibleItems.map((item) => {
          const key         = itemKey(item.label)
          const active      = isParentActive(item)
          const hasChildren = !!item.children && item.children.length > 0
          const isExpanded  = openKeys.includes(key)
          const isAlarms    = item.label === 'Alarms'

          const visibleChildren = item.children
            ? item.children.filter((child) =>
                userRole ? child.roles.includes(userRole as NavRole) : false
              )
            : []

          // Collapsed mode — icons only
          if (!isOpen) {
            return (
              <CollapsedItem
                key={key}
                item={item}
                visibleChildren={visibleChildren}
                pathname={pathname}
                isActive={active}
              />
            )
          }

          // Expanded mode
          return (
            <div key={key}>
              {item.path && !hasChildren ? (
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 h-10 text-sm transition-colors border-l-2
                    ${active
                      ? 'border-accent-primary bg-scada-panel text-accent-primary'
                      : 'border-transparent text-text-muted hover:bg-scada-panel hover:text-text-primary'
                    }`}
                >
                  <span className={`flex-shrink-0 ${active ? 'text-accent-primary' : 'text-text-muted'}`}>
                    <NavIconEl name={item.icon} size={16} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                </Link>
              ) : (
                <button
                  onClick={() => toggleKey(key)}
                  className={`flex items-center gap-3 px-3 h-10 w-full text-sm transition-colors border-l-2
                    ${active
                      ? 'border-accent-primary bg-scada-panel text-accent-primary'
                      : 'border-transparent text-text-muted hover:bg-scada-panel hover:text-text-primary'
                    }`}
                >
                  <span className={`flex-shrink-0 ${active ? 'text-accent-primary' : 'text-text-muted'}`}>
                    <NavIconEl name={item.icon} size={16} />
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {isAlarms && unacknowledged > 0 && (
                    <AlarmBadge count={unacknowledged} unacknowledged={true} />
                  )}
                  <span
                    className={`text-text-muted transition-transform duration-200 flex-shrink-0
                      ${isExpanded ? 'rotate-180' : ''}`}
                  >
                    <ChevronDown size={16} />
                  </span>
                </button>
              )}

              {/* Sub-menu accordion */}
              {hasChildren && (
                <div
                  className={`overflow-hidden transition-all duration-200
                    ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="border-l border-scada-border ml-5">
                    {visibleChildren.map((child) => {
                      const childActive = pathname === child.path || pathname.startsWith(child.path + '/')
                      return (
                        <Link
                          key={child.path}
                          href={child.path}
                          className={`flex items-center gap-2 pl-4 pr-3 h-9 text-xs transition-colors
                            ${childActive
                              ? 'text-accent-primary bg-scada-panel'
                              : 'text-text-muted hover:text-text-primary hover:bg-scada-panel'
                            }`}
                        >
                          <span className="flex-shrink-0">
                            <NavIconEl name={child.icon} size={14} />
                          </span>
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>


    </aside>
  )
}
