'use client'

import { useEffect, useState } from 'react'
import { useClienteAuth } from '@/hooks/useClienteAuth'
import clientePortalService from '@/services/clientePortalService'
import { 
  Package, ShoppingBag, Receipt, TrendingUp, Loader2, 
  Sparkles, ChevronRight, Star, Gift, Zap, Clock,
  ChevronLeft, Heart, ShoppingCart
} from 'lucide-react'
import Link from 'next/link'

export default function ClientePortalPage() {
  const { user, isLoading: authLoading, isAuthorized } = useClienteAuth()
  const [dashboard, setDashboard] = useState<any>(null)
  const [productosDestacados, setProductosDestacados] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentPromoSlide, setCurrentPromoSlide] = useState(0)

  // Placeholder images para productos sin imagen
  const placeholderImages = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&q=80'
  ]

  const getPlaceholderImage = (index: number) => {
    return placeholderImages[index % placeholderImages.length]
  }

  // Banners promocionales con imágenes de Unsplash
  const banners = [
    {
      title: '¡Ofertas de Temporada!',
      subtitle: 'Hasta 40% de descuento en productos seleccionados',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
      color: 'from-blue-600 to-indigo-600',
      cta: 'Ver Ofertas'
    },
    {
      title: 'Nuevos Productos',
      subtitle: 'Descubre las últimas novedades en nuestro catálogo',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80',
      color: 'from-purple-600 to-pink-600',
      cta: 'Explorar'
    },
    {
      title: 'Envío Gratis',
      subtitle: 'En compras mayores a S/ 200',
      image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1200&q=80',
      color: 'from-emerald-600 to-teal-600',
      cta: 'Comprar Ahora'
    }
  ]

  useEffect(() => {
    if (isAuthorized && !authLoading) {
      fetchDashboard()
    }
  }, [isAuthorized, authLoading])

  useEffect(() => {
    // Auto-slide para banners principales
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Auto-slide para promociones
    const interval = setInterval(() => {
      setCurrentPromoSlide((prev) => (prev + 1) % Math.ceil(productosDestacados.length / 2))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboard = async () => {
    try {
      // Obtener estado de cuenta
      const response = await clientePortalService.getEstadoCuenta()
      if (response.success) {
        setDashboard(response.data)
      }

      // Obtener productos del catálogo para mostrar productos reales
      const catalogoResponse = await clientePortalService.getCatalogo()
      if (catalogoResponse.success && catalogoResponse.data) {
        // Tomar los primeros 8 productos para destacados
        // Usar el ID del producto para determinar descuentos de forma consistente
        const productosReales = catalogoResponse.data.slice(0, 8).map((producto: any, index: number) => {
          // Generar descuento basado en el ID del producto para que sea consistente
          const tieneDescuento = producto.id % 3 === 0 // Cada 3er producto tiene descuento
          const porcentajeDescuento = tieneDescuento ? ((producto.id % 4) + 1) * 5 : 0 // 5%, 10%, 15% o 20%
          const esNuevo = producto.id % 5 === 0 // Cada 5to producto es "nuevo"
          
          return {
            ...producto,
            imagen: producto.imagen_url || getPlaceholderImage(index),
            descuento: porcentajeDescuento,
            nuevo: esNuevo
          }
        })
        setProductosDestacados(productosReales)
      }
    } catch (error) {
      console.error('Error al cargar dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  if (isLoading || authLoading || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
          <p className="mt-4 text-slate-600">Cargando tu portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner con Carrusel */}
      <div className="relative h-[400px] overflow-hidden rounded-3xl shadow-2xl">
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <div className="relative h-full w-full">
              <img
                src={banner.image}
                alt={banner.title}
                className="h-full w-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} opacity-90`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-6">
                  <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm font-semibold">Promoción Especial</span>
                  </div>
                  <h1 className="text-5xl font-bold drop-shadow-lg mb-4">
                    {banner.title}
                  </h1>
                  <p className="text-xl mb-8 drop-shadow-md">
                    {banner.subtitle}
                  </p>
                  <Link
                    href="/cliente-portal/catalogo"
                    className="inline-flex items-center space-x-2 rounded-full bg-white px-8 py-4 font-bold text-slate-900 shadow-xl transition hover:scale-105 hover:shadow-2xl"
                  >
                    <span>{banner.cta}</span>
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Controles del carrusel */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-3 backdrop-blur-sm transition hover:bg-white/50"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/30 p-3 backdrop-blur-sm transition hover:bg-white/50"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bienvenida personalizada con modelo 3D */}
      <div className="glass-card rounded-3xl overflow-hidden bg-gradient-to-br from-primary-50 via-indigo-50 to-purple-50">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-slate-900">
              ¡Hola, {user?.nombre_completo?.split(' ')[0] || user?.nombre_completo || 'Cliente'}! 👋
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Bienvenido de vuelta a tu portal personal
            </p>
            <div className="mt-6 flex items-center space-x-4">
              <div className="flex items-center space-x-2 rounded-full bg-white px-4 py-2 shadow-md">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-slate-900">Cliente Premium</span>
              </div>
              <div className="text-sm text-slate-600">
                Miembro desde <span className="font-bold">
                  {dashboard?.cliente?.fecha_creacion 
                    ? new Date(dashboard.cliente.fecha_creacion).getFullYear()
                    : dashboard?.cliente?.createdAt
                    ? new Date(dashboard.cliente.createdAt).getFullYear()
                    : user?.fecha_creacion
                    ? new Date(user.fecha_creacion).getFullYear()
                    : new Date().getFullYear()}
                </span>
              </div>
            </div>
          </div>
          {/* Modelo 3D interactivo con CSS */}
          <div className="relative h-[300px] lg:h-[350px] flex items-center justify-center perspective-1000">
            <div className="relative preserve-3d animate-float">
              {/* Caja 3D con productos */}
              <div className="relative w-48 h-48 transform-style-3d animate-rotate-3d">
                {/* Frente */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center backface-hidden transform translate-z-24">
                  <ShoppingBag className="h-20 w-20 text-white" />
                </div>
                {/* Atrás */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl flex items-center justify-center backface-hidden transform rotate-y-180 translate-z-24">
                  <Package className="h-20 w-20 text-white" />
                </div>
                {/* Izquierda */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl flex items-center justify-center backface-hidden transform rotate-y-n90 translate-z-24">
                  <Gift className="h-20 w-20 text-white" />
                </div>
                {/* Derecha */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-2xl flex items-center justify-center backface-hidden transform rotate-y-90 translate-z-24">
                  <Star className="h-20 w-20 text-white" />
                </div>
              </div>
              {/* Partículas decorativas */}
              <div className="absolute -top-8 -left-8 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
              <div className="absolute -bottom-4 -right-8 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              <div className="absolute top-1/2 -right-12 w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas animadas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card group rounded-2xl p-6 transition hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Compras</p>
              <p className="mt-2 text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {dashboard?.totalCompras || 0}
              </p>
              <p className="mt-1 text-xs text-emerald-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% este mes
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg transition group-hover:scale-110">
              <ShoppingBag className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="glass-card group rounded-2xl p-6 transition hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Gastado</p>
              <p className="mt-2 text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                S/ {Number(dashboard?.totalGastado || 0).toFixed(0)}
              </p>
              <p className="mt-1 text-xs text-emerald-600 flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                Ahorrado S/ 150
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg transition group-hover:scale-110">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="glass-card group rounded-2xl p-6 transition hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Productos Únicos</p>
              <p className="mt-2 text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {dashboard?.productosUnicos || 0}
              </p>
              <p className="mt-1 text-xs text-purple-600 flex items-center">
                <Package className="h-3 w-3 mr-1" />
                Variedad premium
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg transition group-hover:scale-110">
              <Package className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="glass-card group rounded-2xl p-6 transition hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pedidos Activos</p>
              <p className="mt-2 text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {dashboard?.pedidosActivos || 0}
              </p>
              <p className="mt-1 text-xs text-slate-600 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {dashboard?.pedidosActivos > 0 ? 'En proceso' : 'Todos entregados'}
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg transition group-hover:scale-110">
              <Receipt className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Productos Destacados */}
      <div className="glass-card rounded-3xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-yellow-500" />
              Productos Destacados
            </h2>
            <p className="mt-1 text-slate-600">Las mejores ofertas para ti</p>
          </div>
          <Link
            href="/cliente-portal/catalogo"
            className="flex items-center space-x-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            <span>Ver Todo</span>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {productosDestacados.map((producto, index) => (
            <Link
              key={producto.id}
              href={`/cliente-portal/producto/${producto.id}`}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition hover:shadow-2xl hover:scale-[1.02]"
            >
              {producto.nuevo && (
                <div className="absolute left-3 top-3 z-10 flex items-center space-x-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  <Zap className="h-3 w-3" />
                  <span>NUEVO</span>
                </div>
              )}
              {producto.descuento > 0 && (
                <div className="absolute right-3 top-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                  -{producto.descuento}%
                </div>
              )}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={producto.imagen_url || producto.imagen || getPlaceholderImage(index)}
                  alt={producto.nombre}
                  className="h-full w-full object-cover transition group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = getPlaceholderImage(index)
                  }}
                />
                <button className="absolute bottom-3 right-3 rounded-full bg-white p-2 shadow-lg transition hover:bg-red-50 hover:text-red-600">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-500 font-medium">{producto.codigo_interno}</p>
                <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition line-clamp-1">
                  {producto.nombre}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    {producto.descuento > 0 ? (
                      <div>
                        <p className="text-sm text-slate-500 line-through">
                          S/ {Number(producto.precio_venta || producto.precio || 0).toFixed(2)}
                        </p>
                        <p className="text-xl font-bold text-primary-600">
                          S/ {(Number(producto.precio_venta || producto.precio || 0) * (1 - producto.descuento / 100)).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-primary-600">
                        S/ {Number(producto.precio_venta || producto.precio || 0).toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="rounded-full bg-primary-600 p-2 text-white transition hover:bg-primary-700">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Accesos rápidos con animación */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Link
          href="/cliente-portal/catalogo"
          className="glass-card group relative overflow-hidden rounded-3xl p-8 transition hover:shadow-2xl"
        >
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20 blur-2xl transition group-hover:scale-150" />
          <div className="relative flex items-center space-x-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg transition group-hover:scale-110">
              <Package className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary-600 transition">
                Explorar Catálogo
              </h3>
              <p className="mt-1 text-slate-600">
                Descubre todos nuestros productos
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/cliente-portal/mis-compras"
          className="glass-card group relative overflow-hidden rounded-3xl p-8 transition hover:shadow-2xl"
        >
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 opacity-20 blur-2xl transition group-hover:scale-150" />
          <div className="relative flex items-center space-x-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg transition group-hover:scale-110">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary-600 transition">
                Mis Compras
              </h3>
              <p className="mt-1 text-slate-600">
                Revisa tu historial completo
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/cliente-portal/pedidos"
          className="glass-card group relative overflow-hidden rounded-3xl p-8 transition hover:shadow-2xl"
        >
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 opacity-20 blur-2xl transition group-hover:scale-150" />
          <div className="relative flex items-center space-x-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg transition group-hover:scale-110">
              <Receipt className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary-600 transition">
                Mis Pedidos
              </h3>
              <p className="mt-1 text-slate-600">
                Gestiona tus pedidos activos
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/cliente-portal/estado-cuenta"
          className="glass-card group relative overflow-hidden rounded-3xl p-8 transition hover:shadow-2xl"
        >
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 opacity-20 blur-2xl transition group-hover:scale-150" />
          <div className="relative flex items-center space-x-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 text-white shadow-lg transition group-hover:scale-110">
              <TrendingUp className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-primary-600 transition">
                Estado de Cuenta
              </h3>
              <p className="mt-1 text-slate-600">
                Análisis y estadísticas
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Tus productos favoritos */}
      {dashboard?.productosMasComprados && dashboard.productosMasComprados.length > 0 && (
        <div className="glass-card rounded-3xl p-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 flex items-center">
            <Heart className="mr-2 h-6 w-6 text-red-500" />
            Tus Productos Favoritos
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {dashboard.productosMasComprados.slice(0, 4).map((item: any, index: number) => (
              <div
                key={item.producto_id}
                className="group flex items-center space-x-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 p-4 transition hover:from-primary-50 hover:to-indigo-50 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white font-bold shadow-lg">
                  #{index + 1}
                </div>
                <div className="flex-grow">
                  <p className="font-bold text-slate-900 group-hover:text-primary-600 transition">
                    {item.producto?.nombre || 'Producto'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {item.dataValues?.total_cantidad || item.total_cantidad} unidades compradas
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">
                    S/ {Number(item.dataValues?.total_gastado || item.total_gastado || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banner de beneficios */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Gift className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Envío Gratis</h3>
              <p className="text-sm text-slate-600">En compras +S/ 200</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Zap className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Entrega Rápida</h3>
              <p className="text-sm text-slate-600">24-48 horas</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-600 text-white">
              <Star className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Garantía Total</h3>
              <p className="text-sm text-slate-600">30 días devolución</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de categorías con imágenes */}
      <div className="glass-card rounded-3xl p-8">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">Explora por Categorías</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link href="/cliente-portal/catalogo" className="group relative h-40 overflow-hidden rounded-2xl">
            <img 
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80" 
              alt="Tecnología"
              className="h-full w-full object-cover transition group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h3 className="text-lg font-bold text-white">Tecnología</h3>
              <p className="text-sm text-white/80">+50 productos</p>
            </div>
          </Link>
          
          <Link href="/cliente-portal/catalogo" className="group relative h-40 overflow-hidden rounded-2xl">
            <img 
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80" 
              alt="Electrodomésticos"
              className="h-full w-full object-cover transition group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h3 className="text-lg font-bold text-white">Electrodomésticos</h3>
              <p className="text-sm text-white/80">+30 productos</p>
            </div>
          </Link>
          
          <Link href="/cliente-portal/catalogo" className="group relative h-40 overflow-hidden rounded-2xl">
            <img 
              src="https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80" 
              alt="Licores"
              className="h-full w-full object-cover transition group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h3 className="text-lg font-bold text-white">Licores Premium</h3>
              <p className="text-sm text-white/80">+25 productos</p>
            </div>
          </Link>
          
          <Link href="/cliente-portal/catalogo" className="group relative h-40 overflow-hidden rounded-2xl">
            <img 
              src="https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400&q=80" 
              alt="Periféricos"
              className="h-full w-full object-cover transition group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h3 className="text-lg font-bold text-white">Periféricos</h3>
              <p className="text-sm text-white/80">+40 productos</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Video/Animación promocional */}
      <div className="relative h-[300px] overflow-hidden rounded-3xl">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="h-full w-full object-cover"
          poster="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80"
        >
          <source src="https://cdn.coverr.co/videos/coverr-a-woman-shopping-online-2903/1080p.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-lg px-8">
            <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-semibold text-white">Experiencia Premium</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Tu tienda favorita, siempre contigo
            </h2>
            <p className="text-lg text-white/80 mb-6">
              Miles de productos, las mejores marcas y la mejor atención al cliente
            </p>
            <Link
              href="/cliente-portal/catalogo"
              className="inline-flex items-center space-x-2 rounded-full bg-white px-8 py-4 font-bold text-slate-900 shadow-xl transition hover:scale-105"
            >
              <span>Descubrir Ahora</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Marcas destacadas */}
      <div className="glass-card rounded-3xl p-8 text-center">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Marcas que nos respaldan</h2>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png" alt="Google" className="h-8 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png" alt="Amazon" className="h-8 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/80px-Apple_logo_black.svg.png" alt="Apple" className="h-8 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Sony_logo.svg/200px-Sony_logo.svg.png" alt="Sony" className="h-8 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/200px-Samsung_Logo.svg.png" alt="Samsung" className="h-6 object-contain" />
        </div>
      </div>
    </div>
  )
}
