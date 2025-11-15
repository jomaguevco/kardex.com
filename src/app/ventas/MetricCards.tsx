'use client'

import { useQuery } from '@tanstack/react-query'
import { ventaService } from '@/services/ventaService'

export default function MetricCards() {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const hoyISO = hoy.toISOString()

  const { data: ventasHoy } = useQuery({
    queryKey: ['ventas', 'hoy'],
    queryFn: async () => {
      const response = await ventaService.getVentas({
        fecha_inicio: hoyISO,
        fecha_fin: new Date().toISOString(),
        limit: 1000
      })
      return response
    }
  })

  const { data: todasVentas } = useQuery({
    queryKey: ['ventas', 'stats'],
    queryFn: async () => {
      const response = await ventaService.getVentas({ limit: 1000 })
      return response
    }
  })

  const ventas = (ventasHoy as any)?.ventas || []
  const todas = (todasVentas as any)?.ventas || []

  const ventasHoyTotal = ventas.reduce((sum: number, v: any) => sum + Number(v.total || 0), 0)
  const ventasHoyCount = ventas.length

  const todasVentasTotal = todas.reduce((sum: number, v: any) => sum + Number(v.total || 0), 0)
  const todasVentasCount = todas.length
  const ticketPromedio = todasVentasCount > 0 ? todasVentasTotal / todasVentasCount : 0

  const pendientes = todas.filter((v: any) => 
    v.estado?.toUpperCase() === 'PENDIENTE'
  ).length

  return (
    <div className="rounded-3xl bg-white/15 p-6 backdrop-blur-md">
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard 
          titulo="Ventas hoy" 
          valor={`$${ventasHoyTotal.toFixed(2)}`} 
          subtitulo={`${ventasHoyCount} ventas`} 
        />
        <MetricCard 
          titulo="Ticket promedio" 
          valor={`$${ticketPromedio.toFixed(2)}`} 
          subtitulo={`${todasVentasCount} ventas totales`} 
        />
        <MetricCard 
          titulo="Pendientes" 
          valor={pendientes.toString()} 
          subtitulo="Revisa estados en la tabla" 
        />
        <MetricCard 
          titulo="Facturas emitidas" 
          valor={todasVentasCount.toString()} 
          subtitulo="Descarga PDF al instante" 
        />
      </div>
    </div>
  )
}

function MetricCard({ titulo, valor, subtitulo }: { titulo: string; valor: string; subtitulo: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/20 p-4 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{titulo}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{valor}</p>
      <p className="text-xs text-white/70">{subtitulo}</p>
    </div>
  )
}

