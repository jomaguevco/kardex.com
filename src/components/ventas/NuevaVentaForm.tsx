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
  cantidad: z.number().int('La cantidad debe ser un número entero').positive('La cantidad debe ser mayor a 0'),
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
    if (!detalle) return
    
    // Asegurar que el valor sea un número válido, si no usar el valor actual o 0
    const valorNum = isNaN(valor) || !isFinite(valor) ? (campo === 'cantidad' ? 1 : 0) : valor
    
    const cantidad = campo === 'cantidad' ? Math.max(1, valorNum || detalle.cantidad || 1) : (Number(detalle.cantidad) || 1)
    const precio = campo === 'precio_unitario' ? Math.max(0, valorNum || detalle.precio_unitario || 0) : (Number(detalle.precio_unitario) || 0)
    const descuento = campo === 'descuento' ? Math.max(0, valorNum || 0) : (Number(detalle.descuento) || 0)
    
    // Calcular subtotal asegurándonos de que todos los valores sean números válidos
    const cantidadValida = Number(cantidad) || 0
    const precioValido = Number(precio) || 0
    const descuentoValido = Number(descuento) || 0
    const subtotal = Math.max(0, (cantidadValida * precioValido) - descuentoValido)

    if (campo === 'cantidad') {
      setValue(`detalles.${index}.cantidad`, cantidadValida)
    } else if (campo === 'precio_unitario') {
      setValue(`detalles.${index}.precio_unitario`, precioValido)
    } else {
      setValue(`detalles.${index}.descuento`, descuentoValido)
    }
    setValue(`detalles.${index}.subtotal`, subtotal)
  }

  const onSubmit = async (data: VentaFormData) => {
    try {
      // Validaciones adicionales antes de enviar
      // Verificar cliente_id del formulario o del estado
      const clienteIdFinal = data.cliente_id || clienteSeleccionado?.id || 0
      
      console.log('onSubmit - Datos del formulario:', {
        cliente_id: data.cliente_id,
        clienteSeleccionado: clienteSeleccionado?.id,
        clienteIdFinal,
        detalles: data.detalles?.length,
        total: data.total
      })
      
      if (!clienteIdFinal || clienteIdFinal === 0) {
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
        cliente_id: Number(clienteIdFinal),
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
      
      console.log('Enviando venta:', { ...ventaData, detalles: ventaData.detalles.length })

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
      console.error('Error completo:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      })
      
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
    <form onSubmit={handleSubmit(onSubmit, (errors) => {
      console.error('Errores de validación:', errors)
      // Mostrar el primer error encontrado
      const firstError = Object.values(errors)[0]
      if (firstError) {
        toast.error(firstError.message || 'Por favor completa todos los campos requeridos')
      }
    })} className="space-y-6">
      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Número de Factura
          </label>
          <input
            {...register('numero_factura')}
            className="input-field text-base"
            placeholder="FAC-001"
          />
          {errors.numero_factura && (
            <p className="text-base text-red-600 mt-1">{errors.numero_factura.message}</p>
          )}
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            {...register('fecha')}
            type="datetime-local"
            className="input-field text-base"
          />
          {errors.fecha && (
            <p className="text-base text-red-600 mt-1">{errors.fecha.message}</p>
          )}
        </div>

        <div className="relative">
          <label className="block text-base font-medium text-gray-700 mb-1">
            Cliente
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
                // Delay para permitir click en el dropdown
                setTimeout(() => setMostrarDropdownClientes(false), 200)
              }}
              placeholder="Buscar por nombre, documento o email..."
              className="input-field text-base w-full"
            />
            {loadingClientes && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <LoadingSpinner size="sm" />
              </div>
            )}
            {mostrarDropdownClientes && busquedaCliente.length >= 2 && clientes.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {clientes.map((cliente) => (
                  <div
                    key={cliente.id}
                    onClick={() => {
                      setClienteSeleccionado(cliente)
                      setBusquedaCliente(cliente.nombre)
                      setValue('cliente_id', cliente.id, { shouldValidate: true })
                      setMostrarDropdownClientes(false)
                      console.log('Cliente seleccionado:', cliente.id, cliente.nombre)
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{cliente.nombre}</div>
                    <div className="text-sm text-gray-500">
                      {cliente.numero_documento && `${cliente.tipo_documento || 'DOC'}: ${cliente.numero_documento}`}
                      {cliente.email && ` • ${cliente.email}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {mostrarDropdownClientes && busquedaCliente.length >= 2 && !loadingClientes && clientes.length === 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-sm text-gray-500">
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
            <p className="text-base text-red-600 mt-1">{errors.cliente_id.message}</p>
          )}
          {!clienteSeleccionado && !watch('cliente_id') && (
            <p className="text-sm text-amber-600 mt-1">⚠️ Debes seleccionar un cliente para continuar</p>
          )}
          {clienteSeleccionado && (
            <p className="text-sm text-gray-600 mt-1">
              Cliente seleccionado: <span className="font-medium">{clienteSeleccionado.nombre}</span>
            </p>
          )}
        </div>
      </div>

      {/* Búsqueda de productos */}
      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">
          Agregar Producto
        </label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value)}
              className="input-field text-base"
              placeholder="Buscar producto por nombre o código..."
            />
          </div>
          <button
            type="button"
            onClick={agregarProducto}
            disabled={!productoSeleccionado}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-base"
          >
            <Plus className="h-5 w-5 mr-1" />
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
                      <p className="font-medium text-gray-900 text-base">{producto.nombre}</p>
                      <p className="text-base text-gray-500">
                        {producto.codigo_interno} - Stock: {producto.stock_actual}
                      </p>
                    </div>
                    <p className="font-semibold text-primary-600 text-base">
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
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Productos</h3>
        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-base">No hay productos agregados</p>
            <p className="text-base">Busca y agrega productos para continuar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => {
              const producto = productosCache[watchedDetalles[index]?.producto_id]
              return (
                <div key={field.id} className="card p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-4 items-center">
                    <div className="md:col-span-2">
                      <p className="font-medium text-gray-900 text-base">{producto?.nombre}</p>
                      <p className="text-base text-gray-500">{producto?.codigo_interno}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={watchedDetalles[index]?.cantidad || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10) || 1
                          actualizarDetalle(index, 'cantidad', isNaN(val) || val < 1 ? 1 : Math.floor(val))
                        }}
                        onKeyDown={(e) => {
                          // Prevenir teclas de punto decimal y coma
                          if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                            e.preventDefault()
                          }
                        }}
                        className="input-field text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Precio
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={watchedDetalles[index]?.precio_unitario || 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          actualizarDetalle(index, 'precio_unitario', isNaN(val) ? 0 : val)
                        }}
                        className="input-field text-base"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Descuento
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={watchedDetalles[index]?.descuento || 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          actualizarDetalle(index, 'descuento', isNaN(val) ? 0 : val)
                        }}
                        className="input-field text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Subtotal
                      </label>
                      <p className="font-semibold text-gray-900 text-base">
                        ${(Number(watchedDetalles[index]?.subtotal) || 0).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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

      {/* Totales */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Calculator className="h-6 w-6 mr-2" />
          Totales
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 text-base">Subtotal:</span>
            <span className="font-semibold text-base">${(Number(watchedSubtotal) || 0).toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 text-base">Descuento:</span>
            <input
              {...register('descuento', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-24 text-right font-semibold text-base border-b border-gray-300 focus:border-primary-500 focus:outline-none"
            />
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 text-base">Impuesto:</span>
            <input
              {...register('impuesto', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-24 text-right font-semibold text-base border-b border-gray-300 focus:border-primary-500 focus:outline-none"
            />
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span className="text-primary-600">
                ${(Number(watch('total')) || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">
          Observaciones
        </label>
        <textarea
          {...register('observaciones')}
          rows={3}
          className="input-field text-base"
          placeholder="Observaciones adicionales..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline text-base"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || fields.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-base"
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

