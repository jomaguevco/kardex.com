'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'
import pedidoService from '@/services/pedidoService'
import { ShoppingCart, Trash2, Plus, Minus, Loader2, ArrowLeft, CreditCard, Wallet, Building2, Smartphone, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'

type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'YAPE' | 'PLIN'

const METODOS_PAGO: { value: MetodoPago; label: string; icon: any; description: string }[] = [
  {
    value: 'EFECTIVO',
    label: 'Efectivo',
    icon: Wallet,
    description: 'Pago en efectivo al momento de la entrega'
  },
  {
    value: 'TARJETA',
    label: 'Tarjeta',
    icon: CreditCard,
    description: 'Tarjeta de crédito o débito'
  },
  {
    value: 'TRANSFERENCIA',
    label: 'Transferencia',
    icon: Building2,
    description: 'Transferencia bancaria'
  },
  {
    value: 'YAPE',
    label: 'Yape',
    icon: Smartphone,
    description: 'Pago mediante Yape'
  },
  {
    value: 'PLIN',
    label: 'Plin',
    icon: Smartphone,
    description: 'Pago mediante Plin'
  }
]

export default function NuevoPedidoPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [carrito, setCarrito] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [observaciones, setObservaciones] = useState('')
  const [mostrarPago, setMostrarPago] = useState(false)
  const [metodoPago, setMetodoPago] = useState<MetodoPago | ''>('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [previewComprobante, setPreviewComprobante] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    // Asegurar que la cantidad sea un entero
    const cantidadEntera = Math.floor(Math.max(1, nuevaCantidad))
    
    if (cantidadEntera <= 0) {
      eliminarDelCarrito(productoId)
      return
    }

    setCarrito(carrito.map(item =>
      item.id === productoId
        ? { ...item, cantidad: Math.min(cantidadEntera, Math.floor(item.stock_actual || 0)) }
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB')
      return
    }

    setComprobante(file)

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewComprobante(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveComprobante = () => {
    setComprobante(null)
    setPreviewComprobante(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCrearPedido = async () => {
    if (carrito.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    // Mostrar formulario de pago
    setMostrarPago(true)
  }

  const handleProcesarPago = async () => {
    if (!metodoPago) {
      toast.error('Debes seleccionar un método de pago')
      return
    }

    // Si es YAPE, PLIN o TRANSFERENCIA, requerir comprobante
    if ((metodoPago === 'YAPE' || metodoPago === 'PLIN' || metodoPago === 'TRANSFERENCIA') && !comprobante) {
      toast.error(`Debes subir un comprobante de pago para ${metodoPago}`)
      return
    }

    setIsLoading(true)
    
    try {
      console.log('handleProcesarPago - Iniciando creación de pedido y pago...')
      
      const productos = carrito.map(item => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_venta,
        descuento: 0
      }))

      // Crear el pedido y pagarlo en una sola operación (con comprobante si existe)
      console.log('handleProcesarPago - Creando pedido y pagando...')
      
      const responsePedido = await pedidoService.crearPedidoYpagar({
        tipo_pedido: 'PEDIDO_APROBACION',
        productos,
        observaciones: observaciones || undefined,
        metodo_pago: metodoPago
      }, comprobante || undefined)

      if (!responsePedido || !responsePedido.success) {
        throw new Error(responsePedido?.message || 'Error al crear el pedido y procesar el pago')
      }

      const pedido = responsePedido.data
      console.log('handleProcesarPago - Pedido creado y pagado:', pedido.id)

      console.log('handleProcesarPago - Proceso completado exitosamente')

      // Limpiar carrito
      setCarrito([])
      localStorage.removeItem('carrito')
      
      // Mostrar mensaje de éxito
      toast.success('¡Pedido creado y pagado exitosamente!')
      
      // Redirigir a la página de pedidos
      router.push('/cliente-portal/pedidos')
      
    } catch (error: any) {
      console.error('Error al procesar pedido y pago:', error)
      
      // Extraer mensaje de error (priorizar userMessage para errores de red)
      const errorMessage = error?.userMessage || error?.response?.data?.message || error?.message || 'Error al procesar el pedido'
      
      toast.error(`Error: ${errorMessage}`)
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

            {!mostrarPago ? (
              <>
                <button
                  onClick={handleCrearPedido}
                  disabled={isLoading}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Crear Pedido y Pagar</span>
                </button>

                <p className="mt-4 text-xs text-center text-slate-500">
                  Debes pagar el pedido para completar la compra
                </p>
              </>
            ) : (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Método de Pago</h3>
                
                {/* Métodos de pago */}
                <div className="grid grid-cols-1 gap-3">
                  {METODOS_PAGO.map((metodo) => {
                    const Icon = metodo.icon
                    const isSelected = metodoPago === metodo.value
                    const requiereComprobante = ['YAPE', 'PLIN', 'TRANSFERENCIA'].includes(metodo.value)

                    return (
                      <button
                        key={metodo.value}
                        type="button"
                        onClick={() => setMetodoPago(metodo.value)}
                        disabled={isLoading}
                        className={`relative rounded-xl border-2 p-3 text-left transition ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className={`font-semibold ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>
                                {metodo.label}
                              </p>
                              {isSelected && (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600">
                                  <div className="h-2 w-2 rounded-full bg-white" />
                                </div>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-slate-600">{metodo.description}</p>
                            {requiereComprobante && (
                              <p className="mt-1 text-xs font-medium text-amber-600">
                                * Requiere comprobante
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Subir comprobante (si aplica) */}
                {metodoPago && ['YAPE', 'PLIN', 'TRANSFERENCIA'].includes(metodoPago) && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-900">
                      Comprobante de pago {metodoPago === 'YAPE' || metodoPago === 'PLIN' ? '(captura de pantalla)' : '(voucher)'}
                    </label>
                    <div className="space-y-3">
                      {previewComprobante ? (
                        <div className="relative rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
                          <img
                            src={previewComprobante}
                            alt="Comprobante de pago"
                            className="max-h-48 w-full rounded-lg object-contain"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveComprobante}
                            disabled={isLoading}
                            className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white transition hover:bg-red-600 disabled:opacity-50"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => !isLoading && fileInputRef.current?.click()}
                          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed"
                        >
                          <Upload className="mb-2 h-8 w-8 text-slate-400" />
                          <p className="text-sm font-semibold text-slate-700">
                            Haz clic para subir comprobante
                          </p>
                          <p className="mt-1 text-xs text-slate-500">JPG, PNG o GIF. Máximo 5MB</p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {/* Información adicional para efectivo */}
                {metodoPago === 'EFECTIVO' && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-medium text-amber-900">
                      💡 Recordatorio: El pago en efectivo se realizará al momento de la entrega.
                    </p>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarPago(false)
                      setMetodoPago('')
                      setComprobante(null)
                      setPreviewComprobante(null)
                    }}
                    disabled={isLoading}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleProcesarPago}
                    disabled={isLoading || !metodoPago}
                    className="flex-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        <span>Confirmar y Pagar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

