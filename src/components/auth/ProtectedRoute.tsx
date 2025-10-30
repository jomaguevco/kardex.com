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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div>Cargando...</div>
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