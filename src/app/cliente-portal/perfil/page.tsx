'use client'

import { useState, useEffect } from 'react'
import { useClienteAuth } from '@/hooks/useClienteAuth'
import { useAuthStore } from '@/store/authStore'
import { 
  Sparkles, User, Shield, Bell, Camera, Upload, X, 
  Save, Loader2, Eye, EyeOff, Check, Mail, Phone,
  Award, Star, TrendingUp, Calendar, Settings, Zap,
  Heart, ShoppingBag, Package
} from 'lucide-react'
// Mail y Phone se mantienen importados porque se usan en otras partes del componente
import toast from 'react-hot-toast'
import usuarioService from '@/services/usuarioService'
import { getFotoPerfilUrl } from '@/utils/fotoPerfil'
import Link from 'next/link'

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

  // Calcular progreso del perfil
  const calcularProgresoPerfil = () => {
    let completado = 0
    if (user?.nombre_completo) completado += 25
    if (user?.email) completado += 25
    if (user?.telefono) completado += 25
    if (user?.foto_perfil) completado += 25
    return completado
  }

  const progresoPerfil = calcularProgresoPerfil()

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
      {/* Header con banner animado */}
      <div className="relative h-[350px] overflow-hidden rounded-3xl shadow-2xl">
        {/* Video de fondo */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80"
        >
          <source src="https://cdn.coverr.co/videos/coverr-gradient-blue-and-purple-5766/1080p.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-pink-900/90" />
        
        {/* Partículas decorativas */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20 animate-pulse"
              style={{
                width: Math.random() * 8 + 4 + 'px',
                height: Math.random() * 8 + 4 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Info del usuario con avatar grande */}
              <div className="flex items-center gap-6">
                {/* Avatar grande */}
                <div className="relative group">
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-75 blur-lg group-hover:opacity-100 transition animate-pulse" />
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white/30 bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl">
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
                  {/* Botón de cambiar foto */}
                  <label
                    htmlFor="foto-input-header"
                    className="absolute -bottom-1 -right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110"
                  >
                    <Camera className="h-5 w-5 text-indigo-600" />
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="foto-input-header"
                    disabled={uploading}
                  />
                </div>

                <div className="text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{user?.nombre_completo}</h1>
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1">
                      <Star className="h-4 w-4" />
                      <span className="text-xs font-bold">Premium</span>
                    </div>
                  </div>
                  <p className="text-white/70 text-lg">@{user?.nombre_usuario}</p>
                  <div className="flex items-center gap-4 mt-3">
                    {email && (
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Mail className="h-4 w-4" />
                        <span>{email}</span>
                      </div>
                    )}
                    {telefono && (
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Phone className="h-4 w-4" />
                        <span>{telefono}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progreso del perfil */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Perfil Completo</h3>
                    <p className="text-white/60 text-sm">{progresoPerfil}% completado</p>
                  </div>
                </div>
                {/* Barra de progreso animada */}
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progresoPerfil}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs text-white/60">
                  <span>Básico</span>
                  <span>Completo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: ShoppingBag, label: 'Compras', value: '12', color: 'from-blue-500 to-indigo-600' },
          { icon: Heart, label: 'Favoritos', value: '8', color: 'from-pink-500 to-rose-600' },
          { icon: Package, label: 'Productos', value: '45', color: 'from-emerald-500 to-teal-600' },
          { icon: TrendingUp, label: 'Ahorro', value: 'S/150', color: 'from-orange-500 to-red-600' },
        ].map((stat, index) => (
          <div 
            key={index}
            className="glass-card rounded-2xl p-5 group hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg transition-transform group-hover:scale-110`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/cliente-portal/mis-compras" className="glass-card rounded-2xl p-6 group hover:shadow-xl transition-all">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:scale-110 transition">
              <ShoppingBag className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Mis Compras</h3>
              <p className="text-sm text-slate-500">Ver historial de compras</p>
            </div>
          </div>
        </Link>
        <Link href="/cliente-portal/facturas" className="glass-card rounded-2xl p-6 group hover:shadow-xl transition-all">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg group-hover:scale-110 transition">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Mis Facturas</h3>
              <p className="text-sm text-slate-500">Descargar comprobantes</p>
            </div>
          </div>
        </Link>
        <Link href="/cliente-portal/soporte" className="glass-card rounded-2xl p-6 group hover:shadow-xl transition-all">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg group-hover:scale-110 transition">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Soporte</h3>
              <p className="text-sm text-slate-500">Obtener ayuda</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Grid de formularios */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Información personal */}
        <div className="glass-card rounded-3xl p-8 hover:shadow-xl transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Información personal</h3>
              <p className="text-slate-500">Actualiza tus datos personales</p>
            </div>
          </div>

          <form onSubmit={handleGuardarPerfil} className="space-y-5">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={guardandoPerfil}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
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
        <div className="glass-card rounded-3xl p-8 hover:shadow-xl transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Seguridad</h3>
              <p className="text-slate-500">Cambia tu contraseña periódicamente</p>
            </div>
          </div>

          <form onSubmit={handleCambiarContrasena} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña actual *
              </label>
              <div className="relative">
                <input
                  type={mostrarContrasenas ? 'text' : 'password'}
                  value={contrasenaActual}
                  onChange={(e) => setContrasenaActual(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 pr-12 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasenas(!mostrarContrasenas)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
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
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
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
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-slate-900 transition focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
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
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
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
      <div className="glass-card rounded-3xl p-8 hover:shadow-xl transition-all">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
            <Settings className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Preferencias</h3>
            <p className="text-slate-500">Personaliza tu experiencia en el sistema</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border-2 border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/50 p-5 transition hover:shadow-lg hover:border-indigo-200">
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

          <div className="flex items-center justify-between rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-5 opacity-60">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Recordatorios de compra</p>
                <p className="text-sm text-slate-600">Te avisamos cuando tus productos favoritos estén disponibles</p>
              </div>
            </div>
            <span className="rounded-full bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 text-sm font-semibold text-orange-700">
              Próximamente
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
