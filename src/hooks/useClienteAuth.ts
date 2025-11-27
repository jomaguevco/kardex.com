import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import clientePortalService from '@/services/clientePortalService'
import toast from 'react-hot-toast'

/**
 * Hook personalizado para manejar autenticación de cliente
 * Espera a que el estado se restaure antes de verificar autenticación
 */
export function useClienteAuth() {
  const router = useRouter()
  // Obtener valores del store de forma segura con valores por defecto
  const storeState = useAuthStore()
  const user = storeState?.user ?? null
  const storeIsAuthenticated = storeState?.isAuthenticated ?? false
  const isLoading = storeState?.isLoading ?? false
  const checkAuth = storeState?.checkAuth ?? (async () => {})
  
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Primero, asegurar que checkAuth se haya ejecutado
        if (typeof checkAuth === 'function') {
          await checkAuth()
        }
        
        // Dar tiempo para que el estado se restaure
        await new Promise(resolve => setTimeout(resolve, 300))
        
        // Verificar autenticación desde múltiples fuentes
        const currentState = useAuthStore.getState()
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null
        
        // Verificar autenticación desde múltiples fuentes con valores seguros
        const currentIsAuthenticated = currentState?.isAuthenticated ?? false
        const hasAuth = currentIsAuthenticated || (token && userStr)
        const currentUser = currentState?.user || (userStr ? JSON.parse(userStr) : null)
        
        if (hasAuth && currentUser && currentUser.rol === 'CLIENTE') {
          // Verificar que el cliente esté activo
          try {
            const estadoResponse = await clientePortalService.verificarClienteActivo()
            if (estadoResponse.success && estadoResponse.data.activo) {
              setIsAuthorized(true)
            } else {
              // Cliente inactivo
              setIsAuthorized(false)
              toast.error('Tu cuenta está inactiva. Contacta al administrador para más información.')
              router.push('/')
            }
          } catch (error: any) {
            console.error('Error al verificar estado del cliente:', error)
            // Si hay error, permitir acceso pero registrar el error
            setIsAuthorized(true)
          }
        } else {
          setIsAuthorized(false)
          router.push('/')
        }
      } catch (error) {
        console.error('Error en verifyAuth:', error)
        setIsAuthorized(false)
        router.push('/')
      } finally {
        setIsChecking(false)
      }
    }

    verifyAuth()
  }, [checkAuth, router])

  return {
    user,
    isAuthenticated: storeIsAuthenticated,
    isLoading: isLoading || isChecking,
    isAuthorized,
    checkAuth
  }
}

