'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import apiService from '@/services/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

type PeriodoOption = 6 | 12 | 24

export default function SalesChart() {
  const [periodo, setPeriodo] = useState<PeriodoOption>(6)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sales-chart-data', periodo],
    queryFn: async () => {
      const hoy = new Date()
      const datos: any[] = []

      for (let i = periodo - 1; i >= 0; i--) {
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

          const labelMes = periodo > 12 
            ? `${meses[fecha.getMonth()]} ${fecha.getFullYear().toString().slice(-2)}`
            : meses[fecha.getMonth()]

          datos.push({
            name: labelMes,
            ventas: Number(ventasRes.data?.total_monto || ventasRes?.total_monto || 0),
            compras: Number(comprasRes.data?.total_monto || comprasRes?.total_monto || 0)
          })
        } catch (err) {
          const labelMes = periodo > 12 
            ? `${meses[fecha.getMonth()]} ${fecha.getFullYear().toString().slice(-2)}`
            : meses[fecha.getMonth()]

          datos.push({
            name: labelMes,
            ventas: 0,
            compras: 0
          })
        }
      }

      return datos
    }
  })

  const handlePeriodoChange = (newPeriodo: PeriodoOption) => {
    setPeriodo(newPeriodo)
  }

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ventas vs Compras</h3>
        </div>
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

  // Calcular totales
  const totalVentas = data?.reduce((sum, item) => sum + item.ventas, 0) || 0
  const totalCompras = data?.reduce((sum, item) => sum + item.compras, 0) || 0

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ventas vs Compras</h3>
          <p className="text-xs text-slate-500 mt-1">
            Total: <span className="text-blue-600 font-medium">${totalVentas.toFixed(2)}</span> ventas, 
            <span className="text-orange-600 font-medium ml-1">${totalCompras.toFixed(2)}</span> compras
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => handlePeriodoChange(6)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              periodo === 6 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            6 meses
          </button>
          <button
            onClick={() => handlePeriodoChange(12)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              periodo === 12 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            12 meses
          </button>
          <button
            onClick={() => handlePeriodoChange(24)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              periodo === 24 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            24 meses
          </button>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }}
              interval={periodo > 12 ? 1 : 0}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Legend />
            <Bar dataKey="ventas" fill="#3b82f6" name="Ventas" radius={[4, 4, 0, 0]} />
            <Bar dataKey="compras" fill="#f97316" name="Compras" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
