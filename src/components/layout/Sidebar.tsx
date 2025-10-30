'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ShoppingBag,
  BarChart3,
  FileText,
  Settings,
  Users,
  Menu,
  X,
  ChevronDown
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'vendedor', 'almacen']
  },
  {
    title: 'Productos',
    href: '/productos',
    icon: Package,
    roles: ['admin', 'almacen']
  },
  {
    title: 'Ventas',
    href: '/ventas',
    icon: ShoppingCart,
    roles: ['admin', 'vendedor']
  },
  {
    title: 'Compras',
    href: '/compras',
    icon: ShoppingBag,
    roles: ['admin', 'almacen']
  },
  {
    title: 'KARDEX',
    href: '/kardex',
    icon: BarChart3,
    roles: ['admin', 'almacen']
  },
  {
    title: 'Clientes',
    href: '/clientes',
    icon: Users,
    roles: ['admin', 'vendedor']
  },
  {
    title: 'Proveedores',
    href: '/proveedores',
    icon: Users,
    roles: ['admin', 'almacen']
  },
  {
    title: 'Reportes',
    href: '/reportes',
    icon: FileText,
    roles: ['admin', 'vendedor', 'almacen']
  },
  {
    title: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    roles: ['admin']
  }
]

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Sistema KARDEX</h1>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="mt-4 px-2 pb-20">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer del sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="text-xs text-gray-500 text-center">
            Sistema de Ventas KARDEX v1.0
          </div>
        </div>
      </div>
    </>
  )
}

