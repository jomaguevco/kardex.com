'use client'

import { useState } from 'react'
import SidebarSimple from './SidebarSimple'
import Header from './Header'

interface LayoutProps {
  children: React.ReactNode
}

const HEADER_CLEARANCE = 0

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="relative min-h-screen bg-slate-950/95">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-indigo-500/40 via-purple-500/30 to-transparent blur-3xl" />
      </div>
      <SidebarSimple
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        topOffset={HEADER_CLEARANCE}
      />
      <div className="relative transition-all duration-500 lg:pl-64">
        <Header onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="relative z-10 px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-5xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

