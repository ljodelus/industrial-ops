'use client'

// Client component — uses useEffect, Redux hooks, and router for auth guard

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { selectIsAuthenticated } from '@/store/slices/authSlice'
import { TopBar }  from '@/components/layout/TopBar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header }  from '@/components/layout/Header'
import { ToastContainer } from '@/components/ui'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router          = useRouter()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-scada-bg flex flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
