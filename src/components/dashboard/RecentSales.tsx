'use client'

import { useQuery } from '@tanstack/react-query'
import { Clock, DollarSign } from 'lucide-react'
import { ventaService } from '@/services/ventaService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function RecentSales() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['recent-sales'],
    queryFn: () => ventaService.getVentas({ page: 1, limit: 5 }),
    refetchInterval: 30000 // Refrescar cada 30 segundos
  })

  if (isLoading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas Recientes</h3>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="sm" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas Recientes</h3>
        <div className="text-sm text-rose-600">
          Error al cargar ventas recientes
        </div>
      </div>
    )
  }

  const ventas = (data as any)?.ventas || []

  if (ventas.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas Recientes</h3>
        <div className="text-sm text-slate-500 text-center py-8">
          No hay ventas recientes
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas Recientes</h3>
      <div className="space-y-4">
        {ventas.map((venta: any) => (
          <div key={venta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{venta.cliente?.nombre || 'Cliente no registrado'}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(venta.fecha_venta).toLocaleString('es-ES')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">${Number(venta.total || 0).toFixed(2)}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                venta.estado?.toUpperCase() === 'PROCESADA' 
                  ? 'bg-green-100 text-green-800' 
                  : venta.estado?.toUpperCase() === 'PENDIENTE'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {venta.estado || 'Sin estado'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

