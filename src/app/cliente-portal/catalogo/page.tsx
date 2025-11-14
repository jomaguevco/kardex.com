'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import clientePortalService from '@/services/clientePortalService'
import { Package, Search, Loader2, ShoppingCart } from 'lucide-react'

export default function CatalogoPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [productos, setProductos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [carrito, setCarrito] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      router.push('/')
      return
    }

    fetchCatalogo()
  }, [isAuthenticated, user, router])

  const fetchCatalogo = async () => {
    try {
      const response = await clientePortalService.getCatalogo()
      if (response.success) {
        setProductos(response.data)
      }
    } catch (error) {
      console.error('Error al cargar catálogo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (producto.codigo_interno || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const agregarAlCarrito = (producto: any) => {
    const existente = carrito.find(item => item.id === producto.id)
    if (existente) {
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ))
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }])
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Catálogo de Productos</h1>
          <p className="mt-2 text-slate-600">
            Explora nuestros productos disponibles
          </p>
        </div>
        {carrito.length > 0 && (
          <button
            onClick={() => router.push('/cliente-portal/pedidos/nuevo')}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Ver Carrito ({carrito.length})</span>
          </button>
        )}
      </div>

      {/* Barra de búsqueda */}
      <div className="glass-card rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar productos por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field h-12 w-full rounded-xl bg-white pl-12"
          />
        </div>
      </div>

      {/* Grid de productos */}
      {filteredProductos.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Package className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No se encontraron productos
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {searchTerm ? 'Intenta con otro término de búsqueda' : 'El catálogo está vacío'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProductos.map((producto) => (
            <div
              key={producto.id}
              className="glass-card group rounded-2xl p-6 transition hover:shadow-xl"
            >
              <div className="mb-4 flex h-48 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
                {producto.imagen_url ? (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <Package className="h-16 w-16 text-slate-400" />
                )}
              </div>
              
              <h3 className="font-bold text-slate-900 line-clamp-2">
                {producto.nombre}
              </h3>
              
              <p className="mt-1 text-sm text-slate-600">
                Código: {producto.codigo_interno}
              </p>

              {producto.descripcion && (
                <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                  {producto.descripcion}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Precio</p>
                  <p className="text-2xl font-bold text-primary-600">
                    S/ {Number(producto.precio_venta || 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Stock</p>
                  <p className={`text-sm font-semibold ${
                    producto.stock_actual > producto.stock_minimo
                      ? 'text-emerald-600'
                      : 'text-orange-600'
                  }`}>
                    {producto.stock_actual} unid.
                  </p>
                </div>
              </div>

              <button
                onClick={() => agregarAlCarrito(producto)}
                disabled={producto.stock_actual <= 0}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {producto.stock_actual <= 0 ? 'Sin Stock' : 'Agregar al Carrito'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

