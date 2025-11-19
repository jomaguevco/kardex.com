'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import usuarioService from '@/services/usuarioService'
import { useAuthStore } from '@/store/authStore'

export default function EditarPerfilForm() {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre_completo: user?.nombre_completo || '',
    email: user?.email || '',
    telefono: user?.telefono || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre_completo.trim()) {
      toast.error('El nombre completo es requerido')
      return
    }

    try {
      setLoading(true)
      const updatedUser = await usuarioService.actualizarPerfil(formData)
      setUser(updatedUser)
      toast.success('Perfil actualizado exitosamente')
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-slate-900">Información personal</h3>
      <p className="mt-1 text-sm text-slate-500">Actualiza tus datos personales</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nombre completo *
          </label>
          <input
            type="text"
            value={formData.nombre_completo}
            onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
            className="input-field mt-1"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Correo electrónico
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input-field mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            className="input-field mt-1"
            placeholder="+51 999 999 999"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

