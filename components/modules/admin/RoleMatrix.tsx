'use client'

// Client component — role permissions matrix (read-only reference)

import { CheckCircle, XCircle } from '@/lib/icons'
import { Card }  from '@/components/ui/Card'
import { ROLE_PERMISSIONS } from './userHelpers'

const ROLES = [
  { key: 'operator',   label: 'OPERATOR',   className: 'text-accent-primary'  },
  { key: 'supervisor', label: 'SUPERVISOR',  className: 'text-accent-gold'     },
  { key: 'engineer',   label: 'ENGINEER',   className: 'text-status-warning'  },
  { key: 'admin',      label: 'ADMIN',      className: 'text-status-alarm'    },
] as const

export function RoleMatrix() {
  return (
    <Card
      title="Role Permissions"
      accent="gold"
      noPadding
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-scada-border bg-scada-panel">
              <th className="px-4 py-2 text-left text-text-muted font-mono uppercase tracking-wide whitespace-nowrap">
                Module
              </th>
              {ROLES.map(r => (
                <th
                  key={r.key}
                  className={`px-3 py-2 text-center font-mono uppercase tracking-wide whitespace-nowrap ${r.className}`}
                >
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLE_PERMISSIONS.map((perm, idx) => (
              <tr
                key={perm.label}
                className={`border-b border-scada-border hover:bg-scada-panel transition-colors
                  ${idx % 2 === 0 ? '' : 'bg-scada-bg/30'}`}
              >
                <td className="px-4 py-2 font-mono text-text-muted whitespace-nowrap">
                  {perm.label}
                </td>
                {ROLES.map(r => {
                  const allowed = perm.roles.includes(r.key)
                  return (
                    <td key={r.key} className="px-3 py-2 text-center">
                      {allowed
                        ? <CheckCircle size={14} className="text-status-ok inline-block" />
                        : <XCircle    size={14} className="text-status-offline opacity-40 inline-block" />
                      }
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-4 py-3 text-text-muted text-xs italic font-mono border-t border-scada-border">
        Permissions are fixed by role. To change access level, edit the user&apos;s role.
      </p>
    </Card>
  )
}

