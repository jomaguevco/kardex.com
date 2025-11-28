'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import clientePortalService from '@/services/clientePortalService'
import { 
  Package, Loader2, ShoppingCart, Heart, 
  Filter, Grid, List, Star, Zap, Check, X,
  ChevronDown, SlidersHorizontal, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CatalogoPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [productos, setProductos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [carrito, setCarrito] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'nombre' | 'precio-asc' | 'precio-desc' | 'nuevo'>('nombre')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)

  // Placeholder genérico para productos sin imagen
  const getPlaceholderImage = () => {
    // Usar un placeholder SVG genérico en lugar de imágenes de Unsplash que pueden ser incorrectas
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2YxZjVmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaW4gaW1hZ2VuPC90ZXh0Pjwvc3ZnPg=='
  }

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      router.push('/')
      return
    }

    // Cargar carrito desde localStorage
    const carritoGuardado = localStorage.getItem('carrito')
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado))
    }

    // Cargar favoritos
    const favoritosGuardados = localStorage.getItem('favoritos')
    if (favoritosGuardados) {
      setFavorites(JSON.parse(favoritosGuardados))
    }

    fetchCatalogo()
  }, [isAuthenticated, user, router])

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (carrito.length > 0) {
      localStorage.setItem('carrito', JSON.stringify(carrito))
    } else {
      localStorage.removeItem('carrito')
    }
  }, [carrito])

  // Guardar favoritos
  useEffect(() => {
    localStorage.setItem('favoritos', JSON.stringify(favorites))
  }, [favorites])

  const fetchCatalogo = async () => {
    try {
      const response = await clientePortalService.getCatalogo()
      if (response.success) {
        setProductos(response.data)
      }
    } catch (error) {
      console.error('Error al cargar catálogo:', error)
      toast.error('Error al cargar el catálogo')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = (productoId: number) => {
    if (favorites.includes(productoId)) {
      setFavorites(favorites.filter(id => id !== productoId))
      toast.success('Eliminado de favoritos')
    } else {
      setFavorites([...favorites, productoId])
      toast.success('Agregado a favoritos')
    }
  }

  const agregarAlCarrito = (producto: any) => {
    if (producto.stock_actual <= 0) {
      toast.error('Producto sin stock disponible')
      return
    }

    const existente = carrito.find(item => item.id === producto.id)
    if (existente) {
      if (existente.cantidad >= producto.stock_actual) {
        toast.error('No hay más stock disponible')
        return
      }
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
      toast.success(`${producto.nombre} agregado al carrito`)
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }])
      toast.success(`${producto.nombre} agregado al carrito`)
    }
  }

  const getProductosOrdenados = () => {
    let filtered = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (producto.codigo_interno || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categoria_id?.toString() === selectedCategory)
    }

    // Filtrar solo favoritos
    if (showOnlyFavorites) {
      filtered = filtered.filter(p => favorites.includes(p.id))
    }

    // Ordenar
    switch (sortBy) {
      case 'precio-asc':
        return filtered.sort((a, b) => Number(a.precio_venta) - Number(b.precio_venta))
      case 'precio-desc':
        return filtered.sort((a, b) => Number(b.precio_venta) - Number(a.precio_venta))
      case 'nuevo':
        return filtered.sort((a, b) => new Date(b.fecha_creacion || 0).getTime() - new Date(a.fecha_creacion || 0).getTime())
      default:
        return filtered.sort((a, b) => a.nombre.localeCompare(b.nombre))
    }
  }

  const filteredProductos = getProductosOrdenados()

  const cantidadEnCarrito = (productoId: number) => {
    const item = carrito.find(i => i.id === productoId)
    return item ? item.cantidad : 0
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
          <p className="mt-4 text-slate-600">Cargando catálogo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Banner Hero animado */}
      <div className="relative h-[280px] overflow-hidden rounded-3xl shadow-2xl">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          poster="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
        >
          <source src="https://cdn.coverr.co/videos/coverr-shopping-mall-escalator-2951/1080p.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-purple-900/80 to-pink-900/70" />
        
        {/* Partículas decorativas */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20 animate-pulse"
              style={{
                width: Math.random() * 6 + 3 + 'px',
                height: Math.random() * 6 + 3 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 2 + 's',
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-between px-8 lg:px-12">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-semibold text-white">Ofertas Exclusivas</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white drop-shadow-lg mb-4">
              Encuentra lo que <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">necesitas</span>
            </h1>
            <p className="text-lg text-white/80 mb-6">
              Explora nuestra colección de {productos.length} productos premium
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-white">Envío gratis +S/200</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-white">Garantía 30 días</span>
              </div>
            </div>
          </div>

          {/* Carrito flotante */}
          {carrito.length > 0 && (
            <button
              onClick={() => router.push('/cliente-portal/pedidos/nuevo')}
              className="group relative flex items-center space-x-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-4 font-bold text-white shadow-2xl transition hover:scale-105 hover:bg-white/20"
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-xs font-bold animate-pulse">
                  {carrito.reduce((acc, item) => acc + item.cantidad, 0)}
                </span>
              </div>
              <div className="text-left">
                <span className="block text-sm opacity-80">Tu Carrito</span>
                <span className="block font-bold">S/ {carrito.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0).toFixed(2)}</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Categorías rápidas con imágenes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: 'Tecnología', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80', color: 'from-blue-600 to-indigo-600' },
          { name: 'Electrodomésticos', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80', color: 'from-emerald-600 to-teal-600' },
          { name: 'Licores', image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&q=80', color: 'from-purple-600 to-pink-600' },
          { name: 'Periféricos', image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400&q=80', color: 'from-orange-600 to-red-600' },
        ].map((cat, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory('all')}
            className="group relative h-28 overflow-hidden rounded-2xl"
          >
            <img 
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-80 group-hover:opacity-90 transition`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white drop-shadow-lg">{cat.name}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Barra de búsqueda y filtros mejorada */}
      <div className="glass-card rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Búsqueda */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar productos por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 bg-white py-4 px-4 pr-12 text-slate-900 transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-200 p-1 transition hover:bg-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Ordenar */}
          <div className="flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border-2 border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
            >
              <option value="nombre">Ordenar: A-Z</option>
              <option value="precio-asc">Precio: Menor a Mayor</option>
              <option value="precio-desc">Precio: Mayor a Menor</option>
              <option value="nuevo">Más Recientes</option>
            </select>

            {/* Vista */}
            <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-2 transition ${
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-2 transition ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            {/* Filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 rounded-2xl border-2 border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 font-bold text-slate-900">Categorías</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`rounded-full px-4 py-2 font-semibold transition ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todas
              </button>
              {/* Agregar más categorías dinámicamente */}
            </div>
          </div>
        )}
      </div>

      {/* Contador de resultados y filtro de favoritos */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Mostrando <span className="font-bold text-slate-900">{filteredProductos.length}</span> de{' '}
          <span className="font-bold text-slate-900">{productos.length}</span> productos
          {showOnlyFavorites && (
            <span className="ml-2 text-red-600 font-semibold">(Solo favoritos)</span>
          )}
        </p>
        {favorites.length > 0 && (
          <button 
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
              showOnlyFavorites 
                ? 'bg-red-500 text-white shadow-lg' 
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <Heart className={`h-4 w-4 ${showOnlyFavorites ? 'fill-current' : 'fill-red-200'}`} />
            <span>{favorites.length} favoritos</span>
            {showOnlyFavorites && <X className="h-4 w-4 ml-1" />}
          </button>
        )}
      </div>

      {/* Grid de productos */}
      {filteredProductos.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <Package className="mx-auto h-20 w-20 text-slate-300" />
          <h3 className="mt-4 text-xl font-bold text-slate-900">
            No se encontraron productos
          </h3>
          <p className="mt-2 text-slate-600">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'space-y-4'
        }>
          {filteredProductos.map((producto) => {
            const enCarrito = cantidadEnCarrito(producto.id)
            const esFavorito = favorites.includes(producto.id)
            const sinStock = producto.stock_actual <= 0
            const stockBajo = producto.stock_actual > 0 && producto.stock_actual <= producto.stock_minimo

            return viewMode === 'grid' ? (
              // Vista de cuadrícula con efecto 3D
              <div
                key={producto.id}
                className="group perspective-1000"
              >
                <div className="glass-card relative overflow-hidden rounded-3xl transition-all duration-500 transform-gpu group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:rotate-y-2 group-hover:-rotate-x-2">
                {/* Badge de stock */}
                {sinStock && (
                  <div className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
                    Sin Stock
                  </div>
                )}
                {stockBajo && !sinStock && (
                  <div className="absolute left-3 top-3 z-10 flex items-center space-x-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                    <Zap className="h-3 w-3" />
                    <span>Últimas Unidades</span>
                  </div>
                )}

                {/* Botón de favorito */}
                <button
                  onClick={() => toggleFavorite(producto.id)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition hover:scale-110"
                >
                  <Heart
                    className={`h-5 w-5 transition ${
                      esFavorito ? 'fill-red-500 text-red-500' : 'text-slate-400'
                    }`}
                  />
                </button>

                {/* Imagen del producto - Clickeable */}
                <Link href={`/cliente-portal/producto/${producto.id}`}>
                  <div className="relative h-64 overflow-hidden bg-slate-100 cursor-pointer">
                    <img
                      src={producto.imagen_url || getPlaceholderImage(producto.id)}
                      alt={producto.nombre}
                      className="h-full w-full object-cover transition group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = getPlaceholderImage(producto.id)
                      }}
                    />
                    {enCarrito > 0 && (
                      <div className="absolute bottom-3 left-3 flex items-center space-x-2 rounded-full bg-emerald-500 px-3 py-1 text-sm font-bold text-white shadow-lg">
                        <Check className="h-4 w-4" />
                        <span>{enCarrito} en carrito</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Información del producto */}
                <div className="p-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {producto.codigo_interno}
                  </p>
                  <Link href={`/cliente-portal/producto/${producto.id}`}>
                    <h3 className="mt-1 text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-primary-600 transition cursor-pointer">
                      {producto.nombre}
                    </h3>
                  </Link>
                  
                  {producto.descripcion && (
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                      {producto.descripcion}
                    </p>
                  )}

                  {/* Stock */}
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-600">Stock:</span>
                    <span className={`font-bold ${
                      sinStock ? 'text-red-600' : 
                      stockBajo ? 'text-orange-600' : 
                      'text-emerald-600'
                    }`}>
                      {producto.stock_actual} unid.
                    </span>
                  </div>

                  {/* Precio y botón */}
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary-600">
                        S/ {Number(producto.precio_venta).toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      disabled={sinStock}
                      className={`rounded-xl p-3 font-bold text-white shadow-lg transition ${
                        sinStock
                          ? 'cursor-not-allowed bg-slate-300'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-110 hover:shadow-xl'
                      }`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                </div>
              </div>
            ) : (
              // Vista de lista
              <div
                key={producto.id}
                className="glass-card group flex items-center space-x-6 overflow-hidden rounded-2xl p-6 transition hover:shadow-xl"
              >
                {/* Imagen - Clickeable */}
                <Link href={`/cliente-portal/producto/${producto.id}`}>
                  <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 cursor-pointer">
                    <img
                      src={producto.imagen_url || getPlaceholderImage(producto.id)}
                      alt={producto.nombre}
                      className="h-full w-full object-cover transition group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = getPlaceholderImage(producto.id)
                      }}
                    />
                  </div>
                </Link>

                {/* Información */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">
                        {producto.codigo_interno}
                      </p>
                      <Link href={`/cliente-portal/producto/${producto.id}`}>
                        <h3 className="mt-1 text-xl font-bold text-slate-900 cursor-pointer hover:text-primary-600 transition">
                          {producto.nombre}
                        </h3>
                      </Link>
                      {producto.descripcion && (
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                          {producto.descripcion}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleFavorite(producto.id)}
                      className="rounded-full bg-slate-100 p-2 transition hover:bg-slate-200"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          esFavorito ? 'fill-red-500 text-red-500' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div>
                        <p className="text-sm text-slate-600">Precio</p>
                        <p className="text-2xl font-bold text-primary-600">
                          S/ {Number(producto.precio_venta).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Stock</p>
                        <p className={`text-lg font-bold ${
                          sinStock ? 'text-red-600' : 
                          stockBajo ? 'text-orange-600' : 
                          'text-emerald-600'
                        }`}>
                          {producto.stock_actual} unid.
                        </p>
                      </div>
                      {enCarrito > 0 && (
                        <div className="flex items-center space-x-2 rounded-full bg-emerald-100 px-4 py-2 text-emerald-700">
                          <Check className="h-4 w-4" />
                          <span className="font-semibold">{enCarrito} en carrito</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => agregarAlCarrito(producto)}
                      disabled={sinStock}
                      className={`flex items-center space-x-2 rounded-xl px-6 py-3 font-bold text-white shadow-lg transition ${
                        sinStock
                          ? 'cursor-not-allowed bg-slate-300'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 hover:shadow-xl'
                      }`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Banner promocional al final */}
      <div className="glass-card rounded-3xl bg-gradient-to-r from-primary-600 to-indigo-600 p-12 text-center text-white">
        <Zap className="mx-auto h-16 w-16 mb-4" />
        <h2 className="text-3xl font-bold">¿No encuentras lo que buscas?</h2>
        <p className="mt-2 text-lg opacity-90">
          Contáctanos y te ayudaremos a encontrar el producto perfecto
        </p>
        <button className="mt-6 rounded-xl bg-white px-8 py-4 font-bold text-primary-600 shadow-xl transition hover:scale-105">
          Contactar Soporte
        </button>
      </div>
    </div>
  )
}
