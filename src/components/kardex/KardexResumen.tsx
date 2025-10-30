'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Calendar, Package, TrendingUp, TrendingDown } from 'lucide-react'
import { kardexService } from '@/services/kardexService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function KardexResumen() {
  const [filters, setFilters] = useState({
    fecha_inicio: '',
    fecha_fin: ''
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['kardex-resumen', filters],
    queryFn: () => kardexService.getResumenKardex(filters)
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="card p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-gray-600">Cargando resumen KARDEX...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-red-600">Error al cargar el resumen KARDEX</p>
      </div>
    )
  }

  const resumen = data || {
    total_movimientos: 0,
    total_entradas: 0,
    total_salidas: 0,
    valor_total_entradas: 0,
    valor_total_salidas: 0,
    productos_afectados: 0,
    tipos_movimiento: {}
  }

  // Datos para gráficos
  const datosMovimientosPorTipo = Object.entries(resumen.tipos_movimiento).map(([tipo, cantidad]) => ({
    nombre: tipo,
    cantidad: cantidad as number,
    monto: 0 // No hay información de monto en tipos_movimiento
  }))

  const datosProductosMasMovimientos: Array<{nombre: string, movimientos: number}> = [] // No hay esta información en ResumenKardex

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Período</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.fecha_inicio}
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
              value={filters.fecha_fin}
              onChange={(e) => handleFilterChange('fecha_fin', e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ fecha_inicio: '', fecha_fin: '' })}
              className="btn-outline w-full"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Movimientos</p>
              <p className="text-2xl font-semibold text-gray-900">{resumen.total_movimientos}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Entradas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {datosMovimientosPorTipo.find(d => d.nombre.includes('Entrada'))?.cantidad || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Salidas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {datosMovimientosPorTipo.find(d => d.nombre.includes('Salida'))?.cantidad || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de movimientos por tipo */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Movimientos por Tipo</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosMovimientosPorTipo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#0066CC" name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de productos con más movimientos */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos con Más Movimientos</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosProductosMasMovimientos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nombre, movimientos }) => `${nombre}: ${movimientos}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="movimientos"
                >
                  {datosProductosMasMovimientos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla de productos con más movimientos */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Productos con Más Movimientos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Total Movimientos</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {datosProductosMasMovimientos.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td>
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        <Package className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.nombre}</p>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-sm">-</td>
                  <td>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                      {item.movimientos} movimientos
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

