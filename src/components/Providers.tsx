'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
// WhatsAppButton removido - El portal del cliente ya tiene su propio botón de WhatsApp en el layout
// Esto evita el círculo verde duplicado en el medio

function WhatsAppButtonWrapper() {
  // Deshabilitado: El portal del cliente ya tiene su propio botón de WhatsApp en el layout
  // Este componente causaba un círculo verde duplicado en el medio
  return null
}

function AuthInitializer() {
  const { checkAuth } = useAuthStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Marcar tiempo de inicialización para el interceptor de axios
    if (typeof window !== 'undefined') {
      (window as any).__APP_INIT_TIME = Date.now()
    }

    // Restaurar sesión al cargar la aplicación
    const initializeAuth = async () => {
      try {
        await checkAuth()
      } catch (error) {
        console.error('Error al inicializar autenticación:', error)
      } finally {
        setInitialized(true)
        // Marcar fin de período de inicialización después de 2 segundos
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            (window as any).__APP_INIT_TIME = null
          }
        }, 2000)
      }
    }

    initializeAuth()
  }, [checkAuth])

  return null
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
      <AuthInitializer />
      <div style={{ margin: 0, padding: 0, marginTop: 0, paddingTop: 0, top: 0, position: 'relative', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
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

