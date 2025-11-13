'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import usuarioService from '@/services/usuarioService'

export default function CambiarContrasenaForm() {
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nueva: false,
    confirmar: false
  })
  const [formData, setFormData] = useState({
    contrasena_actual: '',
    nueva_contrasena: '',
    confirmar_contrasena: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.nueva_contrasena !== formData.confirmar_contrasena) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (formData.nueva_contrasena.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      setLoading(true)
      await usuarioService.cambiarContrasena({
        contrasena_actual: formData.contrasena_actual,
        nueva_contrasena: formData.nueva_contrasena
      })
      
      toast.success('Contraseña actualizada exitosamente')
      setFormData({
        contrasena_actual: '',
        nueva_contrasena: '',
        confirmar_contrasena: ''
      })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al cambiar contraseña')
    } finally {
      setLoading(false)
    }
  }

  const toggleShowPassword = (field: 'actual' | 'nueva' | 'confirmar') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="card p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h3 className="text-lg font-semibold text-slate-900">Seguridad</h3>
      <p className="mt-1 text-sm text-slate-500">Cambia tu contraseña periódicamente</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Contraseña actual *
          </label>
          <div className="relative mt-1">
            <input
              type={showPasswords.actual ? 'text' : 'password'}
              value={formData.contrasena_actual}
              onChange={(e) => setFormData({ ...formData, contrasena_actual: e.target.value })}
              className="input-field pr-10"
              required
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('actual')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPasswords.actual ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nueva contraseña *
          </label>
          <div className="relative mt-1">
            <input
              type={showPasswords.nueva ? 'text' : 'password'}
              value={formData.nueva_contrasena}
              onChange={(e) => setFormData({ ...formData, nueva_contrasena: e.target.value })}
              className="input-field pr-10"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('nueva')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPasswords.nueva ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Confirmar nueva contraseña *
          </label>
          <div className="relative mt-1">
            <input
              type={showPasswords.confirmar ? 'text' : 'password'}
              value={formData.confirmar_contrasena}
              onChange={(e) => setFormData({ ...formData, confirmar_contrasena: e.target.value })}
              className="input-field pr-10"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => toggleShowPassword('confirmar')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPasswords.confirmar ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            {loading ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>
    </div>
  )
}

