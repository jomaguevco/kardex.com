'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import DashboardStats from '@/components/dashboard/DashboardStats'
import SalesChart from '@/components/dashboard/SalesChart'
import RecentSales from '@/components/dashboard/RecentSales'
import LowStockProducts from '@/components/dashboard/LowStockProducts'
import { ArrowRight, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import monitorService from '@/services/monitorService'
import { MonitoreoTransaccion } from '@/types'

const quickActions = [
  {
    title: 'Registrar venta',
    description: 'Captura pagos y genera comprobantes al instante',
    href: '/ventas',
    color: 'from-blue-500 via-indigo-500 to-sky-400'
  },
  {
    title: 'Registrar compra',
    description: 'Actualiza el stock con cada nueva adquisicion',
    href: '/compras',
    color: 'from-emerald-500 via-emerald-600 to-teal-400'
  },
  {
    title: 'Gestionar inventario',
    description: 'Controla productos, categorias y stocks minimos',
    href: '/productos',
    color: 'from-orange-400 via-amber-500 to-orange-500'
  },
  {
    title: 'Ver reportes',
    description: 'Analiza indicadores y rendimiento del negocio',
    href: '/reportes',
    color: 'from-purple-500 via-indigo-500 to-blue-500'
  }
]

export default function DashboardPage() {
  const [monitorLogs, setMonitorLogs] = useState<MonitoreoTransaccion[]>([])
  const [monitorLoading, setMonitorLoading] = useState(false)
  const [monitorError, setMonitorError] = useState<string | null>(null)

  const loadMonitorLogs = async () => {
    try {
      setMonitorLoading(true)
      setMonitorError(null)
      const response = await monitorService.getTransacciones(6)
      const registros = Array.isArray((response as any)?.data) ? (response as any).data : response
      setMonitorLogs(Array.isArray(registros) ? registros : [])
    } catch (error: any) {
      setMonitorError(error?.message || 'No se pudieron obtener las transacciones monitorizadas')
    } finally {
      setMonitorLoading(false)
    }
  }

  useEffect(() => {
    loadMonitorLogs()
  }, [])

  return (
    <Layout>
      <div className="space-y-10 animate-fade-in">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 px-6 py-10 text-white shadow-xl">
          <div className="absolute -right-12 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl lg:block" />
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Panel inteligente
              </span>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Visualiza la salud de tu negocio con un tablero moderno
              </h1>
              <p className="max-w-xl text-sm text-white/80 sm:text-base">
                Monitorea ventas, anticipa compras y recibe alertas de inventario en una interfaz refinada con animaciones suaves y datos en vivo.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/ventas"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-900/25 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Crear nueva venta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/reportes"
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/15"
                >
                  Explorar reportes
                </Link>
              </div>
            </div>

            <div className="hidden justify-end lg:flex">
              <div className="glass-card floating rounded-3xl p-6">
                <Image
                  src="/illustrations/dashboard-hero.svg"
                  alt="Ilustracion de metricas"
                  width={360}
                  height={280}
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <DashboardStats />

        <section className="grid gap-6 md:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${action.color} p-6 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{action.title}</h3>
                <p className="text-sm text-white/80">{action.description}</p>
              </div>
              <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-white/80 transition group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-10" />
            </Link>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <SalesChart />
          <RecentSales />
        </section>

        <LowStockProducts />

        <section className="glass-card rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Ultimas transacciones monitorizadas</h2>
              <p className="text-sm text-slate-500">
                Observa los procesos automaticos del sistema (ventas, compras y movimientos clave).
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadMonitorLogs}
                disabled={monitorLoading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${monitorLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>

          {monitorError && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {monitorError}
            </p>
          )}

          {!monitorLoading && !monitorError && monitorLogs.length === 0 && (
            <p className="mt-3 text-sm text-slate-500">No hay transacciones registradas todavia.</p>
          )}

          {monitorLoading && (
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando transacciones...
            </div>
          )}

          <div className="mt-6 space-y-3">
            {monitorLogs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className={`rounded-2xl border p-4 transition ${
                  log.estado === 'EXITO'
                    ? 'border-emerald-100 bg-emerald-50/70 text-emerald-900'
                    : 'border-rose-100 bg-rose-50/70 text-rose-900'
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {log.modulo} - {log.accion}
                    </p>
                    <p className="text-xs text-slate-500">
                      Ref: {log.referencia || 'N/D'} - ID solicitud: {log.request_id || 'N/D'}
                    </p>
                  </div>
                  <span
                    className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${
                      log.estado === 'EXITO'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {log.estado}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                  <div>
                    <span className="font-medium text-slate-500">Inicio:</span>{' '}
                    {new Date(log.iniciado_en).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Fin:</span>{' '}
                    {log.completado_en ? new Date(log.completado_en).toLocaleString() : 'En proceso'}
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Duracion:</span>{' '}
                    {log.duracion_ms ? `${log.duracion_ms} ms` : 'N/D'}
                  </div>
                  <div>
                    <span className="font-medium text-slate-500">Mensaje:</span>{' '}
                    {log.mensaje || 'Sin observaciones adicionales'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}
