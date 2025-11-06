'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/services/authService'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import Link from 'next/link'

const resetPasswordSchema = z.object({
  nueva_contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmar_contrasena: z.string()
}).refine((data) => data.nueva_contrasena === data.confirmar_contrasena, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar_contrasena']
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  })

  useEffect(() => {
    if (!token) {
      toast.error('Token de recuperación no válido')
      router.push('/forgot-password')
    }
  }, [token, router])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Token de recuperación no válido')
      return
    }

    setIsLoading(true)
    try {
      const response = await authService.resetPassword(token, data.nueva_contrasena)
      
      if (response.success) {
        setIsSuccess(true)
        toast.success('Contraseña actualizada exitosamente')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        toast.error(response.message || 'Error al restablecer contraseña')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al restablecer contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Contraseña Actualizada
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Tu contraseña ha sido actualizada exitosamente
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="btn-primary"
              >
                Ir al Inicio de Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!token) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Restablecer Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu nueva contraseña
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="nueva_contrasena" className="block text-sm font-medium text-gray-700">
                Nueva Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('nueva_contrasena')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.nueva_contrasena && (
                <p className="mt-1 text-sm text-red-600">{errors.nueva_contrasena.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmar_contrasena" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmar_contrasena')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmar_contrasena && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmar_contrasena.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Contraseña'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

