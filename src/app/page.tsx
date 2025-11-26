'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import apiService from '@/services/api'
import { Loader2, Eye, EyeOff, Sparkles, Shield, Zap, BarChart3, Package, ShoppingCart } from 'lucide-react'

const features = [
  { icon: BarChart3, text: 'Dashboard con métricas en tiempo real', color: 'from-blue-500 to-cyan-500' },
  { icon: Package, text: 'Control total de inventario y KARDEX', color: 'from-purple-500 to-pink-500' },
  { icon: ShoppingCart, text: 'Gestión de ventas y compras', color: 'from-emerald-500 to-teal-500' },
  { icon: Shield, text: 'Seguridad y roles de usuario', color: 'from-orange-500 to-red-500' }
]

type HealthResponse = {
  success: boolean
  message: string
  timestamp: string
  backendVersion?: string
  deploymentSignature?: string
  environment?: string
}

export default function HomePage() {
  const router = useRouter()
  const { login, getRedirectPath } = useAuthStore()

  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (field: 'username' | 'password') => (event: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!credentials.username || !credentials.password) {
      setError('Por favor ingresa usuario y contraseña')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await login(credentials.username, credentials.password)
      const redirectPath = getRedirectPath()
      router.push(redirectPath)
    } catch (err: any) {
      const statusCode = err?.response?.status
      if (statusCode === 401 || err?.message?.includes('401')) {
        setError('Usuario o contraseña incorrectos')
      } else if (statusCode === 403) {
        setError('No tienes permiso para acceder')
      } else if (err?.message?.includes('Credenciales')) {
        setError('Usuario o contraseña incorrectos')
      } else {
        setError('Error al iniciar sesión. Intenta nuevamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchHealthStatus = async () => {
      try {
        const response = await apiService.get<HealthResponse>('/health')
        if (isMounted) {
          setHealthStatus(response as HealthResponse)
        }
      } catch (err) {
        if (isMounted) {
          setHealthStatus({
            success: false,
            message: 'No se pudo conectar con el backend',
            timestamp: new Date().toISOString()
          })
        }
      }
    }

    fetchHealthStatus()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Video de fondo */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-30"
        poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80"
      >
        <source src="https://cdn.coverr.co/videos/coverr-typing-on-a-laptop-keyboard-5765/1080p.mp4" type="video/mp4" />
      </video>

      {/* Overlay con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-blue-950/80 to-purple-950/90" />

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {mounted && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 animate-particle"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 10 + 's'
            }}
          />
        ))}
      </div>

      {/* Esferas decorativas con blur */}
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-br from-blue-600/30 to-cyan-600/30 blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-indigo-600/20 to-emerald-600/20 blur-3xl" />

      {/* Contenido principal */}
      <div className="relative z-10 flex min-h-screen">
        {/* Lado izquierdo - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 xl:px-24">
          <div className={`space-y-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            {/* Logo animado */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 blur-lg opacity-75 animate-pulse" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl">
                  <Package className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">KARDEX</h1>
                <p className="text-blue-300 text-sm">Sistema de Gestión</p>
              </div>
            </div>

            {/* Título principal */}
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm border border-white/20">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Bienvenido al futuro de la gestión</span>
              </div>
              <h2 className="text-5xl xl:text-6xl font-bold leading-tight">
                <span className="text-white">Controla tu</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  negocio
                </span>
                <br />
                <span className="text-white">con elegancia</span>
              </h2>
              <p className="text-lg text-slate-300 max-w-md">
                Gestiona ventas, inventario y clientes desde una plataforma moderna, intuitiva y poderosa.
              </p>
            </div>

            {/* Características */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`group flex items-center space-x-3 rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/10 transition-all duration-500 hover:bg-white/10 hover:scale-105 hover:border-white/20 ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                  style={{ transitionDelay: `${index * 100 + 300}ms` }}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-lg transition-transform group-hover:scale-110`}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-200">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Estadísticas animadas */}
            <div className="flex space-x-8 pt-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">500+</div>
                <div className="text-sm text-slate-400">Empresas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">10K+</div>
                <div className="text-sm text-slate-400">Transacciones/día</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">99.9%</div>
                <div className="text-sm text-slate-400">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 lg:px-16">
          <div className={`w-full max-w-md transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
            {/* Tarjeta de login con glassmorphism */}
            <div className="relative">
              {/* Glow effect behind card */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-30 blur-xl" />
              
              <div className="relative rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                  {/* Logo móvil */}
                  <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">KARDEX</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Iniciar Sesión
                  </h2>
                  <p className="mt-2 text-slate-300">
                    Accede a tu panel de control
                  </p>
                </div>

                {/* Formulario */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-slate-200">
                      Usuario
                    </label>
                    <div className="relative group">
                      <input
                        id="username"
                        type="text"
                        value={credentials.username}
                        onChange={handleChange('username')}
                        placeholder="Ingresa tu usuario"
                        autoComplete="username"
                        className="w-full h-12 rounded-xl bg-white/10 border border-white/20 px-4 text-white placeholder-slate-400 backdrop-blur-sm transition-all focus:bg-white/15 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur-xl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium text-slate-200">
                        Contraseña
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-blue-400 hover:text-blue-300 transition"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <div className="relative group">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={credentials.password}
                        onChange={handleChange('password')}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full h-12 rounded-xl bg-white/10 border border-white/20 px-4 pr-12 text-white placeholder-slate-400 backdrop-blur-sm transition-all focus:bg-white/15 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 blur-xl" />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-200 backdrop-blur-sm animate-shake">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full h-12 rounded-xl font-semibold text-white overflow-hidden transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                    <span className="relative flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Iniciando sesión...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Ingresar al Sistema
                        </>
                      )}
                    </span>
                  </button>
                </form>

                {/* Registro */}
                <div className="mt-6 text-center">
                  <p className="text-slate-300">
                    ¿Eres cliente?{' '}
                    <Link
                      href="/registro"
                      className="font-semibold text-blue-400 hover:text-blue-300 transition"
                    >
                      Regístrate aquí
                    </Link>
                  </p>
                </div>

                {/* Demo credentials */}
                <div className="mt-6 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center backdrop-blur-sm">
                  <p className="text-xs text-slate-400 mb-1">Credenciales de prueba</p>
                  <p className="text-sm text-white">
                    <span className="font-mono bg-white/10 px-2 py-0.5 rounded">admin</span>
                    {' / '}
                    <span className="font-mono bg-white/10 px-2 py-0.5 rounded">admin123</span>
                  </p>
                </div>

                {/* Estado del backend */}
                <div className="mt-4 text-center text-xs text-slate-400">
                  {healthStatus ? (
                    healthStatus.success ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>
                          Backend conectado · v{healthStatus.backendVersion ?? '?'} ({healthStatus.environment ?? 'unknown'})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2 text-red-400">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span>Backend no disponible</span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Verificando conexión...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
