'use client'

import { AlertTriangle, Package } from 'lucide-react'
import { cn } from '@/utils/cn'

const lowStockProducts = [
  {
    id: 1,
    nombre: 'Laptop Dell Inspiron',
    codigo: 'LAP001',
    stock_actual: 2,
    stock_minimo: 5
  },
  {
    id: 2,
    nombre: 'Mouse Inalámbrico',
    codigo: 'MOU002',
    stock_actual: 1,
    stock_minimo: 10
  },
  {
    id: 3,
    nombre: 'Teclado Mecánico',
    codigo: 'TEC003',
    stock_actual: 3,
    stock_minimo: 8
  }
]

export default function LowStockProducts() {
  return (
    <div className="card p-6">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Productos con Stock Bajo</h3>
      </div>
      
      <div className="space-y-3">
        {lowStockProducts.map((product) => (
          <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Package className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{product.nombre}</p>
                <p className="text-sm text-gray-500">Código: {product.codigo}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Stock actual: <span className="font-semibold text-yellow-600">{product.stock_actual}</span>
              </p>
              <p className="text-sm text-gray-600">
                Mínimo: <span className="font-semibold">{product.stock_minimo}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-primary-600 hover:text-primary-500 text-sm font-medium">
          Ver todos los productos con stock bajo
        </button>
      </div>
    </div>
  )
}

