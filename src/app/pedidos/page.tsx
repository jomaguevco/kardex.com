'use client'

import { useState } from 'react'
import { Sparkles, ShoppingBag, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import PedidosTable from '@/components/pedidos/PedidosTable'
import PedidoDetalleModal from '@/components/pedidos/PedidoDetalleModal'
import { useQuery } from '@tanstack/react-query'
import pedidoService from '@/services/pedidoService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Pedido } from '@/services/pedidoService'

export default function PedidosPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <PedidosContent />
      </Layout>
    </ProtectedRoute>
  )
}

function PedidosContent() {
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [isDetalleOpen, setIsDetalleOpen] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<string>('PENDIENTE')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pedidos', 'pendientes', filtroEstado],
    queryFn: async () => {
      const response = await pedidoService.getPedidosPendientes()
      // Filtrar por estado si es necesario
      if (filtroEstado === 'TODOS') {
        return response.data || []
      }
      return (response.data || []).filter((p: Pedido) => p.estado === filtroEstado)
    }
  })

  const pedidos = data || []

  const handleViewDetalle = (pedido: Pedido) => {
    setSelectedPedido(pedido)
    setIsDetalleOpen(true)
  }

  const handleCloseDetalle = () => {
    setIsDetalleOpen(false)
    setSelectedPedido(null)
    refetch()
  }

  const handleAprobar = async (pedidoId: number) => {
    try {
      await pedidoService.aprobarPedido(pedidoId)
      refetch()
      handleCloseDetalle()
    } catch (error: any) {
      console.error('Error al aprobar pedido:', error)
    }
  }

  const handleRechazar = async (pedidoId: number, motivo: string) => {
    try {
      await pedidoService.rechazarPedido(pedidoId, { motivo_rechazo: motivo })
      refetch()
      handleCloseDetalle()
    } catch (error: any) {
      console.error('Error al rechazar pedido:', error)
    }
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 py-8 text-white shadow-xl">
        <div className="absolute -right-12 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl lg:block" />
        <div className="relative">
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
            <ShoppingBag className="mr-2 h-3.5 w-3.5" />
            Gestión de Pedidos
          </span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
            Aprobar y Gestionar Pedidos
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
            Revisa, aprueba o rechaza los pedidos realizados por los clientes
          </p>
        </div>
      </section>

      {/* Estadísticas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pendientes</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {pedidos.filter((p: Pedido) => p.estado === 'PENDIENTE').length}
              </p>
            </div>
            <div className="rounded-xl bg-amber-100 p-3">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Aprobados</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {pedidos.filter((p: Pedido) => p.estado === 'APROBADO' || p.estado === 'PROCESADO').length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-100 p-3">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Rechazados</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {pedidos.filter((p: Pedido) => p.estado === 'RECHAZADO').length}
              </p>
            </div>
            <div className="rounded-xl bg-red-100 p-3">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {pedidos.length}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-100 p-3">
              <AlertCircle className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Filtros</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroEstado('TODOS')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                filtroEstado === 'TODOS'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroEstado('PENDIENTE')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                filtroEstado === 'PENDIENTE'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFiltroEstado('APROBADO')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                filtroEstado === 'APROBADO'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Aprobados
            </button>
            <button
              onClick={() => setFiltroEstado('RECHAZADO')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                filtroEstado === 'RECHAZADO'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Rechazados
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de pedidos */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg font-semibold text-slate-900">
            Error al cargar pedidos
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {(error as any)?.message || 'Ocurrió un error inesperado'}
          </p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-slate-300" />
          <p className="mt-4 text-lg font-semibold text-slate-900">
            No hay pedidos {filtroEstado !== 'TODOS' ? filtroEstado.toLowerCase() : ''}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Los pedidos pendientes aparecerán aquí cuando los clientes realicen pedidos
          </p>
        </div>
      ) : (
        <PedidosTable
          pedidos={pedidos}
          onViewDetalle={handleViewDetalle}
          onAprobar={handleAprobar}
          onRechazar={handleRechazar}
        />
      )}

      {/* Modal de detalle */}
      {selectedPedido && (
        <PedidoDetalleModal
          pedido={selectedPedido}
          isOpen={isDetalleOpen}
          onClose={handleCloseDetalle}
          onAprobar={handleAprobar}
          onRechazar={handleRechazar}
        />
      )}
    </div>
  )
}

