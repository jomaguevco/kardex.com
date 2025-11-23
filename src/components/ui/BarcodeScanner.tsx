'use client'

import { useState, useEffect, useRef } from 'react'
import { Barcode, Search, X } from 'lucide-react'
import { productoService } from '@/services/productoService'
import { Producto } from '@/types'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'

interface BarcodeScannerProps {
  onProductFound: (producto: Producto) => void
  onError?: (error: string) => void
  placeholder?: string
  autoFocus?: boolean
  disabled?: boolean
  className?: string
}

export default function BarcodeScanner({
  onProductFound,
  onError,
  placeholder = 'Escanea o ingresa código de barras...',
  autoFocus = true,
  disabled = false,
  className = ''
}: BarcodeScannerProps) {
  const [codigoBarras, setCodigoBarras] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [productoEncontrado, setProductoEncontrado] = useState<Producto | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-focus cuando se monta
  useEffect(() => {
    if (autoFocus && !disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus, disabled])

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const buscarProducto = async (codigo: string) => {
    if (!codigo || codigo.trim() === '') {
      return
    }

    setIsSearching(true)
    setProductoEncontrado(null)

    try {
      const producto = await productoService.getProductoByBarcode(codigo.trim())
      setProductoEncontrado(producto)
      onProductFound(producto)
      setCodigoBarras('') // Limpiar después de encontrar
      toast.success(`Producto encontrado: ${producto.nombre}`)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Producto no encontrado'
      setProductoEncontrado(null)
      
      if (onError) {
        onError(errorMessage)
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    setCodigoBarras(valor)

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Si el código tiene al menos 3 caracteres, buscar después de 500ms sin escribir
    if (valor.length >= 3) {
      timeoutRef.current = setTimeout(() => {
        buscarProducto(valor)
      }, 500)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Si presiona Enter, buscar inmediatamente
    if (e.key === 'Enter' && codigoBarras.trim().length > 0) {
      e.preventDefault()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      buscarProducto(codigoBarras)
    }
  }

  const handleClear = () => {
    setCodigoBarras('')
    setProductoEncontrado(null)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Barcode className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={codigoBarras}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSearching}
          placeholder={placeholder}
          className={`
            input-field pl-10 pr-10
            ${isSearching ? 'opacity-50 cursor-wait' : ''}
            ${productoEncontrado ? 'border-green-500 bg-green-50' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {isSearching && (
            <LoadingSpinner size="sm" />
          )}
          {codigoBarras && !isSearching && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition"
              tabIndex={-1}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      {productoEncontrado && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Search className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-900 truncate">
                {productoEncontrado.nombre}
              </p>
              <p className="text-xs text-green-700">
                Código: {productoEncontrado.codigo_interno} • Stock: {productoEncontrado.stock_actual}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

