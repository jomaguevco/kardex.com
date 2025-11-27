'use client'

import ClienteNavbar from '@/components/layout/ClienteNavbar'
import GeminiChatWidget from '@/components/chat/GeminiChatWidget'

export default function ClientePortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ClienteNavbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      {/* Asistente de IA */}
      <GeminiChatWidget />
    </>
  )
}
