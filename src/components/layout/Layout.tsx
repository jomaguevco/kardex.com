'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

type LayoutProps = {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  return (
    <div className="relative min-h-screen bg-slate-950/95">
      <BackgroundDecorations />
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="relative transition-all duration-500 lg:pl-64">
        <Header onMenuToggle={toggleSidebar} />
        <main className="relative z-10 px-4 pb-12 pt-14 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

function BackgroundDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-indigo-600/40 via-purple-600/30 to-transparent blur-3xl" />
      <div className="absolute -left-40 top-32 h-80 w-80 rounded-full bg-emerald-500/30 blur-[120px]" />
      <div className="absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-sky-500/25 blur-[120px]" />
    </div>
  )
}

