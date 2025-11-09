'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Plus, Trash2, Search, Calculator } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { productoService } from '@/services/productoService'
import { proveedorService } from '@/services/proveedorService'
import { compraService } from '@/services/compraService'
import { Producto, Proveedor } from '@/types'
import { CompraForm } from '@/types'
import { cn } from '@/utils/cn'

const detalleSchema = z.object({
  producto_id: z.number().positive('Selecciona un producto'),
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
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
    const cantidad = campo === 'cantidad' ? Math.max(1, valor) : detalle.cantidad
    const precio = campo === 'precio_unitario' ? Math.max(0, valor) : detalle.precio_unitario
    const descuentoDetalle = campo === 'descuento' ? Math.max(0, valor) : detalle.descuento || 0
    const subtotal = Math.max(0, cantidad * precio - descuentoDetalle)

    if (campo === 'cantidad') {
      setValue(`detalles.${index}.cantidad`, cantidad)
    } else if (campo === 'precio_unitario') {
      setValue(`detalles.${index}.precio_unitario`, precio)
    } else if (campo === 'descuento') {
      setValue(`detalles.${index}.descuento`, descuentoDetalle)
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
        <div className="mt-1 flex gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={busquedaProducto}
              onChange={(event) => setBusquedaProducto(event.target.value)}
              placeholder="Buscar por nombre o código..."
              className="input-field pl-9"
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
              const producto = productosCache[field.producto_id]
              return (
                <div
                  key={field.id}
                  className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{producto?.nombre || `Producto ${field.producto_id}`}</p>
                    <p className="text-xs text-slate-500">ID: {field.producto_id}</p>
                  </div>

                  <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Cantidad</label>
                      <input
                        type="number"
                        min={1}
                        value={detalles[index]?.cantidad || 0}
                        onChange={(event) => actualizarDetalle(index, 'cantidad', parseInt(event.target.value, 10) || 0)}
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
                        onChange={(event) => actualizarDetalle(index, 'precio_unitario', parseFloat(event.target.value) || 0)}
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
                        onChange={(event) => actualizarDetalle(index, 'descuento', parseFloat(event.target.value) || 0)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subtotal</p>
                      <p className="text-sm font-semibold text-slate-900">${Number(detalles[index]?.subtotal || 0).toFixed(2)}</p>
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
            <span className="font-semibold text-slate-900">${Number(watch('subtotal') || 0).toFixed(2)}</span>
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
            <span>${Number(watch('total') || 0).toFixed(2)}</span>
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
