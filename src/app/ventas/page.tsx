'use client'

import { useState } from 'react'
import { Sparkles, BarChart3, Plus, Receipt } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import VentasTable from '@/components/ventas/VentasTable'
import NuevaVentaForm from '@/components/ventas/NuevaVentaForm'
import EditarVentaForm from '@/components/ventas/EditarVentaForm'
import { ventaService } from '@/services/ventaService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Venta } from '@/types'
import { cn } from '@/utils/cn'
import { Download } from 'lucide-react'
import MetricCards from './MetricCards'

export default function VentasPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <VentasContent />
      </Layout>
    </ProtectedRoute>
  )
}

function VentasContent() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [ventaEditando, setVentaEditando] = useState<Venta | null>(null)
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null)
  const [detallesLoading, setDetallesLoading] = useState(false)
  const [detallesError, setDetallesError] = useState<string | null>(null)

  const handleNuevaVenta = () => {
    setIsModalOpen(true)
  }

  const handleSuccess = () => {
    setIsModalOpen(false)
    queryClient.invalidateQueries({ queryKey: ['ventas'] })
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const handleViewVenta = async (venta: Venta) => {
    setSelectedVenta({ ...venta, detalles: venta.detalles || [] })
    setDetallesError(null)
    setDetallesLoading(true)
    try {
      const ventaCompleta = await ventaService.getVentaById(venta.id)
      setSelectedVenta(ventaCompleta as Venta)
    } catch (error: any) {
      setDetallesError(error?.response?.data?.message || error?.message || 'No se pudo cargar el detalle de la venta')
    } finally {
      setDetallesLoading(false)
    }
  }

  const handleCloseDetalle = () => {
    setSelectedVenta(null)
    setDetallesError(null)
  }

  const handleEditVenta = async (venta: Venta) => {
    try {
      const ventaCompleta = await ventaService.getVentaById(venta.id)
      setVentaEditando(ventaCompleta as Venta)
      setIsEditModalOpen(true)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'No se pudo cargar la venta para editar')
    }
  }

  const handleEditSuccess = () => {
    setIsEditModalOpen(false)
    setVentaEditando(null)
    queryClient.invalidateQueries({ queryKey: ['ventas'] })
  }

  const handleEditCancel = () => {
    setIsEditModalOpen(false)
    setVentaEditando(null)
  }

  const handleDownloadPDF = async (venta: Venta) => {
    try {
      await ventaService.downloadFacturaPDF(venta.id)
      toast.success('PDF descargado correctamente')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'No se pudo descargar el PDF')
    }
  }

  const handleCancelarVenta = async (venta: Venta) => {
    const confirmar = window.confirm(`¿Deseas cancelar la venta ${venta.numero_factura}?`)
    if (!confirmar) return

    try {
      await ventaService.updateVenta(venta.id, { estado: 'ANULADA' as any })
      toast.success('Venta cancelada correctamente')
      handleCloseDetalle()
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'No se pudo cancelar la venta')
    }
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500 px-6 py-8 text-white shadow-xl">
        <div className="absolute -right-12 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl lg:block" />
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Ventas dinámicas
            </span>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Potencia tu ciclo comercial con una vista moderna y acciones rápidas
            </h1>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">
              Gestiona facturas, estados y clientes desde un panel consistente con el dashboard. Crea ventas al vuelo, visualiza detalles y mantén el control en tiempo real.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={handleNuevaVenta}
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-600 shadow-lg shadow-indigo-900/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Plus className="mr-2 h-4 w-4" /> Registrar venta
              </button>
              <div className="inline-flex items-center rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white/90">
                <BarChart3 className="mr-2 h-4 w-4" /> Indicadores listos para el dashboard
              </div>
            </div>
          </div>

          <MetricCards />
        </div>
      </section>

      <section className="space-y-6">
        <div className="card flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 shadow-lg shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Historial de ventas</h2>
            <p className="text-sm text-slate-500">
              Visualiza, filtra y analiza tus ventas con la misma estética y fluidez del dashboard.
            </p>
          </div>
          <button
            onClick={handleNuevaVenta}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Receipt className="mr-2 h-4 w-4" /> Nueva venta
          </button>
        </div>

        <div className="card">
          <VentasTable onView={handleViewVenta} onEdit={handleEditVenta} onCancel={handleCancelarVenta} />
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-start bg-slate-900/60 py-4 sm:py-10 backdrop-blur-sm modal-container">
          <div className="glass-card w-full max-w-6xl max-h-[90vh] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
            <div className="flex-shrink-0 mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Nueva venta
                </span>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  Registra una venta y sincroniza el inventario automáticamente
                </h2>
                <p className="text-xs text-slate-500">
                  El dashboard se actualizará con las métricas más recientes cuando completes el registro.
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="rounded-full bg-white/25 p-2 text-white transition hover:bg-white/40"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <NuevaVentaForm onSuccess={handleSuccess} onCancel={handleCancel} />
            </div>
          </div>
        </div>
      )}

      {selectedVenta && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 px-4 py-4 sm:py-10 backdrop-blur-sm">
          <div className="glass-card w-full max-w-6xl max-h-[90vh] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
            <div className="flex-shrink-0 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Detalle de venta</span>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">{selectedVenta.numero_factura}</h2>
                <p className="text-xs text-slate-500">Estado actual: <strong className="capitalize">{selectedVenta.estado}</strong></p>
              </div>
              <button onClick={handleCloseDetalle} className="rounded-full bg-white/25 px-3 py-1 text-white transition hover:bg-white/40">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <DetalleCard label="Cliente" value={selectedVenta.cliente?.nombre || 'Cliente no registrado'} />
                <DetalleCard label="Fecha" value={new Date(selectedVenta.fecha_venta).toLocaleString()} />
                <DetalleCard label="Subtotal" value={`$${Number((selectedVenta as any).subtotal ?? selectedVenta.total ?? 0).toFixed(2)}`} />
                <DetalleCard label="Total" value={`$${Number(selectedVenta.total ?? 0).toFixed(2)}`} highlight />
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
                ) : (selectedVenta.detalles || []).length === 0 ? (
                  <div className="px-6 py-8 text-center text-sm text-slate-500">
                    Esta venta no tiene productos asociados.
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
                      {(selectedVenta.detalles || []).map((detalle: any, index: number) => (
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

            <div className="flex-shrink-0 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-6 border-t border-slate-200 mt-6">
              <button onClick={handleCloseDetalle} className="btn-outline sm:min-w-[150px]">
                Cerrar
              </button>
              <button 
                onClick={() => handleDownloadPDF(selectedVenta)} 
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Descargar PDF
              </button>
              {selectedVenta.estado?.toUpperCase() !== 'ANULADA' && (
                <button onClick={() => handleCancelarVenta(selectedVenta)} className="btn-primary sm:min-w-[180px]">
                  Cancelar venta
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && ventaEditando && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 px-4 py-4 sm:py-10 backdrop-blur-sm">
          <div className="glass-card w-full max-w-6xl max-h-[90vh] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
            <div className="flex-shrink-0 mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Editar venta
                </span>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  {ventaEditando.numero_factura}
                </h2>
                <p className="text-xs text-slate-500">
                  Modifica los detalles de la venta. Los cambios se reflejarán en el sistema.
                </p>
              </div>
              <button
                onClick={handleEditCancel}
                className="rounded-full bg-white/25 p-2 text-white transition hover:bg-white/40"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <EditarVentaForm venta={ventaEditando} onSuccess={handleEditSuccess} onCancel={handleEditCancel} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ titulo, valor, subtitulo }: { titulo: string; valor: string; subtitulo: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/20 p-4 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{titulo}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{valor}</p>
      <p className="text-xs text-white/70">{subtitulo}</p>
    </div>
  )
}

function DetalleCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn('rounded-2xl border border-slate-100 px-4 py-3', highlight ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600')}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
