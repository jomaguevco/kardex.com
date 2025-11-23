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
  const [isLoading, setIsLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentPromoSlide, setCurrentPromoSlide] = useState(0)

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

  // Productos destacados
  const productosDestacados = [
    {
      id: 1,
      nombre: 'Smartphone Galaxy S23',
      precio: 2499.00,
      imagen: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80',
      descuento: 15,
      nuevo: true
    },
    {
      id: 2,
      nombre: 'Laptop HP Pavilion',
      precio: 3299.00,
      imagen: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80',
      descuento: 20,
      nuevo: false
    },
    {
      id: 3,
      nombre: 'Auriculares Sony WH',
      precio: 899.00,
      imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
      descuento: 10,
      nuevo: true
    },
    {
      id: 4,
      nombre: 'Smartwatch Apple',
      precio: 1899.00,
      imagen: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&q=80',
      descuento: 0,
      nuevo: false
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
      const response = await clientePortalService.getEstadoCuenta()
      if (response.success) {
        setDashboard(response.data)
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

      {/* Bienvenida personalizada */}
      <div className="glass-card rounded-3xl p-8 bg-gradient-to-br from-primary-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              ¡Hola, {dashboard?.cliente?.nombre || 'Cliente'}! 👋
            </h2>
            <p className="mt-2 text-lg text-slate-600">
              Bienvenido de vuelta a tu portal personal
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-slate-600">Miembro desde</p>
                <p className="font-bold text-slate-900">2024</p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg">
                <Star className="h-8 w-8" />
              </div>
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
                {dashboard?.resumen?.total_compras || 0}
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
                S/ {Number(dashboard?.resumen?.total_gastado || 0).toFixed(0)}
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
                {dashboard?.productos_mas_comprados?.length || 0}
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
                0
              </p>
              <p className="mt-1 text-xs text-slate-600 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Todos entregados
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
          {productosDestacados.map((producto) => (
            <Link
              key={producto.id}
              href="/cliente-portal/catalogo"
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition hover:shadow-2xl"
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
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="h-full w-full object-cover transition group-hover:scale-110"
                />
                <button className="absolute bottom-3 right-3 rounded-full bg-white p-2 shadow-lg transition hover:bg-red-50 hover:text-red-600">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition">
                  {producto.nombre}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    {producto.descuento > 0 ? (
                      <div>
                        <p className="text-sm text-slate-500 line-through">
                          S/ {producto.precio.toFixed(2)}
                        </p>
                        <p className="text-xl font-bold text-primary-600">
                          S/ {(producto.precio * (1 - producto.descuento / 100)).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-primary-600">
                        S/ {producto.precio.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <button className="rounded-full bg-primary-600 p-2 text-white transition hover:bg-primary-700">
                    <ShoppingCart className="h-5 w-5" />
                  </button>
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
      {dashboard?.productos_mas_comprados && dashboard.productos_mas_comprados.length > 0 && (
        <div className="glass-card rounded-3xl p-8">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 flex items-center">
            <Heart className="mr-2 h-6 w-6 text-red-500" />
            Tus Productos Favoritos
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {dashboard.productos_mas_comprados.slice(0, 4).map((item: any, index: number) => (
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
    </div>
  )
}
