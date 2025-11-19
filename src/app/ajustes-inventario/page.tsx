'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Package, Plus, CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import { ajusteInventarioService, TipoMovimiento, AjusteInventario } from '@/services/ajusteInventarioService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AjusteInventarioForm from '@/components/ajustes-inventario/AjusteInventarioForm'
import AjustesInventarioTable from '@/components/ajustes-inventario/AjustesInventarioTable'

export default function AjustesInventarioPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <AjustesInventarioContent />
      </Layout>
    </ProtectedRoute>
  )
}

function AjustesInventarioContent() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    estado_movimiento: '',
    tipo_movimiento: '',
    search: ''
  })

  const { data: tiposMovimiento, isLoading: loadingTipos } = useQuery({
    queryKey: ['tipos-movimiento'],
    queryFn: () => ajusteInventarioService.getTiposMovimiento()
  })

  const { data: ajustesData, isLoading: loadingAjustes } = useQuery({
    queryKey: ['ajustes-inventario', filters],
    queryFn: () => ajusteInventarioService.getAjustes(filters)
  })

  const handleSuccess = () => {
    setIsModalOpen(false)
    // Invalidar todas las queries relacionadas para refrescar la tabla
    queryClient.invalidateQueries({ queryKey: ['ajustes-inventario'] })
    queryClient.refetchQueries({ queryKey: ['ajustes-inventario', filters] })
    toast.success('Ajuste de inventario creado exitosamente')
  }

  const handleAprobar = async (id: number) => {
    try {
      await ajusteInventarioService.aprobarAjuste(id)
      toast.success('Ajuste aprobado exitosamente')
      queryClient.invalidateQueries({ queryKey: ['ajustes-inventario'] })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Error al aprobar ajuste')
    }
  }

  const handleRechazar = async (id: number) => {
    const motivo = window.prompt('Ingrese el motivo del rechazo:')
    if (!motivo) return

    try {
      await ajusteInventarioService.rechazarAjuste(id, motivo)
      toast.success('Ajuste rechazado')
      queryClient.invalidateQueries({ queryKey: ['ajustes-inventario'] })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Error al rechazar ajuste')
    }
  }

  const ajustes = ajustesData?.data || []
  const pagination = ajustesData?.pagination

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 px-6 py-8 text-white shadow-xl">
        <div className="absolute -right-12 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl lg:block" />
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              <Package className="mr-2 h-3.5 w-3.5" />
              Ajustes de Inventario
            </span>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Gestiona ajustes de stock con control KARDEX completo
            </h1>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">
              Realiza ajustes positivos, negativos, devoluciones y otros movimientos de inventario. Todos los ajustes se registran en el KARDEX con trazabilidad completa.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-600 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Plus className="mr-2 h-4 w-4" /> Nuevo Ajuste
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white/15 p-6 backdrop-blur-md">
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard 
                titulo="Ajustes Pendientes" 
                valor={ajustes.filter(a => a.estado_movimiento === 'PENDIENTE').length.toString()} 
                subtitulo="Requieren aprobación" 
                icon={Clock}
              />
              <MetricCard 
                titulo="Ajustes Aprobados" 
                valor={ajustes.filter(a => a.estado_movimiento === 'APROBADO').length.toString()} 
                subtitulo="Stock actualizado" 
                icon={CheckCircle}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="card flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 shadow-lg shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Historial de Ajustes</h2>
            <p className="text-sm text-slate-500">
              Visualiza, filtra y gestiona todos los ajustes de inventario realizados.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Plus className="mr-2 h-4 w-4" /> Nuevo Ajuste
          </button>
        </div>

        <div className="card overflow-hidden">
          <AjustesInventarioTable 
            ajustes={ajustes}
            pagination={pagination}
            filters={filters}
            onFilterChange={setFilters}
            onAprobar={handleAprobar}
            onRechazar={handleRechazar}
            isLoading={loadingAjustes}
          />
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 px-4 py-4 sm:py-10 backdrop-blur-sm">
          <div className="glass-card w-full max-w-6xl max-h-[90vh] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
            <div className="flex-shrink-0 mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Nuevo ajuste
                </span>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  Registrar ajuste de inventario
                </h2>
                <p className="text-xs text-slate-500">
                  Selecciona el tipo de movimiento, producto y cantidad. El ajuste se registrará en el KARDEX.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full bg-white/25 p-2 text-white transition hover:bg-white/40"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <AjusteInventarioForm 
                tiposMovimiento={tiposMovimiento || []}
                onSuccess={handleSuccess} 
                onCancel={() => setIsModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ titulo, valor, subtitulo, icon: Icon }: { titulo: string; valor: string; subtitulo: string; icon: any }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/20 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-white" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{titulo}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{valor}</p>
          <p className="text-xs text-white/70">{subtitulo}</p>
        </div>
      </div>
    </div>
  )
}

