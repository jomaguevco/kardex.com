'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Eye, Filter } from 'lucide-react'
import { AjusteInventario } from '@/services/ajusteInventarioService'
import { cn } from '@/utils/cn'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import TableWrapper from '@/components/ui/TableWrapper'

interface AjustesInventarioTableProps {
  ajustes: AjusteInventario[]
  pagination?: {
    total: number
    page: number
    limit: number
    pages: number
  }
  filters: {
    page: number
    limit: number
    estado_movimiento: string
    tipo_movimiento: string
    search: string
  }
  onFilterChange: (filters: any) => void
  onAprobar: (id: number) => void
  onRechazar: (id: number) => void
  isLoading?: boolean
}

export default function AjustesInventarioTable({
  ajustes,
  pagination,
  filters,
  onFilterChange,
  onAprobar,
  onRechazar,
  isLoading
}: AjustesInventarioTableProps) {
  const [selectedAjuste, setSelectedAjuste] = useState<AjusteInventario | null>(null)
  const [searchValue, setSearchValue] = useState(filters.search)

  // Debounce para el buscador: espera 500ms después de que el usuario deje de escribir
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFilterChange({ ...filters, search: searchValue, page: 1 })
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  // Sincronizar searchValue cuando filters.search cambia externamente
  useEffect(() => {
    setSearchValue(filters.search)
  }, [filters.search])

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'APROBADO':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
            <CheckCircle className="h-3 w-3" />
            Aprobado
          </span>
        )
      case 'RECHAZADO':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800">
            <XCircle className="h-3 w-3" />
            Rechazado
          </span>
        )
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            <Clock className="h-3 w-3" />
            Pendiente
          </span>
        )
      default:
        return <span className="text-xs text-gray-500">{estado}</span>
    }
  }

  const getTipoMovimientoBadge = (tipo: string) => {
    const esEntrada = tipo.includes('ENTRADA')
    return (
      <span className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        esEntrada ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
      )}>
        {tipo.replace(/_/g, ' ')}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros - Siempre visibles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 pt-4">
        <div className="flex flex-1 gap-2">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="input-field"
              placeholder="Buscar por número de documento, motivo..."
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={filters.estado_movimiento}
            onChange={(e) => onFilterChange({ ...filters, estado_movimiento: e.target.value, page: 1 })}
            className="input-field"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>

          <select
            value={filters.tipo_movimiento}
            onChange={(e) => onFilterChange({ ...filters, tipo_movimiento: e.target.value, page: 1 })}
            className="input-field"
          >
            <option value="">Todos los tipos</option>
            <option value="ENTRADA_AJUSTE_POSITIVO">Ajuste Positivo</option>
            <option value="SALIDA_AJUSTE_NEGATIVO">Ajuste Negativo</option>
            <option value="ENTRADA_DEVOLUCION_CLIENTE">Devolución Cliente</option>
            <option value="SALIDA_DEVOLUCION_PROVEEDOR">Devolución Proveedor</option>
            <option value="SALIDA_MERMA">Merma</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="card p-10 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-3 text-sm text-slate-500">Cargando ajustes...</p>
        </div>
      ) : (
        <div className="card overflow-hidden animate-fade-in">
          {ajustes.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">
              No encontramos ajustes con los filtros seleccionados.
            </div>
          ) : (
            <TableWrapper>
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Costo Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {ajustes.map((ajuste) => (
                    <tr key={ajuste.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {new Date(ajuste.fecha_movimiento).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-slate-900">
                            {ajuste.producto?.nombre || `Producto ${ajuste.producto_id}`}
                          </p>
                          {ajuste.numero_documento && (
                            <p className="text-xs text-slate-500">{ajuste.numero_documento}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getTipoMovimientoBadge(ajuste.tipo_movimiento)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {Number(ajuste.cantidad).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">{ajuste.stock_anterior}</span>
                          <span className="text-slate-300">→</span>
                          <span className={cn(
                            'font-semibold',
                            ajuste.stock_nuevo > ajuste.stock_anterior ? 'text-emerald-600' : 'text-rose-600'
                          )}>
                            {ajuste.stock_nuevo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        ${Number(ajuste.costo_total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getEstadoBadge(ajuste.estado_movimiento)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {ajuste.usuario?.nombre_completo || 'Usuario no registrado'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedAjuste(ajuste)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {ajuste.estado_movimiento === 'PENDIENTE' && (
                            <>
                              <button
                                onClick={() => onAprobar(ajuste.id)}
                                className="text-emerald-600 hover:text-emerald-900"
                                title="Aprobar"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => onRechazar(ajuste.id)}
                                className="text-rose-600 hover:text-rose-900"
                                title="Rechazar"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrapper>
          )}
        </div>
      )}

      {/* Paginación */}
      {pagination && pagination.pages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 text-sm text-slate-600 sm:flex-row">
          <div>
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFilterChange({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="rounded-xl border border-slate-200 px-3 py-1 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="rounded-xl bg-emerald-100 px-3 py-1 font-semibold text-emerald-600">
              {filters.page}
            </span>
            <button
              onClick={() => onFilterChange({ ...filters, page: filters.page + 1 })}
              disabled={filters.page >= pagination.pages}
              className="rounded-xl border border-slate-200 px-3 py-1 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedAjuste && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 px-4 py-10 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Detalle de Ajuste
                </span>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {selectedAjuste.numero_documento || `Ajuste #${selectedAjuste.id}`}
                </h2>
                <p className="text-sm text-slate-500">
                  {getEstadoBadge(selectedAjuste.estado_movimiento)}
                </p>
              </div>
              <button
                onClick={() => setSelectedAjuste(null)}
                className="rounded-full bg-white/25 px-3 py-1 text-white transition hover:bg-white/40"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailCard label="Producto" value={selectedAjuste.producto?.nombre || 'N/A'} />
              <DetailCard label="Tipo de Movimiento" value={selectedAjuste.tipo_movimiento.replace(/_/g, ' ')} />
              <DetailCard label="Cantidad" value={Number(selectedAjuste.cantidad).toFixed(2)} />
              <DetailCard label="Precio Unitario" value={`$${Number(selectedAjuste.precio_unitario).toFixed(2)}`} />
              <DetailCard label="Costo Total" value={`$${Number(selectedAjuste.costo_total).toFixed(2)}`} highlight />
              <DetailCard 
                label="Stock" 
                value={`${selectedAjuste.stock_anterior} → ${selectedAjuste.stock_nuevo}`} 
              />
              <DetailCard label="Usuario" value={selectedAjuste.usuario?.nombre_completo || 'N/A'} />
              <DetailCard 
                label="Fecha" 
                value={new Date(selectedAjuste.fecha_movimiento).toLocaleString('es-PE')} 
              />
            </div>

            {selectedAjuste.motivo_movimiento && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Motivo
                </p>
                <p className="text-sm text-slate-700">{selectedAjuste.motivo_movimiento}</p>
              </div>
            )}

            {selectedAjuste.observaciones && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Observaciones
                </p>
                <p className="text-sm text-slate-700">{selectedAjuste.observaciones}</p>
              </div>
            )}

            {selectedAjuste.autorizadoPor && (
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">
                  Autorizado por
                </p>
                <p className="text-sm text-emerald-900">
                  {selectedAjuste.autorizadoPor.nombre_completo} el {new Date(selectedAjuste.fecha_autorizacion!).toLocaleString('es-PE')}
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAjuste(null)}
                className="btn-outline"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn(
      'rounded-2xl border border-slate-100 px-4 py-3',
      highlight ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'
    )}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

