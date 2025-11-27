'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import NotificacionesPanel from './NotificacionesPanel'
import { getFotoPerfilUrl } from '@/utils/fotoPerfil'
import {
  Store, ShoppingBag, Package, Receipt, CreditCard,
  MessageCircle, User, LogOut, Bell, ShoppingCart,
  Menu, X, Heart, ChevronDown, Sun, Moon
} from 'lucide-react'
import { useThemeStore } from '@/store/themeStore'

export default function ClienteNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme, setDark } = useThemeStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificacionesOpen, setIsNotificacionesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [notificacionesCount, setNotificacionesCount] = useState(0)

  // Cargar tema al montar
  useEffect(() => {
    const savedTheme = localStorage.getItem('kardex-theme')
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme)
      if (parsed?.state?.isDark) {
        setDark(true)
      }
    }
  }, [setDark])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Actualizar contadores
    const updateCounts = () => {
      const carrito = JSON.parse(localStorage.getItem('carrito') || '[]')
      const favoritos = JSON.parse(localStorage.getItem('favoritos') || '[]')
      setCartCount(carrito.reduce((acc: number, item: any) => acc + item.cantidad, 0))
      setFavoritesCount(favoritos.length)
    }

    updateCounts()
    window.addEventListener('storage', updateCounts)
    const interval = setInterval(updateCounts, 1000)

    return () => {
      window.removeEventListener('storage', updateCounts)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    // Cargar notificaciones no leídas
    const fetchNotificaciones = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notificaciones`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (data.success) {
          const todas = data.data || []
          // Filtrar según el rol: en Portal Cliente ocultar alertas internas (stock, inventario, pendientes de ventas/compras)
          const filtradas = user?.rol === 'CLIENTE'
            ? todas.filter((n: any) => {
                const t = (n.tipo || '').toLowerCase()
                if (t.includes('stock')) return false
                if (t.includes('inventario')) return false
                if (t.includes('pendiente') && (t.includes('venta') || t.includes('compra'))) return false
                return true
              })
            : todas
          const noLeidas = filtradas.filter((n: any) => !n.leida).length
          setNotificacionesCount(noLeidas)
        }
      } catch (error) {
        console.error('Error al cargar notificaciones:', error)
      }
    }

    fetchNotificaciones()
    const interval = setInterval(fetchNotificaciones, 30000) // Actualizar cada 30 segundos

    return () => clearInterval(interval)
  }, [user?.rol])

  const navItems = [
    { name: 'Perfil', href: '/cliente-portal/perfil', icon: User },
    { name: 'Mi Portal', href: '/cliente-portal', icon: Store },
    { name: 'Mis Compras', href: '/cliente-portal/mis-compras', icon: ShoppingBag },
    { name: 'Catálogo', href: '/cliente-portal/catalogo', icon: Package },
    { name: 'Mis Pedidos', href: '/cliente-portal/pedidos', icon: Receipt },
    { name: 'Facturas', href: '/cliente-portal/facturas', icon: CreditCard },
    { name: 'Estado de Cuenta', href: '/cliente-portal/estado-cuenta', icon: CreditCard },
    { name: 'Soporte', href: '/cliente-portal/soporte', icon: MessageCircle }
  ]

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg'
            : 'bg-gradient-to-r from-primary-600 to-indigo-600'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo y nombre */}
            <Link href="/cliente-portal" className="flex items-center space-x-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
                scrolled
                  ? 'bg-gradient-to-br from-primary-600 to-indigo-600'
                  : 'bg-white/20 backdrop-blur-sm'
              }`}>
                <Store className={`h-7 w-7 ${scrolled ? 'text-white' : 'text-white'}`} />
              </div>
              <div>
                <h1 className={`text-xl font-bold transition ${
                  scrolled ? 'text-slate-900' : 'text-white'
                }`}>
                  KARDEX
                </h1>
                <p className={`text-xs transition ${
                  scrolled ? 'text-slate-600' : 'text-white/80'
                }`}>
                  Portal de Cliente
                </p>
              </div>
            </Link>

            {/* Navegación desktop */}
            <div className="hidden lg:flex lg:items-center lg:space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 rounded-xl px-4 py-2 font-semibold transition ${
                      isActive
                        ? scrolled
                          ? 'bg-primary-600 text-white'
                          : 'bg-white/20 text-white backdrop-blur-sm'
                        : scrolled
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Acciones rápidas */}
            <div className="flex items-center space-x-3">
              {/* Toggle Tema Oscuro */}
              <button
                onClick={toggleTheme}
                className={`relative rounded-xl p-2 transition ${
                  scrolled
                    ? 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700'
                    : 'text-white hover:bg-white/10'
                }`}
                title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              >
                {isDark ? (
                  <Sun className="h-6 w-6" />
                ) : (
                  <Moon className="h-6 w-6" />
                )}
              </button>

              {/* Favoritos */}
              <Link
                href="/cliente-portal/catalogo"
                className={`relative rounded-xl p-2 transition ${
                  scrolled
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Heart className="h-6 w-6" />
                {favoritesCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* Carrito */}
              <button
                onClick={() => router.push('/cliente-portal/pedidos/nuevo')}
                className={`relative rounded-xl p-2 transition ${
                  scrolled
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Notificaciones */}
              <button
                onClick={() => setIsNotificacionesOpen(true)}
                className={`relative rounded-xl p-2 transition ${
                  scrolled
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Bell className="h-6 w-6" />
                {notificacionesCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
                    {notificacionesCount > 9 ? '9+' : notificacionesCount}
                  </span>
                )}
              </button>

              {/* Perfil */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center space-x-2 rounded-xl px-4 py-2 transition ${
                    scrolled
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
                  }`}
                >
                  <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-primary-500 to-indigo-600">
                    {getFotoPerfilUrl(user?.foto_perfil) ? (
                      <img
                        src={getFotoPerfilUrl(user?.foto_perfil) || ''}
                        alt={user?.nombre_usuario || 'Cliente'}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                        {user?.nombre_usuario?.charAt(0).toUpperCase() || 'C'}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold">
                    {user?.nombre_usuario || 'Cliente'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown de perfil */}
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white shadow-2xl z-50">
                      <div className="border-b border-slate-200 p-4">
                        <p className="font-bold text-slate-900">
                          {user?.nombre_usuario || 'Cliente'}
                        </p>
                        <p className="text-sm text-slate-600">{user?.email || 'cliente@kardex.com'}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          href="/cliente-portal/perfil"
                          className="flex items-center space-x-3 rounded-xl px-4 py-3 text-slate-700 transition hover:bg-slate-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          <span>Mi Perfil</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-red-600 transition hover:bg-red-50"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Menú móvil */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`rounded-xl p-2 lg:hidden ${
                  scrolled
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil expandible */}
        {isMenuOpen && (
          <div className="border-t border-white/10 bg-white lg:hidden">
            <div className="space-y-1 px-4 py-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 rounded-xl px-4 py-3 font-semibold transition ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              <div className="border-t border-slate-200 pt-4">
                <Link
                  href="/cliente-portal/perfil"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 rounded-xl px-4 py-3 text-slate-700 transition hover:bg-slate-100"
                >
                  <User className="h-5 w-5" />
                  <span>Mi Perfil</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    handleLogout()
                  }}
                  className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Espaciador para el contenido */}
      <div className="h-20" />

      {/* Panel de notificaciones */}
      <NotificacionesPanel 
        isOpen={isNotificacionesOpen} 
        onClose={() => {
          setIsNotificacionesOpen(false)
          // Recargar contador después de cerrar
          const fetchNotificaciones = async () => {
            try {
              const token = localStorage.getItem('token')
              if (!token) return

              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notificaciones`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
              const data = await response.json()
              if (data.success) {
                const todas = data.data || []
                const filtradas = user?.rol === 'CLIENTE'
                  ? todas.filter((n: any) => {
                      const t = (n.tipo || '').toLowerCase()
                      if (t.includes('stock')) return false
                      if (t.includes('inventario')) return false
                      if (t.includes('pendiente') && (t.includes('venta') || t.includes('compra'))) return false
                      return true
                    })
                  : todas
                const noLeidas = filtradas.filter((n: any) => !n.leida).length
                setNotificacionesCount(noLeidas)
              }
            } catch (error) {
              console.error('Error al cargar notificaciones:', error)
            }
          }
          fetchNotificaciones()
        }}
      />
    </>
  )
}

