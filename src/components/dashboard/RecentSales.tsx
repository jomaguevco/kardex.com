'use client'

import { Clock, DollarSign } from 'lucide-react'

const recentSales = [
  {
    id: 1,
    cliente: 'Juan Pérez',
    total: 1250.00,
    fecha: '2024-01-15 14:30',
    estado: 'completada'
  },
  {
    id: 2,
    cliente: 'María García',
    total: 890.50,
    fecha: '2024-01-15 13:45',
    estado: 'completada'
  },
  {
    id: 3,
    cliente: 'Carlos López',
    total: 2100.00,
    fecha: '2024-01-15 12:20',
    estado: 'pendiente'
  },
  {
    id: 4,
    cliente: 'Ana Martínez',
    total: 675.25,
    fecha: '2024-01-15 11:15',
    estado: 'completada'
  }
]

export default function RecentSales() {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas Recientes</h3>
      <div className="space-y-4">
        {recentSales.map((sale) => (
          <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{sale.cliente}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {sale.fecha}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">${sale.total.toFixed(2)}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                sale.estado === 'completada' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {sale.estado}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <button className="text-primary-600 hover:text-primary-500 text-sm font-medium">
          Ver todas las ventas
        </button>
      </div>
    </div>
  )
}

