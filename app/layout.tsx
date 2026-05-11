import type { Metadata } from 'next'
import './globals.css'
import { ReduxProvider } from '@/components/providers/ReduxProvider'

export const metadata: Metadata = {
  title: 'Industrial Ops UI',
  description: 'Industrial Web Supervision Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-scada-bg text-text-primary font-ui antialiased">
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}
