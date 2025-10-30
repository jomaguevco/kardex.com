'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, DollarSign, Download, Package } from 'lucide-react'
import { reporteService } from '@/services/reporteService'
import { ReporteFilters } from '@/services/reporteService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function ReporteRentabilidad() {
  const [filters, setFilters] = useState<ReporteFilters>({
    fecha_inicio: '',
    fecha_fin: ''
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['reporte-rentabilidad', filters],
    queryFn: () => reporteService.getReporteRentabilidad(filters)
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleGenerarReporte = () => {
    console.log('Generando reporte de rentabilidad...')
  }

  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-gray-600">Generando reporte de rentabilidad...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-600">Error al generar el reporte de rentabilidad</p>
      </div>
    )
  }

  const reporte = (data as any) || {
    rentabilidad_por_producto: [],
    estadisticas_generales: {
      total_ingresos: 0,
      total_costos: 0,
      ganancia_total: 0,
      margen_general: 0
    }
  }

  // Preparar datos para gráfico
  const datosRentabilidad = reporte.rentabilidad_por_producto.slice(0, 10).map((item: any) => ({
    nombre: item.producto?.nombre || 'N/A',
    ganancia: item.ganancia_total,
    margen: item.margen_promedio
  }))

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Ingresos</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${Number(reporte.estadisticas_generales.total_ingresos).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Costos</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${Number(reporte.estadisticas_generales.total_costos).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ganancia Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${Number(reporte.estadisticas_generales.ganancia_total).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Margen General</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Number(reporte.estadisticas_generales.margen_general).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de rentabilidad por producto */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rentabilidad por Producto (Top 10)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosRentabilidad}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ganancia" fill="#0066CC" name="Ganancia" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de rentabilidad por producto */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Rentabilidad por Producto ({reporte.rentabilidad_por_producto.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th>Producto</th>
                <th>Cantidad Vendida</th>
                <th>Costo Total</th>
                <th>Ingreso Total</th>
                <th>Ganancia</th>
                <th>Margen %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reporte.rentabilidad_por_producto.slice(0, 15).map((item: any, index: number) => (
                <tr key={item.producto?.id || index} className="hover:bg-gray-50">
                  <td>
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        <Package className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.producto?.nombre || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{item.producto?.codigo || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-semibold">
                    {item.cantidad_vendida}
                  </td>
                  <td className="text-red-600">
                    ${Number(item.costo_total).toFixed(2)}
                  </td>
                  <td className="text-green-600">
                    ${Number(item.ingreso_total).toFixed(2)}
                  </td>
                  <td className={`font-semibold ${item.ganancia_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Number(item.ganancia_total).toFixed(2)}
                  </td>
                  <td>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.margen_promedio >= 30
                        ? 'bg-green-100 text-green-800'
                        : item.margen_promedio >= 15
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {Number(item.margen_promedio).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reporte.rentabilidad_por_producto.length > 15 && (
          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Mostrando 15 de {reporte.rentabilidad_por_producto.length} productos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
