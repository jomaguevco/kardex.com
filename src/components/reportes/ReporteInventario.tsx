'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Package, DollarSign, AlertTriangle, Download } from 'lucide-react'
import { reporteService } from '@/services/reporteService'
import { ReporteFilters } from '@/services/reporteService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ReporteInventario() {
  const [filters, setFilters] = useState<ReporteFilters>({
    stock_bajo: false
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['reporte-inventario', filters],
    queryFn: () => reporteService.getReporteInventario(filters)
  })

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleGenerarReporte = () => {
    // Esta función ya no es necesaria - el reporte se genera automáticamente
    // Se mantiene para compatibilidad pero no hace nada
  }

  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-gray-600">Generando reporte de inventario...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-600">Error al generar el reporte de inventario</p>
      </div>
    )
  }

  const reporte = (data as any) || {
    productos: [],
    estadisticas: {
      total_productos: 0,
      valor_total_inventario: 0,
      productos_stock_bajo: 0
    },
    productos_por_categoria: []
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros del Reporte</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solo Stock Bajo
            </label>
            <select
              value={filters.stock_bajo ? 'true' : 'false'}
              onChange={(e) => handleFilterChange('stock_bajo', e.target.value === 'true')}
              className="input-field"
            >
              <option value="false">Todos los productos</option>
              <option value="true">Solo stock bajo</option>
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={() => console.log('Exportar a PDF')}
              className="btn-outline"
              title="Exportar a PDF"
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reporte.estadisticas.total_productos}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Total Inventario</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${reporte.estadisticas.valor_total_inventario.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Productos Stock Bajo</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reporte.estadisticas.productos_stock_bajo}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de productos por categoría */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos por Categoría</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={reporte.productos_por_categoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ categoria, cantidad }) => `${categoria}: ${cantidad}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {reporte.productos_por_categoria.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Detalle de Productos ({reporte.productos.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Precio Compra</th>
                <th>Valor Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reporte.productos.slice(0, 15).map((producto: any) => (
                <tr key={producto.id} className="hover:bg-gray-50">
                  <td className="font-mono text-sm">{producto.codigo}</td>
                  <td>
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        <Package className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{producto.nombre}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-semibold">
                    {producto.stock_actual}
                  </td>
                  <td className="text-gray-600">
                    {producto.stock_minimo}
                  </td>
                  <td className="text-gray-600">
                    ${producto.precio_compra.toFixed(2)}
                  </td>
                  <td className="font-semibold text-green-600">
                    ${(producto.stock_actual * producto.precio_compra).toFixed(2)}
                  </td>
                  <td>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      producto.stock_actual <= producto.stock_minimo
                        ? 'bg-red-100 text-red-800'
                        : producto.stock_actual <= producto.stock_minimo * 2
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {producto.stock_actual <= producto.stock_minimo ? 'Stock Bajo' : 
                       producto.stock_actual <= producto.stock_minimo * 2 ? 'Stock Medio' : 'Stock Alto'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reporte.productos.length > 15 && (
          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Mostrando 15 de {reporte.productos.length} productos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
