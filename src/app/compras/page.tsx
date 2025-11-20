'use client'

import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Sparkles, Truck, Plus, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import ComprasTable from '@/components/compras/ComprasTable'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { compraService } from '@/services/compraService'
import { Compra } from '@/types'
import { cn } from '@/utils/cn'
import NuevaCompraForm from '@/components/compras/NuevaCompraForm'
import EditarCompraForm from '@/components/compras/EditarCompraForm'

export default function ComprasPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <ComprasContent />
      </Layout>
    </ProtectedRoute>
  )
}

function ComprasContent() {
  const queryClient = useQueryClient()
  const [showHint, setShowHint] = useState(false)
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null)
  const [detallesLoading, setDetallesLoading] = useState(false)
  const [detallesError, setDetallesError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [compraEditando, setCompraEditando] = useState<Compra | null>(null)

  const handleNuevaCompra = () => {
    setIsModalOpen(true)
    setShowHint(true)
  }

  const handleViewCompra = async (compra: Compra) => {
    setSelectedCompra({ ...compra, detalles: compra.detalles || [] })
    setDetallesError(null)
    setDetallesLoading(true)
    try {
      const compraCompleta = await compraService.getCompraById(compra.id)
      setSelectedCompra(compraCompleta as Compra)
    } catch (error: any) {
      setDetallesError(error?.response?.data?.message || error?.message || 'No se pudo cargar el detalle de la compra')
    } finally {
      setDetallesLoading(false)
    }
  }

  const handleCloseDetalle = () => {
    setSelectedCompra(null)
    setDetallesError(null)
  }

  const handleEditCompra = async (compra: Compra) => {
    try {
      const compraCompleta = await compraService.getCompraById(compra.id)
      setCompraEditando(compraCompleta as Compra)
      setIsEditModalOpen(true)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'No se pudo cargar la compra para editar')
    }
  }

  const handleEditSuccess = () => {
    setIsEditModalOpen(false)
    setCompraEditando(null)
    queryClient.invalidateQueries({ queryKey: ['compras'] })
  }

  const handleEditCancel = () => {
    setIsEditModalOpen(false)
    setCompraEditando(null)
  }

  const handleCancelarCompra = async (compra: Compra) => {
    const confirmar = window.confirm(`¿Deseas cancelar la compra ${compra.numero_factura}?`)
    if (!confirmar) return

    try {
      await compraService.updateCompra(compra.id, { estado: 'ANULADA' as any })
      toast.success('Compra cancelada correctamente')
      handleCloseDetalle()
      queryClient.invalidateQueries({ queryKey: ['compras'] })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'No se pudo cancelar la compra')
    }
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-6 py-8 text-white shadow-xl">
        <div className="absolute -right-12 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl lg:block" />
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Compras inteligentes
            </span>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Controla tus abastecimientos con una interfaz alineada al dashboard
            </h1>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">
              Visualiza proveedores, estados y montos con la misma experiencia refinada del resto del sistema. Así mantienes inventarios saludables y decisiones rápidas.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={handleNuevaCompra}
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-amber-600 shadow-lg shadow-amber-900/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Plus className="mr-2 h-4 w-4" /> Registrar compra
              </button>
              <div className="inline-flex items-center rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white/90">
                <Truck className="mr-2 h-4 w-4" /> Seguimiento completo por proveedor
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/15 p-6 backdrop-blur-md">
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard titulo="Órdenes recientes" descripcion="Consulta fechas y estados" />
              <MetricCard titulo="Pagos programados" descripcion="Verifica vencimientos" />
              <MetricCard titulo="Top proveedores" descripcion="Ranking listo para reportes" />
              <MetricCard titulo="Integración KARDEX" descripcion="Movimientos automáticos" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="card flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 shadow-lg shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Historial de compras</h2>
            <p className="text-sm text-slate-500">
              Visualiza facturas, proveedores y totales desde un panel coherente con el resto del producto.
            </p>
          </div>
          <button
            onClick={handleNuevaCompra}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <ClipboardList className="mr-2 h-4 w-4" /> Nueva compra
          </button>
        </div>

        {showHint && (
          <div className="card border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-700">
            Completa la compra con el formulario dinámico y registra costos, descuentos y proveedores en un solo paso. Los movimientos se sincronizan inmediatamente con el inventario.
          </div>
        )}

        <div className="card">
          <ComprasTable onView={handleViewCompra} onEdit={handleEditCompra} onCancel={handleCancelarCompra} />
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-900/70 backdrop-blur-sm">
          <div className="flex h-full w-full items-start justify-start pt-8 sm:pt-12 pb-4 sm:pb-6 pl-8 sm:pl-16 pr-4 sm:pr-6">
            <div className="glass-card w-full max-w-6xl max-h-[85vh] ml-auto rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              <div className="flex-shrink-0 px-4 sm:px-6 pt-3 sm:pt-4 pb-3 flex items-start justify-between gap-4 border-b border-slate-200/50">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Registrar compra</span>
                  <h2 className="mt-1 text-sm font-semibold text-slate-900">Nuevo ingreso de mercadería</h2>
                  <p className="text-[10px] text-slate-500">Controla proveedores, costos y cantidades con el mismo flujo refinado que ventas.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full bg-white/25 px-3 py-1 text-white transition hover:bg-white/40 flex-shrink-0">
                  ✕
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pl-10 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-6">
                <NuevaCompraForm
                  onSuccess={() => {
                    setIsModalOpen(false)
                    setShowHint(false)
                    queryClient.invalidateQueries({ queryKey: ['compras'] })
                  }}
                  onCancel={() => setIsModalOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCompra && (
        <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-900/70 backdrop-blur-sm">
          <div className="flex h-full w-full items-start justify-start pt-8 sm:pt-12 pb-4 sm:pb-6 pl-8 sm:pl-16 pr-4 sm:pr-6">
            <div className="glass-card w-full max-w-6xl max-h-[85vh] ml-auto rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              <div className="flex-shrink-0 px-4 sm:px-6 pt-3 sm:pt-4 pb-3 flex items-start justify-between gap-4 border-b border-slate-200/50">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Detalle de compra</span>
                  <h2 className="mt-1 text-sm font-semibold text-slate-900">{selectedCompra.numero_factura}</h2>
                  <p className="text-[10px] text-slate-500">Estado actual: <strong className="capitalize">{selectedCompra.estado}</strong></p>
                </div>
                <button onClick={handleCloseDetalle} className="rounded-full bg-white/25 px-3 py-1 text-white transition hover:bg-white/40 flex-shrink-0">
                  ✕
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pl-10 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                  <DetalleCard label="Proveedor" value={selectedCompra.proveedor?.nombre || 'Proveedor no registrado'} />
                  <DetalleCard label="Fecha" value={new Date(selectedCompra.fecha_compra).toLocaleString()} />
                  <DetalleCard label="Subtotal" value={`$${Number((selectedCompra as any).subtotal ?? selectedCompra.total ?? 0).toFixed(2)}`} />
                  <DetalleCard label="Total" value={`$${Number(selectedCompra.total ?? 0).toFixed(2)}`} highlight />
                </div>

                {detallesError && (
                  <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {detallesError}
                  </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  {detallesLoading ? (
                    <div className="flex items-center justify-center gap-2 px-6 py-8 text-sm text-slate-500">
                      <LoadingSpinner size="sm" /> Cargando detalles...
                    </div>
                  ) : (selectedCompra.detalles || []).length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-slate-500">
                      Esta compra no tiene productos asociados.
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio unit.</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {(selectedCompra.detalles || []).map((detalle: any, index: number) => (
                          <tr key={detalle.id || index}>
                            <td className="text-sm text-slate-700">{detalle.producto?.nombre || 'Producto'}</td>
                            <td className="text-sm text-slate-600">{detalle.cantidad}</td>
                            <td className="text-sm text-slate-600">${Number(detalle.precio_unitario).toFixed(2)}</td>
                            <td className="text-sm font-semibold text-slate-900">${Number(detalle.subtotal ?? detalle.cantidad * detalle.precio_unitario).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end px-4 sm:px-6 py-4 border-t border-slate-200">
                <button onClick={handleCloseDetalle} className="btn-outline sm:min-w-[150px]">
                  Cerrar
                </button>
                {selectedCompra.estado?.toUpperCase() !== 'ANULADA' && (
                  <button onClick={() => handleCancelarCompra(selectedCompra)} className="btn-primary sm:min-w-[180px]">
                    Cancelar compra
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && compraEditando && (
        <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-900/70 backdrop-blur-sm">
          <div className="flex h-full w-full items-start justify-start pt-8 sm:pt-12 pb-4 sm:pb-6 pl-8 sm:pl-16 pr-4 sm:pr-6">
            <div className="glass-card w-full max-w-6xl max-h-[85vh] ml-auto rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              <div className="flex-shrink-0 px-4 sm:px-6 pt-3 sm:pt-4 pb-3 flex items-start justify-between gap-4 border-b border-slate-200/50">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Editar compra</span>
                  <h2 className="mt-1 text-sm font-semibold text-slate-900">{compraEditando.numero_factura}</h2>
                  <p className="text-[10px] text-slate-500">Modifica los detalles de la compra. Los cambios se reflejarán en el sistema.</p>
                </div>
                <button onClick={handleEditCancel} className="rounded-full bg-white/25 px-3 py-1 text-white transition hover:bg-white/40 flex-shrink-0">
                  ✕
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pl-10 sm:pl-16 pr-4 sm:pr-6 py-4 sm:py-6">
                <EditarCompraForm
                  compra={compraEditando}
                  onSuccess={handleEditSuccess}
                  onCancel={handleEditCancel}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/20 p-4 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{titulo}</p>
      <p className="mt-2 text-xs text-white/70">{descripcion}</p>
    </div>
  )
}

function DetalleCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn('rounded-2xl border border-slate-100 px-4 py-3', highlight ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600')}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
