'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import clientePortalService from '@/services/clientePortalService'
import { TrendingUp, Loader2, Package, ShoppingBag, DollarSign, FileDown, CreditCard } from 'lucide-react'

export default function EstadoCuentaPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [estadoCuenta, setEstadoCuenta] = useState<any>(null)
  const [facturas, setFacturas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      router.push('/')
      return
    }

    fetchEstadoCuenta()
  }, [isAuthenticated, user, router])

  const fetchEstadoCuenta = async () => {
    try {
      const response = await clientePortalService.getEstadoCuenta()
      if (response.success) {
        setEstadoCuenta(response.data)
      }
      const fact = await clientePortalService.getMisFacturas()
      if ((fact as any).success) {
        setFacturas((fact as any).data?.slice(0, 5) || [])
      }
    } catch (error) {
      console.error('Error al cargar estado de cuenta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Estado de Cuenta</h1>
        <p className="mt-2 text-slate-600">
          Resumen de tu actividad y estadísticas de compras
        </p>
      </div>

      {/* Información del cliente */}
      {estadoCuenta?.cliente && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Información del Cliente
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-600">Nombre</p>
              <p className="font-semibold text-slate-900">
                {estadoCuenta.cliente.nombre}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Documento</p>
              <p className="font-semibold text-slate-900">
                {estadoCuenta.cliente.numero_documento}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Email</p>
              <p className="font-semibold text-slate-900">
                {estadoCuenta.cliente.email || 'No registrado'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Teléfono</p>
              <p className="font-semibold text-slate-900">
                {estadoCuenta.cliente.telefono || 'No registrado'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Compras</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {estadoCuenta?.totalCompras || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Gastado</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                S/ {Number(estadoCuenta?.totalGastado || 0).toFixed(2)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Productos Únicos</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {estadoCuenta?.productosMasComprados?.length || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Compras por mes */}
      {estadoCuenta?.comprasPorMes && estadoCuenta.comprasPorMes.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Compras por Mes (Últimos 6 meses)
          </h2>
          <div className="space-y-3">
            {estadoCuenta.comprasPorMes.map((mes: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{mes.mes}</p>
                  <p className="text-sm text-slate-600">
                    {mes.cantidad} compra(s)
                  </p>
                </div>
                <p className="text-xl font-bold text-primary-600">
                  S/ {Number(mes.total || 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facturas recientes */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Facturas recientes</h2>
          <button
            onClick={() => router.push('/cliente-portal/facturas')}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Ver todas
          </button>
        </div>
        {facturas.length === 0 ? (
          <p className="text-sm text-slate-600">Aún no tienes facturas emitidas.</p>
        ) : (
          <div className="space-y-3">
            {facturas.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{f.numero_factura}</p>
                  <p className="text-xs text-slate-600">{new Date(f.fecha_venta).toLocaleDateString('es-ES')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-primary-600">S/ {Number(f.total || 0).toFixed(2)}</p>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => alert('Descarga de PDF desde Reportes (próx.)')}
                  >
                    <FileDown className="h-4 w-4" /> PDF
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:shadow"
                    onClick={() => router.push('/cliente-portal/soporte')}
                    title="Pagar con Yape/Plin desde el Agente Virtual"
                  >
                    <CreditCard className="h-4 w-4" /> Pagar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Productos más comprados */}
      {estadoCuenta?.productosMasComprados && estadoCuenta.productosMasComprados.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Productos Más Comprados
          </h2>
          <div className="space-y-3">
            {estadoCuenta.productosMasComprados.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.producto?.nombre || 'Producto'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {item.total_cantidad} unidades compradas
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-primary-600">
                  S/ {Number(item.total_gastado || 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

