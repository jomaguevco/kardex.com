'use client'

import { useState } from 'react'
import { Sparkles, ShoppingBag, Clock, CreditCard, Truck, AlertCircle, Package, CheckCircle } from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import PedidosTable from '@/components/pedidos/PedidosTable'
import PedidoDetalleModal from '@/components/pedidos/PedidoDetalleModal'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import pedidoService from '@/services/pedidoService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Pedido } from '@/services/pedidoService'
import toast from 'react-hot-toast'

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
  const queryClient = useQueryClient()
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [isDetalleOpen, setIsDetalleOpen] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState<string>('EN_PROCESO')

  // Obtener todos los pedidos para estadísticas
  const { data: todosLosPedidos } = useQuery({
    queryKey: ['pedidos', 'pendientes', 'TODOS'],
    queryFn: async () => {
      const response = await pedidoService.getPedidosPendientes({
        estado: undefined, // Todos los estados
        limit: 1000
      })
      return response.data || []
    }
  })

  // Obtener pedidos filtrados para la tabla
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pedidos', 'pendientes', filtroEstado],
    queryFn: async () => {
      const response = await pedidoService.getPedidosPendientes({
        estado: filtroEstado === 'TODOS' ? undefined : filtroEstado,
        limit: 1000
      })
      return response.data || []
    }
  })

  const pedidos = data || []
  const pedidosParaEstadisticas = todosLosPedidos || []

  const handleViewDetalle = (pedido: Pedido) => {
    setSelectedPedido(pedido)
    setIsDetalleOpen(true)
  }

  const handleCloseDetalle = () => {
    setIsDetalleOpen(false)
    setSelectedPedido(null)
    refetch()
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    refetch()
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
            Gestionar Envíos de Pedidos
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
            Gestiona el envío y entrega de pedidos pagados por los clientes
          </p>
        </div>
      </section>

      {/* Estadísticas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">En Proceso</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {pedidosParaEstadisticas.filter((p: Pedido) => p.estado === 'EN_PROCESO').length}
              </p>
            </div>
            <div className="rounded-xl bg-blue-100 p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">En Camino</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {pedidosParaEstadisticas.filter((p: Pedido) => p.estado === 'EN_CAMINO').length}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-100 p-3">
              <Truck className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Entregados</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {pedidosParaEstadisticas.filter((p: Pedido) => p.estado === 'ENTREGADO').length}
              </p>
            </div>
            <div className="rounded-xl bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {pedidosParaEstadisticas.length}
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
              onClick={() => setFiltroEstado('EN_PROCESO')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                filtroEstado === 'EN_PROCESO'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              En Proceso
            </button>
            <button
              onClick={() => setFiltroEstado('EN_CAMINO')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                filtroEstado === 'EN_CAMINO'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              En Camino
            </button>
            <button
              onClick={() => setFiltroEstado('ENTREGADO')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                filtroEstado === 'ENTREGADO'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Entregados
            </button>
            <button
              onClick={() => setFiltroEstado('CANCELADO')}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                filtroEstado === 'CANCELADO'
                  ? 'bg-gray-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Cancelados
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
        />
      )}

      {/* Modal de detalle */}
      {selectedPedido && (
        <PedidoDetalleModal
          pedido={selectedPedido}
          isOpen={isDetalleOpen}
          onClose={handleCloseDetalle}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  )
}

