'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Calculator } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productoService } from '@/services/productoService'
import { ventaService } from '@/services/ventaService'
import { clienteService } from '@/services/clienteService'
import { VentaForm, Producto, Cliente } from '@/types'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/utils/cn'

const detalleVentaSchema = z.object({
  producto_id: z.number().positive('Selecciona un producto'),
  cantidad: z.number().positive('La cantidad debe ser mayor a 0'),
  precio_unitario: z.number().positive('El precio debe ser mayor a 0'),
  descuento: z.number().min(0).optional(),
  subtotal: z.number().positive('El subtotal debe ser mayor a 0')
})

const ventaSchema = z.object({
  numero_factura: z.string().min(1, 'El número de factura es requerido'),
  cliente_id: z.number().positive('Selecciona un cliente'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  subtotal: z.number().positive('El subtotal debe ser mayor a 0'),
  descuento: z.number().min(0).optional(),
  impuesto: z.number().min(0).optional(),
  total: z.number().positive('El total debe ser mayor a 0'),
  observaciones: z.string().optional(),
  detalles: z.array(detalleVentaSchema).min(1, 'Agrega al menos un producto')
})

type VentaFormData = z.infer<typeof ventaSchema>

interface NuevaVentaFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function NuevaVentaForm({ onSuccess, onCancel }: NuevaVentaFormProps) {
  const [productosCache, setProductosCache] = useState<Record<number, Producto>>({})
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)

  const { data: productosData, isLoading: loadingProductos } = useQuery({
    queryKey: ['productos', { search: busquedaProducto, limit: 10 }],
    queryFn: () => productoService.getProductos({ search: busquedaProducto, limit: 10 }),
    enabled: busquedaProducto.length > 2
  })

  const { data: clientesData, isLoading: loadingClientes, error: clientesError } = useQuery({
    queryKey: ['clientes', 'selector'],
    queryFn: () => clienteService.getClientes({ limit: 200 })
  })

  const clientes: Cliente[] = clientesData?.clientes ?? []

  useEffect(() => {
    if (clientesError) {
      const message = (clientesError as any)?.message || 'No se pudieron cargar los clientes'
      toast.error(message)
    }
  }, [clientesError])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<VentaFormData>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      numero_factura: `FAC-${Date.now()}`,
      cliente_id: 0,
      fecha: new Date().toISOString().slice(0, 16),
      subtotal: 0,
      descuento: 0,
      impuesto: 0,
      total: 0,
      observaciones: '',
      detalles: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'detalles'
  })

  const watchedDetalles = watch('detalles')
  const watchedSubtotal = watch('subtotal')
  const watchedDescuento = watch('descuento') || 0
  const watchedImpuesto = watch('impuesto') || 0

  // Calcular totales automáticamente
  useEffect(() => {
    const subtotal = watchedDetalles.reduce((sum, detalle) => sum + (detalle.subtotal || 0), 0)
    const total = subtotal - watchedDescuento + watchedImpuesto
    setValue('subtotal', subtotal)
    setValue('total', total)
  }, [watchedDetalles, watchedDescuento, watchedImpuesto, setValue])

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

  useEffect(() => {
    if (productoSeleccionado) {
      setProductosCache((prev) => ({ ...prev, [productoSeleccionado.id]: productoSeleccionado }))
    }
  }, [productoSeleccionado])

  const agregarProducto = () => {
    if (!productoSeleccionado) return

    const productoExistente = watchedDetalles.find(
      detalle => detalle.producto_id === productoSeleccionado.id
    )

    if (productoExistente) {
      toast.error('Este producto ya está en la venta')
      return
    }

    append({
      producto_id: productoSeleccionado.id,
      cantidad: 1,
      precio_unitario: productoSeleccionado.precio_venta,
      descuento: 0,
      subtotal: productoSeleccionado.precio_venta
    })

    setProductosCache((prev) => ({ ...prev, [productoSeleccionado.id]: productoSeleccionado }))
    setProductoSeleccionado(null)
    setBusquedaProducto('')
  }

  const actualizarDetalle = (index: number, campo: 'cantidad' | 'precio_unitario' | 'descuento', valor: number) => {
    const detalle = watchedDetalles[index]
    const cantidad = campo === 'cantidad' ? Math.max(1, valor) : detalle.cantidad
    const precio = campo === 'precio_unitario' ? Math.max(0, valor) : detalle.precio_unitario
    const descuento = campo === 'descuento' ? Math.max(0, valor) : detalle.descuento || 0
    const subtotal = Math.max(0, cantidad * precio - descuento)

    if (campo === 'cantidad') {
      setValue(`detalles.${index}.cantidad`, cantidad)
    } else if (campo === 'precio_unitario') {
      setValue(`detalles.${index}.precio_unitario`, precio)
    } else {
      setValue(`detalles.${index}.descuento`, descuento)
    }
    setValue(`detalles.${index}.subtotal`, subtotal)
  }

  const onSubmit = async (data: VentaFormData) => {
    try {
      // Validaciones adicionales antes de enviar
      if (!data.cliente_id || data.cliente_id === 0) {
        toast.error('Debes seleccionar un cliente')
        return
      }

      if (!data.detalles || data.detalles.length === 0) {
        toast.error('Debes agregar al menos un producto')
        return
      }

      // Validar que todos los detalles tengan información válida
      const detallesInvalidos = data.detalles.filter(
        detalle => !detalle.producto_id || detalle.cantidad <= 0 || detalle.precio_unitario <= 0
      )

      if (detallesInvalidos.length > 0) {
        toast.error('Todos los productos deben tener cantidad y precio válidos')
        return
      }

      // Formatear fecha correctamente
      let fechaVenta = data.fecha
      if (typeof fechaVenta === 'string' && fechaVenta.includes('T')) {
        // Si es datetime-local, convertir a ISO
        fechaVenta = new Date(fechaVenta).toISOString()
      }

      const ventaData: VentaForm = {
        numero_factura: data.numero_factura,
        cliente_id: data.cliente_id,
        fecha_venta: fechaVenta,
        subtotal: Number(data.subtotal) || 0,
        descuento: Number(data.descuento) || 0,
        impuestos: Number(data.impuesto) || 0,
        total: Number(data.total) || 0,
        observaciones: data.observaciones || '',
        detalles: data.detalles.map(detalle => ({
          producto_id: Number(detalle.producto_id),
          cantidad: Number(detalle.cantidad),
          precio_unitario: Number(detalle.precio_unitario),
          descuento: Number(detalle.descuento) || 0,
          subtotal: Number(detalle.subtotal)
        }))
      }

      await ventaService.createVenta(ventaData)
      toast.success('Venta creada exitosamente')
      reset({
        numero_factura: `FAC-${Date.now()}`,
        cliente_id: 0,
        fecha: new Date().toISOString().slice(0, 16),
        subtotal: 0,
        descuento: 0,
        impuesto: 0,
        total: 0,
        observaciones: '',
        detalles: []
      })
      setProductoSeleccionado(null)
      setBusquedaProducto('')
      setProductosCache({})
      onSuccess?.()
    } catch (error: any) {
      console.error('Error al crear venta:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear la venta'
      toast.error(errorMessage)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Información básica */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Factura
          </label>
          <input
            {...register('numero_factura')}
            className="input-field"
            placeholder="FAC-001"
          />
          {errors.numero_factura && (
            <p className="text-sm text-red-600 mt-1">{errors.numero_factura.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            {...register('fecha')}
            type="datetime-local"
            className="input-field"
          />
          {errors.fecha && (
            <p className="text-sm text-red-600 mt-1">{errors.fecha.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente
          </label>
          <select
            {...register('cliente_id', { valueAsNumber: true })}
            className="input-field"
            disabled={loadingClientes}
          >
            <option value={0}>Selecciona un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </select>
          {errors.cliente_id && (
            <p className="text-sm text-red-600 mt-1">{errors.cliente_id.message}</p>
          )}
        </div>
      </div>

      {/* Búsqueda de productos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Agregar Producto
        </label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value)}
              className="input-field"
              placeholder="Buscar producto por nombre o código..."
            />
          </div>
          <button
            type="button"
            onClick={agregarProducto}
            disabled={!productoSeleccionado}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </button>
        </div>

        {/* Lista de productos encontrados */}
        {busquedaProducto.length > 2 && (
          <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
            {loadingProductos ? (
              <div className="p-4 text-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              productosData?.productos.map((producto) => (
                <div
                  key={producto.id}
                  className={cn(
                    'p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100',
                    productoSeleccionado?.id === producto.id && 'bg-primary-50'
                  )}
                  onClick={() => setProductoSeleccionado(producto as any)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{producto.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {producto.codigo_interno} - Stock: {producto.stock_actual}
                      </p>
                    </div>
                    <p className="font-semibold text-primary-600">
                      ${Number(producto.precio_venta).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Detalles de la venta */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos</h3>
        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay productos agregados</p>
            <p className="text-sm">Busca y agrega productos para continuar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => {
              const producto = productosCache[watchedDetalles[index]?.producto_id]
              return (
                <div key={field.id} className="card p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 sm:gap-4 items-center">
                    <div className="md:col-span-2">
                      <p className="font-medium text-gray-900">{producto?.nombre}</p>
                      <p className="text-sm text-gray-500">{producto?.codigo_interno}</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={watchedDetalles[index]?.cantidad || 0}
                        onChange={(e) => actualizarDetalle(index, 'cantidad', parseInt(e.target.value))}
                        className="input-field text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Precio
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={watchedDetalles[index]?.precio_unitario || 0}
                        onChange={(e) => actualizarDetalle(index, 'precio_unitario', parseFloat(e.target.value))}
                        className="input-field text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Descuento
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={watchedDetalles[index]?.descuento || 0}
                        onChange={(e) => actualizarDetalle(index, 'descuento', parseFloat(e.target.value))}
                        className="input-field text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Subtotal
                      </label>
                      <p className="font-semibold text-gray-900">
                        ${Number(watchedDetalles[index]?.subtotal || 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Totales */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Totales
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold">${Number(watchedSubtotal || 0).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Descuento:</span>
            <input
              {...register('descuento', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-24 text-right font-semibold border-b border-gray-300 focus:border-primary-500 focus:outline-none"
            />
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Impuesto:</span>
            <input
              {...register('impuesto', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-24 text-right font-semibold border-b border-gray-300 focus:border-primary-500 focus:outline-none"
            />
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary-600">
                ${Number(watch('total') || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones
        </label>
        <textarea
          {...register('observaciones')}
          rows={3}
          className="input-field"
          placeholder="Observaciones adicionales..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || fields.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creando...
            </>
          ) : (
            'Crear Venta'
          )}
        </button>
      </div>
    </form>
  )
}

