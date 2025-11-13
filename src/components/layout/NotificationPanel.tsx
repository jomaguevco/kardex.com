'use client'

import { useEffect, useState } from 'react'
import { X, Check, CheckCheck, Package, ShoppingCart, ShoppingBag, Activity, Info, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import notificacionService, { Notificacion } from '@/services/notificacionService'
import toast from 'react-hot-toast'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  onNotificationUpdate?: () => void
}

export default function NotificationPanel({ isOpen, onClose, onNotificationUpdate }: NotificationPanelProps) {
  const router = useRouter()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'todas' | 'noLeidas'>('todas')

  useEffect(() => {
    if (isOpen) {
      loadNotificaciones()
    }
  }, [isOpen, filter])

  const loadNotificaciones = async () => {
    try {
      setLoading(true)
      const data = await notificacionService.getNotificaciones({
        leido: filter === 'noLeidas' ? false : undefined,
        limit: 30
      })
      setNotificaciones(data)
    } catch (error: any) {
      toast.error('Error al cargar notificaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarLeida = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await notificacionService.marcarComoLeida(id)
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n))
      onNotificationUpdate?.()
    } catch (error) {
      toast.error('Error al marcar notificación')
    }
  }

  const handleMarcarTodasLeidas = async () => {
    try {
      await notificacionService.marcarTodasComoLeidas()
      setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })))
      onNotificationUpdate?.()
      toast.success('Todas las notificaciones marcadas como leídas')
    } catch (error) {
      toast.error('Error al marcar notificaciones')
    }
  }

  const handleNotificacionClick = (notificacion: Notificacion) => {
    // Marcar como leída
    if (!notificacion.leido) {
      notificacionService.marcarComoLeida(notificacion.id).then(() => {
        onNotificationUpdate?.()
      })
    }

    // Navegar según el tipo
    if (notificacion.referencia_tipo === 'producto') {
      router.push('/productos')
    } else if (notificacion.referencia_tipo === 'compras') {
      router.push('/compras')
    } else if (notificacion.referencia_tipo === 'ventas') {
      router.push('/ventas')
    }

    onClose()
  }

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'STOCK_BAJO':
        return <Package className="h-5 w-5" />
      case 'COMPRA_PENDIENTE':
        return <ShoppingBag className="h-5 w-5" />
      case 'VENTA_PENDIENTE':
        return <ShoppingCart className="h-5 w-5" />
      case 'TRANSACCION':
        return <Activity className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'STOCK_BAJO':
        return 'bg-amber-500/15 text-amber-600'
      case 'COMPRA_PENDIENTE':
        return 'bg-blue-500/15 text-blue-600'
      case 'VENTA_PENDIENTE':
        return 'bg-emerald-500/15 text-emerald-600'
      case 'TRANSACCION':
        return 'bg-purple-500/15 text-purple-600'
      default:
        return 'bg-slate-500/15 text-slate-600'
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md animate-slide-in-right overflow-hidden border-l border-slate-200 bg-white shadow-2xl sm:w-96">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Notificaciones</h2>
            <p className="text-xs text-slate-500">
              {notificaciones.filter(n => !n.leido).length} sin leer
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-600 transition hover:bg-white/80 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 border-b border-slate-200 bg-slate-50 px-6 py-3">
          <button
            onClick={() => setFilter('todas')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === 'todas'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('noLeidas')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === 'noLeidas'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            No leídas
          </button>
          <button
            onClick={handleMarcarTodasLeidas}
            className="ml-auto rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white"
            title="Marcar todas como leídas"
          >
            <CheckCheck className="h-4 w-4" />
          </button>
        </div>

        {/* Lista de notificaciones */}
        <div className="h-[calc(100vh-140px)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : notificaciones.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              {filter === 'noLeidas' ? 'No tienes notificaciones sin leer' : 'No tienes notificaciones'}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notificaciones.map((notificacion, index) => (
                <div
                  key={notificacion.id}
                  onClick={() => handleNotificacionClick(notificacion)}
                  className={`group relative cursor-pointer px-6 py-4 transition hover:bg-slate-50 ${
                    !notificacion.leido ? 'bg-indigo-50/30' : ''
                  }`}
                  style={{
                    animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  {/* Indicador de no leída */}
                  {!notificacion.leido && (
                    <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-indigo-600" />
                  )}

                  <div className="flex gap-3">
                    {/* Icono */}
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getColorTipo(notificacion.tipo)}`}>
                      {getIconoTipo(notificacion.tipo)}
                    </div>

                    {/* Contenido */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{notificacion.titulo}</p>
                        {!notificacion.leido && (
                          <button
                            onClick={(e) => handleMarcarLeida(notificacion.id, e)}
                            className="rounded-lg p-1 text-slate-400 opacity-0 transition hover:bg-white hover:text-indigo-600 group-hover:opacity-100"
                            title="Marcar como leída"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{notificacion.mensaje}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(notificacion.fecha_creacion).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {/* Flecha de acción */}
                    {notificacion.referencia_tipo && (
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100" />
                    )}
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

