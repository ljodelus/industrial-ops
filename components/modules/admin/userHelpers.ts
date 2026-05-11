// Shared helpers for user management components

import type { UserRole } from '@/types'
import type { BadgeProps } from '@/types'

export type RoleBadgeVariant = BadgeProps['variant']

export const ROLE_BADGE_VARIANT: Record<UserRole, RoleBadgeVariant> = {
  operator:   'info',
  supervisor: 'gold',
  engineer:   'warning',
  admin:      'alarm',
}

export const ROLE_AVATAR_CLASS: Record<UserRole, string> = {
  operator:   'bg-accent-primary/20 text-accent-primary',
  supervisor: 'bg-accent-gold/20 text-accent-gold',
  engineer:   'bg-status-warning/20 text-status-warning',
  admin:      'bg-status-alarm/20 text-status-alarm',
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export const ROLE_PERMISSIONS: { label: string; roles: UserRole[] }[] = [
  { label: 'Overview',               roles: ['operator', 'supervisor', 'engineer', 'admin'] },
  { label: 'Production Monitor',     roles: ['operator', 'supervisor', 'engineer', 'admin'] },
  { label: 'Job Queue (view)',        roles: ['operator', 'supervisor', 'engineer', 'admin'] },
  { label: 'Job Queue (manage)',      roles: ['supervisor', 'engineer', 'admin'] },
  { label: 'Crane Control (view)',    roles: ['supervisor', 'engineer', 'admin'] },
  { label: 'Crane Control (ctrl)',    roles: ['engineer', 'admin'] },
  { label: 'Recipes (view)',          roles: ['operator', 'supervisor', 'engineer', 'admin'] },
  { label: 'Recipes (edit)',          roles: ['engineer', 'admin'] },
  { label: 'Alarms (view)',           roles: ['operator', 'supervisor', 'engineer', 'admin'] },
  { label: 'Alarms (ack)',            roles: ['operator', 'supervisor', 'engineer', 'admin'] },
  { label: 'Alarms (settings)',       roles: ['engineer', 'admin'] },
  { label: 'Reports',                 roles: ['supervisor', 'engineer', 'admin'] },
  { label: 'Maintenance',             roles: ['engineer', 'admin'] },
  { label: 'Admin',                   roles: ['admin'] },
]

