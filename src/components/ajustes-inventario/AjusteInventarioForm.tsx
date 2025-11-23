'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Calculator } from 'lucide-react'
import toast from 'react-hot-toast'
import { productoService } from '@/services/productoService'
import { ajusteInventarioService, TipoMovimiento, CreateAjusteData } from '@/services/ajusteInventarioService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import BarcodeScanner from '@/components/ui/BarcodeScanner'
import { cn } from '@/utils/cn'

const ajusteSchema = z.object({
  producto_id: z.number().positive('Selecciona un producto'),
  tipo_movimiento: z.string().min(1, 'Selecciona un tipo de movimiento'),
  cantidad: z.number().int('La cantidad debe ser un número entero').positive('La cantidad debe ser mayor a 0'),
  precio_unitario: z.number().min(0).optional(),
  motivo_movimiento: z.string().optional(),
  observaciones: z.string().optional(),
  numero_documento: z.string().optional()
})

type AjusteFormData = z.infer<typeof ajusteSchema>

interface AjusteInventarioFormProps {
  tiposMovimiento: TipoMovimiento[]
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AjusteInventarioForm({ tiposMovimiento, onSuccess, onCancel }: AjusteInventarioFormProps) {
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null)
  const [tipoMovimientoSeleccionado, setTipoMovimientoSeleccionado] = useState<TipoMovimiento | null>(null)

