'use client'

import { useState } from 'react'
import { Menu, Bell, User, LogOut, Settings, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface HeaderProps {
  onMenuToggle: () => void
  topOffset?: number
}

export default function Header({ onMenuToggle, topOffset = 24 }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  return (
    <header 
      className="sticky z-40 h-[73px] border-b border-white/30 bg-white/60 shadow-sm shadow-slate-950/10 backdrop-blur-xl"
      style={{ top: `${topOffset}px` }}
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
          <button className="relative rounded-xl border border-white/30 bg-white/70 p-2 shadow-sm shadow-slate-900/10 transition hover:-translate-y-0.5 hover:border-white/60 hover:shadow-lg">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute -top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center gap-3 rounded-xl border border-white/30 bg-white/70 px-2 py-1.5 shadow-sm shadow-slate-900/10 transition hover:-translate-y-0.5 hover:border-white/60 hover:shadow-lg"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/40">
                <User className="h-5 w-5" />
              </div>
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
                  onClick={() => setShowUserMenu(false)}
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
    </header>
  )
}

