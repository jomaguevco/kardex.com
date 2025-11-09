'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  BarChart3,
  FileText,
  Settings,
  Users,
  X
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  topOffset?: number
}

const menuItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Productos', href: '/productos', icon: Package },
  { title: 'Ventas', href: '/ventas', icon: ShoppingCart },
  { title: 'Compras', href: '/compras', icon: ShoppingBag },
  { title: 'KARDEX', href: '/kardex', icon: BarChart3 },
  { title: 'Clientes', href: '/clientes', icon: Users },
  { title: 'Proveedores', href: '/proveedores', icon: Users },
  { title: 'Reportes', href: '/reportes', icon: FileText },
  { title: 'Configuración', href: '/configuracion', icon: Settings }
]

export default function Sidebar({ isOpen, onToggle, topOffset = 32 }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={onToggle} />}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r border-white/20 bg-white/20 shadow-xl shadow-slate-950/20 backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="relative flex h-[73px] items-center justify-between border-b border-white/20 px-5">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-white/60">Sistema Kardex</span>
            <p className="text-sm font-semibold text-white">Panel administrativo</p>
          </div>
          <button onClick={onToggle} className="rounded-xl border border-white/30 bg-white/20 p-1 text-white transition hover:border-white/50 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav
          className="flex-1 space-y-1 overflow-y-auto px-3 pb-4"
          style={{ paddingTop: topOffset }}
        >
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-white text-slate-900 shadow-lg shadow-indigo-500/20'
                    : 'text-white/70 hover:bg-white/15 hover:text-white'
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-9 w-9 items-center justify-center rounded-xl text-base shadow-sm shadow-slate-950/10',
                    isActive
                      ? 'bg-gradient-to-br from-indigo-500 to-emerald-500 text-white'
                      : 'bg-white/10 text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {item.title}
              </Link>
            )
          })}
        </nav>

        <div className="space-y-3 border-t border-white/15 px-5 pb-6 pt-4">
          <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-white/80 shadow-inner">
            Sistema de Ventas KARDEX v1.0
          </div>
        </div>
      </aside>
    </>
  )
}

