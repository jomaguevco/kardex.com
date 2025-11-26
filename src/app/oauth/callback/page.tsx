'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setToken } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const userStr = searchParams.get('user')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMessage('Error en la autenticación. Por favor, intenta de nuevo.')
      setTimeout(() => router.push('/'), 3000)
      return
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        
        // Guardar en el store
        setToken(token)
        setUser(user)

        setStatus('success')
        setMessage('¡Bienvenido! Redirigiendo...')

        // Redirigir según el rol
        setTimeout(() => {
          if (user.rol === 'CLIENTE') {
            router.push('/cliente-portal')
          } else {
            router.push('/dashboard')
          }
        }, 1500)
      } catch (e) {
        console.error('Error parsing OAuth callback data:', e)
        setStatus('error')
        setMessage('Error procesando la autenticación.')
        setTimeout(() => router.push('/'), 3000)
      }
    } else {
      setStatus('error')
      setMessage('Datos de autenticación incompletos.')
      setTimeout(() => router.push('/'), 3000)
    }
  }, [searchParams, router, setUser, setToken])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-16 w-16 text-white animate-spin" />
            <p className="mt-4 text-xl text-white">Procesando autenticación...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-emerald-400" />
            <p className="mt-4 text-xl text-white">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-16 w-16 text-red-400" />
            <p className="mt-4 text-xl text-white">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}

