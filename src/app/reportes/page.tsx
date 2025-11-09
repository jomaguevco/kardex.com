'use client'

import { useEffect, useState } from 'react'
import {
  Sparkles,
  PieChart,
  ShoppingBag,
  Boxes,
  Coins,
  BarChart3,
  ArrowRight,
  FileBarChart,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { reporteService } from '@/services/reporteService'

 type ReporteTab = 'ventas' | 'compras' | 'inventario' | 'rentabilidad' | 'movimientos'

const tabs: { id: ReporteTab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'ventas',
    label: 'Reporte de ventas',
    icon: <PieChart className="h-4 w-4" />,
    description: 'Estadísticas de facturación y clientes.'
  },
  {
    id: 'compras',
    label: 'Reporte de compras',
    icon: <ShoppingBag className="h-4 w-4" />,
    description: 'Controla tus órdenes de abastecimiento.'
  },
  {
    id: 'inventario',
    label: 'Reporte de inventario',
    icon: <Boxes className="h-4 w-4" />,
    description: 'Valor y rotación de productos.'
  },
  {
    id: 'rentabilidad',
    label: 'Reporte de rentabilidad',
    icon: <Coins className="h-4 w-4" />,
    description: 'Ingresos, costos y márgenes.'
  },
  {
    id: 'movimientos',
    label: 'Movimientos KARDEX',
    icon: <BarChart3 className="h-4 w-4" />,
    description: 'Entradas y salidas del inventario.'
  }
]

export default function ReportesPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <ReportesContent />
      </Layout>
    </ProtectedRoute>
  )
}

