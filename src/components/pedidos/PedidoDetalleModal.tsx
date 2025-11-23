'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, XCircle, Package, User, Calendar, DollarSign, AlertCircle } from 'lucide-react'
import { Pedido } from '@/services/pedidoService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface PedidoDetalleModalProps {
  pedido: Pedido
  isOpen: boolean
  onClose: () => void
  onAprobar: (pedidoId: number) => Promise<void>
  onRechazar: (pedidoId: number, motivo: string) => Promise<void>
}

export default function PedidoDetalleModal({
  pedido,
  isOpen,
  onClose,
  onAprobar,
  onRechazar
}: PedidoDetalleModalProps) {
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [isAprobando, setIsAprobando] = useState(false)
  const [isRechazando, setIsRechazando] = useState(false)

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

  const handleAprobar = async () => {
    if (!confirm('¿Estás seguro de aprobar este pedido? El cliente podrá proceder al pago.')) {
      return
    }

    try {
      setIsAprobando(true)
      await onAprobar(pedido.id)
      toast.success('Pedido aprobado correctamente')
      onClose()
    } catch (error: any) {
      toast.error(error?.message || 'Error al aprobar el pedido')
    } finally {
      setIsAprobando(false)
    }
  }

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      toast.error('Debes ingresar un motivo de rechazo')
      return
    }

    try {
      setIsRechazando(true)
      await onRechazar(pedido.id, motivoRechazo.trim())
      toast.success('Pedido rechazado correctamente')
      setMotivoRechazo('')
      onClose()
    } catch (error: any) {
      toast.error(error?.message || 'Error al rechazar el pedido')
    } finally {
      setIsRechazando(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Pendiente
          </span>
        )
      case 'APROBADO':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            Aprobado
          </span>
        )
      case 'PAGADO':
        return (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
            Pagado
          </span>
        )
      case 'PROCESADO':
      case 'EN_CAMINO':
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            {estado === 'EN_CAMINO' ? 'En Camino' : 'Procesado'}
          </span>
        )
      case 'RECHAZADO':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
            Rechazado
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
        <div className="h-full w-full flex items-start justify-end">
          <div
            className="relative w-full max-w-6xl max-h-[85vh] rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden ml-auto mr-8"
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

            {/* Motivo de rechazo si está rechazado */}
            {pedido.estado === 'RECHAZADO' && pedido.motivo_rechazo && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Motivo de rechazo:</p>
                    <p className="mt-1 text-sm text-red-700">{pedido.motivo_rechazo}</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer con acciones */}
          {pedido.estado === 'PENDIENTE' && (
            <div className="flex-shrink-0 space-y-4 border-t border-slate-200 bg-white p-6">
              {/* Motivo de rechazo */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Motivo de rechazo (si aplica):
                </label>
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Ingrese el motivo del rechazo..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRechazar}
                  disabled={isRechazando || !motivoRechazo.trim()}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRechazando ? 'Rechazando...' : 'Rechazar Pedido'}
                </button>
                <button
                  onClick={handleAprobar}
                  disabled={isAprobando}
                  className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAprobando ? 'Aprobando...' : (
                    <>
                      <CheckCircle className="mr-2 inline h-5 w-5" />
                      Aprobar Pedido
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

            {pedido.estado !== 'PENDIENTE' && (
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

