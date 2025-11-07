'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Loader2 } from 'lucide-react'

const highlights = [
  'Dashboard con m&#233;tricas en tiempo real',
  'Control total de inventario y KARDEX autom&#225;tico',
  'Reportes listos para compartir con tu equipo'
]

export default function HomePage() {
  const router = useRouter()
  const { login } = useAuthStore()

  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field: 'username' | 'password') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!credentials.username || !credentials.password) {
      setError('Por favor ingresa usuario y contrase&#241;a')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await login(credentials.username, credentials.password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesi&#243;n. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-emerald-400/20 blur-3xl glow-pulse" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-400/20 via-sky-400/20 to-purple-500/20 blur-3xl glow-pulse" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 text-center lg:text-left">
            <span className="badge-soft inline-flex items-center justify-center lg:justify-start">
              Bienvenido al Sistema KARDEX
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Sistema de Ventas KARDEX{' '}
              <span className="gradient-text">Demo en vivo</span>
            </h1>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              Controla ventas, compras e inventario desde un mismo lugar con flujos intuitivos, animaciones suaves y datos presentados de forma clara.
            </p>

            <ul className="space-y-3 text-left">
              {highlights.map((item) => (
                <li key={item} className="flex items-start space-x-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    &#10003;
                  </span>
                  <span className="text-sm text-slate-600 sm:text-base" dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>

            <div className="hidden lg:flex floating">
              <Image
                src="/illustrations/login-hero.svg"
                alt="Ilustraci&#243;n de control de inventario"
                width={520}
                height={420}
                priority
              />
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8 shadow-xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold text-slate-900">
                Inicia sesi&#243;n
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Utiliza tus credenciales para entrar al panel administrativo
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2 text-left">
                <label htmlFor="username" className="text-sm font-medium text-slate-700">
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleChange('username')}
                  placeholder="admin"
                  autoComplete="username"
                  className="input-field h-12 rounded-xl bg-white/90"
                />
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Contrase&#241;a
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary-600 hover:text-primary-500"
                  >
                    &#191;Olvidaste tu contrase&#241;a?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleChange('password')}
                  placeholder="********"
                  autoComplete="current-password"
                  className="input-field h-12 rounded-xl bg-white/90"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 font-medium text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesi&#243;n...
                  </>
                ) : (
                  'Ingresar al sistema'
                )}
              </button>
            </form>

            <div className="mt-8 rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
              Usuario demo: <span className="font-semibold text-slate-700">admin</span> /{' '}
              <span className="font-semibold text-slate-700">admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
