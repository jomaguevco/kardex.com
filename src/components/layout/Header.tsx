'use client'

import { useState, useEffect } from 'react'
import { Menu, Bell, User, LogOut, Settings, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import NotificacionesPanel from './NotificacionesPanel'
import notificacionService from '@/services/notificacionService'

interface HeaderProps {
  onMenuToggle: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const { user, logout } = useAuthStore()

  const getApiBaseUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'
    return apiUrl.replace(/\/api$/, '') || 'http://localhost:4001'
  }

  const getFotoUrl = () => {
    if (!user?.foto_perfil) return null
    const baseUrl = getApiBaseUrl().replace(/\/$/, '')
    let url = user.foto_perfil
    if (url.startsWith('http://') && typeof window !== 'undefined' && window.location.protocol === 'https:') {
      url = url.replace(/^http:\/\//, 'https://')
    } else if (!url.startsWith('http')) {
      const path = url.startsWith('/') ? url : `/${url}`
      url = `${baseUrl}${path}`
    }
    const cacheBuster = `v=${Date.now()}`
    return url.includes('?') ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`
  }

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
        zIndex: 60,
        width: '100%',
        height: '73px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        boxShadow: '0 1px 2px 0 rgba(2, 6, 23, 0.1)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        transform: 'translateZ(0)',
        willChange: 'transform',
        margin: 0,
        padding: 0
      }}
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-8">
        <div className="flex items-center">
          <button
            onClick={onMenuToggle}
            className="rounded-xl border border-white/40 bg-white/70 p-2 shadow-sm shadow-slate-900/10 transition hover:-translate-y-0.5 hover:border-white/70 hover:shadow-lg lg:hidden"
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <div className="ml-3 flex items-center gap-2 rounded-xl border border-white/30 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Sistema de ventas KARDEX
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={() => setShowNotifications(true)}
            className="relative rounded-xl border border-white/30 bg-white/70 p-2 shadow-sm shadow-slate-900/10 transition hover:-translate-y-0.5 hover:border-white/60 hover:shadow-lg"
          >
            <Bell className="h-5 w-5 text-slate-600" />
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center gap-3 rounded-xl border border-white/30 bg-white/70 px-2 py-1.5 shadow-sm shadow-slate-900/10 transition hover:-translate-y-0.5 hover:border-white/60 hover:shadow-lg"
            >
              {getFotoUrl() ? (
                <img
                  src={getFotoUrl() || ''}
                  alt={user?.nombre_completo || 'Usuario'}
                  className="h-10 w-10 rounded-xl object-cover border border-white/50"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/40">
                  <User className="h-5 w-5" />
                </div>
              )}
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800">{user?.nombre_completo}</p>
                <p className="text-xs font-medium capitalize text-slate-500">{user?.rol}</p>
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

