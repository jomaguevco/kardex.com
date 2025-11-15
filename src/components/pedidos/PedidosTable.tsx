'use client'

import { useState } from 'react'
import { Eye, CheckCircle, XCircle, Package, Calendar, User, DollarSign } from 'lucide-react'
import { Pedido } from '@/services/pedidoService'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface PedidosTableProps {
  pedidos: Pedido[]
  onViewDetalle: (pedido: Pedido) => void
  onAprobar: (pedidoId: number) => void
  onRechazar: (pedidoId: number, motivo: string) => void
}

export default function PedidosTable({
  pedidos,
  onViewDetalle,
  onAprobar,
  onRechazar
}: PedidosTableProps) {
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            <Calendar className="mr-1 h-3 w-3" />
            Pendiente
          </span>
        )
      case 'APROBADO':
      case 'PROCESADO':
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            {estado === 'PROCESADO' ? 'Procesado' : 'Aprobado'}
          </span>
        )
      case 'RECHAZADO':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Rechazado
          </span>
        )
      case 'CANCELADO':
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
            Cancelado
          </span>
        )
      default:
        return <span className="text-sm text-slate-600">{estado}</span>
    }
  }

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Pedido
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Cliente
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Productos
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Fecha
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Estado
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {pedidos.map((pedido) => (
              <tr
                key={pedido.id}
                className="transition hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-semibold text-slate-900">
                    {pedido.numero_pedido}
                  </div>
                  <div className="text-xs text-slate-500">
                    #{pedido.id}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-slate-900">
                        {pedido.cliente?.nombre || 'Cliente'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {pedido.cliente?.numero_documento || 'Sin documento'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center text-sm text-slate-900">
                    <Package className="mr-2 h-4 w-4 text-slate-400" />
                    {pedido.detalles?.length || 0} productos
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center text-sm font-semibold text-slate-900">
                    <DollarSign className="mr-1 h-4 w-4 text-emerald-600" />
                    S/. {Number(pedido.total).toFixed(2)}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                  {formatDistanceToNow(new Date(pedido.fecha_pedido), {
                    addSuffix: true,
                    locale: es
                  })}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {getEstadoBadge(pedido.estado)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewDetalle(pedido)}
                      className="rounded-lg bg-indigo-100 p-2 text-indigo-600 transition hover:bg-indigo-200"
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {pedido.estado === 'PENDIENTE' && (
                      <>
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de aprobar este pedido?')) {
                              onAprobar(pedido.id)
                            }
                          }}
                          className="rounded-lg bg-emerald-100 p-2 text-emerald-600 transition hover:bg-emerald-200"
                          title="Aprobar"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const motivo = prompt('Ingrese el motivo del rechazo:')
                            if (motivo && motivo.trim()) {
                              onRechazar(pedido.id, motivo.trim())
                            }
                          }}
                          className="rounded-lg bg-red-100 p-2 text-red-600 transition hover:bg-red-200"
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
      </div>
    </div>
  )
}

