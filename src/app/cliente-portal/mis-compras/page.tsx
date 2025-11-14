'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import clientePortalService from '@/services/clientePortalService'
import { ShoppingBag, Calendar, DollarSign, Loader2, Eye } from 'lucide-react'

export default function MisComprasPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [compras, setCompras] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      router.push('/')
      return
    }

    fetchCompras()
  }, [isAuthenticated, user, router])

  const fetchCompras = async () => {
    try {
      const response = await clientePortalService.getMisCompras()
      if (response.success) {
        setCompras(response.data)
      }
    } catch (error) {
      console.error('Error al cargar compras:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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
        <h1 className="text-3xl font-bold text-slate-900">Mis Compras</h1>
        <p className="mt-2 text-slate-600">
          Historial completo de tus compras realizadas
        </p>
      </div>

      {compras.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No tienes compras registradas
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Explora nuestro catálogo y realiza tu primera compra
          </p>
          <button
            onClick={() => router.push('/cliente-portal/catalogo')}
            className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            Ver Catálogo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {compras.map((compra) => (
            <div
              key={compra.id}
              className="glass-card rounded-2xl p-6 transition hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Factura {compra.numero_factura}
                      </h3>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-slate-600">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDate(compra.fecha_venta)}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="mr-1 h-4 w-4" />
                          S/ {Number(compra.total || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {compra.detalles && compra.detalles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-slate-700">
                        Productos:
                      </p>
                      <div className="space-y-1">
                        {compra.detalles.map((detalle: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                          >
                            <span className="text-slate-700">
                              {detalle.producto?.nombre || 'Producto'} x {detalle.cantidad}
                            </span>
                            <span className="font-semibold text-slate-900">
                              S/ {Number(detalle.subtotal || 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => router.push(`/cliente-portal/facturas/${compra.id}`)}
                  className="ml-4 flex items-center space-x-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver Detalle</span>
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold text-slate-900">
                      S/ {Number(compra.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                  {compra.descuento > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Descuento:</span>
                      <span className="font-semibold text-emerald-600">
                        - S/ {Number(compra.descuento || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {compra.impuestos > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Impuestos:</span>
                      <span className="font-semibold text-slate-900">
                        S/ {Number(compra.impuestos || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Total</p>
                  <p className="text-2xl font-bold text-primary-600">
                    S/ {Number(compra.total || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

