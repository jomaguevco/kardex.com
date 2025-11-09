'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Mail, User, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '@/services/authService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const forgotPasswordSchema = z
  .object({
    email: z.string().email().optional(),
    nombre_usuario: z.string().min(3).max(50).optional()
  })
  .refine((data) => data.email || data.nombre_usuario, {
    message: 'Ingresa un email o un usuario',
    path: ['email']
  })

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [resetLink, setResetLink] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      const response = await authService.requestPasswordReset(data.email, data.nombre_usuario)

      if (response.success) {
        setIsSuccess(true)
        if ((response as any).resetLink) {
          setResetLink((response as any).resetLink)
        }
        toast.success('Si el usuario existe, enviaremos un enlace de recuperación')
      } else {
        toast.error(response.message || 'No pudimos procesar tu solicitud')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al solicitar la recuperación')
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
            <h2 className="mt-6 text-2xl font-semibold text-slate-900">Solicitud enviada</h2>
            <p className="mt-2 text-sm text-slate-500">
              Si las credenciales coinciden, recibirás un enlace de recuperación en tu correo.
            </p>
            {resetLink && (
              <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-left text-xs text-indigo-700">
                <p className="font-semibold">Enlace (modo desarrollo):</p>
                <a className="mt-1 block break-all text-indigo-600 underline" href={resetLink} target="_blank" rel="noopener noreferrer">
                  {resetLink}
                </a>
              </div>
            )}
            <div className="mt-6">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 px-4 py-16">
      <div className="absolute inset-0 bg-[url('/grain.svg')] opacity-20" />
      <div className="relative z-10 w-full max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="hidden lg:block space-y-4 text-white/90">
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="mr-2 h-3.5 w-3.5" /> Recuperación segura
            </span>
            <h1 className="text-4xl font-semibold leading-tight">
              ¿Olvidaste tu contraseña? Te ayudamos a restablecerla en segundos.
            </h1>
            <p className="text-sm text-white/80">
              Ingresa tu correo o nombre de usuario. Te enviaremos un correo con instrucciones para crear una nueva contraseña y mantener tu cuenta segura.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 shadow-2xl">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-slate-900">Recuperar contraseña</h2>
              <p className="mt-1 text-sm text-slate-500">Ingresa tu email o usuario asociado a la cuenta.</p>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Correo electrónico</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="tu@email.com"
                    className="input-field pl-9"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs font-medium text-rose-500">{errors.email.message}</p>
                )}
              </div>

              <div className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                o
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Nombre de usuario</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    {...register('nombre_usuario')}
                    type="text"
                    placeholder="usuario_demo"
                    className="input-field pl-9"
                  />
                </div>
                {errors.nombre_usuario && (
                  <p className="text-xs font-medium text-rose-500">{errors.nombre_usuario.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary inline-flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Enviando solicitud...
                  </>
                ) : (
                  'Enviar enlace de recuperación'
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

