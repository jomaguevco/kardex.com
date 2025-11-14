'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import clientePortalService from '@/services/clientePortalService'
import {
  ArrowLeft, ShoppingCart, Heart, Share2, Star,
  Package, Truck, Shield, Check, Minus, Plus,
  Loader2, Zap, TrendingUp, Info, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import ClienteNavbar from '@/components/layout/ClienteNavbar'

export default function DetalleProductoPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const [producto, setProducto] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cantidad, setCantidad] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [carrito, setCarrito] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      router.push('/')
      return
    }

    // Cargar favoritos
    const favoritosGuardados = localStorage.getItem('favoritos')
    if (favoritosGuardados) {
      const favoritos = JSON.parse(favoritosGuardados)
      setIsFavorite(favoritos.includes(Number(params.id)))
    }

    // Cargar carrito
    const carritoGuardado = localStorage.getItem('carrito')
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado))
    }

    fetchProducto()
  }, [isAuthenticated, user, router, params.id])

  const fetchProducto = async () => {
    try {
      setIsLoading(true)
      // Obtener todos los productos y filtrar por ID
      const response = await clientePortalService.getCatalogo()
      if (response.success) {
        const prod = response.data.find((p: any) => p.id === Number(params.id))
        if (prod) {
          setProducto(prod)
        } else {
          toast.error('Producto no encontrado')
          router.push('/cliente-portal/catalogo')
        }
      }
    } catch (error) {
      console.error('Error al cargar producto:', error)
      toast.error('Error al cargar el producto')
      router.push('/cliente-portal/catalogo')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = () => {
    const favoritosGuardados = localStorage.getItem('favoritos')
    const favoritos = favoritosGuardados ? JSON.parse(favoritosGuardados) : []
    
    if (isFavorite) {
      const nuevosFavoritos = favoritos.filter((id: number) => id !== producto.id)
      localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos))
      setIsFavorite(false)
      toast.success('Eliminado de favoritos')
    } else {
      favoritos.push(producto.id)
      localStorage.setItem('favoritos', JSON.stringify(favoritos))
      setIsFavorite(true)
      toast.success('Agregado a favoritos')
    }
  }

  const agregarAlCarrito = () => {
    if (producto.stock_actual <= 0) {
      toast.error('Producto sin stock disponible')
      return
    }

    const existente = carrito.find(item => item.id === producto.id)
    let nuevoCarrito

    if (existente) {
      const nuevaCantidad = existente.cantidad + cantidad
      if (nuevaCantidad > producto.stock_actual) {
        toast.error('No hay suficiente stock disponible')
        return
      }
      nuevoCarrito = carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    } else {
      if (cantidad > producto.stock_actual) {
        toast.error('No hay suficiente stock disponible')
        return
      }
      nuevoCarrito = [...carrito, { ...producto, cantidad }]
    }

    setCarrito(nuevoCarrito)
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito))
    toast.success(`${cantidad} ${cantidad === 1 ? 'unidad agregada' : 'unidades agregadas'} al carrito`)
  }

  const handleCantidadChange = (delta: number) => {
    const nuevaCantidad = cantidad + delta
    if (nuevaCantidad >= 1 && nuevaCantidad <= producto.stock_actual) {
      setCantidad(nuevaCantidad)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: producto.nombre,
        text: `Mira este producto: ${producto.nombre}`,
        url: window.location.href
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Enlace copiado al portapapeles')
    }
  }

  if (isLoading) {
    return (
      <>
        <ClienteNavbar />
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
            <p className="mt-4 text-slate-600">Cargando producto...</p>
          </div>
        </div>
      </>
    )
  }

  if (!producto) {
    return (
      <>
        <ClienteNavbar />
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Package className="mx-auto h-20 w-20 text-slate-300" />
            <h3 className="mt-4 text-xl font-bold text-slate-900">Producto no encontrado</h3>
            <button
              onClick={() => router.push('/cliente-portal/catalogo')}
              className="mt-6 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </>
    )
  }

  const sinStock = producto.stock_actual <= 0
  const stockBajo = producto.stock_actual > 0 && producto.stock_actual <= producto.stock_minimo
  const enCarrito = carrito.find(item => item.id === producto.id)

  // Imágenes del producto (usar la principal y agregar placeholders)
  const imagenes = [
    producto.imagen_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
  ]

  return (
    <>
      <ClienteNavbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center space-x-2 text-sm text-slate-600">
          <button
            onClick={() => router.push('/cliente-portal')}
            className="hover:text-primary-600 transition"
          >
            Inicio
          </button>
          <span>/</span>
          <button
            onClick={() => router.push('/cliente-portal/catalogo')}
            className="hover:text-primary-600 transition"
          >
            Catálogo
          </button>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{producto.nombre}</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-100 shadow-2xl">
              {sinStock && (
                <div className="absolute left-6 top-6 z-10 rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                  Sin Stock
                </div>
              )}
              {stockBajo && !sinStock && (
                <div className="absolute left-6 top-6 z-10 flex items-center space-x-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                  <Zap className="h-4 w-4" />
                  <span>¡Últimas {producto.stock_actual} unidades!</span>
                </div>
              )}
              <button
                onClick={toggleFavorite}
                className="absolute right-6 top-6 z-10 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm transition hover:scale-110"
              >
                <Heart
                  className={`h-6 w-6 transition ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-400'
                  }`}
                />
              </button>
              <img
                src={imagenes[selectedImage]}
                alt={producto.nombre}
                className="h-[500px] w-full object-cover"
              />
            </div>

            {/* Miniaturas */}
            <div className="grid grid-cols-3 gap-4">
              {imagenes.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`overflow-hidden rounded-2xl transition ${
                    selectedImage === index
                      ? 'ring-4 ring-primary-600'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Vista ${index + 1}`}
                    className="h-32 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
                    {producto.codigo_interno}
                  </p>
                  <h1 className="mt-2 text-4xl font-bold text-slate-900">
                    {producto.nombre}
                  </h1>
                </div>
                <button
                  onClick={handleShare}
                  className="rounded-full bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {/* Rating (placeholder) */}
              <div className="mt-4 flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-600">(4.0) · 24 reseñas</span>
              </div>
            </div>

            {/* Precio */}
            <div className="rounded-2xl bg-gradient-to-r from-primary-50 to-indigo-50 p-6">
              <p className="text-sm text-slate-600">Precio</p>
              <p className="mt-1 text-5xl font-bold text-primary-600">
                S/ {Number(producto.precio_venta).toFixed(2)}
              </p>
              {!sinStock && (
                <p className="mt-2 text-sm text-emerald-600 flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  Disponible para entrega inmediata
                </p>
              )}
            </div>

            {/* Descripción */}
            {producto.descripcion && (
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
                <h3 className="mb-3 flex items-center text-lg font-bold text-slate-900">
                  <Info className="mr-2 h-5 w-5 text-primary-600" />
                  Descripción
                </h3>
                <p className="text-slate-700 leading-relaxed">{producto.descripcion}</p>
              </div>
            )}

            {/* Especificaciones */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Especificaciones</h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Stock Disponible</span>
                  <span className={`font-bold ${
                    sinStock ? 'text-red-600' :
                    stockBajo ? 'text-orange-600' :
                    'text-emerald-600'
                  }`}>
                    {producto.stock_actual} unidades
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Código Interno</span>
                  <span className="font-bold text-slate-900">{producto.codigo_interno}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-600">Categoría</span>
                  <span className="font-bold text-slate-900">Electrónica</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Marca</span>
                  <span className="font-bold text-slate-900">Premium</span>
                </div>
              </div>
            </div>

            {/* Selector de cantidad y botones */}
            <div className="space-y-4">
              {!sinStock && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-semibold text-slate-700">Cantidad:</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleCantidadChange(-1)}
                      disabled={cantidad <= 1}
                      className="rounded-xl bg-slate-200 p-2 transition hover:bg-slate-300 disabled:opacity-50"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="w-12 text-center text-2xl font-bold text-slate-900">
                      {cantidad}
                    </span>
                    <button
                      onClick={() => handleCantidadChange(1)}
                      disabled={cantidad >= producto.stock_actual}
                      className="rounded-xl bg-slate-200 p-2 transition hover:bg-slate-300 disabled:opacity-50"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <span className="text-sm text-slate-600">
                    ({producto.stock_actual} disponibles)
                  </span>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={agregarAlCarrito}
                  disabled={sinStock}
                  className={`flex-grow flex items-center justify-center space-x-3 rounded-2xl py-4 font-bold text-white shadow-xl transition ${
                    sinStock
                      ? 'cursor-not-allowed bg-slate-300'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 hover:shadow-2xl'
                  }`}
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span>{sinStock ? 'Sin Stock' : 'Agregar al Carrito'}</span>
                </button>
                {enCarrito && (
                  <button
                    onClick={() => router.push('/cliente-portal/pedidos/nuevo')}
                    className="rounded-2xl bg-emerald-600 px-6 py-4 font-bold text-white shadow-xl transition hover:bg-emerald-700"
                  >
                    Ver Carrito
                  </button>
                )}
              </div>

              {enCarrito && (
                <div className="rounded-xl bg-emerald-50 border-2 border-emerald-200 p-4 flex items-center space-x-3">
                  <Check className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">
                    Ya tienes {enCarrito.cantidad} {enCarrito.cantidad === 1 ? 'unidad' : 'unidades'} en tu carrito
                  </span>
                </div>
              )}
            </div>

            {/* Beneficios */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center space-x-3 rounded-xl bg-blue-50 p-4">
                <Truck className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-xs font-semibold text-blue-900">Envío Gratis</p>
                  <p className="text-xs text-blue-700">En compras +S/ 200</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 rounded-xl bg-emerald-50 p-4">
                <Shield className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-xs font-semibold text-emerald-900">Garantía</p>
                  <p className="text-xs text-emerald-700">30 días devolución</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 rounded-xl bg-purple-50 p-4">
                <Zap className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-xs font-semibold text-purple-900">Entrega Rápida</p>
                  <p className="text-xs text-purple-700">24-48 horas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Productos relacionados (placeholder) */}
        <div className="mt-16">
          <h2 className="mb-6 text-3xl font-bold text-slate-900">Productos Relacionados</h2>
          <div className="rounded-3xl bg-gradient-to-r from-slate-100 to-slate-200 p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-slate-400" />
            <p className="mt-4 text-slate-600">Próximamente: Recomendaciones personalizadas</p>
          </div>
        </div>
      </div>
    </>
  )
}

