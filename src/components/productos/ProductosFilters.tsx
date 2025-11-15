'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { ProductoFilters } from '@/types'
import { cn } from '@/utils/cn'

interface ProductosFiltersProps {
  filters: ProductoFilters
  onFiltersChange: (filters: ProductoFilters) => void
}

export default function ProductosFilters({ filters, onFiltersChange }: ProductosFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value, page: 1 })
  }

  const handleCategoriaChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      categoria_id: value ? parseInt(value) : undefined, 
      page: 1 
    })
  }

  const handleMarcaChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      marca_id: value ? parseInt(value) : undefined, 
      page: 1 
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 10,
      search: '',
      categoria_id: undefined,
      marca_id: undefined
    })
  }

  const hasActiveFilters = filters.search || filters.categoria_id || filters.marca_id

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-primary-600 hover:text-primary-500 flex items-center"
          >
            <Filter className="h-4 w-4 mr-1" />
            {showAdvanced ? 'Ocultar' : 'Avanzados'}
          </button>
        </div>
      </div>

      {/* Búsqueda básica */}
      <div>
        <input
          type="text"
          placeholder="Buscar por nombre, código o código de barras..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={filters.categoria_id || ''}
              onChange={(e) => handleCategoriaChange(e.target.value)}
              className="input-field"
            >
              <option value="">Todas las categorías</option>
              <option value="1">Electrónicos</option>
              <option value="2">Ropa</option>
              <option value="3">Hogar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marca
            </label>
            <select
              value={filters.marca_id || ''}
              onChange={(e) => handleMarcaChange(e.target.value)}
              className="input-field"
            >
              <option value="">Todas las marcas</option>
              <option value="1">Samsung</option>
              <option value="2">Apple</option>
              <option value="3">Dell</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

