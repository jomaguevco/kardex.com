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

  useEffect(() => {
    if (!hasCheckedAuth) {
      checkAuth()
      setHasCheckedAuth(true)
    }
  }, [checkAuth, hasCheckedAuth])

  useEffect(() => {
    if (hasCheckedAuth && !isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/')
        return
      }

      // Verificar roles si se especifican
      if (requiredRoles && requiredRoles.length > 0) {
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
  }, [isAuthenticated, user, isLoading, hasCheckedAuth, router, requiredRoles])

  // Mostrar loading mientras verifica autenticación
  if (isLoading || !hasCheckedAuth) {
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