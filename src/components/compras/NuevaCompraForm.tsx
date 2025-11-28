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
  producto_id: z.union([z.number(), z.string()]).transform(val => Number(val)).pipe(z.number().positive('Selecciona un producto')),
  cantidad: z.union([z.number(), z.string()]).transform(val => Number(val)).pipe(z.number().int('La cantidad debe ser un número entero').positive('La cantidad debe ser mayor a 0')),
  precio_unitario: z.union([z.number(), z.string()]).transform(val => Number(val)).pipe(z.number().positive('El precio debe ser mayor a 0')),
  descuento: z.union([z.number(), z.string(), z.nan()]).optional().transform(val => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    return isNaN(num) ? 0 : num
  }).pipe(z.number().min(0).optional()),
  subtotal: z.union([z.number(), z.string()]).transform(val => Number(val)).pipe(z.number().positive('El subtotal debe ser mayor a 0'))
})

const compraSchema = z.object({
  proveedor_id: z.union([z.number(), z.string()]).transform(val => Number(val)).pipe(z.number().positive('Selecciona un proveedor')),
  fecha: z.string().min(1, 'La fecha es requerida'),
  subtotal: z.union([z.number(), z.string()]).transform(val => Number(val)).pipe(z.number().min(0.01, 'El subtotal debe ser mayor a 0')),
  descuento: z.union([z.number(), z.string(), z.nan()]).optional().transform(val => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    return isNaN(num) ? 0 : num
  }).pipe(z.number().min(0).optional()),
  impuesto: z.union([z.number(), z.string(), z.nan()]).optional().transform(val => {
    const num = typeof val === 'string' ? parseFloat(val) : val
    return isNaN(num) ? 0 : num
  }).pipe(z.number().min(0).optional()),
  total: z.union([z.number(), z.string()]).transform(val => Number(val)).pipe(z.number().min(0.01, 'El total debe ser mayor a 0')),
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
      // Lógica del backend: precio_real = precio_unitario - descuento, subtotal = precio_real * cantidad
      const precioReal = Math.max(0, precio - descuento)
      const nuevoSubtotal = precioReal * nuevaCantidad
      
      setValue(`detalles.${productoExistenteIndex}.cantidad`, nuevaCantidad, { shouldValidate: true, shouldDirty: true })
      setValue(`detalles.${productoExistenteIndex}.subtotal`, nuevoSubtotal, { shouldValidate: true, shouldDirty: true })
      
      // Recalcular subtotal total inmediatamente
      const nuevosDetalles = [...detalles]
      nuevosDetalles[productoExistenteIndex] = {
        ...nuevosDetalles[productoExistenteIndex],
        cantidad: nuevaCantidad,
        subtotal: nuevoSubtotal
      }
      
      const subtotalTotal = nuevosDetalles.reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0)
      const descuentoGeneral = Number(descuento) || 0
      const impuestoValido = Number(impuesto) || 0
      const totalCalculado = subtotalTotal - descuentoGeneral + impuestoValido
      
      setValue('subtotal', subtotalTotal, { shouldValidate: true })
      setValue('total', Math.max(0, totalCalculado), { shouldValidate: true })
      
      // Sin toast para ser más rápido (solo feedback visual en la cantidad)
    } else {
      // Si no existe, agregarlo nuevo
      const precio = productoAAgregar.precio_compra || productoAAgregar.precio_venta
      const nuevoSubtotal = precio * cantidadIncremental
      
      append({
        producto_id: productoAAgregar.id,
        cantidad: cantidadIncremental,
        precio_unitario: precio,
        descuento: 0,
        subtotal: nuevoSubtotal
      }, { shouldFocus: false })

      setProductosCache((prev) => ({ ...prev, [productoAAgregar.id]: productoAAgregar }))
      
      // Recalcular subtotal total después de agregar
      setTimeout(() => {
        const todosLosDetalles = watch('detalles')
        const subtotalTotal = todosLosDetalles.reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0)
        const descuentoGeneral = Number(descuento) || 0
        const impuestoValido = Number(impuesto) || 0
        const totalCalculado = subtotalTotal - descuentoGeneral + impuestoValido
        
        setValue('subtotal', subtotalTotal, { shouldValidate: true })
        setValue('total', Math.max(0, totalCalculado), { shouldValidate: true })
      }, 0)
      
      // Sin toast para ser más rápido - el producto aparece directamente en la lista
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
    // Lógica del backend: precio_real = precio_unitario - descuento, subtotal = precio_real * cantidad
    const cantidadValida = Number(cantidad) || 0
    const precioValido = Number(precio) || 0
    const descuentoValido = Number(descuentoDetalle) || 0
    const precioReal = Math.max(0, precioValido - descuentoValido)
    const subtotal = precioReal * cantidadValida

    if (campo === 'cantidad') {
      setValue(`detalles.${index}.cantidad`, cantidadValida, { shouldValidate: true, shouldDirty: true })
    } else if (campo === 'precio_unitario') {
      setValue(`detalles.${index}.precio_unitario`, precioValido, { shouldValidate: true, shouldDirty: true })
    } else if (campo === 'descuento') {
      setValue(`detalles.${index}.descuento`, descuentoValido, { shouldValidate: true, shouldDirty: true })
    }
    // Actualizar subtotal y forzar actualización del formulario
    setValue(`detalles.${index}.subtotal`, subtotal, { shouldValidate: true, shouldDirty: true })
    
    // Forzar recálculo del subtotal total inmediatamente
    const nuevosDetalles = [...detalles]
    nuevosDetalles[index] = {
      ...nuevosDetalles[index],
      cantidad: cantidadValida,
      precio_unitario: precioValido,
      descuento: descuentoValido,
      subtotal: subtotal
    }
    
    const subtotalTotal = nuevosDetalles.reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0)
    const descuentoGeneral = Number(descuento) || 0
    const impuestoValido = Number(impuesto) || 0
    const totalCalculado = subtotalTotal - descuentoGeneral + impuestoValido
    
    setValue('subtotal', subtotalTotal, { shouldValidate: true })
    setValue('total', Math.max(0, totalCalculado), { shouldValidate: true })
  }

  const onSubmit = async (data: CompraFormData) => {
    try {
      console.log('Formulario enviado con datos:', data)
      
      // Validar que hay productos
      if (!data.detalles || data.detalles.length === 0) {
        toast.error('Agrega al menos un producto')
        return
      }

      // Validar que el proveedor está seleccionado
      if (!data.proveedor_id || data.proveedor_id <= 0) {
        toast.error('Selecciona un proveedor')
        return
      }

      // Validar que el subtotal y total son válidos
      if (!data.subtotal || data.subtotal <= 0) {
        toast.error('El subtotal debe ser mayor a 0')
        return
      }

      if (!data.total || data.total <= 0) {
        toast.error('El total debe ser mayor a 0')
        return
      }

      // Asegurar que todos los valores numéricos sean números
      const compra: CompraForm = {
        proveedor_id: Number(data.proveedor_id),
        numero_factura: `COMP-${Date.now()}`,
        fecha_compra: data.fecha,
        subtotal: Number(data.subtotal),
        descuento: Number(data.descuento) || 0,
        impuestos: Number(data.impuesto) || 0,
        total: Number(data.total),
        observaciones: data.observaciones || '',
        detalles: data.detalles.map((detalle) => ({
          producto_id: Number(detalle.producto_id),
          cantidad: Number(detalle.cantidad),
          precio_unitario: Number(detalle.precio_unitario),
          descuento: Number(detalle.descuento) || 0,
          subtotal: Number(detalle.subtotal)
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
          descuento: detalle.descuento || 0,
          subtotal: detalle.subtotal
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
      console.error('Error al registrar compra:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'No se pudo registrar la compra'
      toast.error(errorMessage)
    }
  }

  // Manejar errores de validación del formulario
  const onError = (errors: any) => {
    console.error('Errores de validación:', errors)
    
    // Construir mensaje de error más descriptivo
    const errorMessages: string[] = []
    
    if (errors.proveedor_id) {
      errorMessages.push('Selecciona un proveedor')
    }
    if (errors.fecha) {
      errorMessages.push('La fecha es requerida')
    }
    if (errors.subtotal) {
      errorMessages.push(`Subtotal: ${errors.subtotal.message}`)
    }
    if (errors.total) {
      errorMessages.push(`Total: ${errors.total.message}`)
    }
    if (errors.detalles) {
      if (errors.detalles.message) {
        errorMessages.push(errors.detalles.message)
      }
      // Verificar errores en cada detalle
      if (Array.isArray(errors.detalles)) {
        errors.detalles.forEach((error: any, index: number) => {
          if (error) {
            if (error.producto_id) errorMessages.push(`Producto ${index + 1}: ${error.producto_id.message}`)
            if (error.cantidad) errorMessages.push(`Producto ${index + 1}: ${error.cantidad.message}`)
            if (error.precio_unitario) errorMessages.push(`Producto ${index + 1}: ${error.precio_unitario.message}`)
            if (error.subtotal) errorMessages.push(`Producto ${index + 1}: ${error.subtotal.message}`)
          }
        })
      }
    }
    
    if (errorMessages.length > 0) {
      toast.error(errorMessages[0])
    } else {
      toast.error('Por favor completa todos los campos requeridos')
    }
  }

  // Recalcular subtotal y total cuando cambian los detalles, descuento o impuesto
  useEffect(() => {
    // Calcular subtotal sumando todos los subtotales de los detalles
    const subtotalCalculado = detalles.reduce((sum, detalle) => {
      const subtotalDetalle = Number(detalle.subtotal) || 0
      return sum + subtotalDetalle
    }, 0)
    
    const descuentoValido = Number(descuento) || 0
    const impuestoValido = Number(impuesto) || 0
    const totalCalculado = subtotalCalculado - descuentoValido + impuestoValido
    
    // Asegurar que los valores sean números válidos y mayores a 0
    const subtotalFinal = Math.max(0.01, subtotalCalculado)
    const totalFinal = Math.max(0.01, totalCalculado)
    
    setValue('subtotal', subtotalFinal, { shouldValidate: false, shouldDirty: true })
    setValue('total', totalFinal, { shouldValidate: false, shouldDirty: true })
    setValue('descuento', descuentoValido, { shouldValidate: false })
    setValue('impuesto', impuestoValido, { shouldValidate: false })
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
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
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
          {/* Escáner de código de barras - Modo Rápido */}
          <BarcodeScanner
            onProductFound={(producto) => {
              // Agregar directamente a detalles (sin pasos intermedios)
              // Si el producto ya existe, incrementa cantidad
              // Si no existe, lo agrega con cantidad 1
              agregarProducto(producto, 1)
            }}
            placeholder="Escanea código de barras..."
          />
          <p className="text-xs text-slate-500 mt-1 mb-2">
            ⚡ Escanea y el producto se agrega automáticamente. Ajusta cantidades después.
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
              {...register('descuento', { 
                valueAsNumber: true,
                setValueAs: (v) => {
                  const num = parseFloat(v)
                  return isNaN(num) ? 0 : num
                }
              })}
              className="w-24 text-right font-semibold border-b border-slate-300 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>Impuesto:</span>
            <input
              type="number"
              step="0.01"
              min={0}
              {...register('impuesto', { 
                valueAsNumber: true,
                setValueAs: (v) => {
                  const num = parseFloat(v)
                  return isNaN(num) ? 0 : num
                }
              })}
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

      {/* Mostrar errores de validación */}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-600 mb-2">Errores de validación:</p>
          <ul className="list-disc list-inside text-xs text-rose-600 space-y-1">
            {errors.proveedor_id && <li>Proveedor: {errors.proveedor_id.message}</li>}
            {errors.fecha && <li>Fecha: {errors.fecha.message}</li>}
            {errors.subtotal && <li>Subtotal: {errors.subtotal.message}</li>}
            {errors.total && <li>Total: {errors.total.message}</li>}
            {errors.descuento && <li>Descuento: {errors.descuento.message}</li>}
            {errors.impuesto && <li>Impuesto: {errors.impuesto.message}</li>}
            {errors.detalles && (
              <li>
                Productos: {errors.detalles.message}
                {errors.detalles.root && <span className="block ml-4">- {errors.detalles.root.message}</span>}
                {Array.isArray(errors.detalles) && errors.detalles.map((error: any, index: number) => (
                  error && (
                    <span key={index} className="block ml-4">
                      Producto {index + 1}: {error.producto_id?.message || error.cantidad?.message || error.precio_unitario?.message || error.subtotal?.message || 'Error en el producto'}
                    </span>
                  )
                ))}
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-outline sm:min-w-[150px]">
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting || fields.length === 0 || loadingProveedores || !watch('proveedor_id') || watch('proveedor_id') <= 0} 
          className="btn-primary inline-flex items-center justify-center sm:min-w-[200px] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={(e) => {
            // Validar antes de enviar
            if (fields.length === 0) {
              e.preventDefault()
              toast.error('Agrega al menos un producto')
              return
            }
            if (!watch('proveedor_id') || watch('proveedor_id') <= 0) {
              e.preventDefault()
              toast.error('Selecciona un proveedor')
              return
            }
            const subtotalVal = watch('subtotal')
            const totalVal = watch('total')
            if (!subtotalVal || subtotalVal <= 0) {
              e.preventDefault()
              toast.error('El subtotal debe ser mayor a 0')
              return
            }
            if (!totalVal || totalVal <= 0) {
              e.preventDefault()
              toast.error('El total debe ser mayor a 0')
              return
            }
          }}
        >
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
