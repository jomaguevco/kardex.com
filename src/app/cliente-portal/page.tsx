'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import clientePortalService from '@/services/clientePortalService'
import { Package, ShoppingBag, Receipt, TrendingUp, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ClientePortalPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [dashboard, setDashboard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      router.push('/')
      return
    }

    fetchDashboard()
  }, [isAuthenticated, user, router])

  const fetchDashboard = async () => {
    try {
      const response = await clientePortalService.getEstadoCuenta()
      if (response.success) {
        setDashboard(response.data)
      }
    } catch (error) {
      console.error('Error al cargar dashboard:', error)
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
        <h1 className="text-3xl font-bold text-slate-900">
          Bienvenido, {dashboard?.cliente?.nombre || 'Cliente'}
        </h1>
        <p className="mt-2 text-slate-600">
          Este es tu portal personal donde puedes ver tus compras, explorar el catálogo y hacer pedidos.
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Compras</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dashboard?.totalCompras || 0}
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
                S/ {Number(dashboard?.totalGastado || 0).toFixed(2)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Productos Únicos</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dashboard?.productosMasComprados?.length || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Facturas</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dashboard?.totalCompras || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Receipt className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Link
          href="/cliente-portal/catalogo"
          className="glass-card group rounded-2xl p-8 transition hover:shadow-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition">
                Ver Catálogo
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Explora nuestros productos disponibles
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/cliente-portal/mis-compras"
          className="glass-card group rounded-2xl p-8 transition hover:shadow-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition">
                Mis Compras
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Revisa tu historial de compras
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/cliente-portal/pedidos"
          className="glass-card group rounded-2xl p-8 transition hover:shadow-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg">
              <Receipt className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition">
                Mis Pedidos
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Gestiona tus pedidos pendientes
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/cliente-portal/estado-cuenta"
          className="glass-card group rounded-2xl p-8 transition hover:shadow-xl"
        >
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 text-white shadow-lg">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition">
                Estado de Cuenta
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Ver estadísticas y análisis
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Productos más comprados */}
      {dashboard?.productosMasComprados && dashboard.productosMasComprados.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Tus Productos Favoritos
          </h2>
          <div className="space-y-3">
            {dashboard.productosMasComprados.slice(0, 5).map((item: any) => (
              <div
                key={item.producto_id}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {item.producto?.nombre || 'Producto'}
                  </p>
                  <p className="text-sm text-slate-600">
                    Código: {item.producto?.codigo || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">
                    {item.total_cantidad} unidades
                  </p>
                  <p className="text-sm text-slate-600">
                    S/ {Number(item.total_gastado || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

