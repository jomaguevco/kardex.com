'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import pedidoService from '@/services/pedidoService'
import { ClipboardList, Loader2, Calendar, Package } from 'lucide-react'

export default function PedidosPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, string> = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      APROBADO: 'bg-green-100 text-green-800',
      PROCESADO: 'bg-blue-100 text-blue-800',
      CANCELADO: 'bg-gray-100 text-gray-800',
      RECHAZADO: 'bg-red-100 text-red-800'
    }
    return badges[estado] || 'bg-slate-100 text-slate-800'
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
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getEstadoBadge(pedido.estado)}`}>
                          {pedido.estado}
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

                <div className="ml-4 text-right">
                  <p className="text-sm text-slate-600">Total</p>
                  <p className="text-2xl font-bold text-primary-600">
                    S/ {Number(pedido.total || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

