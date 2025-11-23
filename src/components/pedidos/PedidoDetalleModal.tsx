'use client'

import { useState, useEffect } from 'react'
import { X, Package, User, Calendar, DollarSign, AlertCircle, Truck, MessageSquare, XCircle } from 'lucide-react'
import { Pedido } from '@/services/pedidoService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'
import pedidoService from '@/services/pedidoService'

interface PedidoDetalleModalProps {
  pedido: Pedido
  isOpen: boolean
  onClose: () => void
  onRefresh?: () => void
}

export default function PedidoDetalleModal({
  pedido,
  isOpen,
  onClose,
  onRefresh
}: PedidoDetalleModalProps) {
  const [actualizacion, setActualizacion] = useState('')
  const [motivoAnulacion, setMotivoAnulacion] = useState('')
  const [isMarcandoEnCamino, setIsMarcandoEnCamino] = useState(false)
  const [isMarcandoEntregado, setIsMarcandoEntregado] = useState(false)
  const [isAgregandoActualizacion, setIsAgregandoActualizacion] = useState(false)
  const [isAnulando, setIsAnulando] = useState(false)

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow || ''
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleMarcarEnCamino = async () => {
    if (!confirm('¿Estás seguro de marcar este pedido como en camino?')) {
      return
    }

    try {
      setIsMarcandoEnCamino(true)
      await pedidoService.marcarComoEnCamino(pedido.id)
      toast.success('Pedido marcado como en camino correctamente')
      if (onRefresh) onRefresh()
      onClose()
    } catch (error: any) {
      toast.error(error?.message || 'Error al marcar pedido como en camino')
    } finally {
      setIsMarcandoEnCamino(false)
    }
  }

  const handleMarcarEntregado = async () => {
    if (!confirm('¿Estás seguro de marcar este pedido como entregado? Se creará la venta y se descontará el stock.')) {
      return
    }

    try {
      setIsMarcandoEntregado(true)
      await pedidoService.marcarComoEntregado(pedido.id)
      toast.success('Pedido marcado como entregado correctamente')
      if (onRefresh) onRefresh()
      onClose()
    } catch (error: any) {
      toast.error(error?.message || 'Error al marcar pedido como entregado')
    } finally {
      setIsMarcandoEntregado(false)
    }
  }

  const handleAgregarActualizacion = async () => {
    if (!actualizacion.trim()) {
      toast.error('Debes ingresar una actualización')
      return
    }

    try {
      setIsAgregandoActualizacion(true)
      await pedidoService.agregarActualizacionEnvio(pedido.id, actualizacion.trim())
      toast.success('Actualización agregada correctamente')
      setActualizacion('')
      if (onRefresh) onRefresh()
    } catch (error: any) {
      toast.error(error?.message || 'Error al agregar actualización')
    } finally {
      setIsAgregandoActualizacion(false)
    }
  }

  const handleAnular = async () => {
    if (!motivoAnulacion.trim()) {
      toast.error('Debes ingresar un motivo de anulación')
      return
    }

    if (!confirm('¿Estás seguro de anular este pedido? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      setIsAnulando(true)
      await pedidoService.anularPedido(pedido.id, motivoAnulacion.trim())
      toast.success('Pedido anulado correctamente')
      setMotivoAnulacion('')
      if (onRefresh) onRefresh()
      onClose()
    } catch (error: any) {
      toast.error(error?.message || 'Error al anular pedido')
    } finally {
      setIsAnulando(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'BORRADOR':
        return (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Borrador
          </span>
        )
      case 'EN_PROCESO':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            En Proceso
          </span>
        )
      case 'EN_CAMINO':
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            En Camino
          </span>
        )
      case 'ENTREGADO':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
            Entregado
          </span>
        )
      case 'CANCELADO':
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
            Cancelado
          </span>
        )
      default:
        return <span className="text-sm text-slate-600">{estado}</span>
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] overflow-hidden bg-black/50 backdrop-blur-sm p-8 sm:p-12">
        <div className="h-full w-full flex items-start justify-start">
          <div
            className="relative w-full max-w-6xl max-h-[85vh] rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden ml-72 mr-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 pt-3 pb-3 text-white">
              <div>
                <h2 className="text-sm font-bold">Detalle del Pedido</h2>
                <p className="text-[10px] text-white/80">{pedido.numero_pedido}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-white/20 p-2 transition hover:bg-white/30 flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pl-10 sm:pl-16 pr-4 sm:pr-6 py-6 space-y-6">
            {/* Información general */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-indigo-100 p-2">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Cliente</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {pedido.cliente?.nombre || 'Cliente'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {pedido.cliente?.numero_documento || 'Sin documento'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-amber-100 p-2">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Fecha</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {format(new Date(pedido.fecha_pedido), "dd 'de' MMMM, yyyy", { locale: es })}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(pedido.fecha_pedido), "HH:mm 'hrs'", { locale: es })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-emerald-100 p-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Total</p>
                    <p className="text-lg font-bold text-emerald-600">
                      S/. {Number(pedido.total).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600">Estado</p>
                    <div className="mt-1">
                      {getEstadoBadge(pedido.estado)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Productos */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Productos</h3>
              <div className="space-y-2">
                {pedido.detalles?.map((detalle) => (
                  <div
                    key={detalle.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {detalle.producto?.nombre || `Producto #${detalle.producto_id}`}
                      </p>
                      <p className="text-sm text-slate-600">
                        Código: {detalle.producto?.codigo_interno || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">
                        {detalle.cantidad} x S/. {Number(detalle.precio_unitario).toFixed(2)}
                      </p>
                      {detalle.descuento > 0 && (
                        <p className="text-xs text-red-600">
                          Descuento: S/. {Number(detalle.descuento).toFixed(2)}
                        </p>
                      )}
                      <p className="font-semibold text-slate-900">
                        S/. {Number(detalle.subtotal).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold text-slate-900">
                    S/. {Number(pedido.subtotal).toFixed(2)}
                  </span>
                </div>
                {pedido.descuento > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Descuento:</span>
                    <span className="font-semibold text-red-600">
                      -S/. {Number(pedido.descuento).toFixed(2)}
                    </span>
                  </div>
                )}
                {pedido.impuesto > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Impuesto:</span>
                    <span className="font-semibold text-slate-900">
                      S/. {Number(pedido.impuesto).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-300 pt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-slate-900">Total:</span>
                    <span className="text-xl font-bold text-emerald-600">
                      S/. {Number(pedido.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {pedido.observaciones && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Observaciones</h3>
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {pedido.observaciones}
                </p>
              </div>
            )}

            {/* Actualizaciones del envío (si existen) */}
            {pedido.actualizaciones_envio && (
              <div className="glass-card rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-indigo-900">Actualizaciones del Envío</h3>
                <div className="space-y-2">
                  {pedido.actualizaciones_envio.split('\n\n').map((actualizacion, index) => (
                    <div key={index} className="rounded-lg bg-white p-3 border border-indigo-100">
                      <p className="text-sm text-indigo-800 whitespace-pre-line">{actualizacion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Motivo de cancelación si está cancelado */}
            {pedido.estado === 'CANCELADO' && pedido.motivo_rechazo && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Motivo de cancelación:</p>
                    <p className="mt-1 text-sm text-red-700">{pedido.motivo_rechazo}</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer con acciones */}
          {pedido.estado !== 'CANCELADO' && (
            <div className="flex-shrink-0 space-y-4 border-t border-slate-200 bg-white p-6">
              {/* Agregar actualización */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Agregar actualización sobre el envío:
                </label>
                <textarea
                  value={actualizacion}
                  onChange={(e) => setActualizacion(e.target.value)}
                  placeholder="Ej: El pedido salió del almacén, llegará mañana..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={handleAgregarActualizacion}
                  disabled={isAgregandoActualizacion || !actualizacion.trim()}
                  className="mt-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{isAgregandoActualizacion ? 'Agregando...' : 'Agregar Actualización'}</span>
                </button>
              </div>

              {/* Botones de acción según estado */}
              <div className="flex gap-3 flex-wrap">
                {/* Marcar como en camino - solo si está EN_PROCESO */}
                {pedido.estado === 'EN_PROCESO' && (
                  <button
                    onClick={handleMarcarEnCamino}
                    disabled={isMarcandoEnCamino}
                    className="flex-1 min-w-[200px] rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Truck className="h-5 w-5" />
                    <span>{isMarcandoEnCamino ? 'Marcando...' : 'Marcar como En Camino'}</span>
                  </button>
                )}

                {/* Marcar como entregado - solo si está EN_CAMINO */}
                {pedido.estado === 'EN_CAMINO' && (
                  <button
                    onClick={handleMarcarEntregado}
                    disabled={isMarcandoEntregado}
                    className="flex-1 min-w-[200px] rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Package className="h-5 w-5" />
                    <span>{isMarcandoEntregado ? 'Marcando...' : 'Marcar como Entregado'}</span>
                  </button>
                )}

                {/* Anular pedido - solo si NO está EN_CAMINO ni ENTREGADO */}
                {pedido.estado !== 'EN_CAMINO' && pedido.estado !== 'ENTREGADO' && (
                  <>
                    <div className="w-full">
                      <label className="mb-2 block text-sm font-semibold text-slate-900">
                        Motivo de anulación:
                      </label>
                      <textarea
                        value={motivoAnulacion}
                        onChange={(e) => setMotivoAnulacion(e.target.value)}
                        placeholder="Ingrese el motivo de anulación..."
                        rows={2}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>
                    <button
                      onClick={handleAnular}
                      disabled={isAnulando || !motivoAnulacion.trim()}
                      className="flex-1 min-w-[200px] rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <XCircle className="h-5 w-5" />
                      <span>{isAnulando ? 'Anulando...' : 'Anular Pedido'}</span>
                    </button>
                  </>
                )}

                <button
                  onClick={onClose}
                  className="flex-1 min-w-[150px] rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {pedido.estado === 'CANCELADO' && (
            <div className="flex-shrink-0 flex justify-end border-t border-slate-200 bg-white px-6 py-4">
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  )
}

