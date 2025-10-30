'use client'

import { useQuery } from '@tanstack/react-query'
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
}

function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, color }: StatCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={cn('p-3 rounded-lg', color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className={cn(
              'text-sm',
              changeType === 'positive' && 'text-green-600',
              changeType === 'negative' && 'text-red-600',
              changeType === 'neutral' && 'text-gray-600'
            )}>
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardStats() {
  // Simular datos - en producción vendrían de la API
  const stats = [
    {
      title: 'Ventas del Día',
      value: '$12,450',
      change: '+12% vs ayer',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Ventas Totales',
      value: '156',
      change: '+8% vs mes anterior',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Productos',
      value: '1,234',
      change: 'Stock actualizado',
      changeType: 'neutral' as const,
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      title: 'Crecimiento',
      value: '23.5%',
      change: '+2.1% vs mes anterior',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  )
}

