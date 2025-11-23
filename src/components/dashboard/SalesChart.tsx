'use client'

import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import apiService from '@/services/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function SalesChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sales-chart-data'],
    queryFn: async () => {
      // Obtener datos de los últimos 6 meses
      const hoy = new Date()
      const datos: any[] = []

      for (let i = 5; i >= 0; i--) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
        const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
        const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0)
        const inicioStr = inicioMes.toISOString().split('T')[0]
        const finStr = finMes.toISOString().split('T')[0]

        try {
          const [ventasRes, comprasRes] = await Promise.all([
            apiService.get(`/ventas/estadisticas?fecha_inicio=${inicioStr}&fecha_fin=${finStr}`),
            apiService.get(`/compras/estadisticas?fecha_inicio=${inicioStr}&fecha_fin=${finStr}`)
          ])

          datos.push({
            name: meses[fecha.getMonth()],
            ventas: Number(ventasRes.data?.data?.total_monto || 0),
            compras: Number(comprasRes.data?.data?.total_monto || 0)
          })
        } catch (err) {
          datos.push({
            name: meses[fecha.getMonth()],
            ventas: 0,
            compras: 0
          })
        }
      }

      return datos
    }
  })

  if (isLoading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas vs Compras</h3>
        <div className="h-80 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas vs Compras</h3>
        <div className="h-80 flex items-center justify-center text-sm text-rose-600">
          Error al cargar datos del gráfico
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas vs Compras</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="ventas" fill="#0066CC" name="Ventas" />
            <Bar dataKey="compras" fill="#FF9900" name="Compras" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

