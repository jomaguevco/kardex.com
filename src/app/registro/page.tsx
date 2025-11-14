'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, ArrowLeft, Check } from 'lucide-react'
import apiService from '@/services/api'

interface RegistroData {
  nombre: string
  email: string
  telefono: string
  numero_documento: string
  contrasena: string
  confirmar_contrasena: string
}

export default function RegistroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegistroData>({
    nombre: '',
    email: '',
    telefono: '',
    numero_documento: '',
    contrasena: '',
    confirmar_contrasena: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)

  const handleChange = (field: keyof RegistroData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    // Validaciones
    if (!formData.nombre || !formData.email || !formData.telefono || !formData.numero_documento || !formData.contrasena) {
      setError('Por favor completa todos los campos obligatorios')
      return
    }

    if (formData.contrasena !== formData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (!aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones')
      return
    }

    setIsLoading(true)

    try {
      const response = await apiService.post('/auth/register-cliente', {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        numero_documento: formData.numero_documento,
        contrasena: formData.contrasena
      })

      if (response.success) {
        // Mostrar mensaje de éxito y redirigir al login
        alert('¡Registro exitoso! Ahora puedes iniciar sesión con tus credenciales.')
        router.push('/')
      } else {
        setError(response.message || 'Error al registrar usuario')
      }
    } catch (err: any) {
      setError(err?.message || 'Error al registrar usuario. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-emerald-400/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-400/20 via-sky-400/20 to-purple-500/20 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al login
          </Link>

          <div className="glass-card rounded-3xl p-8 shadow-xl">
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
                  <Check className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-slate-900">
                Registro de Cliente
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Crea tu cuenta para acceder al portal de clientes
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-medium text-slate-700">
                    Nombre completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleChange('nombre')}
                    placeholder="Juan Pérez"
                    className="input-field h-11 rounded-xl bg-white/90"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    placeholder="juan@ejemplo.com"
                    className="input-field h-11 rounded-xl bg-white/90"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="telefono" className="text-sm font-medium text-slate-700">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange('telefono')}
                    placeholder="987654321"
                    className="input-field h-11 rounded-xl bg-white/90"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="numero_documento" className="text-sm font-medium text-slate-700">
                    Número de documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="numero_documento"
                    type="text"
                    value={formData.numero_documento}
                    onChange={handleChange('numero_documento')}
                    placeholder="12345678"
                    className="input-field h-11 rounded-xl bg-white/90"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contrasena" className="text-sm font-medium text-slate-700">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contrasena"
                    type="password"
                    value={formData.contrasena}
                    onChange={handleChange('contrasena')}
                    placeholder="Mínimo 6 caracteres"
                    className="input-field h-11 rounded-xl bg-white/90"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmar_contrasena" className="text-sm font-medium text-slate-700">
                    Confirmar contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmar_contrasena"
                    type="password"
                    value={formData.confirmar_contrasena}
                    onChange={handleChange('confirmar_contrasena')}
                    placeholder="Repite tu contraseña"
                    className="input-field h-11 rounded-xl bg-white/90"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-xl bg-slate-50 p-4">
                <input
                  id="terminos"
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="terminos" className="text-sm text-slate-600">
                  Acepto los{' '}
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    términos y condiciones
                  </a>{' '}
                  y la{' '}
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    política de privacidad
                  </a>
                </label>
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
                    Registrando...
                  </>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/" className="font-semibold text-primary-600 hover:text-primary-500 transition">
                Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

