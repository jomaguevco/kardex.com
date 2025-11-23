'use client'

import { useQuery } from '@tanstack/react-query'
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'
import { dashboardService } from '@/services/dashboardService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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
    <div className="card-hover p-6 group">
      <div className="flex items-center">
        <div className={cn('p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3', color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 transition-all duration-300 group-hover:text-indigo-600">{value}</p>
          {change && (
            <p className={cn(
              'text-sm font-medium mt-1 flex items-center gap-1',
              changeType === 'positive' && 'text-emerald-600',
              changeType === 'negative' && 'text-rose-600',
              changeType === 'neutral' && 'text-slate-600'
            )}>
              {changeType === 'positive' && '↗'}
              {changeType === 'negative' && '↘'}
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardStats() {
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getDashboardStats(),
    refetchInterval: 30000 // Refrescar cada 30 segundos
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-hover p-6">
            <LoadingSpinner size="sm" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6 text-sm text-rose-600">
        Error al cargar estadísticas del dashboard
      </div>
    )
  }

  const stats = [
    {
      title: 'Ventas del Día',
      value: `$${Number(statsData?.ventasDelDia || 0).toFixed(2)}`,
      change: statsData?.crecimiento ? `${statsData.crecimiento > 0 ? '+' : ''}${statsData.crecimiento.toFixed(1)}% vs mes anterior` : undefined,
      changeType: (statsData?.crecimiento || 0) > 0 ? 'positive' : (statsData?.crecimiento || 0) < 0 ? 'negative' : 'neutral' as const,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Ventas Totales',
      value: statsData?.ventasDelMes?.toString() || '0',
      change: statsData?.crecimiento ? `${statsData.crecimiento > 0 ? '+' : ''}${statsData.crecimiento.toFixed(1)}% vs mes anterior` : undefined,
      changeType: (statsData?.crecimiento || 0) > 0 ? 'positive' : (statsData?.crecimiento || 0) < 0 ? 'negative' : 'neutral' as const,
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Productos',
      value: statsData?.totalProductos?.toString() || '0',
      change: statsData?.productosStockBajo ? `${statsData.productosStockBajo} con stock bajo` : 'Stock actualizado',
      changeType: (statsData?.productosStockBajo || 0) > 0 ? 'negative' : 'neutral' as const,
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      title: 'Crecimiento',
      value: statsData?.crecimiento ? `${statsData.crecimiento > 0 ? '+' : ''}${statsData.crecimiento.toFixed(1)}%` : '0%',
      change: statsData?.crecimiento ? `${statsData.crecimiento > 0 ? '+' : ''}${statsData.crecimiento.toFixed(1)}% vs mes anterior` : undefined,
      changeType: (statsData?.crecimiento || 0) > 0 ? 'positive' : (statsData?.crecimiento || 0) < 0 ? 'negative' : 'neutral' as const,
      icon: TrendingUp,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <StatCard
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            color={stat.color}
          />
        </div>
      ))}
    </div>
  )
}

