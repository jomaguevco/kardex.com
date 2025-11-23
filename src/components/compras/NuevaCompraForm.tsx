'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Plus, Trash2, Calculator } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import BarcodeScanner from '@/components/ui/BarcodeScanner'
import { productoService } from '@/services/productoService'
import { proveedorService } from '@/services/proveedorService'
import { compraService } from '@/services/compraService'
import { Producto, Proveedor } from '@/types'
import { CompraForm } from '@/types'
import { cn } from '@/utils/cn'

const detalleSchema = z.object({
  producto_id: z.number().positive('Selecciona un producto'),
  cantidad: z.number().int('La cantidad debe ser un número entero').positive('La cantidad debe ser mayor a 0'),
  precio_unitario: z.number().positive('El precio debe ser mayor a 0'),
  descuento: z.number().min(0).optional(),
  subtotal: z.number().positive('El subtotal debe ser mayor a 0')
})

const compraSchema = z.object({
  proveedor_id: z.number().positive('Selecciona un proveedor'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  subtotal: z.number().positive('El subtotal debe ser mayor a 0'),
  descuento: z.number().min(0).optional(),
  impuesto: z.number().min(0).optional(),
  total: z.number().positive('El total debe ser mayor a 0'),
  observaciones: z.string().optional(),
  detalles: z.array(detalleSchema).min(1, 'Agrega al menos un producto')
})

type CompraFormData = z.infer<typeof compraSchema>

interface NuevaCompraFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function NuevaCompraForm({ onSuccess, onCancel }: NuevaCompraFormProps) {
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [productosCache, setProductosCache] = useState<Record<number, Producto>>({})

  const { data: proveedoresData, isLoading: loadingProveedores } = useQuery({
    queryKey: ['proveedores', 'activos'],
    queryFn: () => proveedorService.getProveedoresActivos()
  })

  const proveedores = (proveedoresData as Proveedor[]) || []

  const { data: productosData, isLoading: loadingProductos } = useQuery({
    queryKey: ['productos', { search: busquedaProducto, limit: 10 }],
    queryFn: () => productoService.getProductos({ search: busquedaProducto, limit: 10 }),
    enabled: busquedaProducto.length > 2
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CompraFormData>({
    resolver: zodResolver(compraSchema),
    defaultValues: {
      proveedor_id: 0,
      fecha: new Date().toISOString().slice(0, 16),
      subtotal: 0,
      descuento: 0,
      impuesto: 0,
      total: 0,
      detalles: []
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'detalles' })

  const detalles = watch('detalles')
  const descuento = watch('descuento') || 0
  const impuesto = watch('impuesto') || 0

  const agregarProducto = (producto?: Producto, cantidadIncremental: number = 1) => {
    const productoAAgregar = producto || selectedProduct
    if (!productoAAgregar) {
      toast.error('Selecciona un producto de la lista')
      return
    }

    // Buscar si el producto ya existe en los detalles
    const productoExistenteIndex = detalles.findIndex((detalle) => detalle.producto_id === productoAAgregar.id)
    
    if (productoExistenteIndex >= 0) {
      // Si ya existe, incrementar la cantidad
      const detalleExistente = detalles[productoExistenteIndex]
      const nuevaCantidad = (detalleExistente.cantidad || 1) + cantidadIncremental
      const precio = detalleExistente.precio_unitario || productoAAgregar.precio_compra || productoAAgregar.precio_venta
      const descuento = detalleExistente.descuento || 0
      const nuevoSubtotal = (nuevaCantidad * precio) - descuento
      
      setValue(`detalles.${productoExistenteIndex}.cantidad`, nuevaCantidad)
      setValue(`detalles.${productoExistenteIndex}.subtotal`, nuevoSubtotal)
      
      toast.success(`${productoAAgregar.nombre}: cantidad ${nuevaCantidad}`, { duration: 1500 })
    } else {
      // Si no existe, agregarlo nuevo
      const precio = productoAAgregar.precio_compra || productoAAgregar.precio_venta
      append({
        producto_id: productoAAgregar.id,
        cantidad: cantidadIncremental,
        precio_unitario: precio,
        descuento: 0,
        subtotal: precio * cantidadIncremental
      })

      setProductosCache((prev) => ({ ...prev, [productoAAgregar.id]: productoAAgregar }))
      toast.success(`${productoAAgregar.nombre} agregado`, { duration: 1500 })
    }

    setSelectedProduct(null)
    setBusquedaProducto('')
  }

  const actualizarDetalle = (index: number, campo: keyof (typeof detalles)[number], valor: number) => {
    const detalle = detalles[index]
    if (!detalle) return
    
    // Asegurar que el valor sea un número válido, si no usar el valor actual o 0
    const valorNum = isNaN(valor) || !isFinite(valor) ? (campo === 'cantidad' ? 1 : 0) : valor
    
    const cantidad = campo === 'cantidad' ? Math.max(1, valorNum || detalle.cantidad || 1) : (Number(detalle.cantidad) || 1)
    const precio = campo === 'precio_unitario' ? Math.max(0, valorNum || detalle.precio_unitario || 0) : (Number(detalle.precio_unitario) || 0)
    const descuentoDetalle = campo === 'descuento' ? Math.max(0, valorNum || 0) : (Number(detalle.descuento) || 0)
    
    // Calcular subtotal asegurándonos de que todos los valores sean números válidos
    const cantidadValida = Number(cantidad) || 0
    const precioValido = Number(precio) || 0
    const descuentoValido = Number(descuentoDetalle) || 0
    const subtotal = Math.max(0, (cantidadValida * precioValido) - descuentoValido)

    if (campo === 'cantidad') {
      setValue(`detalles.${index}.cantidad`, cantidadValida)
    } else if (campo === 'precio_unitario') {
      setValue(`detalles.${index}.precio_unitario`, precioValido)
    } else if (campo === 'descuento') {
      setValue(`detalles.${index}.descuento`, descuentoValido)
    }
    setValue(`detalles.${index}.subtotal`, subtotal)
  }

  const onSubmit = async (data: CompraFormData) => {
    try {
      const compra: CompraForm = {
        proveedor_id: data.proveedor_id,
        numero_factura: `COMP-${Date.now()}`,
        fecha_compra: data.fecha,
        subtotal: data.subtotal,
        descuento: data.descuento || 0,
        impuestos: data.impuesto || 0,
        total: data.total,
        observaciones: data.observaciones,
        detalles: data.detalles.map((detalle) => ({
          producto_id: detalle.producto_id,
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          descuento: detalle.descuento || 0,
          subtotal: detalle.subtotal
        }))
      }

      await compraService.createCompra({
        proveedor_id: compra.proveedor_id,
        numero_factura: compra.numero_factura,
        fecha_compra: compra.fecha_compra,
        subtotal: compra.subtotal,
        descuento: compra.descuento,
        impuestos: compra.impuestos,
        total: compra.total,
        observaciones: compra.observaciones,
        detalles: compra.detalles.map((detalle) => ({
          producto_id: detalle.producto_id,
          cantidad: detalle.cantidad,
          precio_unitario: detalle.precio_unitario,
          descuento: detalle.descuento
        }))
      })

      toast.success('Compra registrada correctamente')
      reset({
        proveedor_id: 0,
        fecha: new Date().toISOString().slice(0, 16),
        subtotal: 0,
        descuento: 0,
        impuesto: 0,
        total: 0,
        observaciones: '',
        detalles: []
      })
      setSelectedProduct(null)
      setBusquedaProducto('')
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'No se pudo registrar la compra')
    }
  }

  useEffect(() => {
    const subtotalCalculado = detalles.reduce((sum, detalle) => sum + (detalle.subtotal || 0), 0)
    const totalCalculado = subtotalCalculado - descuento + impuesto
    setValue('subtotal', subtotalCalculado)
    setValue('total', totalCalculado)
  }, [detalles, descuento, impuesto, setValue])

  useEffect(() => {
    if (productosData?.productos) {
      setProductosCache((prev) => {
        const next = { ...prev }
        productosData.productos.forEach((producto: Producto) => {
          next[producto.id] = producto
        })
        return next
      })
    }
  }, [productosData])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className="block text-sm font-medium text-slate-600">Proveedor</label>
          <select
            {...register('proveedor_id', { valueAsNumber: true })}
            className="input-field"
            disabled={loadingProveedores}
          >
            <option value={0}>Selecciona un proveedor</option>
            {proveedores.map((proveedor) => (
              <option key={proveedor.id} value={proveedor.id}>
                {proveedor.nombre}
              </option>
            ))}
          </select>
          {errors.proveedor_id && <p className="mt-1 text-xs font-medium text-rose-500">{errors.proveedor_id.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Fecha de compra</label>
          <input type="datetime-local" {...register('fecha')} className="input-field" />
          {errors.fecha && <p className="mt-1 text-xs font-medium text-rose-500">{errors.fecha.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600">Agregar productos</label>
        <div className="mt-1 space-y-2">
          {/* Escáner de código de barras - Modo Híbrido */}
          <BarcodeScanner
            onProductFound={(producto) => {
              // Modo híbrido: 
              // - Si el producto ya existe en la lista, incrementa cantidad en 1
              // - Si no existe, lo agrega con cantidad 1 (luego puedes ajustar manualmente)
              agregarProducto(producto, 1)
              
              // Auto-focus de nuevo para siguiente escaneo (opcional - puedes desactivarlo)
              setTimeout(() => {
                const scannerInput = document.querySelector('input[placeholder*="Escanea código"]') as HTMLInputElement
                if (scannerInput) {
                  scannerInput.focus()
                }
              }, 100)
            }}
            placeholder="Escanea código de barras (1 vez = cantidad 1, o escanea múltiples veces)..."
            className="mb-2"
          />
          <p className="text-xs text-gray-500 mt-1 mb-2">
            💡 Escanea 1 vez y ajusta cantidad manualmente, o escanea múltiples veces para incrementar
          </p>
          
          {/* Búsqueda manual por nombre */}
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={busquedaProducto}
                onChange={(event) => setBusquedaProducto(event.target.value)}
                placeholder="Buscar por nombre o código..."
                className="input-field"
              />
            </div>
            <button
              type="button"
              onClick={() => agregarProducto()}
              disabled={!selectedProduct}
              className="btn-primary inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> Agregar
            </button>
          </div>
        </div>
        {busquedaProducto.length > 2 && (
          <div className="mt-2 max-h-48 overflow-y-auto rounded-2xl border border-slate-100 bg-white">
            {loadingProductos ? (
              <div className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-slate-500">
                <LoadingSpinner size="sm" /> Buscando productos...
              </div>
            ) : (
              (productosData?.productos || []).map((producto: Producto) => (
                <button
                  type="button"
                  key={producto.id}
                  onClick={() => setSelectedProduct(producto)}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-3 text-left text-sm transition hover:bg-slate-50',
                    selectedProduct?.id === producto.id && 'bg-indigo-50 text-indigo-600'
                  )}
                >
                  <div>
                    <p className="font-medium text-slate-900">{producto.nombre}</p>
                    <p className="text-xs text-slate-500">Stock: {producto.stock_actual}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">${Number(producto.precio_compra || producto.precio_venta).toFixed(2)}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">Productos seleccionados</h3>
        {fields.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No hay productos agregados.
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => {
              const productoId = field.producto_id
              const producto = productosCache[productoId]
              const nombreProducto = producto?.nombre || (productoId ? 'Cargando producto...' : 'Producto desconocido')
              const codigoProducto = producto?.codigo_interno || ''
              
              return (
                <div
                  key={field.id}
                  className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{nombreProducto}</p>
                    <p className="text-xs text-slate-500">{codigoProducto || `ID: ${productoId}`}</p>
                  </div>

                  <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Cantidad</label>
                      <input
                        type="number"
                        step="1"
                        min={1}
                        value={detalles[index]?.cantidad || 0}
                        onChange={(event) => {
                          const val = parseInt(event.target.value, 10)
                          actualizarDetalle(index, 'cantidad', isNaN(val) || val < 1 ? 1 : Math.floor(val))
                        }}
                        onKeyDown={(e) => {
                          // Prevenir teclas de punto decimal y coma
                          if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                            e.preventDefault()
                          }
                        }}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Precio unitario</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={detalles[index]?.precio_unitario || 0}
                        onChange={(event) => {
                          const val = parseFloat(event.target.value)
                          actualizarDetalle(index, 'precio_unitario', isNaN(val) ? 0 : val)
                        }}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Descuento</label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={detalles[index]?.descuento || 0}
                        onChange={(event) => {
                          const val = parseFloat(event.target.value)
                          actualizarDetalle(index, 'descuento', isNaN(val) ? 0 : val)
                        }}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subtotal</p>
                      <p className="text-sm font-semibold text-slate-900">${(Number(detalles[index]?.subtotal) || 0).toFixed(2)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        remove(index)
                      }}
                      className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="card space-y-4 p-5">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-indigo-500" /> Totales
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-900">${(Number(watch('subtotal')) || 0).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Descuento:</span>
            <input
              type="number"
              step="0.01"
              min={0}
              {...register('descuento', { valueAsNumber: true })}
              className="w-24 text-right font-semibold border-b border-slate-300 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Impuesto:</span>
            <input
              type="number"
              step="0.01"
              min={0}
              {...register('impuesto', { valueAsNumber: true })}
              className="w-24 text-right font-semibold border-b border-slate-300 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-indigo-600">
            <span>Total:</span>
            <span>${(Number(watch('total')) || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-600">Observaciones</label>
        <textarea {...register('observaciones')} rows={3} className="input-field" placeholder="Observaciones, condiciones de pago, notas de recepción..." />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-outline sm:min-w-[150px]">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting || fields.length === 0 || loadingProveedores} className="btn-primary inline-flex items-center justify-center sm:min-w-[200px] disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" /> Registrando...
            </>
          ) : (
            'Registrar compra'
          )}
        </button>
      </div>
    </form>
  )
}
