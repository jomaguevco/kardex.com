'use client'

import { useState, useEffect } from 'react'
import { X, Package, User, Calendar, DollarSign, CheckCircle, Truck, CreditCard } from 'lucide-react'
import { Pedido } from '@/services/pedidoService'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import PagoModal from './PagoModal'

interface PedidoDetalleModalClienteProps {
  pedido: Pedido
  isOpen: boolean
  onClose: () => void
  onRefresh?: () => void
}

export default function PedidoDetalleModalCliente({
  pedido,
  isOpen,
  onClose,
  onRefresh
}: PedidoDetalleModalClienteProps) {
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false)

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

  const getEstadoBadge = (estado: string) => {
    // Si tiene fecha_envio, mostrar como EN_CAMINO para el cliente
    const estadoParaCliente = pedido.fecha_envio ? 'EN_CAMINO' : estado

    switch (estadoParaCliente) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Pendiente
          </span>
        )
      case 'APROBADO':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Aprobado - Listo para pagar
          </span>
        )
      case 'PAGADO':
        return (
          <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
            <CreditCard className="mr-1 h-3 w-3" />
            Pagado - En espera de envío
          </span>
        )
      case 'EN_CAMINO':
      case 'PROCESADO':
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <Truck className="mr-1 h-3 w-3" />
            En camino
          </span>
        )
      case 'RECHAZADO':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
            Rechazado
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

  const handlePagoSuccess = () => {
    setIsPagoModalOpen(false)
    if (onRefresh) {
      onRefresh()
    }
    // Cerrar modal después de un momento para que se vea el mensaje
    setTimeout(() => {
      onClose()
    }, 1000)
  }

  const mostrarBotonPagar = pedido.estado === 'APROBADO'

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] overflow-hidden bg-black/50 backdrop-blur-sm">
        <div className="flex h-full w-full items-start justify-start pt-8 sm:pt-12 pb-4 sm:pb-6 pl-8 sm:pl-16 pr-4 sm:pr-6">
          <div
            className="relative w-full max-w-6xl max-h-[85vh] ml-auto rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden"
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

            {/* Información de pago (si existe) */}
            {pedido.metodo_pago && (
              <div className="glass-card rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-emerald-900">Información de Pago</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-emerald-700">Método de pago</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-900">
                      {pedido.metodo_pago}
                    </p>
                  </div>
                  {pedido.fecha_pago && (
                    <div>
                      <p className="text-xs font-medium text-emerald-700">Fecha de pago</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-900">
                        {format(new Date(pedido.fecha_pago), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                      </p>
                    </div>
                  )}
                  {pedido.comprobante_pago && (
                    <div className="md:col-span-2">
                      <p className="text-xs font-medium text-emerald-700 mb-2">Comprobante</p>
                      <img
                        src={pedido.comprobante_pago}
                        alt="Comprobante de pago"
                        className="max-w-xs rounded-lg border border-emerald-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información de envío (si existe) */}
            {pedido.fecha_envio && (
              <div className="glass-card rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start space-x-3">
                  <Truck className="mt-1 h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900">Pedido en camino</h3>
                    <p className="mt-1 text-sm text-blue-700">
                      Tu pedido fue enviado el {format(new Date(pedido.fecha_envio), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                    {pedido.venta?.numero_factura && (
                      <p className="mt-1 text-xs text-blue-600">
                        Factura: {pedido.venta.numero_factura}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

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
                    <span className="text-slate-600">IGV (18%):</span>
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
                  <X className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Motivo de rechazo:</p>
                    <p className="mt-1 text-sm text-red-700">{pedido.motivo_rechazo}</p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer con acciones */}
          {mostrarBotonPagar && (
            <div className="flex-shrink-0 space-y-4 border-t border-slate-200 bg-white p-6">
              <button
                onClick={() => setIsPagoModalOpen(true)}
                className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 font-semibold text-white shadow-lg transition hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>Proceder al Pago</span>
              </button>
              <p className="text-center text-xs text-slate-500">
                Tu pedido ha sido aprobado. Procede al pago para completar tu compra.
              </p>
            </div>
          )}

            {!mostrarBotonPagar && (
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

      {/* Modal de pago */}
      {isPagoModalOpen && (
        <PagoModal
          pedidoId={pedido.id}
          total={Number(pedido.total)}
          isOpen={isPagoModalOpen}
          onClose={() => setIsPagoModalOpen(false)}
          onSuccess={handlePagoSuccess}
        />
      )}
    </>
  )
}