function ReportesContent() {
  const [activeTab, setActiveTab] = useState<ReporteTab>('ventas')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  const [reporteVentas, setReporteVentas] = useState<any>(null)
  const [reporteCompras, setReporteCompras] = useState<any>(null)
  const [reporteInventario, setReporteInventario] = useState<any>(null)
  const [reporteRentabilidad, setReporteRentabilidad] = useState<any>(null)
  const [reporteMovimientos, setReporteMovimientos] = useState<any>(null)

  const cargarReporte = async (tab: ReporteTab = activeTab) => {
    try {
      setIsLoading(true)
      setError(null)
      switch (tab) {
        case 'ventas': {
          const data = await reporteService.getReporteVentas({
            fecha_inicio: fechaInicio || undefined,
            fecha_fin: fechaFin || undefined
          })
          setReporteVentas(data)
          break
        }
        case 'compras': {
          const data = await reporteService.getReporteCompras({
            fecha_inicio: fechaInicio || undefined,
            fecha_fin: fechaFin || undefined
          })
          setReporteCompras(data)
          break
        }
        case 'inventario': {
          const data = await reporteService.getReporteInventario({})
          setReporteInventario(data)
          break
        }
        case 'rentabilidad': {
          const data = await reporteService.getReporteRentabilidad({
            fecha_inicio: fechaInicio || undefined,
            fecha_fin: fechaFin || undefined
          })
          setReporteRentabilidad(data)
          break
        }
        case 'movimientos': {
          const data = await reporteService.getReporteMovimientos({
            fecha_inicio: fechaInicio || undefined,
            fecha_fin: fechaFin || undefined
          })
          setReporteMovimientos(data)
          break
        }
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Error al cargar el reporte'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarReporte()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const requiresFecha = ['ventas', 'compras', 'rentabilidad', 'movimientos'].includes(activeTab)

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 px-6 py-10 text-white shadow-xl">
        <div className="absolute -right-12 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl lg:block" />
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Inteligencia comercial
            </span>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Visualiza el desempeño del negocio con reportes cohesivos y listos para compartir
            </h1>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">
              Accede a métricas de ventas, compras, inventario y rentabilidad con la misma estética refinada del dashboard. Exporta, filtra y toma decisiones con confianza.
            </p>
            <div className="inline-flex items-center rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white/90">
              <FileBarChart className="mr-2 h-4 w-4" /> Reportes sincronizados con el backend en tiempo real
            </div>
          </div>

          <div className="rounded-3xl bg-white/15 p-6 backdrop-blur-md">
            <div className="grid gap-4 sm:grid-cols-2">
              <HeroMetric title="Snapshots al día" description="Consulta filtros por rango de fechas" />
              <HeroMetric title="Exportación rápida" description="Usa las métricas para presentaciones" />
              <HeroMetric title="Alertas de stock" description="Integra con el módulo de inventario" />
              <HeroMetric title="KPIs clave" description="Ticket promedio, márgenes y más" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="card overflow-hidden">
          <nav className="flex flex-wrap gap-2 border-b border-slate-200 bg-white/70 px-4 py-3">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-indigo-50/60 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              )
            })}
          </nav>

          <div className="space-y-6 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {tabs.find((tab) => tab.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-slate-500">
                  {tabs.find((tab) => tab.id === activeTab)?.description}
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
              >
                Generar PDF <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {requiresFecha && (
              <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-[repeat(3,minmax(0,1fr))]">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(event) => setFechaInicio(event.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha fin</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(event) => setFechaFin(event.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => cargarReporte()}
                    disabled={isLoading}
                    className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? 'Actualizando...' : 'Aplicar filtros'}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="py-20 text-center text-sm text-slate-500">
                <LoadingSpinner size="lg" />
                <p className="mt-3">Cargando reporte...</p>
              </div>
            ) : (
              <ReportContent
                tab={activeTab}
                reporteVentas={reporteVentas}
                reporteCompras={reporteCompras}
                reporteInventario={reporteInventario}
                reporteRentabilidad={reporteRentabilidad}
                reporteMovimientos={reporteMovimientos}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function ReportContent({
  tab,
  reporteVentas,
  reporteCompras,
  reporteInventario,
  reporteRentabilidad,
  reporteMovimientos
}: any) {
  switch (tab as ReporteTab) {
    case 'ventas':
      return <ReporteVentas data={reporteVentas} />
    case 'compras':
      return <ReporteCompras data={reporteCompras} />
    case 'inventario':
      return <ReporteInventario data={reporteInventario} />
    case 'rentabilidad':
      return <ReporteRentabilidad data={reporteRentabilidad} />
    case 'movimientos':
      return <ReporteMovimientos data={reporteMovimientos} />
    default:
      return null
  }
}

function HeroMetric({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/20 p-4 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/85">{title}</p>
      <p className="mt-2 text-xs text-white/75">{description}</p>
    </div>
  )
}

function StatCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'warning' }) {
  const classes = {
    default: 'bg-slate-50 text-slate-900',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700'
  }[tone]

  return (
    <div className={`rounded-2xl border border-slate-100 px-4 py-3 ${classes}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  )
}

function ReporteVentas({ data }: { data: any }) {
  if (!data) {
    return <EmptyState />
  }

  const stats = data.estadisticas || {}

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total ventas" value={`$${Number(stats.total_ventas || 0).toFixed(2)}`} />
        <StatCard label="Cantidad" value={`${stats.cantidad_ventas || 0} ventas`} />
        <StatCard label="Ticket promedio" value={`$${Number(stats.promedio_venta || 0).toFixed(2)}`} />
        <StatCard label="Clientes" value={`${data.resumen_clientes?.total_clientes || 0}`} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Factura</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {(data.ventas || []).map((venta: any) => (
              <tr key={venta.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{venta.numero_factura}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{venta.cliente?.nombre || 'Cliente no registrado'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(venta.fecha_venta).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">${Number(venta.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReporteCompras({ data }: { data: any }) {
  if (!data) {
    return <EmptyState />
  }

  const stats = data.estadisticas || {}

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total compras" value={`$${Number(stats.total_compras || 0).toFixed(2)}`} />
        <StatCard label="Órdenes" value={`${stats.cantidad_compras || 0}`} />
        <StatCard label="Ticket promedio" value={`$${Number(stats.promedio_compra || 0).toFixed(2)}`} />
        <StatCard label="Proveedores" value={`${data.resumen_proveedores?.total_proveedores || 0}`} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Factura</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {(data.compras || []).map((compra: any) => (
              <tr key={compra.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{compra.numero_factura}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{compra.proveedor?.nombre || 'Proveedor no registrado'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(compra.fecha_compra).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">${Number(compra.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReporteInventario({ data }: { data: any }) {
  if (!data) {
    return <EmptyState />
  }

  const stats = data.estadisticas || {}

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Productos" value={`${stats.total_productos || 0}`} />
        <StatCard label="Valor inventario" value={`$${Number(stats.valor_total_inventario || 0).toFixed(2)}`} />
        <StatCard label="Stock bajo" value={`${stats.productos_stock_bajo || 0}`} tone="warning" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Producto</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Stock actual</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Stock mínimo</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Precio compra</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Valor total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {(data.productos || []).slice(0, 80).map((producto: any) => {
              const isLow = producto.stock_actual <= producto.stock_minimo
              return (
                <tr key={producto.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-700">{producto.nombre}</td>
                  <td
                    className={`px-6 py-4 text-right text-sm font-semibold ${
                      isLow ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {producto.stock_actual}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">{producto.stock_minimo}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">${Number(producto.precio_compra).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                    ${(Number(producto.stock_actual) * Number(producto.precio_compra)).toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReporteRentabilidad({ data }: { data: any }) {
  if (!data) {
    return <EmptyState />
  }

  const stats = data.estadisticas_generales || {}

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ingresos" value={`$${Number(stats.total_ingresos || 0).toFixed(2)}`} />
        <StatCard label="Costos" value={`$${Number(stats.total_costos || 0).toFixed(2)}`} />
        <StatCard label="Ganancia" value={`$${Number(stats.ganancia_total || 0).toFixed(2)}`} tone="success" />
        <StatCard label="Margen" value={`${Number(stats.margen_general || 0).toFixed(2)}%`} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Producto</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Cant. vendida</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Ingresos</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Costos</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Ganancia</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Margen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {(data.rentabilidad_por_producto || []).slice(0, 80).map((item: any, index: number) => {
              const ganancia = Number(item.ganancia_total || 0)
              const margen = Number(item.margen_promedio || 0)
              return (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-700">{item.producto?.nombre || 'Producto no registrado'}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">{Number(item.cantidad_vendida || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">${Number(item.ingreso_total || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">${Number(item.costo_total || 0).toFixed(2)}</td>
                  <td
                    className={`px-6 py-4 text-right text-sm font-semibold ${
                      ganancia >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    ${ganancia.toFixed(2)}
                  </td>
                  <td
                    className={`px-6 py-4 text-right text-sm font-semibold ${
                      margen >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {margen.toFixed(2)}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReporteMovimientos({ data }: { data: any }) {
  if (!data) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Los movimientos sincronizan automáticamente las existencias y alimentan el dashboard.
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Movimiento</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Cantidad</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Stock anterior</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Stock nuevo</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Costo total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {(data.movimientos || []).slice(0, 120).map((movimiento: any) => (
              <tr key={movimiento.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(movimiento.fecha_movimiento).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{movimiento.producto?.nombre || 'Producto no registrado'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{movimiento.tipo_movimiento}</td>
                <td className="px-6 py-4 text-right text-sm text-slate-500">{movimiento.cantidad}</td>
                <td className="px-6 py-4 text-right text-sm text-slate-500">{movimiento.stock_anterior}</td>
                <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">{movimiento.stock_nuevo}</td>
                <td className="px-6 py-4 text-right text-sm text-slate-500">${Number(movimiento.costo_total || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-6 py-16 text-center text-sm text-slate-500">
      Aún no hay información disponible para este reporte en el rango seleccionado.
    </div>
  )
}
