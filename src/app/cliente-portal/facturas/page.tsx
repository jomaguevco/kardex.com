'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import clientePortalService from '@/services/clientePortalService'
import { Receipt, Loader2, Calendar, Download } from 'lucide-react'

export default function FacturasPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [facturas, setFacturas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      router.push('/')
      return
    }

    fetchFacturas()
  }, [isAuthenticated, user, router])

  const fetchFacturas = async () => {
    try {
      const response = await clientePortalService.getMisFacturas()
      if (response.success) {
        setFacturas(response.data)
      }
    } catch (error) {
      console.error('Error al cargar facturas:', error)
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
        <h1 className="text-3xl font-bold text-slate-900">Mis Facturas</h1>
        <p className="mt-2 text-slate-600">
          Consulta y descarga tus facturas
        </p>
      </div>

      {facturas.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Receipt className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No tienes facturas disponibles
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Las facturas aparecerán aquí después de realizar compras
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {facturas.map((factura) => (
            <div
              key={factura.id}
              className="glass-card rounded-2xl p-6 transition hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-red-600 text-white">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {factura.numero_factura}
                    </h3>
                    <p className="text-sm text-slate-600 flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(factura.fecha_venta).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-semibold text-slate-900">
                    S/ {Number(factura.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                {factura.descuento > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Descuento:</span>
                    <span className="font-semibold text-emerald-600">
                      - S/ {Number(factura.descuento || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {factura.impuestos > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Impuestos:</span>
                    <span className="font-semibold text-slate-900">
                      S/ {Number(factura.impuestos || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="font-semibold text-slate-700">Total:</span>
                  <span className="text-xl font-bold text-primary-600">
                    S/ {Number(factura.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => alert('Función de descarga en desarrollo')}
                className="mt-4 flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                <Download className="h-4 w-4" />
                <span>Descargar PDF</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

