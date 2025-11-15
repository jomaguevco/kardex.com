'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, Edit, X, Calendar, User } from 'lucide-react'
import { VentaFilters, Venta } from '@/types'
import { ventaService } from '@/services/ventaService'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import TableWrapper from '@/components/ui/TableWrapper'
import { cn } from '@/utils/cn'

interface VentasTableProps {
  onView?: (venta: Venta) => void
  onEdit?: (venta: Venta) => void
  onCancel?: (venta: Venta) => void
}

export default function VentasTable({ onView, onEdit, onCancel }: VentasTableProps) {
  const [filters, setFilters] = useState<VentaFilters>({
    page: 1,
    limit: 10,
    fecha_inicio: '',
    fecha_fin: '',
    estado: ''
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['ventas', filters],
    queryFn: () => ventaService.getVentas(filters)
  })

  const handleFilterChange = (key: keyof VentaFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const limpiarFiltros = () => {
    setFilters({ page: 1, limit: 10, fecha_inicio: '', fecha_fin: '', estado: '' })
  }

  if (isLoading) {
    return (
      <div className="card p-10 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-sm text-slate-500">Cargando ventas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6 text-sm text-rose-600">
        Ocurrió un error al cargar las ventas. Intenta nuevamente.
      </div>
    )
  }

  const ventas = (data as any)?.ventas || []
  const pagination = (data as any)?.pagination

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha inicio</label>
          <input
            type="date"
            value={filters.fecha_inicio || ''}
            onChange={(event) => handleFilterChange('fecha_inicio', event.target.value)}
            className="input-field"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha fin</label>
          <input
            type="date"
            value={filters.fecha_fin || ''}
            onChange={(event) => handleFilterChange('fecha_fin', event.target.value)}
            className="input-field"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</label>
          <select
            value={filters.estado || ''}
            onChange={(event) => handleFilterChange('estado', event.target.value)}
            className="input-field"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button onClick={() => limpiarFiltros()} className="btn-outline w-full text-xs sm:text-sm">
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="card animate-fade-in" style={{ overflow: 'visible' }}>
        {ventas.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            No encontramos ventas con los filtros seleccionados.
          </div>
        ) : (
          <TableWrapper>
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Factura</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Fecha</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Vendedor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {ventas.map((venta: any, index: number) => (
                  <tr 
                    key={venta.id} 
                    className="animate-fade-in transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 font-mono text-sm text-slate-700">{venta.numero_factura}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{venta.cliente?.nombre || 'Cliente no registrado'}</p>
                          <p className="text-xs text-slate-500">{venta.cliente?.email || 'Sin email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="mr-2 h-4 w-4" /> {new Date(venta.fecha_venta).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-600">${Number(venta.total || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <EstadoBadge estado={venta.estado} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{venta.usuario?.nombre || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {onView && (
                          <AccionButton title="Ver detalles" onClick={() => onView(venta)}>
                            <Eye className="h-4 w-4" />
                          </AccionButton>
                        )}
                        {onEdit && (
                          <AccionButton title="Editar" onClick={() => onEdit(venta)} variant="primary">
                            <Edit className="h-4 w-4" />
                          </AccionButton>
                        )}
                        {onCancel && normalizeEstado(venta.estado) !== 'cancelada' && (
                          <AccionButton title="Cancelar" onClick={() => onCancel(venta)} variant="danger">
                            <X className="h-4 w-4" />
                          </AccionButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrapper>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 text-sm text-slate-600 sm:flex-row">
            <div>
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                disabled={pagination.page === 1}
                className="rounded-xl border border-slate-200 px-3 py-1 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="rounded-xl bg-indigo-100 px-3 py-1 font-semibold text-indigo-600">{pagination.page}</span>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="rounded-xl border border-slate-200 px-3 py-1 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const normalized = normalizeEstado(estado)
  const styles = {
    completada: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20',
    pendiente: 'bg-amber-500/15 text-amber-600 border border-amber-500/20',
    cancelada: 'bg-rose-500/15 text-rose-600 border border-rose-500/20'
  } as const

  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize', styles[normalized as keyof typeof styles] ?? 'bg-slate-500/15 text-slate-600 border border-slate-500/20')}>
      {estado || 'Sin estado'}
    </span>
  )
}

function normalizeEstado(estado: string) {
  return (estado || '').toString().toLowerCase()
}

function AccionButton({ children, onClick, disabled, title, variant = 'ghost' }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; title: string; variant?: 'ghost' | 'primary' | 'danger' }) {
  const base = 'inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-xs font-semibold transition'
  const variants = {
    ghost: 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800',
    primary: 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    danger: 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
  }

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, variants[variant], disabled && 'cursor-not-allowed opacity-40')}
    >
      {children}
    </button>
  )
}

