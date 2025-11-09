'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/services/authService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const resetPasswordSchema = z
  .object({
    nueva_contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmar_contrasena: z.string()
  })
  .refine((data) => data.nueva_contrasena === data.confirmar_contrasena, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar_contrasena']
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordFormData>({
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
        toast.error(response.message || 'No se pudo restablecer la contraseña')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al restablecer la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 px-4 py-16">
        <div className="absolute inset-0 bg-[url('/grain.svg')] opacity-20" />
        <div className="relative z-10 w-full max-w-md">
          <div className="glass-card rounded-3xl p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-slate-900">Contraseña actualizada</h2>
            <p className="mt-2 text-sm text-slate-500">Puedes iniciar sesión con tus nuevas credenciales.</p>
            <div className="mt-6">
              <Link href="/login" className="btn-primary inline-flex items-center gap-2">
                Ir al inicio de sesión
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 px-4 py-16">
      <div className="absolute inset-0 bg-[url('/grain.svg')] opacity-20" />
      <div className="relative z-10 w-full max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="hidden space-y-4 text-white/90 lg:block">
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Seguridad reforzada
            </span>
            <h1 className="text-4xl font-semibold leading-tight">Crea una nueva contraseña segura y recupera tu acceso.</h1>
            <p className="text-sm text-white/80">
              Ingresa una contraseña nueva y confiable. Recuerda utilizar letras, números y símbolos para proteger tu cuenta.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 shadow-2xl">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-slate-900">Restablecer contraseña</h2>
              <p className="mt-1 text-sm text-slate-500">Ingresa y confirma tu nueva contraseña.</p>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Nueva contraseña</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    {...register('nueva_contrasena')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-field pl-9 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.nueva_contrasena && <p className="text-xs font-medium text-rose-500">{errors.nueva_contrasena.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Confirmar contraseña</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    {...register('confirmar_contrasena')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-field pl-9 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmar_contrasena && <p className="text-xs font-medium text-rose-500">{errors.confirmar_contrasena.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Actualizando...
                  </>
                ) : (
                  'Actualizar contraseña'
                )}
              </button>

              <div className="text-center">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                  <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}

