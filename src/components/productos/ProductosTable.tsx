'use client'

import { useQuery } from '@tanstack/react-query'
import { Edit, Trash2, Eye, Package, AlertTriangle } from 'lucide-react'
import { ProductoFilters, Producto } from '@/types'
import { productoService } from '@/services/productoService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import TableWrapper from '@/components/ui/TableWrapper'
import { cn } from '@/utils/cn'

interface ProductosTableProps {
  filters: ProductoFilters
  onFiltersChange?: (filters: ProductoFilters) => void
  onView?: (producto: Producto) => void
  onEdit?: (producto: Producto) => void
  onDelete?: (producto: Producto) => void
}

export default function ProductosTable({
  filters,
  onFiltersChange,
  onView,
  onEdit,
  onDelete
}: ProductosTableProps) {
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

  const currentPage = filters.page ?? pagination?.page ?? 1
  const currentLimit = filters.limit ?? pagination?.limit ?? 10

  const handlePageChange = (page: number) => {
    if (!pagination || !onFiltersChange) return
    const boundedPage = Math.min(Math.max(page, 1), pagination.totalPages)
    if (boundedPage === currentPage) return
    onFiltersChange({
      ...filters,
      page: boundedPage,
      limit: currentLimit
    })
  }

  const getStockStatus = (stockActual: number, stockMinimo: number) => {
    if (stockActual <= stockMinimo) {
      return { status: 'low', color: 'text-red-600', bgColor: 'bg-red-100' }
    } else if (stockActual <= stockMinimo * 2) {
      return { status: 'medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    }
    return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-100' }
  }

  return (
    <div className="card animate-fade-in">
      <div className="border-b border-slate-200 px-4 py-5 sm:px-6 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-lg font-bold text-slate-900">
          Lista de Productos <span className="text-indigo-600">({pagination?.total || 0})</span>
        </h3>
      </div>

      <TableWrapper>
        <table className="min-w-full divide-y divide-gray-200">
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
          <tbody className="divide-y divide-gray-200 bg-white">
            {productos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                  No se encontraron productos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              productos.map((producto, index) => {
                const stockStatus = getStockStatus(producto.stock_actual, producto.stock_minimo)

                return (
                  <tr 
                    key={producto.id} 
                    className="animate-fade-in transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="font-mono text-sm">{producto.codigo_interno}</td>
                    <td>
                      <div className="flex items-center">
                        <div className="mr-3 rounded-lg bg-gray-100 p-2">
                          <Package className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{producto.nombre}</p>
                          <p className="text-sm text-gray-500">
                            {producto.codigo_barras || producto.codigo_interno}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="font-semibold">
                      ${Number(producto.precio_venta ?? 0).toFixed(2)}
                    </td>
                    <td>
                      <div className="flex items-center">
                        <span
                          className={cn(
                            'rounded-full px-2 py-1 text-xs font-medium',
                            stockStatus.bgColor,
                            stockStatus.color
                          )}
                        >
                          {producto.stock_actual}
                        </span>
                        {stockStatus.status === 'low' && (
                          <AlertTriangle className="ml-2 h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Mín: {producto.stock_minimo}</p>
                    </td>
                    <td>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                          producto.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        )}
                      >
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => onView?.(producto)}
                          disabled={!onView}
                          className={cn(
                            'rounded-lg p-2 text-slate-400 transition-all duration-200',
                            onView ? 'hover:bg-slate-100 hover:text-slate-700 hover:scale-110' : 'cursor-not-allowed opacity-40'
                          )}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit?.(producto)}
                          disabled={!onEdit}
                          className={cn(
                            'rounded-lg p-2 text-slate-400 transition-all duration-200',
                            onEdit ? 'hover:bg-blue-100 hover:text-blue-600 hover:scale-110' : 'cursor-not-allowed opacity-40'
                          )}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete?.(producto)}
                          disabled={!onDelete}
                          className={cn(
                            'rounded-lg p-2 text-slate-400 transition-all duration-200',
                            onDelete ? 'hover:bg-rose-100 hover:text-rose-600 hover:scale-110' : 'cursor-not-allowed opacity-40'
                          )}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </TableWrapper>

      {pagination && pagination.totalPages > 1 && (
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
          <div className="flex flex-col items-center justify-between space-y-2 text-sm text-gray-700 sm:flex-row sm:space-y-0">
            <div>
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
              {pagination.total} resultados
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={pagination.page === 1 || !onFiltersChange}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="rounded-md bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
                {pagination.page}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={pagination.page === pagination.totalPages || !onFiltersChange}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
