'use client'

import { useState, useEffect } from 'react'
import { Sparkles, User as UserIcon, Shield, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import { useAuthStore } from '@/store/authStore'
import FotoPerfilUpload from '@/components/perfil/FotoPerfilUpload'
import EditarPerfilForm from '@/components/perfil/EditarPerfilForm'
import CambiarContrasenaForm from '@/components/perfil/CambiarContrasenaForm'
import usuarioService from '@/services/usuarioService'

export default function PerfilPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <PerfilContent />
      </Layout>
    </ProtectedRoute>
  )
}

function PerfilContent() {
  const { user } = useAuthStore()
  const [notificacionesHabilitadas, setNotificacionesHabilitadas] = useState(true)
  const [guardandoPreferencias, setGuardandoPreferencias] = useState(false)

  // Cargar preferencias al montar el componente
  useEffect(() => {
    if (user?.preferencias) {
      try {
        const prefs = typeof user.preferencias === 'string' 
          ? JSON.parse(user.preferencias) 
          : user.preferencias
        setNotificacionesHabilitadas(prefs.notificaciones !== false)
      } catch (error) {
        console.error('Error al cargar preferencias:', error)
      }
    }
  }, [user])

  const handleToggleNotificaciones = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoValor = e.target.checked
    setNotificacionesHabilitadas(nuevoValor)

    try {
      setGuardandoPreferencias(true)
      await usuarioService.actualizarPreferencias({
        notificaciones: nuevoValor
      })
      toast.success('Preferencias actualizadas')
    } catch (error: any) {
      toast.error('Error al actualizar preferencias')
      // Revertir el cambio si falla
      setNotificacionesHabilitadas(!nuevoValor)
    } finally {
      setGuardandoPreferencias(false)
    }
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 py-8 text-white shadow-xl">
        <div className="absolute -right-12 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl lg:block" />
        <div className="relative">
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Mi perfil
          </span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
            Gestiona tu información personal
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
            Actualiza tus datos, cambia tu contraseña y personaliza tus preferencias en el sistema
          </p>

          {/* Info del usuario */}
          <div className="mt-6 inline-flex items-center gap-4 rounded-2xl border border-white/30 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <UserIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.nombre_completo}</p>
              <p className="text-xs text-white/70">@{user?.nombre_usuario} · {user?.rol}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Foto de perfil */}
      <FotoPerfilUpload />

      {/* Grid de formularios */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Información personal */}
        <EditarPerfilForm />

        {/* Cambiar contraseña */}
        <CambiarContrasenaForm />
      </div>

      {/* Preferencias (futuro) */}
      <div className="card p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-lg font-semibold text-slate-900">Preferencias</h3>
        <p className="mt-1 text-sm text-slate-500">Personaliza tu experiencia en el sistema</p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
                <p className="text-xs text-slate-500">Recibe alertas de stock bajo y transacciones</p>
              </div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input 
                type="checkbox" 
                className="peer sr-only" 
                checked={notificacionesHabilitadas}
                onChange={handleToggleNotificaciones}
                disabled={guardandoPreferencias}
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-indigo-300 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Autenticación de dos factores</p>
                <p className="text-xs text-slate-500">Próximamente disponible</p>
              </div>
            </div>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
              Próximamente
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

