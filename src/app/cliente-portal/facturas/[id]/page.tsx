'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import clientePortalService from '@/services/clientePortalService'
import { ArrowLeft, Calendar, FileText, Package, Loader2, Download } from 'lucide-react'
import toast from 'react-hot-toast'

interface DetalleVenta {
  id: number
  producto_id: number
  cantidad: number
  precio_unitario: number
  subtotal: number
  producto: {
    id: number
    nombre: string
    codigo_interno: string
    imagen_url?: string
  }
}

interface Factura {
  id: number
  numero_factura: string
  fecha_venta: string
  subtotal: number
  descuento: number
  impuestos: number
  total: number
  estado: string
  observaciones?: string
  detalles: DetalleVenta[]
}

export default function DetalleFacturaPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const [factura, setFactura] = useState<Factura | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      router.push('/')
      return
    }

    fetchDetalleFactura()
  }, [isAuthenticated, user, router, params.id])

  const fetchDetalleFactura = async () => {
    try {
      setIsLoading(true)
      const response = await clientePortalService.getDetalleCompra(params.id as string)
      
      if (response.success) {
        setFactura(response.data)
      } else {
        toast.error(response.message || 'Error al cargar el detalle de la factura')
        router.push('/cliente-portal/mis-compras')
      }
    } catch (error: any) {
      console.error('Error al cargar detalle de factura:', error)
      toast.error(error.response?.data?.message || 'Error al cargar el detalle de la factura')
      router.push('/cliente-portal/mis-compras')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDescargarPDF = () => {
    toast.success('Descarga de PDF próximamente disponible')
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!factura) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <FileText className="mx-auto h-16 w-16 text-slate-300" />
        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          Factura no encontrada
        </h3>
        <button
          onClick={() => router.push('/cliente-portal/mis-compras')}
          className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
        >
          Volver a Mis Compras
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/cliente-portal/mis-compras')}
            className="rounded-xl p-2 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Detalle de Factura</h1>
            <p className="mt-2 text-slate-600">
              Factura #{factura.numero_factura}
            </p>
          </div>
        </div>
        <button
          onClick={handleDescargarPDF}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-semibold text-white shadow-lg transition hover:shadow-xl"
        >
          <Download className="h-5 w-5" />
          <span>Descargar PDF</span>
        </button>
      </div>

      {/* Información de la factura */}
      <div className="glass-card rounded-2xl p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-slate-500">Número de Factura</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{factura.numero_factura}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Fecha de Emisión</p>
            <div className="mt-1 flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-slate-400" />
              <p className="text-lg font-bold text-slate-900">
                {new Date(factura.fecha_venta).toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Estado</p>
            <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              {factura.estado === 'PROCESADA' ? 'Procesada' : factura.estado}
            </span>
          </div>
        </div>

        {factura.observaciones && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-700">Observaciones:</p>
            <p className="mt-1 text-slate-600">{factura.observaciones}</p>
          </div>
        )}
      </div>

      {/* Detalle de productos */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="mb-4 flex items-center space-x-2 text-xl font-bold text-slate-900">
          <Package className="h-6 w-6 text-primary-600" />
          <span>Productos</span>
        </h2>

        <div className="space-y-4">
          {factura.detalles && factura.detalles.length > 0 ? (
            factura.detalles.map((detalle) => (
              <div
                key={detalle.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-primary-300 hover:bg-slate-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {detalle.producto?.imagen_url ? (
                      <img
                        src={detalle.producto.imagen_url}
                        alt={detalle.producto.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-full w-full p-3 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{detalle.producto?.nombre || 'Producto'}</h3>
                    <p className="text-sm text-slate-600">
                      Código: {detalle.producto?.codigo_interno || 'N/A'}
                    </p>
                    <p className="text-sm text-slate-600">
                      Cantidad: {detalle.cantidad} x S/ {Number(detalle.precio_unitario).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">
                    S/ {Number(detalle.subtotal).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500">No hay productos en esta factura</p>
          )}
        </div>
      </div>

      {/* Resumen de totales */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Resumen</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-slate-700">
            <span>Subtotal:</span>
            <span className="font-semibold">S/ {Number(factura.subtotal).toFixed(2)}</span>
          </div>
          {factura.descuento > 0 && (
            <div className="flex justify-between text-slate-700">
              <span>Descuento:</span>
              <span className="font-semibold text-green-600">
                -S/ {Number(factura.descuento).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-slate-700">
            <span>IGV (18%):</span>
            <span className="font-semibold">S/ {Number(factura.impuestos).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-xl font-bold text-primary-600">
            <span>Total:</span>
            <span>S/ {Number(factura.total).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

