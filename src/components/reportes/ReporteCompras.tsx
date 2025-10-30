'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Calendar, DollarSign, ShoppingBag, Download } from 'lucide-react'
import { reporteService } from '@/services/reporteService'
import { ReporteFilters } from '@/services/reporteService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ReporteCompras() {
  const [filters, setFilters] = useState<ReporteFilters>({
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'completada'
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['reporte-compras', filters],
    queryFn: () => reporteService.getReporteCompras(filters)
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleGenerarReporte = () => {
    console.log('Generando reporte de compras...')
  }

  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-gray-600">Generando reporte de compras...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-600">Error al generar el reporte de compras</p>
      </div>
    )
  }

  const reporte = (data as any) || {
    compras: [],
    estadisticas: {
      total_compras: 0,
      cantidad_compras: 0,
      promedio_compra: 0
    },
    compras_por_dia: []
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros del Reporte</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="flex items-end space-x-2">
            <button
              onClick={handleGenerarReporte}
              className="btn-primary flex-1"
            >
              Generar Reporte
            </button>
            <button
              onClick={() => console.log('Exportar a PDF')}
              className="btn-outline"
              title="Exportar a PDF"
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
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Compras</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${reporte.estadisticas.total_compras.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cantidad Compras</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reporte.estadisticas.cantidad_compras}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio por Compra</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${reporte.estadisticas.promedio_compra.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de compras por día */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compras por Día</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reporte.compras_por_dia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#FF9900" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de compras */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Detalle de Compras ({reporte.compras.length})
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reporte.compras.slice(0, 10).map((compra: any) => (
                <tr key={compra.id} className="hover:bg-gray-50">
                  <td className="font-mono text-sm">{compra.numero_factura}</td>
                  <td>{compra.proveedor?.nombre || 'N/A'}</td>
                  <td>{new Date(compra.fecha).toLocaleDateString()}</td>
                  <td className="font-semibold text-blue-600">
                    ${compra.total.toFixed(2)}
                  </td>
                  <td>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      compra.estado === 'completada' 
                        ? 'bg-green-100 text-green-800' 
                        : compra.estado === 'pendiente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {compra.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reporte.compras.length > 10 && (
          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Mostrando 10 de {reporte.compras.length} compras
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
