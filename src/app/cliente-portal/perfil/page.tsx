'use client'

import { useState, useEffect } from 'react'
import { useClienteAuth } from '@/hooks/useClienteAuth'
import { useAuthStore } from '@/store/authStore'
import { 
  Sparkles, User, Shield, Bell, Camera, Upload, X, 
  Save, Loader2, Eye, EyeOff, Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import usuarioService from '@/services/usuarioService'
import { getFotoPerfilUrl } from '@/utils/fotoPerfil'

export default function ClientePerfilPage() {
  const { user: clienteUser, isLoading: authLoading, isAuthorized } = useClienteAuth()
  const { user, setUser } = useAuthStore()
  
  // Estados para foto
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  
  // Estados para información personal
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  
  // Estados para contraseña
  const [contrasenaActual, setContrasenaActual] = useState('')
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [mostrarContrasenas, setMostrarContrasenas] = useState(false)
  const [guardandoContrasena, setGuardandoContrasena] = useState(false)
  
  // Estados para preferencias
  const [notificacionesHabilitadas, setNotificacionesHabilitadas] = useState(true)
  const [guardandoPreferencias, setGuardandoPreferencias] = useState(false)

  useEffect(() => {
    if (user) {
      setNombreCompleto(user.nombre_completo || '')
      setEmail(user.email || '')
      setTelefono(user.telefono || '')
      
      if (user.preferencias) {
        try {
          const prefs = typeof user.preferencias === 'string' 
            ? JSON.parse(user.preferencias) 
            : user.preferencias
          setNotificacionesHabilitadas(prefs.notificaciones !== false)
        } catch (error) {
          console.error('Error al cargar preferencias:', error)
        }
      }
    }
  }, [user])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    handleUploadFoto(file)
  }

  const handleUploadFoto = async (file: File) => {
    try {
      setUploading(true)
      const response = await usuarioService.uploadFoto(file)
      
      if (user && response?.foto_perfil) {
        setUser({ ...user, foto_perfil: response.foto_perfil })
        toast.success('Foto de perfil actualizada')
      }
      setPreview(null)
    } catch (error: any) {
      console.error('Error al subir foto:', error)
      toast.error(error?.response?.data?.message || error?.message || 'Error al subir la foto')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleEliminarFoto = async () => {
    try {
      setUploading(true)
      await usuarioService.eliminarFoto()
      if (user) {
        setUser({ ...user, foto_perfil: null })
      }
      toast.success('Foto eliminada exitosamente')
    } catch (error: any) {
      toast.error('Error al eliminar la foto')
    } finally {
      setUploading(false)
    }
  }

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setGuardandoPerfil(true)
      await usuarioService.actualizarPerfil({
        nombre_completo: nombreCompleto,
        email,
        telefono
      })
      
      if (user) {
        setUser({
          ...user,
          nombre_completo: nombreCompleto,
          email,
          telefono
        })
      }
      
      toast.success('Perfil actualizado correctamente')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al actualizar perfil')
    } finally {
      setGuardandoPerfil(false)
    }
  }

  const handleCambiarContrasena = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (nuevaContrasena !== confirmarContrasena) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    
    if (nuevaContrasena.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    
    try {
      setGuardandoContrasena(true)
      await usuarioService.cambiarContrasena({
        contrasena_actual: contrasenaActual,
        nueva_contrasena: nuevaContrasena
      })
      
      setContrasenaActual('')
      setNuevaContrasena('')
      setConfirmarContrasena('')
      toast.success('Contraseña actualizada correctamente')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al cambiar contraseña')
    } finally {
      setGuardandoContrasena(false)
    }
  }

  const handleToggleNotificaciones = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoValor = e.target.checked
    setNotificacionesHabilitadas(nuevoValor)

    try {
      setGuardandoPreferencias(true)
      await usuarioService.actualizarPreferencias({ notificaciones: nuevoValor })
      toast.success('Preferencias actualizadas')
    } catch (error: any) {
      toast.error('Error al actualizar preferencias')
      setNotificacionesHabilitadas(!nuevoValor)
    } finally {
      setGuardandoPreferencias(false)
    }
  }

  const fotoUrl = preview || getFotoPerfilUrl(user?.foto_perfil, false) || null

  if (authLoading || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
          <p className="mt-4 text-slate-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative h-[280px] overflow-hidden rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-6">
            <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-semibold">Mi Perfil</span>
            </div>
            <h1 className="text-4xl font-bold drop-shadow-lg mb-4">
              Gestiona tu información personal
            </h1>
            <p className="text-lg mb-6 drop-shadow-md text-white/90">
              Actualiza tus datos, cambia tu contraseña y personaliza tus preferencias
            </p>
            
            {/* Info del usuario */}
            <div className="inline-flex items-center gap-4 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <User className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold">{user?.nombre_completo}</p>
                <p className="text-sm text-white/70">@{user?.nombre_usuario} · {user?.rol}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Foto de perfil */}
      <div className="glass-card rounded-3xl p-8">
        <h3 className="text-xl font-bold text-slate-900">Foto de perfil</h3>
        <p className="mt-1 text-slate-600">Personaliza tu imagen de perfil</p>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
          {/* Preview de la foto */}
          <div className="relative">
            <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-indigo-500 to-purple-500 shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <User className="h-16 w-16" />
              </div>
              {fotoUrl && (
                <img
                  src={fotoUrl}
                  alt="Foto de perfil"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
            </div>
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/50 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex flex-col gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="foto-input"
              disabled={uploading}
            />
            <label
              htmlFor="foto-input"
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-105 disabled:opacity-50"
            >
              <Upload className="h-5 w-5" />
              {user?.foto_perfil ? 'Cambiar foto' : 'Subir foto'}
            </label>

            {user?.foto_perfil && (
              <button
                onClick={handleEliminarFoto}
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
                Eliminar foto
              </button>
            )}

            <p className="text-sm text-slate-500">
              JPG, PNG o GIF. Máximo 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de formularios */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Información personal */}
        <div className="glass-card rounded-3xl p-8">
          <h3 className="text-xl font-bold text-slate-900">Información personal</h3>
          <p className="mt-1 text-slate-600">Actualiza tus datos personales</p>

          <form onSubmit={handleGuardarPerfil} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={guardandoPerfil}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
            >
              {guardandoPerfil ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Guardar cambios
            </button>
          </form>
        </div>

        {/* Seguridad */}
        <div className="glass-card rounded-3xl p-8">
          <h3 className="text-xl font-bold text-slate-900">Seguridad</h3>
          <p className="mt-1 text-slate-600">Cambia tu contraseña periódicamente</p>

          <form onSubmit={handleCambiarContrasena} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña actual *
              </label>
              <div className="relative">
                <input
                  type={mostrarContrasenas ? 'text' : 'password'}
                  value={contrasenaActual}
                  onChange={(e) => setContrasenaActual(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 pr-12 text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasenas(!mostrarContrasenas)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {mostrarContrasenas ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nueva contraseña *
              </label>
              <input
                type={mostrarContrasenas ? 'text' : 'password'}
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirmar nueva contraseña *
              </label>
              <input
                type={mostrarContrasenas ? 'text' : 'password'}
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                required
              />
              {confirmarContrasena && nuevaContrasena === confirmarContrasena && (
                <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
                  <Check className="h-4 w-4" /> Las contraseñas coinciden
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={guardandoContrasena}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
            >
              {guardandoContrasena ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Shield className="h-5 w-5" />
              )}
              Cambiar contraseña
            </button>
          </form>
        </div>
      </div>

      {/* Preferencias */}
      <div className="glass-card rounded-3xl p-8">
        <h3 className="text-xl font-bold text-slate-900">Preferencias</h3>
        <p className="mt-1 text-slate-600">Personaliza tu experiencia en el sistema</p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-2xl border-2 border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/50 p-5 transition hover:shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Notificaciones</p>
                <p className="text-sm text-slate-600">Recibe alertas y actualizaciones importantes</p>
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
              <div className="peer h-7 w-14 rounded-full bg-slate-300 after:absolute after:left-[4px] after:top-[4px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-md after:transition-all after:content-[''] peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-600 peer-checked:after:translate-x-7 peer-focus:ring-4 peer-focus:ring-indigo-300/50 peer-disabled:opacity-50"></div>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-5 opacity-60">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Autenticación de dos factores</p>
                <p className="text-sm text-slate-600">Mayor seguridad para tu cuenta</p>
              </div>
            </div>
            <span className="rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 text-sm font-semibold text-purple-700">
              Próximamente
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

