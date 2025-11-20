'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, Calendar, Package, ArrowUp, ArrowDown, Minus, X } from 'lucide-react'
import { KardexFilters, MovimientoKardex } from '@/types'
import { kardexService } from '@/services/kardexService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import TableWrapper from '@/components/ui/TableWrapper'
import { cn } from '@/utils/cn'

export default function KardexTable() {
  const [filters, setFilters] = useState<KardexFilters>({
    page: 1,
    limit: 10,
    producto_id: undefined,
    fecha_inicio: '',
    fecha_fin: '',
    tipo_movimiento: undefined
  })

  const [selectedMovimiento, setSelectedMovimiento] = useState<MovimientoKardex | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['kardex', filters],
    queryFn: () => kardexService.getMovimientos(filters)
  })

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'salida':
        return <ArrowDown className="h-4 w-4 text-red-600" />
      case 'ajuste':
        return <Minus className="h-4 w-4 text-yellow-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'bg-green-100 text-green-800'
      case 'salida':
        return 'bg-red-100 text-red-800'
      case 'ajuste':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-gray-600">Cargando movimientos KARDEX...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-600">Error al cargar los movimientos KARDEX</p>
      </div>
    )
  }

  const movimientos = data?.movimientos || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              Producto ID
            </label>
            <input
              type="number"
              value={filters.producto_id || ''}
              onChange={(e) => handleFilterChange('producto_id', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field"
              placeholder="ID del producto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Movimiento
            </label>
            <select
              value={filters.tipo_movimiento || ''}
              onChange={(e) => handleFilterChange('tipo_movimiento', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field"
            >
              <option value="">Todos los tipos</option>
              <option value="1">Entrada por compra</option>
              <option value="2">Salida por venta</option>
              <option value="3">Ajuste de inventario</option>
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

      {/* Tabla de movimientos */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Movimientos KARDEX ({pagination?.total || 0})
          </h3>
        </div>

        <TableWrapper>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Total</th>
                <th>Referencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movimientos.map((movimiento) => (
                <tr key={movimiento.id} className="hover:bg-gray-50">
                  <td>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(movimiento.fecha_movimiento).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {(movimiento as any).producto?.nombre || 'Producto no encontrado'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(movimiento as any).producto?.codigo || ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center">
                      {getTipoIcon((movimiento as any).tipo_movimiento?.tipo || '')}
                      <span className={cn(
                        'ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full',
                        getTipoColor((movimiento as any).tipo_movimiento?.tipo || '')
                      )}>
                        {(movimiento as any).tipo_movimiento?.nombre || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="font-semibold">
                    {(movimiento as any).tipo_movimiento?.tipo === 'entrada' ? '+' : '-'}
                    {movimiento.cantidad}
                  </td>
                  <td className="text-gray-600">
                    ${movimiento.precio_unitario.toFixed(2)}
                  </td>
                  <td className="font-semibold text-gray-900">
                    ${movimiento.costo_total.toFixed(2)}
                  </td>
                  <td className="font-mono text-sm text-gray-500">
                    {movimiento.documento_referencia}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedMovimiento(movimiento as any)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>

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

      {/* Modal de detalles del movimiento */}
      {selectedMovimiento && (
        <div className="fixed inset-0 z-[9999] overflow-hidden bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="flex h-full w-full items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl max-h-[85vh] w-full mx-auto flex flex-col overflow-hidden">
              <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 px-6 pt-3 pb-3">
                <h3 className="text-sm font-semibold text-gray-900">Detalles del Movimiento</h3>
                <button
                  onClick={() => setSelectedMovimiento(null)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pl-10 sm:pl-16 pr-4 sm:pr-6 py-6 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Producto</label>
                <p className="text-gray-900">{(selectedMovimiento as any).producto?.nombre || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tipo de Movimiento</label>
                <p className="text-gray-900">{(selectedMovimiento as any).tipo_movimiento?.nombre || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Cantidad</label>
                <p className="text-gray-900">{selectedMovimiento.cantidad}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Precio Unitario</label>
                <p className="text-gray-900">${selectedMovimiento.precio_unitario.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total</label>
                <p className="text-gray-900">${selectedMovimiento.costo_total.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha</label>
                <p className="text-gray-900">{new Date(selectedMovimiento.fecha_movimiento).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Referencia</label>
                <p className="text-gray-900 font-mono">{selectedMovimiento.documento_referencia}</p>
              </div>
              {selectedMovimiento.observaciones && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Observaciones</label>
                  <p className="text-gray-900">{selectedMovimiento.observaciones}</p>
                </div>
              )}
              </div>
              
              <div className="flex-shrink-0 flex justify-end border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => setSelectedMovimiento(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
