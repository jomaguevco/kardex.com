'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Edit, Trash2, Eye, Package, AlertTriangle, X } from 'lucide-react'
import { ProductoFilters, Producto } from '@/types'
import { productoService } from '@/services/productoService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn'

interface ProductosTableProps {
  filters: ProductoFilters
}

export default function ProductosTable({ filters }: ProductosTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['productos', filters],
    queryFn: () => productoService.getProductos(filters)
  })

  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-gray-600">Cargando productos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-600">Error al cargar los productos</p>
      </div>
    )
  }

  const productos = data?.productos || []
  const pagination = data?.pagination

  const getStockStatus = (stockActual: number, stockMinimo: number) => {
    if (stockActual <= stockMinimo) {
      return { status: 'low', color: 'text-red-600', bgColor: 'bg-red-100' }
    } else if (stockActual <= stockMinimo * 2) {
      return { status: 'medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    } else {
      return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' }
    }
  }

  return (
    <div className="card">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Lista de Productos ({pagination?.total || 0})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="table min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Precio Venta</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map((producto) => {
              const stockStatus = getStockStatus(producto.stock_actual, producto.stock_minimo)
              
              return (
                <tr key={producto.id} className="hover:bg-gray-50">
                  <td className="font-mono text-sm">{producto.codigo_interno}</td>
                  <td>
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        <Package className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{producto.nombre}</p>
                        <p className="text-sm text-gray-500">{producto.codigo_barras || producto.codigo_interno}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-semibold">${Number(producto.precio_venta).toFixed(2)}</td>
                  <td>
                    <div className="flex items-center">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', stockStatus.bgColor, stockStatus.color)}>
                        {producto.stock_actual}
                      </span>
                      {stockStatus.status === 'low' && (
                        <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Mín: {producto.stock_minimo}</p>
                  </td>
                  <td>
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                      producto.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    )}>
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedProduct(producto as any)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="text-sm text-gray-700">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} resultados
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md">
                {pagination.page}
              </span>
              <button
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles del producto */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detalles del Producto</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Código Interno</label>
                <p className="text-gray-900">{selectedProduct.codigo_interno}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-gray-900">{selectedProduct.nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Precio Venta</label>
                <p className="text-gray-900">${Number(selectedProduct.precio_venta).toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Stock Actual</label>
                <p className="text-gray-900">{selectedProduct.stock_actual}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Stock Mínimo</label>
                <p className="text-gray-900">{selectedProduct.stock_minimo}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
