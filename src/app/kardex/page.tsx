'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, PackageSearch, Filter, ArrowUpRight, Layers, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { kardexService, MovimientoKardex, KardexProductoResponse } from '@/services/kardexService'
import { productoService, Producto } from '@/services/productoService'

export default function KardexPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <KardexContent />
      </Layout>
    </ProtectedRoute>
  )
}

function KardexContent() {
  const router = useRouter()
  const [movimientos, setMovimientos] = useState<MovimientoKardex[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [kardexProducto, setKardexProducto] = useState<KardexProductoResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConsulting, setIsConsulting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState({ producto_id: '', fecha_inicio: '', fecha_fin: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [movimientosResponse, productosResponse] = await Promise.all([
        kardexService.getMovimientos({ limit: 80 }),
        productoService.getProductos({ limit: 150 })
      ])
      setMovimientos(movimientosResponse.movimientos || [])
      setProductos(productosResponse.productos || [])
    } catch (err: any) {
      const message = err?.message || 'No se pudieron cargar los movimientos'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const cargarKardexProducto = async (productoId: number) => {
    try {
      setIsConsulting(true)
      const producto = productos.find((p) => p.id === productoId)
      if (!producto) {
        toast.error('No encontramos el producto seleccionado')
        return
      }
      setProductoSeleccionado(producto)
      const kardex = await kardexService.getKardexProducto(productoId, {
        fecha_inicio: filtros.fecha_inicio || undefined,
        fecha_fin: filtros.fecha_fin || undefined
      })
      setKardexProducto(kardex)
    } catch (err: any) {
      const message = err?.message || 'No se pudo consultar el KARDEX del producto'
      toast.error(message)
      setError(message)
    } finally {
      setIsConsulting(false)
    }
  }

  const resumenMovimientos = useMemo(() => {
    const entradas = movimientos.filter((mov) => mov.tipo_movimiento.includes('ENTRADA')).length
    const salidas = movimientos.filter((mov) => mov.tipo_movimiento.includes('SALIDA')).length
    const productosUnicos = new Set(movimientos.map((mov) => mov.producto_id)).size
    return { entradas, salidas, productosUnicos }
  }, [movimientos])

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 px-6 py-10 text-white shadow-xl">
        <div className="absolute -right-12 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl lg:block" />
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Control de inventario en vivo
            </span>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Consulta movimientos de inventario con la misma estética refinada del dashboard
            </h1>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">
              Filtra por producto, obtén resúmenes y visualiza el historial KARDEX para tomar decisiones rápidas sobre stock, compras y transferencias.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => router.push('/productos')}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-purple-600 shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <ArrowUpRight className="h-4 w-4" /> Administrar productos
              </button>
              <div className="inline-flex items-center rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white/90">
                <PackageSearch className="mr-2 h-4 w-4" /> Integrado con reportes y productos
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/15 p-6 backdrop-blur-md">
            <div className="grid gap-4 sm:grid-cols-3">
              <HeroStat title="Entradas" value={resumenMovimientos.entradas} tone="success" />
              <HeroStat title="Salidas" value={resumenMovimientos.salidas} tone="warning" />
              <HeroStat title="Productos" value={resumenMovimientos.productosUnicos} tone="neutral" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="card space-y-6 p-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Consulta personalizada</h2>
              <p className="text-sm text-slate-500">Selecciona un producto y acota por rango de fechas para ver su historial detallado.</p>
            </div>
            <button
              onClick={() => router.push('/productos')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            >
              Administrar productos <ArrowUpRight className="h-4 w-4" />
            </button>
          </header>

          <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))_auto]">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Filter className="h-3.5 w-3.5" /> Producto
              </label>
              <select
                value={filtros.producto_id}
                onChange={(event) => setFiltros({ ...filtros, producto_id: event.target.value })}
                className="input-field mt-1"
              >
                <option value="">Selecciona un producto</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} · Stock {producto.stock_actual}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha inicio</label>
              <input
                type="date"
                value={filtros.fecha_inicio}
                onChange={(event) => setFiltros({ ...filtros, fecha_inicio: event.target.value })}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha fin</label>
              <input
                type="date"
                value={filtros.fecha_fin}
                onChange={(event) => setFiltros({ ...filtros, fecha_fin: event.target.value })}
                className="input-field mt-1"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => filtros.producto_id && cargarKardexProducto(Number(filtros.producto_id))}
                disabled={!filtros.producto_id || isConsulting}
                className="btn-primary inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isConsulting ? <LoadingSpinner size="sm" /> : <SearchIcon />} Consultar
              </button>
            </div>
          </div>

          {kardexProducto && productoSeleccionado && (
            <KardexProductoDetalle producto={productoSeleccionado} data={kardexProducto} />
          )}
        </div>

        <div className="card space-y-4 p-6">
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Movimientos recientes</h2>
              <p className="text-sm text-slate-500">Visualiza las últimas entradas, salidas y ajustes que afectan tu inventario.</p>
            </div>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Actualizar
            </button>
          </header>

          {error && !isLoading && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="py-20 text-center text-sm text-slate-500">
              <LoadingSpinner size="lg" />
              <p className="mt-3">Cargando movimientos...</p>
            </div>
          ) : movimientos.length === 0 ? (
            <EmptyState message="Todavía no registraste movimientos en el inventario." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Movimiento</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Cantidad</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Stock nuevo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Documento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {movimientos.map((movimiento) => {
                    const { badgeClass, label } = getMovimientoBadge(movimiento.tipo_movimiento)
                    return (
                      <tr key={movimiento.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-500">{new Date(movimiento.fecha_movimiento).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{getProductoNombre(productos, movimiento.producto_id)}</td>
                        <td className="px-6 py-4 text-sm"><span className={badgeClass}>{label}</span></td>
                        <td className="px-6 py-4 text-right text-sm text-slate-600">{movimiento.cantidad}</td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">{movimiento.stock_nuevo}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{movimiento.numero_documento || movimiento.documento_referencia}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function KardexProductoDetalle({ producto, data }: { producto: Producto; data: KardexProductoResponse }) {
  const resumen = data.resumen || {}

  return (
    <div className="space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-inner">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Historial por producto</h3>
          <p className="text-sm text-slate-500">{producto.nombre} · Código {producto.codigo_interno}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
          Stock actual: <span className="text-slate-900">{producto.stock_actual}</span>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ResumenCard title="Entradas" value={resumen.total_entradas || 0} tone="success" />
        <ResumenCard title="Salidas" value={resumen.total_salidas || 0} tone="warning" />
        <ResumenCard title="Stock inicial" value={resumen.stock_inicial || 0} tone="neutral" />
        <ResumenCard title="Stock final" value={resumen.stock_final || 0} tone="primary" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Movimiento</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Cantidad</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Precio unit.</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Stock anterior</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Stock nuevo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Documento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {data.movimientos.map((movimiento) => {
              const { badgeClass, label } = getMovimientoBadge(movimiento.tipo_movimiento)
              return (
                <tr key={movimiento.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(movimiento.fecha_movimiento).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm"><span className={badgeClass}>{label}</span></td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">{movimiento.cantidad}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">${Number(movimiento.precio_unitario).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-sm text-slate-600">{movimiento.stock_anterior}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">{movimiento.stock_nuevo}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{movimiento.numero_documento || movimiento.documento_referencia}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ResumenCard({ title, value, tone }: { title: string; value: number; tone: 'success' | 'warning' | 'neutral' | 'primary' }) {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    neutral: 'bg-slate-50 text-slate-700',
    primary: 'bg-indigo-50 text-indigo-700'
  }[tone]

  return (
    <div className={`rounded-2xl border border-slate-100 px-4 py-3 ${styles}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  )
}

function HeroStat({ title, value, tone }: { title: string; value: number; tone: 'success' | 'warning' | 'neutral' }) {
  const colors = {
    success: 'text-emerald-100',
    warning: 'text-amber-100',
    neutral: 'text-indigo-100'
  }[tone]

  return (
    <div className="rounded-2xl border border-white/40 bg-white/20 p-4 text-center backdrop-blur-sm">
      <p className={`text-xs font-semibold uppercase tracking-wide ${colors}`}>{title}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  )
}

function getMovimientoBadge(tipo: string) {
  if (tipo.includes('ENTRADA')) {
    return { badgeClass: 'inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600', label: tipo.replace('_', ' ') }
  }
  if (tipo.includes('SALIDA')) {
    return { badgeClass: 'inline-flex rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-600', label: tipo.replace('_', ' ') }
  }
  return { badgeClass: 'inline-flex rounded-full bg-slate-500/15 px-3 py-1 text-xs font-semibold text-slate-600', label: tipo.replace('_', ' ') }
}

function getProductoNombre(productos: Producto[], productoId: number) {
  return productos.find((p) => p.id === productoId)?.nombre || 'Producto no identificado'
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-6 py-12 text-center text-sm text-slate-500">
      {message}
    </div>
  )
}

function SearchIcon() {
  return <span className="text-lg leading-none">🔎</span>
}