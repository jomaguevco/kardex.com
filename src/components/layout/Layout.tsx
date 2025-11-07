'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="relative min-h-screen bg-transparent">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="floating absolute -left-24 top-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-200/50 via-blue-200/40 to-emerald-200/40 blur-3xl" />
        <div className="floating absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-200/40 via-sky-200/40 to-purple-200/40 blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Contenido principal */}
      <div className="relative lg:pl-64">
        {/* Header */}
        <Header onMenuToggle={toggleSidebar} />

        {/* Contenido de la página */}
        <main className="relative z-10 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

