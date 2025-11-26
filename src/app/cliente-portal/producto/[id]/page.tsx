'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import clientePortalService from '@/services/clientePortalService'
import resenaService, { Resena, EstadisticasResenas } from '@/services/resenaService'
import {
  ArrowLeft, ShoppingCart, Heart, Share2, Star,
  Package, Truck, Shield, Check, Minus, Plus,
  Loader2, Zap, TrendingUp, Info, AlertCircle,
  Send, User, MessageSquare, ThumbsUp
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
  // Estados para reseñas
  const [resenas, setResenas] = useState<Resena[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasResenas | null>(null)
  const [miResena, setMiResena] = useState<Resena | null>(null)
  const [nuevaResena, setNuevaResena] = useState({ puntuacion: 5, comentario: '' })
  const [enviandoResena, setEnviandoResena] = useState(false)
  const [cargandoResenas, setCargandoResenas] = useState(true)

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
    fetchResenas()
  }, [isAuthenticated, user, router, params.id])

  const fetchResenas = async () => {
    try {
      setCargandoResenas(true)
      const response = await resenaService.getResenasPorProducto(Number(params.id))
      setResenas(response.data)
      setEstadisticas(response.estadisticas)
      
      // Verificar si el usuario ya dejó una reseña
      const miResenaData = await resenaService.getMiResena(Number(params.id))
      if (miResenaData) {
        setMiResena(miResenaData)
        setNuevaResena({ puntuacion: miResenaData.puntuacion, comentario: miResenaData.comentario || '' })
      }
    } catch (error) {
      console.error('Error al cargar reseñas:', error)
    } finally {
      setCargandoResenas(false)
    }
  }

  const enviarResena = async () => {
    if (!nuevaResena.comentario.trim()) {
      toast.error('Por favor, escribe un comentario para tu reseña')
      return
    }

    try {
      setEnviandoResena(true)
      await resenaService.crearResena({
        producto_id: Number(params.id),
        puntuacion: nuevaResena.puntuacion,
        comentario: nuevaResena.comentario
      })
      toast.success(miResena ? 'Reseña actualizada' : 'Reseña enviada')
      fetchResenas()
    } catch (error) {
      console.error('Error al enviar reseña:', error)
      toast.error('Error al enviar la reseña')
    } finally {
      setEnviandoResena(false)
    }
  }

  const eliminarMiResena = async () => {
    if (!miResena) return
    
    try {
      await resenaService.eliminarResena(miResena.id)
      toast.success('Reseña eliminada')
      setMiResena(null)
      setNuevaResena({ puntuacion: 5, comentario: '' })
      fetchResenas()
    } catch (error) {
      console.error('Error al eliminar reseña:', error)
      toast.error('Error al eliminar la reseña')
    }
  }

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

              {/* Rating real */}
              <div className="mt-4 flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(estadisticas?.promedio || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-600">
                  ({estadisticas?.promedio?.toFixed(1) || '0.0'}) · {estadisticas?.totalResenas || 0} reseñas
                </span>
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

        {/* Sección de Reseñas */}
        <div className="mt-16" id="resenas">
          <h2 className="mb-8 text-3xl font-bold text-slate-900 flex items-center">
            <MessageSquare className="mr-3 h-8 w-8 text-primary-600" />
            Reseñas y Opiniones
          </h2>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Estadísticas de reseñas */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Resumen */}
                <div className="rounded-3xl bg-gradient-to-br from-primary-50 to-indigo-100 p-6 shadow-lg">
                  <div className="text-center">
                    <p className="text-6xl font-bold text-primary-600">
                      {estadisticas?.promedio?.toFixed(1) || '0.0'}
                    </p>
                    <div className="mt-2 flex justify-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-6 w-6 ${
                            i < Math.round(estadisticas?.promedio || 0) 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Basado en {estadisticas?.totalResenas || 0} reseñas
                    </p>
                  </div>

                  {/* Distribución */}
                  <div className="mt-6 space-y-2">
                    {[5, 4, 3, 2, 1].map(stars => {
                      const count = estadisticas?.distribucion?.[stars as keyof typeof estadisticas.distribucion] || 0
                      const total = estadisticas?.totalResenas || 1
                      const percentage = (count / total) * 100
                      return (
                        <div key={stars} className="flex items-center space-x-3">
                          <span className="w-8 text-sm font-medium text-slate-600">{stars}★</span>
                          <div className="flex-grow h-3 rounded-full bg-white/50 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-8 text-xs text-slate-500">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Formulario de reseña */}
                <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-lg">
                  <h3 className="mb-4 text-lg font-bold text-slate-900">
                    {miResena ? '✏️ Editar tu reseña' : '⭐ Deja tu reseña'}
                  </h3>

                  {/* Selector de estrellas */}
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium text-slate-600">Tu puntuación:</p>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setNuevaResena(prev => ({ ...prev, puntuacion: star }))}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-10 w-10 transition ${
                              star <= nuevaResena.puntuacion
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-300 hover:text-yellow-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {nuevaResena.puntuacion === 1 && 'Muy malo'}
                      {nuevaResena.puntuacion === 2 && 'Malo'}
                      {nuevaResena.puntuacion === 3 && 'Regular'}
                      {nuevaResena.puntuacion === 4 && 'Bueno'}
                      {nuevaResena.puntuacion === 5 && 'Excelente'}
                    </p>
                  </div>

                  {/* Campo de comentario */}
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-slate-600">
                      Tu opinión:
                    </label>
                    <textarea
                      value={nuevaResena.comentario}
                      onChange={(e) => setNuevaResena(prev => ({ ...prev, comentario: e.target.value }))}
                      placeholder="Cuéntanos tu experiencia con este producto..."
                      rows={4}
                      className="w-full rounded-xl border-2 border-slate-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex space-x-3">
                    <button
                      onClick={enviarResena}
                      disabled={enviandoResena || !nuevaResena.comentario.trim()}
                      className="flex-grow flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enviandoResena ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          <span>{miResena ? 'Actualizar' : 'Enviar'}</span>
                        </>
                      )}
                    </button>
                    {miResena && (
                      <button
                        onClick={eliminarMiResena}
                        className="rounded-xl border-2 border-red-200 px-4 py-3 text-red-600 transition hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de reseñas */}
            <div className="lg:col-span-2">
              {cargandoResenas ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : resenas.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-12 text-center">
                  <MessageSquare className="mx-auto h-16 w-16 text-slate-300" />
                  <h3 className="mt-4 text-xl font-bold text-slate-700">Sin reseñas aún</h3>
                  <p className="mt-2 text-slate-500">¡Sé el primero en compartir tu opinión!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {resenas.map((resena) => (
                    <div
                      key={resena.id}
                      className={`rounded-2xl border-2 p-6 transition hover:shadow-lg ${
                        resena.usuario_id === user?.id 
                          ? 'border-primary-200 bg-primary-50/50' 
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          {resena.usuario?.foto_perfil ? (
                            <img
                              src={resena.usuario.foto_perfil}
                              alt={resena.usuario.nombre_completo}
                              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 text-white font-bold shadow-md">
                              {resena.usuario?.nombre_completo?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">
                              {resena.usuario?.nombre_completo || 'Usuario'}
                              {resena.usuario_id === user?.id && (
                                <span className="ml-2 text-xs font-normal text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                                  Tu reseña
                                </span>
                              )}
                            </p>
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < resena.puntuacion 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-slate-500">
                                {new Date(resena.fecha_creacion).toLocaleDateString('es-PE', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 text-slate-700 leading-relaxed">
                        {resena.comentario}
                      </p>

                      <div className="mt-4 flex items-center space-x-4 text-sm text-slate-500">
                        <button className="flex items-center space-x-1 hover:text-primary-600 transition">
                          <ThumbsUp className="h-4 w-4" />
                          <span>Útil</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

