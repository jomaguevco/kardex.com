'use client'

import { useState, useEffect } from 'react'
import { Menu, Bell, User, LogOut, Settings, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import NotificacionesPanel from './NotificacionesPanel'
import notificacionService from '@/services/notificacionService'
import { getFotoPerfilUrl } from '@/utils/fotoPerfil'

interface HeaderProps {
  onMenuToggle: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const { user, logout } = useAuthStore()

  useEffect(() => {
    loadNotificationCount()
    // Actualizar cada 30 segundos
    const interval = setInterval(loadNotificationCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotificationCount = async () => {
    try {
      const resumen = await notificacionService.getResumen()
      setNotificationCount(resumen.noLeidas)
    } catch (error) {
      // Silently fail
    }
  }

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
    router.push('/')
  }

  const handleConfigClick = () => {
    router.push('/perfil')
    setShowUserMenu(false)
  }

  return (
    <header 
      className="header-fixed"
      style={{ 
        position: 'fixed', 
        top: '0', 
        left: '0', 
        right: '0', 
        zIndex: 9999,
        width: '100%',
        height: '56px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        boxShadow: '0 1px 2px 0 rgba(2, 6, 23, 0.1)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        transform: 'none', /* Eliminar transform para evitar movimiento */
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        transition: 'none' /* Eliminar transiciones */
      }}
    >
      <div className="flex h-full items-center justify-between px-3 lg:px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuToggle}
            className="rounded-lg border border-white/40 bg-white/70 p-1.5 shadow-sm shadow-slate-900/10 transition hover:-translate-y-0.5 hover:border-white/70 hover:shadow-lg lg:hidden"
          >
            <Menu className="h-4 w-4 text-slate-600" />
          </button>
          <div className="ml-2 flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            <Sparkles className="h-3 w-3 text-indigo-500" /> Sistema de ventas KARDEX
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          <button 
            onClick={() => setShowNotifications(true)}
            className="relative rounded-lg border border-white/30 bg-white/70 p-1.5 shadow-sm shadow-slate-900/10 transition hover:-translate-y-0.5 hover:border-white/60 hover:shadow-lg"
          >
            <Bell className="h-4 w-4 text-slate-600" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/70 px-1.5 py-1 shadow-sm shadow-slate-900/10 transition hover:-translate-y-0.5 hover:border-white/60 hover:shadow-lg"
            >
              <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg border border-white/50 bg-gradient-to-br from-indigo-500 to-emerald-500">
                {getFotoPerfilUrl(user?.foto_perfil) ? (
                  <img
                    src={getFotoPerfilUrl(user?.foto_perfil) || ''}
                    alt={user?.nombre_completo || 'Usuario'}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold text-slate-800">{user?.nombre_completo}</p>
                <p className="text-[10px] font-medium capitalize text-slate-500">{user?.rol}</p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white/95 p-2 shadow-xl shadow-slate-900/15 backdrop-blur-sm">
                <div className="rounded-xl bg-slate-50/70 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-800">{user?.nombre_completo}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleConfigClick}
                  className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100/80"
                >
                  <Settings className="h-4 w-4" /> Configuración
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <NotificacionesPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)}
        onUpdate={loadNotificationCount}
      />
    </header>
  )
}

