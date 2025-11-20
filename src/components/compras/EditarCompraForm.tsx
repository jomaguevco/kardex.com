'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Plus, Trash2, Calculator } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { productoService } from '@/services/productoService'
import { proveedorService } from '@/services/proveedorService'
import { compraService } from '@/services/compraService'
import { Producto, Proveedor, Compra } from '@/types'
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

interface EditarCompraFormProps {
  compra: Compra
  onSuccess?: () => void
  onCancel?: () => void
}

export default function EditarCompraForm({ compra, onSuccess, onCancel }: EditarCompraFormProps) {
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [productosCache, setProductosCache] = useState<Record<number, Producto>>({})

  // Validar que la compra se pueda editar
  const puedeEditar = compra.estado?.toUpperCase() !== 'PROCESADA' && compra.estado?.toUpperCase() !== 'ANULADA'

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
      proveedor_id: compra.proveedor_id || 0,
      fecha: compra.fecha_compra ? new Date(compra.fecha_compra).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      subtotal: (compra as any).subtotal || 0,
      descuento: (compra as any).descuento || 0,
      impuesto: (compra as any).impuestos || 0,
      total: compra.total || 0,
      observaciones: (compra as any).observaciones || '',
      detalles: (compra.detalles || []).map((detalle: any) => ({
        producto_id: detalle.producto_id || detalle.producto?.id || 0,
        cantidad: detalle.cantidad || 0,
        precio_unitario: detalle.precio_unitario || 0,
        descuento: detalle.descuento || 0,
        subtotal: detalle.subtotal || (detalle.cantidad * detalle.precio_unitario) || 0
      }))
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'detalles' })

  const detalles = watch('detalles')
  const descuento = watch('descuento') || 0
  const impuesto = watch('impuesto') || 0

  // Cargar productos de los detalles iniciales
  useEffect(() => {
    const cargarProductos = async () => {
      // Primero, agregar productos que ya vienen en los detalles originales
      const productosIniciales: Record<number, Producto> = {}
      if (compra.detalles) {
        compra.detalles.forEach((detalle: any) => {
          // Priorizar producto completo del detalle
          if (detalle.producto && detalle.producto.id) {
            productosIniciales[detalle.producto.id] = detalle.producto
          }
          // Si no hay producto completo pero hay producto_id y producto, usar ese
          if (detalle.producto_id && detalle.producto && !productosIniciales[detalle.producto_id]) {
            productosIniciales[detalle.producto_id] = detalle.producto
          }
        })
        if (Object.keys(productosIniciales).length > 0) {
          setProductosCache(prev => ({ ...prev, ...productosIniciales }))
        }
      }
      
      // Luego, cargar los productos que faltan del API
      const productosIds = (compra.detalles || [])
        .map((d: any) => d.producto_id || d.producto?.id)
        .filter(Boolean)
        .filter((id: number) => !productosIniciales[id]) // Solo cargar los que no tenemos
      
      // Cargar todos los productos faltantes en paralelo para mayor eficiencia
      const promesasProductos = productosIds.map(async (productoId: number) => {
        try {
          const producto = await productoService.getProductoById(productoId)
          if (producto) {
            return { [productoId]: producto }
          }
        } catch (error) {
          console.error(`Error al cargar producto ${productoId}:`, error)
        }
        return null
      })
      
      const productosCargados = await Promise.all(promesasProductos)
      const productosFinales = productosCargados.reduce((acc, curr) => {
        if (curr) {
          return { ...acc, ...curr }
        }
        return acc
      }, {})
      
      if (Object.keys(productosFinales).length > 0) {
        setProductosCache(prev => ({ ...prev, ...productosFinales }))
      }
    }
    cargarProductos()
  }, [compra.detalles])

  const agregarProducto = () => {
    if (!selectedProduct) {
      toast.error('Selecciona un producto de la lista')
      return
    }

    const productoExistente = detalles.find((detalle) => detalle.producto_id === selectedProduct.id)
    if (productoExistente) {
      toast.error('Este producto ya está en la compra')
      return
    }

    append({
      producto_id: selectedProduct.id,
      cantidad: 1,
      precio_unitario: selectedProduct.precio_compra || selectedProduct.precio_venta,
      descuento: 0,
      subtotal: selectedProduct.precio_compra || selectedProduct.precio_venta
    })

    setProductosCache((prev) => ({ ...prev, [selectedProduct.id]: selectedProduct }))
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

  // Calcular totales automáticamente
  useEffect(() => {
    const subtotal = detalles.reduce((sum, detalle) => {
      const subtotalDetalle = Number(detalle.subtotal) || 0
      return sum + (isNaN(subtotalDetalle) ? 0 : subtotalDetalle)
    }, 0)
    const descuentoValido = Number(descuento) || 0
    const impuestoValido = Number(impuesto) || 0
    const total = Math.max(0, subtotal - descuentoValido + impuestoValido)
    setValue('subtotal', subtotal)
    setValue('total', total)
  }, [detalles, descuento, impuesto, setValue])

  const onSubmit = async (data: CompraFormData) => {
    if (!puedeEditar) {
      toast.error('No se puede editar una compra procesada o anulada')
      return
    }

    try {
      await compraService.updateCompra(compra.id, {
        proveedor_id: data.proveedor_id,
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
      } as any)

      toast.success('Compra actualizada correctamente')
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'No se pudo actualizar la compra')
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

  if (!puedeEditar) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-center">
        <p className="text-sm font-semibold text-amber-800">
          Esta compra no se puede editar porque está {compra.estado?.toLowerCase()}
        </p>
        <p className="mt-2 text-xs text-amber-600">
          Solo se pueden editar compras en estado pendiente
        </p>
        <button
          onClick={onCancel}
          className="mt-4 btn-outline"
        >
          Cerrar
        </button>
      </div>
    )
  }

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
        <div className="mt-1 flex gap-2">
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
            onClick={agregarProducto}
            disabled={!selectedProduct}
            className="btn-primary inline-flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> Agregar
          </button>
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
              const detalleOriginal = compra.detalles?.[index]
              const productoDelDetalle = detalleOriginal?.producto
              const productoId = field.producto_id
              const producto = productosCache[productoId] || productoDelDetalle
              // Preferir el nombre del detalle original, luego del cache, luego mostrar mensaje apropiado
              const nombreProducto = productoDelDetalle?.nombre || producto?.nombre || (productoId ? 'Cargando producto...' : 'Producto desconocido')
              const codigoProducto = productoDelDetalle?.codigo_interno || producto?.codigo_interno || ''
              
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
              <LoadingSpinner size="sm" className="mr-2" /> Actualizando...
            </>
          ) : (
            'Actualizar compra'
          )}
        </button>
      </div>
    </form>
  )
}

