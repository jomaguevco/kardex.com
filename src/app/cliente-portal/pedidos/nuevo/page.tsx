'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'
import pedidoService from '@/services/pedidoService'
import { ShoppingCart, Trash2, Plus, Minus, Loader2, ArrowLeft } from 'lucide-react'

export default function NuevoPedidoPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [carrito, setCarrito] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      router.push('/')
      return
    }

    // Cargar carrito desde localStorage
    const carritoGuardado = localStorage.getItem('carrito')
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado))
    }
  }, [isAuthenticated, user, router])

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (carrito.length > 0) {
      localStorage.setItem('carrito', JSON.stringify(carrito))
    } else {
      localStorage.removeItem('carrito')
    }
  }, [carrito])

  const actualizarCantidad = (productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(productoId)
      return
    }

    setCarrito(carrito.map(item =>
      item.id === productoId
        ? { ...item, cantidad: Math.min(nuevaCantidad, item.stock_actual) }
        : item
    ))
  }

  const eliminarDelCarrito = (productoId: number) => {
    setCarrito(carrito.filter(item => item.id !== productoId))
  }

  const calcularSubtotal = () => {
    return carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0)
  }

  const calcularImpuesto = (subtotal: number) => {
    return subtotal * 0.18 // IGV 18%
  }

  const calcularTotal = () => {
    const subtotal = calcularSubtotal()
    const impuesto = calcularImpuesto(subtotal)
    return subtotal + impuesto
  }

  const handleCrearPedido = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío')
      return
    }

    setIsLoading(true)
    try {
      const detalles = carrito.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_venta
      }))

      const response = await pedidoService.crearPedido({
        detalles,
        observaciones: observaciones || undefined
      })

      if (response.success) {
        // Limpiar carrito
        setCarrito([])
        localStorage.removeItem('carrito')
        
        alert('¡Pedido creado exitosamente! Un vendedor lo revisará pronto.')
        router.push('/cliente-portal/pedidos')
      } else {
        alert(response.message || 'Error al crear el pedido')
      }
    } catch (error: any) {
      console.error('Error al crear pedido:', error)
      alert(error.response?.data?.message || 'Error al crear el pedido')
    } finally {
      setIsLoading(false)
    }
  }

  if (carrito.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/cliente-portal/catalogo')}
            className="rounded-xl p-2 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Carrito de Compras</h1>
        </div>

        <div className="glass-card rounded-2xl p-12 text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            Tu carrito está vacío
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Agrega productos desde el catálogo para crear un pedido
          </p>
          <button
            onClick={() => router.push('/cliente-portal/catalogo')}
            className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            Ir al Catálogo
          </button>
        </div>
      </div>
    )
  }

  const subtotal = calcularSubtotal()
  const impuesto = calcularImpuesto(subtotal)
  const total = calcularTotal()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/cliente-portal/catalogo')}
            className="rounded-xl p-2 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Carrito de Compras</h1>
            <p className="mt-2 text-slate-600">
              {carrito.length} {carrito.length === 1 ? 'producto' : 'productos'} en tu carrito
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {carrito.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-start space-x-4">
                {/* Imagen */}
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
                  {item.imagen_url ? (
                    <img
                      src={item.imagen_url}
                      alt={item.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingCart className="h-10 w-10 text-slate-400" />
                  )}
                </div>

                {/* Detalles */}
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{item.nombre}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Código: {item.codigo_interno}
                  </p>
                  <p className="mt-2 text-lg font-bold text-primary-600">
                    S/ {Number(item.precio_venta).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Stock disponible: {item.stock_actual} unid.
                  </p>
                </div>

                {/* Controles de cantidad */}
                <div className="flex flex-col items-end space-y-4">
                  <button
                    onClick={() => eliminarDelCarrito(item.id)}
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                      className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200 transition"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                      disabled={item.cantidad >= item.stock_actual}
                      className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    Subtotal: S/ {(item.precio_venta * item.cantidad).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="glass-card sticky top-6 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900">Resumen del Pedido</h2>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">S/ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IGV (18%):</span>
                <span className="font-semibold">S/ {impuesto.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-slate-900">
                  <span>Total:</span>
                  <span className="text-primary-600">S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Observaciones (opcional)
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Agrega comentarios o instrucciones especiales..."
                rows={3}
                className="input-field w-full rounded-xl"
              />
            </div>

            <button
              onClick={handleCrearPedido}
              disabled={isLoading}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creando pedido...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  <span>Crear Pedido</span>
                </>
              )}
            </button>

            <p className="mt-4 text-xs text-center text-slate-500">
              Tu pedido será revisado por un vendedor antes de ser procesado
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

