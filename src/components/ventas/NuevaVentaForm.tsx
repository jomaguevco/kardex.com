'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Calculator, Receipt, User, Calendar, Package, ShoppingCart, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productoService } from '@/services/productoService'
import { ventaService } from '@/services/ventaService'
import { clienteService } from '@/services/clienteService'
import { VentaForm, Producto, Cliente } from '@/types'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import BarcodeScanner from '@/components/ui/BarcodeScanner'
import { cn } from '@/utils/cn'

const detalleVentaSchema = z.object({
  producto_id: z.number().positive('Selecciona un producto'),
  cantidad: z.number().int('La cantidad debe ser un número entero').positive('La cantidad debe ser mayor a 0'),
  precio_unitario: z.number().positive('El precio debe ser mayor a 0'),
  descuento: z.number().min(0).optional(),
  subtotal: z.number().positive('El subtotal debe ser mayor a 0')
})

const ventaSchema = z.object({
  numero_factura: z.string().min(1, 'El número de factura es requerido'),
  cliente_id: z.number().refine((val) => val > 0, {
    message: 'Debes seleccionar un cliente'
  }),
  fecha: z.string().min(1, 'La fecha es requerida'),
  subtotal: z.number().refine((val) => val > 0, {
    message: 'El subtotal debe ser mayor a 0. Agrega productos a la venta.'
  }),
  descuento: z.number().min(0).optional(),
  impuesto: z.number().min(0).optional(),
  total: z.number().refine((val) => val > 0, {
    message: 'El total debe ser mayor a 0. Agrega productos a la venta.'
  }),
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
  const [busquedaCliente, setBusquedaCliente] = useState('')
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [mostrarDropdownClientes, setMostrarDropdownClientes] = useState(false)

  const { data: productosData, isLoading: loadingProductos } = useQuery({
    queryKey: ['productos', { search: busquedaProducto, limit: 10 }],
    queryFn: () => productoService.getProductos({ search: busquedaProducto, limit: 10 }),
    enabled: busquedaProducto.length > 2
  })

  const { data: clientesData, isLoading: loadingClientes, error: clientesError } = useQuery({
    queryKey: ['clientes', 'search', busquedaCliente],
    queryFn: () => clienteService.getClientes({ search: busquedaCliente, limit: 10 }),
    enabled: busquedaCliente.length >= 2
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
    trigger,
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
    name: 'detalles',
    rules: {
      minLength: 1,
      required: 'Agrega al menos un producto'
    }
  })

  const watchedDetalles = watch('detalles')
  const watchedSubtotal = watch('subtotal')
  const watchedDescuento = watch('descuento') || 0
  const watchedImpuesto = watch('impuesto') || 0

  // Calcular totales automáticamente
  useEffect(() => {
    const subtotal = watchedDetalles.reduce((sum, detalle) => {
      const subtotalDetalle = Number(detalle.subtotal) || 0
      return sum + (isNaN(subtotalDetalle) ? 0 : subtotalDetalle)
    }, 0)
    const descuentoValido = Number(watchedDescuento) || 0
    const impuestoValido = Number(watchedImpuesto) || 0
    const total = Math.max(0, subtotal - descuentoValido + impuestoValido)
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

  const agregarProducto = (producto?: Producto, cantidadIncremental: number = 1) => {
    const productoAAgregar = producto || productoSeleccionado
    if (!productoAAgregar) return

    // Buscar si el producto ya existe en los detalles
    const productoExistenteIndex = watchedDetalles.findIndex(
      detalle => detalle.producto_id === productoAAgregar.id
    )

    if (productoExistenteIndex >= 0) {
      // Si ya existe, incrementar la cantidad
      const detalleExistente = watchedDetalles[productoExistenteIndex]
      const nuevaCantidad = (detalleExistente.cantidad || 1) + cantidadIncremental
      const precio = detalleExistente.precio_unitario || productoAAgregar.precio_venta
      const descuento = detalleExistente.descuento || 0
      const nuevoSubtotal = (nuevaCantidad * precio) - descuento
      
      setValue(`detalles.${productoExistenteIndex}.cantidad`, nuevaCantidad, { shouldValidate: true, shouldDirty: true })
      setValue(`detalles.${productoExistenteIndex}.subtotal`, nuevoSubtotal, { shouldValidate: true, shouldDirty: true })
    } else {
      // Si no existe, agregarlo nuevo
      const nuevoDetalle = {
        producto_id: productoAAgregar.id,
        cantidad: cantidadIncremental,
        precio_unitario: Number(productoAAgregar.precio_venta) || 0,
        descuento: 0,
        subtotal: (Number(productoAAgregar.precio_venta) || 0) * cantidadIncremental
      }
      
      append(nuevoDetalle)
      
      // Asegurar que los valores se registren correctamente
      const index = fields.length
      setTimeout(() => {
        setValue(`detalles.${index}.producto_id`, nuevoDetalle.producto_id, { shouldValidate: true })
        setValue(`detalles.${index}.cantidad`, nuevoDetalle.cantidad, { shouldValidate: true })
        setValue(`detalles.${index}.precio_unitario`, nuevoDetalle.precio_unitario, { shouldValidate: true })
        setValue(`detalles.${index}.descuento`, nuevoDetalle.descuento, { shouldValidate: true })
        setValue(`detalles.${index}.subtotal`, nuevoDetalle.subtotal, { shouldValidate: true })
      }, 0)

      setProductosCache((prev) => ({ ...prev, [productoAAgregar.id]: productoAAgregar }))
    }

    setProductoSeleccionado(null)
    setBusquedaProducto('')
  }

  const actualizarDetalle = (index: number, campo: 'cantidad' | 'precio_unitario' | 'descuento', valor: number) => {
    const detalle = watchedDetalles[index]
    if (!detalle) return
    
    const valorNum = isNaN(valor) || !isFinite(valor) ? (campo === 'cantidad' ? 1 : 0) : valor
    
    // Obtener valores actuales o usar los nuevos según el campo que se está actualizando
    const cantidadNueva = campo === 'cantidad' ? Math.max(1, Math.floor(valorNum) || 1) : (Number(detalle.cantidad) || 1)
    const precioNuevo = campo === 'precio_unitario' ? Math.max(0, valorNum || 0) : (Number(detalle.precio_unitario) || 0)
    const descuentoNuevo = campo === 'descuento' ? Math.max(0, valorNum || 0) : (Number(detalle.descuento) || 0)
    
    // Calcular subtotal con los valores finales
    const subtotalNuevo = Math.max(0, (cantidadNueva * precioNuevo) - descuentoNuevo)

    // Actualizar todos los valores del detalle de forma síncrona
    setValue(`detalles.${index}.cantidad`, cantidadNueva, { shouldValidate: false })
    setValue(`detalles.${index}.precio_unitario`, precioNuevo, { shouldValidate: false })
    setValue(`detalles.${index}.descuento`, descuentoNuevo, { shouldValidate: false })
    setValue(`detalles.${index}.subtotal`, subtotalNuevo, { shouldValidate: false })
    
    if (detalle.producto_id) {
      setValue(`detalles.${index}.producto_id`, detalle.producto_id, { shouldValidate: false })
    }

    // Forzar recálculo de totales después de actualizar el detalle
    // Usar setTimeout para asegurar que los valores se hayan propagado
    setTimeout(() => {
      const detallesActuales = watchedDetalles.map((d, i) => {
        if (i === index) {
          return { ...d, cantidad: cantidadNueva, precio_unitario: precioNuevo, descuento: descuentoNuevo, subtotal: subtotalNuevo }
        }
        return d
      })
      const nuevoSubtotal = detallesActuales.reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0)
      const descuentoGeneral = Number(watchedDescuento) || 0
      const impuestoGeneral = Number(watchedImpuesto) || 0
      const nuevoTotal = Math.max(0, nuevoSubtotal - descuentoGeneral + impuestoGeneral)
      
      setValue('subtotal', nuevoSubtotal)
      setValue('total', nuevoTotal)
    }, 0)
  }

  const onSubmit = async (data: VentaFormData) => {
    try {
      const clienteIdFinal = data.cliente_id || clienteSeleccionado?.id || 0
      
      if (!clienteIdFinal || clienteIdFinal === 0) {
        toast.error('Debes seleccionar un cliente')
        return
      }

      // Usar watchedDetalles para obtener los valores más recientes
      const detallesActuales = watchedDetalles || data.detalles || []
      
      if (!detallesActuales || detallesActuales.length === 0) {
        toast.error('Debes agregar al menos un producto')
        return
      }

      const detallesInvalidos = detallesActuales.filter(
        detalle => !detalle.producto_id || detalle.cantidad <= 0 || detalle.precio_unitario <= 0
      )

      if (detallesInvalidos.length > 0) {
        toast.error('Todos los productos deben tener cantidad y precio válidos')
        return
      }

      let fechaVenta = data.fecha
      if (typeof fechaVenta === 'string' && fechaVenta.includes('T')) {
        fechaVenta = new Date(fechaVenta).toISOString()
      }

      // Recalcular subtotales de cada detalle para asegurar valores correctos
      const detallesCalculados = detallesActuales.map(detalle => {
        const cantidad = Number(detalle.cantidad) || 1
        const precioUnitario = Number(detalle.precio_unitario) || 0
        const descuentoDetalle = Number(detalle.descuento) || 0
        const subtotalDetalle = (cantidad * precioUnitario) - descuentoDetalle
        
        return {
          producto_id: Number(detalle.producto_id),
          cantidad: cantidad,
          precio_unitario: precioUnitario,
          descuento: descuentoDetalle,
          subtotal: Math.max(0, subtotalDetalle)
        }
      })

      // Recalcular totales basados en los detalles actualizados
      const subtotalCalculado = detallesCalculados.reduce((sum, det) => sum + det.subtotal, 0)
      const descuentoGeneral = Number(data.descuento) || 0
      const impuestoGeneral = Number(data.impuesto) || 0
      const totalCalculado = Math.max(0, subtotalCalculado - descuentoGeneral + impuestoGeneral)

      const ventaData: VentaForm = {
        numero_factura: data.numero_factura,
        cliente_id: Number(clienteIdFinal),
        fecha_venta: fechaVenta,
        subtotal: subtotalCalculado,
        descuento: descuentoGeneral,
        impuestos: impuestoGeneral,
        total: totalCalculado,
        observaciones: data.observaciones || '',
        detalles: detallesCalculados
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
      
      let errorMessage = 'Error al crear la venta'
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit(onSubmit, (errors) => {
        if (errors.cliente_id) {
          toast.error('Debes seleccionar un cliente')
        } else if (errors.detalles) {
          toast.error('Debes agregar al menos un producto')
        } else if (errors.subtotal) {
          toast.error('El subtotal debe ser mayor a 0')
        } else if (errors.total) {
          toast.error('El total debe ser mayor a 0')
        } else {
          const firstError = Object.values(errors)[0]
          if (firstError) {
            const errorMessage = firstError.message || 'Por favor completa todos los campos requeridos'
            toast.error(errorMessage)
          }
        }
      })} 
      className="space-y-6"
    >
      {/* Información básica - Card con gradiente */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 shadow-lg shadow-slate-900/5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 p-2">
            <Receipt className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Información de la Venta</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Receipt className="h-4 w-4" />
              Número de Factura
            </label>
            <input
              {...register('numero_factura')}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="FAC-001"
            />
            {errors.numero_factura && (
              <p className="mt-1 text-xs text-red-600">{errors.numero_factura.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Calendar className="h-4 w-4" />
              Fecha
            </label>
            <input
              {...register('fecha')}
              type="datetime-local"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            {errors.fecha && (
              <p className="mt-1 text-xs text-red-600">{errors.fecha.message}</p>
            )}
          </div>

          <div className="relative">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <User className="h-4 w-4" />
              Cliente *
            </label>
            <div className="relative">
              <input
                type="text"
                value={busquedaCliente}
                onChange={(e) => {
                  setBusquedaCliente(e.target.value)
                  setMostrarDropdownClientes(true)
                  if (!e.target.value) {
                    setClienteSeleccionado(null)
                    setValue('cliente_id', 0)
                  }
                }}
                onFocus={() => {
                  if (busquedaCliente.length >= 2) {
                    setMostrarDropdownClientes(true)
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setMostrarDropdownClientes(false), 200)
                }}
                placeholder="Buscar por nombre, documento o email..."
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {loadingClientes && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
              {mostrarDropdownClientes && busquedaCliente.length >= 2 && clientes.length > 0 && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                  {clientes.map((cliente) => (
                    <div
                      key={cliente.id}
                      onClick={() => {
                        setClienteSeleccionado(cliente)
                        setBusquedaCliente(cliente.nombre)
                        setValue('cliente_id', cliente.id, { 
                          shouldValidate: true,
                          shouldDirty: true,
                          shouldTouch: true
                        })
                        setMostrarDropdownClientes(false)
                        setTimeout(() => {
                          trigger('cliente_id')
                        }, 100)
                      }}
                      className="cursor-pointer border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50 last:border-b-0"
                    >
                      <div className="font-medium text-slate-900">{cliente.nombre}</div>
                      <div className="text-xs text-slate-500">
                        {cliente.numero_documento && `${cliente.tipo_documento || 'DOC'}: ${cliente.numero_documento}`}
                        {cliente.email && ` • ${cliente.email}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {mostrarDropdownClientes && busquedaCliente.length >= 2 && !loadingClientes && clientes.length === 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-xl">
                  No se encontraron clientes
                </div>
              )}
            </div>
            <input
              type="hidden"
              {...register('cliente_id', { 
                valueAsNumber: true,
                validate: (value) => {
                  const finalValue = value || clienteSeleccionado?.id || 0
                  return finalValue > 0 || 'Debes seleccionar un cliente'
                }
              })}
              value={clienteSeleccionado?.id || watch('cliente_id') || 0}
            />
            {errors.cliente_id && (
              <p className="mt-1 text-xs text-red-600">{errors.cliente_id.message}</p>
            )}
            {clienteSeleccionado && (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-medium text-emerald-700">
                  {clienteSeleccionado.nombre}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Búsqueda de productos - Card moderna */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-2">
            <Package className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Agregar Productos</h3>
        </div>

        <div className="space-y-4">
          {/* Escáner de código de barras */}
          <div>
            <BarcodeScanner
              onProductFound={(producto) => {
                if (producto.stock_actual <= 0) {
                  toast.error('Producto sin stock disponible', { duration: 1500 })
                  return
                }
                agregarProducto(producto, 1)
              }}
              placeholder="Escanea código de barras..."
            />
            <p className="mt-2 text-xs text-slate-500">
              ⚡ Escanea y el producto se agrega automáticamente. Ajusta cantidades después.
            </p>
          </div>
          
          {/* Búsqueda manual */}
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={busquedaProducto}
                onChange={(e) => setBusquedaProducto(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Buscar producto por nombre o código..."
              />
            </div>
            <button
              type="button"
              onClick={() => agregarProducto()}
              disabled={!productoSeleccionado}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-xl hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>

          {/* Lista de productos encontrados */}
          {busquedaProducto.length > 2 && (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white">
              {loadingProductos ? (
                <div className="flex items-center justify-center p-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                productosData?.productos.map((producto) => {
                  const stockBajo = producto.stock_actual <= (producto.stock_minimo || 5)
                  const sinStock = producto.stock_actual <= 0
                  return (
                  <div
                    key={producto.id}
                    className={cn(
                      'cursor-pointer border-b border-slate-100 p-3 transition last:border-b-0',
                      productoSeleccionado?.id === producto.id && 'bg-emerald-50',
                      sinStock ? 'opacity-50 cursor-not-allowed bg-red-50' : 'hover:bg-slate-50'
                    )}
                    onClick={() => !sinStock && setProductoSeleccionado(producto as any)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{producto.nombre}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-500">{producto.codigo_interno}</p>
                          <span className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                            sinStock ? 'bg-red-100 text-red-700' :
                            stockBajo ? 'bg-amber-100 text-amber-700' :
                            'bg-emerald-100 text-emerald-700'
                          )}>
                            {sinStock ? 'Sin stock' : `Stock: ${producto.stock_actual}`}
                          </span>
                        </div>
                      </div>
                      <p className="font-semibold text-emerald-600">
                        ${Number(producto.precio_venta).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )})
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lista de productos agregados */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2">
            <ShoppingCart className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Productos en la Venta ({fields.length})
          </h3>
        </div>

        {fields.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-4 text-sm font-medium text-slate-600">No hay productos agregados</p>
            <p className="mt-1 text-xs text-slate-500">Busca y agrega productos para continuar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => {
              const producto = productosCache[watchedDetalles[index]?.producto_id]
              return (
                <div 
                  key={field.id} 
                  className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <input type="hidden" {...register(`detalles.${index}.producto_id`, { valueAsNumber: true })} />
                  <input type="hidden" {...register(`detalles.${index}.subtotal`, { valueAsNumber: true })} />
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-7 lg:items-center">
                    <div className="lg:col-span-2">
                      <p className="font-semibold text-slate-900">{producto?.nombre}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500">{producto?.codigo_interno}</p>
                        <span className={cn(
                          'text-xs font-medium',
                          (producto?.stock_actual || 0) < (watchedDetalles[index]?.cantidad || 0) 
                            ? 'text-red-600' 
                            : 'text-emerald-600'
                        )}>
                          (Stock: {producto?.stock_actual || 0})
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Cantidad</label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max={producto?.stock_actual || 999}
                        value={watchedDetalles[index]?.cantidad || 1}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 1
                          actualizarDetalle(index, 'cantidad', isNaN(val) || val < 1 ? 1 : Math.floor(val))
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                            e.preventDefault()
                          }
                        }}
                        className={cn(
                          "w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2",
                          (producto?.stock_actual || 0) < (watchedDetalles[index]?.cantidad || 0)
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                            : "border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                        )}
                      />
                      {(producto?.stock_actual || 0) < (watchedDetalles[index]?.cantidad || 0) && (
                        <p className="mt-1 text-xs text-red-600">⚠️ Excede stock disponible</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Precio</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={watchedDetalles[index]?.precio_unitario || 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          actualizarDetalle(index, 'precio_unitario', isNaN(val) ? 0 : val)
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Descuento</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={watchedDetalles[index]?.descuento || 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          actualizarDetalle(index, 'descuento', isNaN(val) ? 0 : val)
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">Subtotal</label>
                      <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900">
                        ${(Number(watchedDetalles[index]?.subtotal) || 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Totales - Card destacada */}
      <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 shadow-xl shadow-indigo-500/10">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 p-2">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Resumen de Totales</h3>
        </div>
        
        <input type="hidden" {...register('subtotal', { valueAsNumber: true })} />
        <input type="hidden" {...register('total', { valueAsNumber: true })} />
        
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-white/60 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">Subtotal:</span>
            <span className="text-base font-semibold text-slate-900">
              ${(Number(watchedSubtotal) || 0).toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center justify-between rounded-lg bg-white/60 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">Descuento:</span>
            <input
              {...register('descuento', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-right text-sm font-semibold shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          
          <div className="flex items-center justify-between rounded-lg bg-white/60 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">Impuesto:</span>
            <input
              {...register('impuesto', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-right text-sm font-semibold shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          
          <div className="border-t-2 border-indigo-200 pt-3">
            <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-4">
              <span className="text-base font-bold text-white">TOTAL:</span>
              <span className="text-xl font-bold text-white">
                ${(Number(watch('total')) || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
        <label className="mb-2 block text-sm font-medium text-slate-700">Observaciones</label>
        <textarea
          {...register('observaciones')}
          rows={3}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          placeholder="Observaciones adicionales..."
        />
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || fields.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-xl hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              Creando...
            </>
          ) : (
            <>
              <Receipt className="h-4 w-4" />
              Crear Venta
            </>
          )}
        </button>
      </div>
    </form>
  )
}
