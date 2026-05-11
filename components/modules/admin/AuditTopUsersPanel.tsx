'use client'
// Client component — top users ranked list + horizontal bar chart

import { Card, Badge } from '@/components/ui'
import { auditTopUsers } from '@/lib/mock/audit'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'

// Colors by role — hex from globals.css
const ROLE_COLOR: Record<string, string> = {
  operator:   '#4fc3f7',  // accent-primary
  supervisor: '#e8a23a',  // accent-gold
  engineer:   '#ffa726',  // status-warning
  admin:      '#ef5350',  // status-alarm
  system:     '#78909c',  // status-idle
}

const ROLE_BADGE_VARIANT: Record<string, 'info' | 'gold' | 'warning' | 'alarm' | 'offline'> = {
  operator:   'info',
  supervisor: 'gold',
  engineer:   'warning',
  admin:      'alarm',
  system:     'offline',
}

interface AuditTopUsersPanelProps {
  selectedUser: string | null
  onUserClick:  (user: string | null) => void
}

export function AuditTopUsersPanel({ selectedUser, onUserClick }: AuditTopUsersPanelProps) {
  const maxCount = Math.max(...auditTopUsers.map(u => u.count))
  const total    = auditTopUsers.reduce((s, u) => s + u.count, 0)

  return (
    <Card
      title="TOP USERS"
      accent="gold"
      action={<span className="text-text-muted text-xs font-mono">By action count in selected period</span>}
    >
      {/* Ranked list */}
      <div className="space-y-3 mb-4">
        {auditTopUsers.map((u, i) => {
          const pct  = ((u.count / total) * 100).toFixed(1)
          const barW = Math.round((u.count / maxCount) * 100)
          const isSelected = selectedUser === u.name

          return (
            <button
              key={u.name}
              onClick={() => onUserClick(isSelected ? null : u.name)}
              className={`w-full text-left flex items-center gap-3 px-2 py-1 rounded-scada transition-colors ${
                isSelected ? 'bg-scada-panel' : 'hover:bg-scada-panel'
              }`}
            >
              <span className="text-accent-gold font-mono text-xs font-bold w-5 shrink-0">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-text-primary text-sm truncate">{u.name}</span>
                  {u.role !== 'system' && (
                    <Badge variant={ROLE_BADGE_VARIANT[u.role]} label={u.role} />
                  )}
                </div>
                <div className="h-1.5 bg-scada-border rounded-scada overflow-hidden">
                  <div
                    className="h-full rounded-scada transition-all"
                    style={{ width: `${barW}%`, backgroundColor: ROLE_COLOR[u.role] }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-accent-primary font-mono text-xs">{u.count}</div>
                <div className="text-text-muted font-mono text-[10px]">{pct}%</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Horizontal bar chart */}
      <div className="border-t border-scada-border pt-4">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart
            layout="vertical"
            data={auditTopUsers}
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2433" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: '#6b738a', fontSize: 9, fontFamily: 'monospace' }}
              axisLine={{ stroke: '#1f2433' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fill: '#6b738a', fontSize: 9, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1d2e',
                border: '1px solid #1f2433',
                borderRadius: '2px',
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#e8eaf6',
              }}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Bar
              dataKey="count"
              radius={[0, 2, 2, 0]}
              onClick={(data: unknown) => {
                const d = data as { name?: string }
                if (d?.name) onUserClick(selectedUser === d.name ? null : d.name)
              }}
              style={{ cursor: 'pointer' }}
            >
              {auditTopUsers.map(u => (
                <Cell key={u.name} fill={ROLE_COLOR[u.role]} opacity={selectedUser && selectedUser !== u.name ? 0.3 : 0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}


