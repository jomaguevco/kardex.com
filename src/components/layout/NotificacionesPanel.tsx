'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  Bell, X, Check, Package, ShoppingBag, AlertCircle, 
  Info, CheckCircle, Loader2, Trash2 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Notificacion {
  id: number
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  fecha_creacion: string
}

interface NotificacionesPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificacionesPanel({ isOpen, onClose }: NotificacionesPanelProps) {
  const { token, user } = useAuthStore()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (isOpen) {
      fetchNotificaciones()
    }
  }, [isOpen])

  const fetchNotificaciones = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notificaciones`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        const todas: Notificacion[] = data.data || []
        // Filtrar según rol (clientes no deben ver alertas internas de administración)
        const role = user?.rol
        const filtradas = role === 'CLIENTE'
          ? todas.filter(n => {
              const t = (n.tipo || '').toLowerCase()
              // Ocultar alertas internas
              if (t.includes('stock')) return false
              if (t.includes('inventario')) return false
              if (t.includes('pendiente') && (t.includes('venta') || t.includes('compra'))) return false
              return true
            })
          : todas
        setNotificaciones(filtradas)
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const marcarComoLeida = async (id: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notificaciones/${id}/leer`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        setNotificaciones(notificaciones.map(n => 
          n.id === id ? { ...n, leida: true } : n
        ))
      }
    } catch (error) {
      console.error('Error al marcar notificación:', error)
    }
  }

  const marcarTodasComoLeidas = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notificaciones/leer-todas`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        setNotificaciones(notificaciones.map(n => ({ ...n, leida: true })))
      }
    } catch (error) {
      console.error('Error al marcar todas:', error)
    }
  }

  const eliminarNotificacion = async (id: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notificaciones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        setNotificaciones(notificaciones.filter(n => n.id !== id))
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error)
    }
  }

  const getIconoTipo = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'pedido':
      case 'pedido_aprobado':
      case 'pedido_rechazado':
        return <ShoppingBag className="h-5 w-5" />
      case 'venta':
      case 'compra':
        return <Package className="h-5 w-5" />
      case 'stock':
      case 'stock_bajo':
        return <AlertCircle className="h-5 w-5" />
      case 'info':
        return <Info className="h-5 w-5" />
      case 'exito':
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getColorTipo = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'pedido':
      case 'pedido_aprobado':
        return 'bg-emerald-100 text-emerald-600'
      case 'pedido_rechazado':
        return 'bg-red-100 text-red-600'
      case 'venta':
      case 'compra':
        return 'bg-blue-100 text-blue-600'
      case 'stock':
      case 'stock_bajo':
        return 'bg-orange-100 text-orange-600'
      case 'info':
        return 'bg-slate-100 text-slate-600'
      case 'exito':
        return 'bg-emerald-100 text-emerald-600'
      default:
        return 'bg-primary-100 text-primary-600'
    }
  }

  const notificacionesFiltradas = filter === 'unread' 
    ? notificaciones.filter(n => !n.leida)
    : notificaciones

  const noLeidas = notificaciones.filter(n => !n.leida).length

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300">
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-primary-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-white/20 p-2">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Notificaciones</h2>
                {noLeidas > 0 && (
                  <p className="text-sm text-white/80">
                    {noLeidas} sin leer
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 p-2 transition hover:bg-white/30"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filtros */}
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === 'all'
                  ? 'bg-white text-primary-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Todas ({notificaciones.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === 'unread'
                  ? 'bg-white text-primary-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              No leídas ({noLeidas})
            </button>
          </div>
        </div>

        {/* Acciones rápidas */}
        {noLeidas > 0 && (
          <div className="border-b border-slate-200 bg-slate-50 p-3">
            <button
              onClick={marcarTodasComoLeidas}
              className="flex items-center space-x-2 text-sm font-semibold text-primary-600 transition hover:text-primary-700"
            >
              <Check className="h-4 w-4" />
              <span>Marcar todas como leídas</span>
            </button>
          </div>
        )}

        {/* Lista de notificaciones */}
        <div className="h-[calc(100vh-200px)] overflow-y-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : notificacionesFiltradas.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center p-8 text-center">
              <Bell className="h-16 w-16 text-slate-300" />
              <p className="mt-4 font-semibold text-slate-900">
                {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones'}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Te notificaremos cuando haya novedades
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {notificacionesFiltradas.map((notif) => (
                <div
                  key={notif.id}
                  className={`group relative p-4 transition hover:bg-slate-50 ${
                    !notif.leida ? 'bg-primary-50/50' : ''
                  }`}
                >
                  {/* Indicador de no leída */}
                  {!notif.leida && (
                    <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary-600" />
                  )}

                  <div className="flex items-start space-x-3 pl-4">
                    {/* Icono */}
                    <div className={`rounded-full p-2 ${getColorTipo(notif.tipo)}`}>
                      {getIconoTipo(notif.tipo)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-grow">
                      <h3 className="font-semibold text-slate-900">
                        {notif.titulo}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {notif.mensaje}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {formatDistanceToNow(new Date(notif.fecha_creacion), {
                          addSuffix: true,
                          locale: es
                        })}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex space-x-1 opacity-0 transition group-hover:opacity-100">
                      {!notif.leida && (
                        <button
                          onClick={() => marcarComoLeida(notif.id)}
                          className="rounded-lg bg-emerald-100 p-2 text-emerald-600 transition hover:bg-emerald-200"
                          title="Marcar como leída"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => eliminarNotificacion(notif.id)}
                        className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

