'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const loginSchema = z.object({
  nombre_usuario: z.string().min(1, 'Usuario es requerido'),
  contrasena: z.string().min(1, 'Contraseña es requerida')
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.nombre_usuario, data.contrasena)
      toast.success('¡Bienvenido!')
    } catch (error: any) {
      console.error('Error en login:', error)
      toast.error(error.message || 'Error al iniciar sesión')
    }
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div>
          <label htmlFor="nombre_usuario" className="block text-sm font-medium text-gray-700">
            Usuario
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('nombre_usuario')}
              type="text"
              autoComplete="username"
              className="input-field pl-10"
              placeholder="admin"
            />
          </div>
          {errors.nombre_usuario && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre_usuario.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('contrasena')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
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
          {errors.contrasena && (
            <p className="mt-1 text-sm text-red-600">{errors.contrasena.message}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex justify-center items-center"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </div>

      <div className="text-center space-y-2">
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        <p className="text-sm text-gray-600">
          Usuario por defecto: <strong>admin</strong> / <strong>admin123</strong>
        </p>
      </div>
    </form>
  )
}