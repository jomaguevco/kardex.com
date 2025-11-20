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
  X,
  Store,
  ClipboardList,
  Receipt,
  CreditCard,
  MessageCircle,
  PackageCheck
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  topOffset?: number
}

interface MenuItem {
  title: string
  href: string
  icon: any
  roles: string[]
}

const allMenuItems: MenuItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMINISTRADOR', 'VENDEDOR'] },
  { title: 'Productos', href: '/productos', icon: Package, roles: ['ADMINISTRADOR'] },
  { title: 'Pedidos', href: '/pedidos', icon: ClipboardList, roles: ['ADMINISTRADOR', 'VENDEDOR'] },
  { title: 'Ventas', href: '/ventas', icon: ShoppingCart, roles: ['ADMINISTRADOR', 'VENDEDOR'] },
  { title: 'Compras', href: '/compras', icon: ShoppingBag, roles: ['ADMINISTRADOR'] },
  { title: 'KARDEX', href: '/kardex', icon: BarChart3, roles: ['ADMINISTRADOR'] },
  { title: 'Ajustes Inventario', href: '/ajustes-inventario', icon: PackageCheck, roles: ['ADMINISTRADOR'] },
  { title: 'Clientes', href: '/clientes', icon: Users, roles: ['ADMINISTRADOR', 'VENDEDOR'] },
  { title: 'Proveedores', href: '/proveedores', icon: Users, roles: ['ADMINISTRADOR'] },
  { title: 'Reportes', href: '/reportes', icon: FileText, roles: ['ADMINISTRADOR', 'VENDEDOR'] },
  { title: 'Perfil', href: '/perfil', icon: Settings, roles: ['ADMINISTRADOR', 'VENDEDOR', 'CLIENTE'] },
  
  // Menú para clientes
  { title: 'Mi Portal', href: '/cliente-portal', icon: Store, roles: ['CLIENTE'] },
  { title: 'Mis Compras', href: '/cliente-portal/mis-compras', icon: ShoppingBag, roles: ['CLIENTE'] },
  { title: 'Catálogo', href: '/cliente-portal/catalogo', icon: Package, roles: ['CLIENTE'] },
  { title: 'Mis Pedidos', href: '/cliente-portal/pedidos', icon: ClipboardList, roles: ['CLIENTE'] },
  { title: 'Facturas', href: '/cliente-portal/facturas', icon: Receipt, roles: ['CLIENTE'] },
  { title: 'Estado de Cuenta', href: '/cliente-portal/estado-cuenta', icon: CreditCard, roles: ['CLIENTE'] },
  { title: 'Soporte', href: '/cliente-portal/soporte', icon: MessageCircle, roles: ['CLIENTE'] },
]

export default function Sidebar({ isOpen, onToggle, topOffset = 24 }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()

  // Filtrar menú según el rol del usuario
  const menuItems = allMenuItems.filter(item => 
    user?.rol && item.roles.includes(user.rol)
  )

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={onToggle} />}

      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-40 flex w-52 flex-col border-r border-white/20 bg-white/20 shadow-xl shadow-slate-950/20 backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div 
          className="relative flex shrink-0 items-center justify-between border-b border-white/20 px-4"
          style={{ height: '56px' }}
        >
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/60">Sistema Kardex</span>
            <p className="text-xs font-semibold text-white">
              {user?.rol === 'CLIENTE' ? 'Portal de Cliente' : 
               user?.rol === 'VENDEDOR' ? 'Panel de Vendedor' : 
               'Panel Administrativo'}
            </p>
          </div>
          <button onClick={onToggle} className="rounded-xl border border-white/30 bg-white/20 p-1 text-white transition hover:border-white/50 lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav
          className="flex-1 space-y-0.5 overflow-y-auto px-2.5 pb-4 pt-4"
        >
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition',
                  isActive
                    ? 'bg-white text-slate-900 shadow-lg shadow-indigo-500/20'
                    : 'text-white/70 hover:bg-white/15 hover:text-white'
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs shadow-sm shadow-slate-950/10',
                    isActive
                      ? 'bg-gradient-to-br from-indigo-500 to-emerald-500 text-white'
                      : 'bg-white/10 text-white'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {item.title}
              </Link>
            )
          })}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-white/15 px-3 pb-4 pt-3">
          <div className="rounded-xl border border-white/20 bg-white/10 px-2.5 py-1.5 text-[10px] text-white/80 shadow-inner">
            Sistema de Ventas KARDEX v1.0
          </div>
        </div>
      </aside>
    </>
  )
}

