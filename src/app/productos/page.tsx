'use client'

import { useState, ChangeEvent, FormEvent, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Sparkles, Package, X, Camera, Upload, Loader2, ImagePlus } from 'lucide-react'
import toast from 'react-hot-toast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import ProductosFilters from '@/components/productos/ProductosFilters'
import ProductosTable from '@/components/productos/ProductosTable'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import BarcodeCameraScanner from '@/components/ui/BarcodeCameraScanner'
import { productoService, CreateProductoData } from '@/services/productoService'
import { Producto, ProductoFilters } from '@/types'

const DEFAULT_LIMIT = 10

type ProductoFormState = {
  codigo_interno: string
  nombre: string
  descripcion: string
  codigo_barras: string
  precio_venta: string
  precio_compra: string
  costo_promedio: string
  stock_actual: string
  stock_minimo: string
  stock_maximo: string
  punto_reorden: string
  imagen_url: string
}

const initialFormState: ProductoFormState = {
  codigo_interno: '',
  nombre: '',
  descripcion: '',
  codigo_barras: '',
  precio_venta: '',
  precio_compra: '',
  costo_promedio: '',
  stock_actual: '',
  stock_minimo: '',
  stock_maximo: '',
  punto_reorden: '',
  imagen_url: ''
}

const DEFAULT_FILTERS: ProductoFilters = {
  page: 1,
  limit: DEFAULT_LIMIT
}

export default function ProductosPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <ProductosContent />
      </Layout>
    </ProtectedRoute>
  )
}

