'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import WhatsAppButton from './layout/WhatsAppButton'

function WhatsAppButtonWrapper() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Solo mostrar para usuarios con rol CLIENTE
  if (!mounted || !user || user.rol !== 'CLIENTE') {
    return null
  }

  return <WhatsAppButton />
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ margin: 0, padding: 0, top: 0 }}>
        {children}
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#28A745',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#DC3545',
              secondary: '#fff',
            },
          },
        }}
      />
      <WhatsAppButtonWrapper />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

