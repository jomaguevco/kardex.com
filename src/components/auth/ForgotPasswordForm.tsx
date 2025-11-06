'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/services/authService'
import { Mail, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

const forgotPasswordSchema = z.object({
  email: z.string().email().optional(),
  nombre_usuario: z.string().min(3).max(50).optional()
}).refine((data) => data.email || data.nombre_usuario, {
  message: 'Debe proporcionar email o nombre de usuario',
  path: ['email']
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [resetLink, setResetLink] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      const response = await authService.requestPasswordReset(data.email, data.nombre_usuario)
      
      if (response.success) {
        setIsSuccess(true)
        // En desarrollo, mostrar el link directamente
        if ((response as any).resetLink) {
          setResetLink((response as any).resetLink)
        }
        toast.success('Si el usuario existe, se enviará un enlace de recuperación')
      } else {
        toast.error(response.message || 'Error al solicitar recuperación')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al solicitar recuperación de contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Solicitud Enviada
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Si el usuario existe, se enviará un enlace de recuperación
              </p>
              {resetLink && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-800 mb-2">Enlace de desarrollo:</p>
                  <a 
                    href={resetLink} 
                    className="text-xs text-blue-600 underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resetLink}
                  </a>
                </div>
              )}
              <div className="mt-6">
                <Link
                  href="/login"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recuperar Contraseña
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu email o nombre de usuario para recuperar tu contraseña
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="input-field pl-10"
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O</span>
              </div>
            </div>

            <div>
              <label htmlFor="nombre_usuario" className="block text-sm font-medium text-gray-700">
                Nombre de Usuario
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('nombre_usuario')}
                  type="text"
                  className="input-field pl-10"
                  placeholder="nombre_usuario"
                />
              </div>
              {errors.nombre_usuario && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre_usuario.message}</p>
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
                  Enviando...
                </>
              ) : (
                'Enviar Enlace de Recuperación'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

