'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

type LayoutProps = {
  children: React.ReactNode
}

const HEADER_HEIGHT = 73

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  return (
    <div style={{ margin: 0, padding: 0, marginTop: 0, paddingTop: 0, position: 'relative', minHeight: '100vh', overflow: 'visible' }}>
      <BackgroundDecorations />
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} topOffset={0} />
      <Header onMenuToggle={toggleSidebar} />
      <div 
        className="relative min-h-screen bg-slate-950/95 transition-all duration-500 lg:pl-64" 
        style={{ 
          paddingTop: `${HEADER_HEIGHT}px`, 
          marginTop: 0,
          margin: 0,
          padding: 0,
          overflow: 'visible'
        }}
      >
        <main
          className="relative z-10 px-4 pb-12 sm:px-6 lg:px-8 pt-6"
          style={{ marginTop: 0, paddingTop: '1.5rem' }}
        >
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

function BackgroundDecorations() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-indigo-600/40 via-purple-600/30 to-transparent blur-3xl" />
      <div className="absolute -left-40 top-32 h-80 w-80 rounded-full bg-emerald-500/30 blur-[120px]" />
      <div className="absolute -right-32 bottom-10 h-72 w-72 rounded-full bg-sky-500/25 blur-[120px]" />
    </div>
  )
}

