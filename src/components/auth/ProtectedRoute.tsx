'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore()
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Inicializar autenticación solo una vez
    if (!hasCheckedAuth) {
      const initializeAuth = async () => {
        try {
          await checkAuth()
        } catch (error) {
          console.error('Error al verificar autenticación:', error)
        } finally {
          setHasCheckedAuth(true)
          // Dar un pequeño delay para asegurar que el estado se haya actualizado
          setTimeout(() => {
            setIsInitializing(false)
          }, 200)
        }
      }
      initializeAuth()
    }
  }, [checkAuth, hasCheckedAuth])

  useEffect(() => {
    // Solo verificar autenticación después de que haya terminado la inicialización
    if (hasCheckedAuth && !isLoading && !isInitializing) {
      // Verificar si hay token en localStorage como última verificación
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      
      // Si no hay autenticación pero hay datos en localStorage, restaurar
      if ((!isAuthenticated || !user) && token && userStr) {
        try {
          const parsedUser = JSON.parse(userStr)
          // Si hay datos válidos, no redirigir inmediatamente
          // Dar tiempo para que el store se actualice
          return
        } catch (error) {
          console.error('Error al parsear usuario:', error)
        }
      }
      
      // Solo redirigir si realmente no hay autenticación después de todos los intentos
      if (!isAuthenticated || !user) {
        // Verificar una vez más el estado del store antes de redirigir
        const currentState = useAuthStore.getState()
        if (!currentState.token && !currentState.user && !token) {
          router.push('/')
          return
        }
      }

      // Verificar roles si se especifican
      if (requiredRoles && requiredRoles.length > 0 && user) {
        const userRole = user.rol?.toLowerCase()
        const hasRequiredRole = requiredRoles.some(role => 
          role.toLowerCase() === userRole
        )
        
        if (!hasRequiredRole) {
          router.push('/dashboard')
          return
        }
      }
    }
  }, [isAuthenticated, user, isLoading, hasCheckedAuth, isInitializing, router, requiredRoles])

  // Mostrar loading mientras verifica autenticación o está inicializando
  if (isLoading || !hasCheckedAuth || isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-emerald-50">
        <div className="glass-card flex flex-col items-center rounded-3xl px-8 py-10 text-center shadow-xl">
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
            ⏳
          </span>
          <p className="text-base font-medium text-slate-700">Verificando tu sesión...</p>
          <p className="mt-1 text-sm text-slate-500">
            Estamos asegurándonos de que tengas acceso al módulo seleccionado.
          </p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated || !user) {
    return null
  }

  // Si no tiene el rol requerido, no mostrar nada (se redirigirá)
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = user.rol?.toLowerCase()
    const hasRequiredRole = requiredRoles.some(role => 
      role.toLowerCase() === userRole
    )
    
    if (!hasRequiredRole) {
      return null
    }
  }

  return <>{children}</>
}