function ProductosContent() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<ProductoFilters>(DEFAULT_FILTERS)
  const [formData, setFormData] = useState<ProductoFormState>(initialFormState)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiltersChange = (nextFilters: ProductoFilters) => {
    setFilters(prev => {
      const merged = { ...prev, ...nextFilters }
      const sanitized: ProductoFilters = {
        page: merged.page ?? 1,
        limit: merged.limit ?? DEFAULT_LIMIT
      }

      if (merged.search && merged.search.trim() !== '') {
        sanitized.search = merged.search.trim()
      }

      if (merged.categoria_id) {
        sanitized.categoria_id = merged.categoria_id
      }

      if (merged.marca_id) {
        sanitized.marca_id = merged.marca_id
      }

      return sanitized
    })
  }

  const handleInputChange = (field: keyof ProductoFormState) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const mapProductToForm = (producto: Producto): ProductoFormState => ({
    codigo_interno: producto.codigo_interno ?? '',
    nombre: producto.nombre ?? '',
    descripcion: producto.descripcion ?? '',
    codigo_barras: producto.codigo_barras ?? '',
    precio_venta:
      producto.precio_venta !== undefined ? String(producto.precio_venta) : '',
    precio_compra:
      producto.precio_compra !== undefined ? String(producto.precio_compra) : '',
    costo_promedio:
      producto.costo_promedio !== undefined ? String(producto.costo_promedio) : '',
    stock_actual:
      producto.stock_actual !== undefined ? String(producto.stock_actual) : '',
    stock_minimo:
      producto.stock_minimo !== undefined ? String(producto.stock_minimo) : '',
    stock_maximo:
      producto.stock_maximo !== undefined ? String(producto.stock_maximo) : '',
    punto_reorden:
      producto.punto_reorden !== undefined ? String(producto.punto_reorden) : '',
    imagen_url: producto.imagen_url ?? ''
  })

  const handleBarcodeScanned = (code: string) => {
    setFormData(prev => ({ ...prev, codigo_barras: code }))
    setIsScannerOpen(false)
    toast.success(`Código escaneado: ${code}`)
  }

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB')
      return
    }

    setIsUploadingImage(true)
    try {
      // Subir a Cloudinary a través del backend
      const formData = new FormData()
      formData.append('imagen', file)
      
      const response = await fetch('/api-proxy/productos/upload-imagen', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al subir la imagen')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, imagen_url: data.url }))
      toast.success('Imagen subida correctamente')
    } catch (error) {
      console.error('Error al subir imagen:', error)
      toast.error('Error al subir la imagen')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setFormData(initialFormState)
    setIsModalOpen(true)
  }

  const openEditModal = (producto: Producto) => {
    setEditingProduct(producto)
    setFormData(mapProductToForm(producto))
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setFormData(initialFormState)
  }

  const openViewModal = (producto: Producto) => {
    setSelectedProduct(producto)
    setIsViewOpen(true)
  }

  const closeViewModal = () => {
    setSelectedProduct(null)
    setIsViewOpen(false)
  }

  const parseDecimal = (value: string) => (value.trim() === '' ? undefined : Number(value))
  const parseInteger = (value: string) => (value.trim() === '' ? undefined : parseInt(value, 10))

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.codigo_interno.trim() || !formData.nombre.trim()) {
      toast.error('Completa los campos obligatorios marcados con *')
      return
    }

    const precioVenta = parseDecimal(formData.precio_venta)
    if (precioVenta === undefined || Number.isNaN(precioVenta) || precioVenta <= 0) {
      toast.error('Ingresa un precio de venta válido')
      return
    }

    const payload: CreateProductoData = {
      codigo_interno: formData.codigo_interno.trim(),
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || undefined,
      codigo_barras: formData.codigo_barras.trim() || undefined,
      precio_venta: precioVenta,
      imagen_url: formData.imagen_url.trim() || undefined
    }

    const precioCompra = parseDecimal(formData.precio_compra)
    if (precioCompra !== undefined) {
      if (Number.isNaN(precioCompra) || precioCompra < 0) {
        toast.error('Ingresa un precio de compra válido')
        return
      }
      payload.precio_compra = precioCompra
    }

    const costoPromedio = parseDecimal(formData.costo_promedio)
    if (costoPromedio !== undefined) {
      if (Number.isNaN(costoPromedio) || costoPromedio < 0) {
        toast.error('Ingresa un costo promedio válido')
        return
      }
      payload.costo_promedio = costoPromedio
    }

    const stockActual = parseInteger(formData.stock_actual)
    if (stockActual !== undefined) {
      if (Number.isNaN(stockActual) || stockActual < 0) {
        toast.error('Ingresa un stock actual válido')
        return
      }
      payload.stock_actual = stockActual
    }

    const stockMinimo = parseInteger(formData.stock_minimo)
    if (stockMinimo !== undefined) {
      if (Number.isNaN(stockMinimo) || stockMinimo < 0) {
        toast.error('Ingresa un stock mínimo válido')
        return
      }
      payload.stock_minimo = stockMinimo
    }

    const stockMaximo = parseInteger(formData.stock_maximo)
    if (stockMaximo !== undefined) {
      if (Number.isNaN(stockMaximo) || stockMaximo < 0) {
        toast.error('Ingresa un stock máximo válido')
        return
      }
      payload.stock_maximo = stockMaximo
    }

    if (stockMinimo !== undefined && stockMaximo !== undefined && stockMaximo < stockMinimo) {
      toast.error('El stock máximo debe ser mayor o igual al stock mínimo')
      return
    }

    const puntoReorden = parseInteger(formData.punto_reorden)
    if (puntoReorden !== undefined) {
      if (Number.isNaN(puntoReorden) || puntoReorden < 0) {
        toast.error('Ingresa un punto de reorden válido')
        return
      }
      payload.punto_reorden = puntoReorden
    }

    try {
      setIsSubmitting(true)

      if (editingProduct) {
        await productoService.updateProducto(editingProduct.id, payload)
        toast.success('Producto actualizado correctamente')
      } else {
        await productoService.createProducto(payload)
        toast.success('Producto creado correctamente')
      }

      await queryClient.invalidateQueries({ queryKey: ['productos'] })
      setFilters(prev => ({ ...prev, page: 1 }))
      closeModal()
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'No se pudo guardar el producto'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (producto: Producto) => {
    const confirmDelete = window.confirm(
      `¿Deseas eliminar el producto "${producto.nombre}"?`
    )

    if (!confirmDelete) return

    try {
      await productoService.deleteProducto(producto.id)
      toast.success('Producto eliminado correctamente')
      await queryClient.invalidateQueries({ queryKey: ['productos'] })
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'No se pudo eliminar el producto'
      toast.error(message)
    }
  }

  const getStockState = (producto: Producto) => {
    const stockActual = Number(producto.stock_actual ?? 0)
    const stockMinimo = Number(producto.stock_minimo ?? 0)
    const stockMaximo = Number(producto.stock_maximo ?? 0)

    if (stockMinimo && stockActual <= stockMinimo) {
      return {
        label: 'Stock bajo',
        badgeClass: 'bg-rose-100 text-rose-600'
      }
    }

    if (stockMaximo && stockActual >= stockMaximo) {
      return {
        label: 'Stock por encima del máximo',
        badgeClass: 'bg-amber-100 text-amber-700'
      }
    }

    return {
      label: 'Stock saludable',
      badgeClass: 'bg-emerald-100 text-emerald-600'
    }
  }

  const stockState = selectedProduct ? getStockState(selectedProduct) : null

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 px-6 py-8 text-white shadow-xl">
        <div className="absolute -right-12 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/15 blur-3xl lg:block" />
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Gestión de inventario
            </span>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Controla tu catálogo con un diseño refinado y consistente
            </h1>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">
              Alinea todos los módulos al estilo del dashboard, mantén stocks saludables y prepara tu operación para un lanzamiento comercial.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-900/25 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuevo producto
              </button>
              <Link
                href="/kardex"
                className="inline-flex items-center justify-center rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/15"
              >
                Ver movimientos KARDEX
              </Link>
            </div>
          </div>

          <div className="hidden justify-end lg:flex">
            <div className="glass-card floating rounded-3xl p-6">
              <Image
                src="/illustrations/dashboard-hero.svg"
                alt="Gestión de inventario"
                width={360}
                height={280}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <ProductosFilters filters={filters} onFiltersChange={handleFiltersChange} />

          <div className="card border border-indigo-100/60 bg-white/90 p-4 text-sm text-slate-600 shadow-lg shadow-indigo-500/5">
            <p className="font-medium text-slate-800">Consejo</p>
            <p className="mt-2">
              Mantén sincronizados los precios y los puntos de reorden: el dashboard mostrará alertas de stock bajo automáticamente.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 px-6 py-4 shadow-lg shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Catálogo de productos</h2>
              <p className="text-sm text-slate-500">
                Gestiona códigos internos, variaciones y existencias en una sola vista.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo producto
            </button>
          </div>

          <ProductosTable
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onView={openViewModal}
            onEdit={openEditModal}
            onDelete={handleDeleteProduct}
          />
        </div>
      </div>

      {isViewOpen && selectedProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 px-4 py-4 sm:py-10 backdrop-blur-sm">
          <div className="glass-card w-full max-w-4xl max-h-[90vh] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
            <div className="flex-shrink-0 flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  <Package className="mr-1.5 h-3.5 w-3.5" />
                  {selectedProduct.codigo_interno || 'Sin código'}
                </span>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                  {selectedProduct.nombre}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedProduct.descripcion || 'Sin descripción registrada'}
                </p>
              </div>

              <button
                onClick={closeViewModal}
                className="rounded-full bg-white/25 p-2 text-white transition hover:bg-white/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mt-6">
              <div className="grid gap-4 sm:grid-cols-2 mb-6">
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-inner">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Precio de venta</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    S/. {Number(selectedProduct.precio_venta ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-inner">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Stock actual</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {selectedProduct.stock_actual ?? 0} unidades
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-inner">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Stock mínimo</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {selectedProduct.stock_minimo ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-inner">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Stock máximo</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {selectedProduct.stock_maximo ?? 0}
                  </p>
                </div>
                {selectedProduct.codigo_barras && (
                  <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-inner">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Código de barras</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {selectedProduct.codigo_barras}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {stockState && (
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${stockState.badgeClass}`}
                  >
                    {stockState.label}
                  </span>
                )}
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedProduct.activo
                      ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                  }`}
                >
                  {selectedProduct.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div className="flex-shrink-0 flex justify-end pt-6 border-t border-slate-200 mt-6">
              <button onClick={closeViewModal} className="btn-outline">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 px-4 py-4 sm:py-10 backdrop-blur-sm">
          <div className="glass-card w-full max-w-5xl max-h-[90vh] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
            <div className="flex-shrink-0 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {editingProduct ? 'Editar producto' : 'Nuevo producto'}
                </span>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  {editingProduct
                    ? 'Actualiza la información del producto'
                    : 'Registra un nuevo producto'}
                </h2>
                <p className="text-xs text-slate-500">
                  Completa la información básica para sincronizar el inventario con el dashboard.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-full bg-white/25 p-2 text-white transition hover:bg-white/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mt-6">
              <form id="producto-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Código interno *
                    </label>
                    <input
                      type="text"
                      value={formData.codigo_interno}
                      onChange={handleInputChange('codigo_interno')}
                      className="input-field"
                      placeholder="SKU interno"
                      autoFocus={!editingProduct}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Código de barras
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.codigo_barras}
                        onChange={handleInputChange('codigo_barras')}
                        className="input-field flex-1"
                        placeholder="EAN / UPC"
                      />
                      <button
                        type="button"
                        onClick={() => setIsScannerOpen(true)}
                        className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition"
                        title="Escanear con cámara"
                      >
                        <Camera className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Nombre del producto *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={handleInputChange('nombre')}
                      className="input-field"
                      placeholder="Nombre comercial"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={handleInputChange('descripcion')}
                      className="input-field min-h-[96px]"
                      placeholder="Comparte características relevantes, presentaciones o notas internas"
                    />
                  </div>
                  
                  {/* Campo de imagen */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Imagen del producto
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Preview de imagen */}
                      <div className="flex-shrink-0">
                        {formData.imagen_url ? (
                          <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-slate-200 group">
                            <img
                              src={formData.imagen_url}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, imagen_url: '' }))}
                              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                            >
                              <X className="h-6 w-6 text-white" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                            <ImagePlus className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Opciones de subida */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">URL de imagen</label>
                          <input
                            type="url"
                            value={formData.imagen_url}
                            onChange={handleInputChange('imagen_url')}
                            className="input-field text-sm"
                            placeholder="https://ejemplo.com/imagen.jpg"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">o</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm disabled:opacity-50"
                          >
                            {isUploadingImage ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Subiendo...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                <span>Subir imagen</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-400">
                          Formatos: JPG, PNG, WEBP. Máximo 5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Precio de venta *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.precio_venta}
                      onChange={handleInputChange('precio_venta')}
                      className="input-field"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Precio de compra
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.precio_compra}
                      onChange={handleInputChange('precio_compra')}
                      className="input-field"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Costo promedio
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.costo_promedio}
                      onChange={handleInputChange('costo_promedio')}
                      className="input-field"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Stock actual
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.stock_actual}
                      onChange={handleInputChange('stock_actual')}
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Stock mínimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.stock_minimo}
                      onChange={handleInputChange('stock_minimo')}
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Stock máximo
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.stock_maximo}
                      onChange={handleInputChange('stock_maximo')}
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Punto de reorden
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.punto_reorden}
                      onChange={handleInputChange('punto_reorden')}
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="flex-shrink-0 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-6 border-t border-slate-200 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="btn-outline sm:min-w-[160px]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="producto-form"
                disabled={isSubmitting}
                className="btn-primary inline-flex items-center justify-center sm:min-w-[200px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Guardando...
                  </>
                ) : editingProduct ? (
                  'Actualizar producto'
                ) : (
                  'Crear producto'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escáner de código de barras */}
      {isScannerOpen && (
        <BarcodeCameraScanner
          isOpen={isScannerOpen}
          onScan={handleBarcodeScanned}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  )
}
