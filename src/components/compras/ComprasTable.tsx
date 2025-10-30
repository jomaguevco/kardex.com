'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, Edit, X, Calendar, Truck, DollarSign } from 'lucide-react'
import { CompraFilters, Compra } from '@/types'
import { compraService } from '@/services/compraService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn'

export default function ComprasTable() {
  const [filters, setFilters] = useState<CompraFilters>({
    page: 1,
    limit: 10,
    fecha_inicio: '',
    fecha_fin: '',
    estado: ''
  })

  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['compras', filters],
    queryFn: () => compraService.getCompras(filters)
  })

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'bg-green-100 text-green-800'
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-gray-600">Cargando compras...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-600">Error al cargar las compras</p>
      </div>
    )
  }

  const compras = data?.compras || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.fecha_inicio || ''}
              onChange={(e) => handleFilterChange('fecha_inicio', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.fecha_fin || ''}
              onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.estado || ''}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              className="input-field"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ page: 1, limit: 10 })}
              className="btn-outline w-full"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de compras */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Compras ({pagination?.total || 0})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th>Factura</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Usuario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {compras.map((compra) => (
                <tr key={compra.id} className="hover:bg-gray-50">
                  <td className="font-mono text-sm">{compra.numero_factura}</td>
                  <td>
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <Truck className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {(compra as any).proveedor?.nombre || 'Proveedor no encontrado'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(compra as any).proveedor?.email || ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(compra.fecha_compra).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="font-semibold text-blue-600">
                    ${compra.total.toFixed(2)}
                  </td>
                  <td>
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      getEstadoColor(compra.estado)
                    )}>
                      {compra.estado}
                    </span>
                  </td>
                  <td>
                    <p className="text-sm text-gray-900">
                      {(compra as any).usuario?.nombre || 'Usuario no encontrado'}
                    </p>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedCompra(compra as any)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {compra.estado !== 'cancelada' && (
                        <button
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Cancelar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} resultados
              </div>
              <div className="flex items-center space-x-2">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page! - 1 }))}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md">
                  {pagination.page}
                </span>
                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page! + 1 }))}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles de la compra */}
      {selectedCompra && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detalles de la Compra</h3>
              <button
                onClick={() => setSelectedCompra(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Número de Factura</label>
                  <p className="text-gray-900 font-mono">{selectedCompra.numero_factura}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha</label>
                  <p className="text-gray-900">{new Date(selectedCompra.fecha_compra).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Proveedor</label>
                  <p className="text-gray-900">{(selectedCompra as any).proveedor?.nombre || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <span className={cn(
                    'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                    getEstadoColor(selectedCompra.estado)
                  )}>
                    {selectedCompra.estado}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Totales</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">${selectedCompra.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Descuento:</span>
                    <span className="font-semibold">${selectedCompra.descuento.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Impuesto:</span>
                    <span className="font-semibold">${selectedCompra.impuestos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-primary-600">${selectedCompra.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