  const { data: productosData, isLoading: loadingProductos } = useQuery({
    queryKey: ['productos', { search: busquedaProducto, limit: 10 }],
    queryFn: () => productoService.getProductos({ search: busquedaProducto, limit: 10 }),
    enabled: busquedaProducto.length > 2
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<AjusteFormData>({
    resolver: zodResolver(ajusteSchema),
    defaultValues: {
      producto_id: 0,
      tipo_movimiento: '',
      cantidad: 1,
      precio_unitario: 0,
      motivo_movimiento: '',
      observaciones: '',
      numero_documento: ''
    }
  })

  const watchedCantidad = watch('cantidad') || 1
  const watchedPrecio = watch('precio_unitario') || 0
  const costoTotal = watchedCantidad * watchedPrecio

  // Cargar precio del producto cuando se selecciona
  useEffect(() => {
    if (productoSeleccionado) {
      setValue('producto_id', productoSeleccionado.id)
      setValue('precio_unitario', productoSeleccionado.costo_promedio || productoSeleccionado.precio_compra || 0)
    }
  }, [productoSeleccionado, setValue])

  // Actualizar tipo de movimiento seleccionado
  useEffect(() => {
    const tipo = tiposMovimiento.find(t => t.codigo === watch('tipo_movimiento'))
    setTipoMovimientoSeleccionado(tipo || null)
  }, [watch('tipo_movimiento'), tiposMovimiento])

  const onSubmit = async (data: AjusteFormData) => {
    try {
      if (!productoSeleccionado) {
        toast.error('Debes seleccionar un producto')
        return
      }

      if (!tipoMovimientoSeleccionado) {
        toast.error('Debes seleccionar un tipo de movimiento')
        return
      }

      // Validar que la cantidad sea válida para salidas
      if (tipoMovimientoSeleccionado.tipo_operacion === 'SALIDA') {
        const stockActual = productoSeleccionado.stock_actual || 0
        if (data.cantidad > stockActual) {
          toast.error(`No hay suficiente stock. Stock actual: ${stockActual}`)
          return
        }
      }

      const ajusteData: CreateAjusteData = {
        producto_id: data.producto_id,
        tipo_movimiento: tipoMovimientoSeleccionado.codigo,
        cantidad: data.cantidad,
        precio_unitario: data.precio_unitario > 0 ? data.precio_unitario : undefined,
        motivo_movimiento: data.motivo_movimiento || undefined,
        observaciones: data.observaciones || undefined,
        numero_documento: data.numero_documento || undefined,
        requiere_autorizacion: tipoMovimientoSeleccionado.requiere_autorizacion
      }

      await ajusteInventarioService.createAjuste(ajusteData)
      toast.success('Ajuste de inventario creado exitosamente')
      onSuccess?.()
    } catch (error: any) {
      console.error('Error al crear ajuste:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al crear el ajuste'
      toast.error(errorMessage)
    }
  }

  // Separar tipos por operación
  const tiposEntrada = tiposMovimiento.filter(t => t.tipo_operacion === 'ENTRADA' || t.codigo?.includes('ENTRADA'))
  const tiposSalida = tiposMovimiento.filter(t => t.tipo_operacion === 'SALIDA' || t.codigo?.includes('SALIDA'))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Búsqueda de producto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Producto <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {/* Escáner de código de barras */}
          <BarcodeScanner
            onProductFound={(producto) => {
              setProductoSeleccionado(producto)
              setBusquedaProducto('')
              setValue('producto_id', producto.id)
              setValue('precio_unitario', producto.costo_promedio || producto.precio_compra || 0)
              toast.success(`Producto seleccionado: ${producto.nombre}`)
            }}
            placeholder="Escanea código de barras..."
            className="mb-2"
          />
          
          {/* Búsqueda manual por nombre */}
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
          </div>
        </div>

        {/* Lista de productos encontrados */}
        {busquedaProducto.length > 2 && (
          <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
            {loadingProductos ? (
              <div className="p-4 text-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              productosData?.productos.map((producto: any) => (
                <div
                  key={producto.id}
                  className={cn(
                    'p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100',
                    productoSeleccionado?.id === producto.id && 'bg-primary-50'
                  )}
                  onClick={() => {
                    setProductoSeleccionado(producto)
                    setBusquedaProducto('')
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{producto.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {producto.codigo_interno} - Stock: {producto.stock_actual}
                      </p>
                    </div>
                    <p className="font-semibold text-primary-600">
                      ${Number(producto.costo_promedio || producto.precio_compra || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {productoSeleccionado && (
          <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm font-medium text-emerald-900">
              {productoSeleccionado.nombre}
            </p>
            <p className="text-xs text-emerald-700">
              Stock actual: {productoSeleccionado.stock_actual} | 
              Precio: ${Number(productoSeleccionado.costo_promedio || productoSeleccionado.precio_compra || 0).toFixed(2)}
            </p>
          </div>
        )}

        {errors.producto_id && (
          <p className="text-sm text-red-600 mt-1">{errors.producto_id.message}</p>
        )}
      </div>

      {/* Tipo de movimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Movimiento <span className="text-red-500">*</span>
          </label>
          <select
            {...register('tipo_movimiento')}
            className="input-field"
          >
            <option value="">Selecciona un tipo</option>
            {tiposEntrada.length > 0 && (
              <optgroup label="Entradas">
                {tiposEntrada.map((tipo, index) => (
                  <option key={tipo.id || tipo.codigo || index} value={tipo.codigo}>
                    {tipo.nombre} {tipo.requiere_autorizacion && '🔒'}
                  </option>
                ))}
              </optgroup>
            )}
            {tiposSalida.length > 0 && (
              <optgroup label="Salidas">
                {tiposSalida.map((tipo, index) => (
                  <option key={tipo.id || tipo.codigo || index} value={tipo.codigo}>
                    {tipo.nombre} {tipo.requiere_autorizacion && '🔒'}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {errors.tipo_movimiento && (
            <p className="text-sm text-red-600 mt-1">{errors.tipo_movimiento.message}</p>
          )}
          {tipoMovimientoSeleccionado && tipoMovimientoSeleccionado.descripcion && (
            <p className="text-xs text-gray-500 mt-1">{tipoMovimientoSeleccionado.descripcion}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad <span className="text-red-500">*</span>
          </label>
          <input
            {...register('cantidad', { valueAsNumber: true })}
            type="number"
            step="1"
            min="1"
            className="input-field"
            placeholder="1"
            onChange={(e) => {
              const val = parseInt(e.target.value, 10) || 1
              const intValue = isNaN(val) || val < 1 ? 1 : Math.floor(val)
              setValue('cantidad', intValue, { shouldValidate: true })
              // Actualizar el valor visual del input
              e.target.value = intValue.toString()
            }}
            onKeyDown={(e) => {
              // Prevenir teclas de punto decimal y coma
              if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                e.preventDefault()
              }
            }}
          />
          {errors.cantidad && (
            <p className="text-sm text-red-600 mt-1">{errors.cantidad.message}</p>
          )}
          {productoSeleccionado && tipoMovimientoSeleccionado?.tipo_operacion === 'SALIDA' && (
            <p className="text-xs text-amber-600 mt-1">
              Stock disponible: {productoSeleccionado.stock_actual}
            </p>
          )}
        </div>
      </div>

      {/* Precio y total */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio Unitario
          </label>
          <input
            {...register('precio_unitario', { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0"
            className="input-field"
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-1">
            Si no se especifica, se usará el costo promedio del producto
          </p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-5 w-5 text-indigo-500" />
            <span className="text-sm font-semibold text-gray-600">Costo Total</span>
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            ${costoTotal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Motivo y observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Motivo del Movimiento
        </label>
        <input
          {...register('motivo_movimiento')}
          type="text"
          className="input-field"
          placeholder="Ej: Ajuste por inventario físico, Devolución de cliente, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número de Documento (Opcional)
        </label>
        <input
          {...register('numero_documento')}
          type="text"
          className="input-field"
          placeholder="Ej: AJ-2024-001"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observaciones
        </label>
        <textarea
          {...register('observaciones')}
          rows={3}
          className="input-field"
          placeholder="Observaciones adicionales sobre el ajuste..."
        />
      </div>

      {/* Información de autorización */}
      {tipoMovimientoSeleccionado?.requiere_autorizacion && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-800">
            ⚠️ Este ajuste requiere autorización
          </p>
          <p className="text-xs text-amber-700 mt-1">
            El ajuste quedará pendiente hasta que sea aprobado por un administrador.
          </p>
        </div>
      )}

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
          disabled={isSubmitting || !productoSeleccionado || !tipoMovimientoSeleccionado}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creando...
            </>
          ) : (
            'Crear Ajuste'
          )}
        </button>
      </div>
    </form>
  )
}

