'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import pedidoService from '@/services/pedidoService'
import { ClipboardList, Loader2, Calendar, Package, Eye } from 'lucide-react'
import PedidoDetalleModalCliente from '@/components/pedidos/PedidoDetalleModalCliente'
import { Pedido } from '@/services/pedidoService'

export default function PedidosPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [isDetalleOpen, setIsDetalleOpen] = useState(false)

  const fetchPedidos = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Iniciando fetchPedidos...')
      const response = await pedidoService.getMisPedidos()
      console.log('📦 Respuesta completa de getMisPedidos:', response)
      console.log('📦 response.success:', response?.success)
      console.log('📦 response.data:', response?.data)
      console.log('📦 response.data length:', response?.data?.length)
      
      if (response && response.success) {
        const pedidosArray = Array.isArray(response.data) ? response.data : []
        console.log('✅ Pedidos encontrados:', pedidosArray.length)
        if (pedidosArray.length > 0) {
          console.log('📋 Primer pedido:', {
            id: pedidosArray[0].id,
            numero: pedidosArray[0].numero_pedido,
            estado: pedidosArray[0].estado,
            cliente_id: pedidosArray[0].cliente_id,
            usuario_id: pedidosArray[0].usuario_id
          })
        }
        setPedidos(pedidosArray)
      } else {
        console.warn('⚠️ Respuesta sin success o sin data:', response)
        setPedidos([])
      }
    } catch (error: any) {
      console.error('❌ Error al cargar pedidos:', error)
      console.error('❌ Error response:', error?.response)
      console.error('❌ Error data:', error?.response?.data)
      setPedidos([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      router.push('/')
      return
    }

    fetchPedidos()
    
    // Refrescar pedidos cada 5 segundos si no hay pedidos (para detectar nuevos)
    const interval = setInterval(() => {
      if (pedidos.length === 0) {
        console.log('Refrescando pedidos automáticamente...')
        fetchPedidos()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user, router, pedidos.length])

  // Refrescar cuando la página vuelva a estar visible (después de crear un pedido)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Página visible - refrescando pedidos...')
        fetchPedidos()
      }
    }

    const handleFocus = () => {
      console.log('Ventana enfocada - refrescando pedidos...')
      fetchPedidos()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isAuthenticated, user])

  const getEstadoBadge = (pedido: Pedido) => {
    // Si tiene fecha_envio, mostrar como EN_CAMINO para el cliente
    const estadoParaCliente = pedido.fecha_envio ? 'EN_CAMINO' : pedido.estado

    const badges: Record<string, string> = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      APROBADO: 'bg-blue-100 text-blue-800',
      PAGADO: 'bg-purple-100 text-purple-800',
      PROCESADO: 'bg-emerald-100 text-emerald-800',
      EN_CAMINO: 'bg-emerald-100 text-emerald-800',
      CANCELADO: 'bg-gray-100 text-gray-800',
      RECHAZADO: 'bg-red-100 text-red-800'
    }
    return badges[estadoParaCliente] || 'bg-slate-100 text-slate-800'
  }

  const getEstadoLabel = (pedido: Pedido) => {
    // Si tiene fecha_envio, mostrar como EN_CAMINO para el cliente
    if (pedido.fecha_envio) {
      return 'En camino'
    }

    const labels: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      APROBADO: 'Aprobado - Listo para pagar',
      PAGADO: 'Pagado - En espera de envío',
      PROCESADO: 'En camino',
      EN_CAMINO: 'En camino',
      CANCELADO: 'Cancelado',
      RECHAZADO: 'Rechazado'
    }
    return labels[pedido.estado] || pedido.estado
  }

  const handleViewDetalle = (pedido: Pedido) => {
    setSelectedPedido(pedido)
    setIsDetalleOpen(true)
  }

  const handleCloseDetalle = () => {
    setIsDetalleOpen(false)
    setSelectedPedido(null)
    fetchPedidos() // Refrescar pedidos después de cerrar
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mis Pedidos</h1>
        <p className="mt-2 text-slate-600">
          Gestiona y revisa el estado de tus pedidos
        </p>
      </div>

      {pedidos.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <ClipboardList className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No tienes pedidos registrados
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Realiza un pedido desde nuestro catálogo
          </p>
          <button
            onClick={() => router.push('/cliente-portal/catalogo')}
            className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            Ver Catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="glass-card rounded-2xl p-6 transition hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                      <ClipboardList className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Pedido {pedido.numero_pedido}
                      </h3>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-slate-600">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(pedido.fecha_pedido).toLocaleDateString('es-ES')}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoBadge(pedido)}`}>
                          {getEstadoLabel(pedido)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {pedido.detalles && pedido.detalles.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-slate-700 mb-2">
                        {pedido.detalles.length} producto(s)
                      </p>
                    </div>
                  )}

                  {pedido.observaciones && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-600">Observaciones:</p>
                      <p className="mt-1 text-sm text-slate-700">{pedido.observaciones}</p>
                    </div>
                  )}

                  {pedido.motivo_rechazo && (
                    <div className="mt-3 rounded-lg bg-red-50 p-3">
                      <p className="text-xs font-semibold text-red-600">Motivo de rechazo:</p>
                      <p className="mt-1 text-sm text-red-700">{pedido.motivo_rechazo}</p>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col items-end justify-between space-y-2">
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Total</p>
                    <p className="text-2xl font-bold text-primary-600">
                      S/ {Number(pedido.total || 0).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewDetalle(pedido)}
                    className="rounded-lg bg-indigo-100 px-4 py-2 text-indigo-600 transition hover:bg-indigo-200 flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-semibold">Ver Detalle</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalle */}
      {selectedPedido && (
        <PedidoDetalleModalCliente
          pedido={selectedPedido}
          isOpen={isDetalleOpen}
          onClose={handleCloseDetalle}
          onRefresh={fetchPedidos}
        />
      )}
    </div>
  )
}

