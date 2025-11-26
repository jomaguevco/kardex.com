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

  // Imagen placeholder para productos sin imagen
  const placeholderImages = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80',
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&q=80'
  ]

  const getPlaceholderImage = (productId: number) => {
    return placeholderImages[productId % placeholderImages.length]
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
      {/* Header con carrito flotante */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
            Catálogo de Productos
          </h1>
          <p className="mt-2 text-slate-600">
            Descubre {productos.length} productos increíbles
          </p>
        </div>
        {carrito.length > 0 && (
          <button
            onClick={() => router.push('/cliente-portal/pedidos/nuevo')}
            className="group relative flex items-center space-x-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-bold text-white shadow-2xl transition hover:scale-105 hover:shadow-3xl"
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold animate-pulse">
                {carrito.reduce((acc, item) => acc + item.cantidad, 0)}
              </span>
            </div>
            <span>Ver Carrito</span>
            <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-emerald-400 animate-ping" />
          </button>
        )}
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
              // Vista de cuadrícula
              <div
                key={producto.id}
                className="glass-card group relative overflow-hidden rounded-3xl transition hover:shadow-2xl"
              >
                {/* Badge de stock */}
                {sinStock && (
                  <div className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
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
