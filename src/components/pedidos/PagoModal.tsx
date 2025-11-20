'use client'

import { useState, useRef } from 'react'
import { X, CreditCard, Wallet, Building2, Smartphone, Upload, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface PagoModalProps {
  pedidoId: number
  total: number
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'YAPE' | 'PLIN'

const METODOS_PAGO: { value: MetodoPago; label: string; icon: any; description: string }[] = [
  {
    value: 'EFECTIVO',
    label: 'Efectivo',
    icon: Wallet,
    description: 'Pago en efectivo al momento de la entrega'
  },
  {
    value: 'TARJETA',
    label: 'Tarjeta',
    icon: CreditCard,
    description: 'Tarjeta de crédito o débito'
  },
  {
    value: 'TRANSFERENCIA',
    label: 'Transferencia',
    icon: Building2,
    description: 'Transferencia bancaria'
  },
  {
    value: 'YAPE',
    label: 'Yape',
    icon: Smartphone,
    description: 'Pago mediante Yape'
  },
  {
    value: 'PLIN',
    label: 'Plin',
    icon: Smartphone,
    description: 'Pago mediante Plin'
  }
]

export default function PagoModal({
  pedidoId,
  total,
  isOpen,
  onClose,
  onSuccess
}: PagoModalProps) {
  const [metodoPago, setMetodoPago] = useState<MetodoPago | ''>('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [previewComprobante, setPreviewComprobante] = useState<string | null>(null)
  const [isProcesando, setIsProcesando] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      return
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB')
      return
    }

    setComprobante(file)

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewComprobante(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveComprobante = () => {
    setComprobante(null)
    setPreviewComprobante(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!metodoPago) {
      toast.error('Debes seleccionar un método de pago')
      return
    }

    // Si es YAPE o PLIN, requerir comprobante
    if ((metodoPago === 'YAPE' || metodoPago === 'PLIN' || metodoPago === 'TRANSFERENCIA') && !comprobante) {
      toast.error(`Debes subir un comprobante de pago para ${metodoPago}`)
      return
    }

    setIsProcesando(true)

    try {
      // Importar el servicio dinámicamente para evitar problemas de importación circular
      const pedidoService = (await import('@/services/pedidoService')).default

      let comprobanteUrl: string | undefined = undefined

      // Si hay comprobante, subirlo primero
      if (comprobante) {
        // Aquí deberías subir la imagen al servidor
        // Por ahora, usaremos una URL temporal o base64
        // En producción, esto debería subirse a un servicio de almacenamiento
        const formData = new FormData()
        formData.append('file', comprobante)

        try {
          // Intentar subir el archivo si hay un endpoint para ello
          // Por ahora, usaremos base64 como fallback
          const reader = new FileReader()
          reader.readAsDataURL(comprobante)
          reader.onloadend = () => {
            comprobanteUrl = reader.result as string
          }
        } catch (error) {
          console.warn('No se pudo subir el comprobante, usando base64 temporal')
        }
      }

      // Esperar un momento para que se procese la imagen si es necesario
      if (comprobante && !comprobanteUrl) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Marcar pedido como pagado
      await pedidoService.marcarComoPagado(pedidoId, {
        metodo_pago: metodoPago,
        comprobante_pago: comprobanteUrl
      })

      toast.success('Pago registrado exitosamente')
      onSuccess()
      onClose()

      // Limpiar formulario
      setMetodoPago('')
      setComprobante(null)
      setPreviewComprobante(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      console.error('Error al procesar pago:', error)
      toast.error(error?.message || 'Error al procesar el pago')
    } finally {
      setIsProcesando(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] overflow-hidden bg-black/50 backdrop-blur-sm">
        <div className="flex h-full w-full items-center justify-center px-4 sm:px-12 py-4 sm:py-10">
          <div
            className="relative w-full max-w-4xl max-h-[90vh] ml-auto rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white">
              <div>
                <h2 className="text-lg font-bold">Simular Pago</h2>
                <p className="text-sm text-white/80">
                  Total a pagar: <span className="font-semibold">S/ {Number(total).toFixed(2)}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-white/20 p-2 transition hover:bg-white/30 flex-shrink-0"
                disabled={isProcesando}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
              <form id="pago-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Método de pago */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-900">
                Selecciona el método de pago
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {METODOS_PAGO.map((metodo) => {
                  const Icon = metodo.icon
                  const isSelected = metodoPago === metodo.value
                  const requiereComprobante = ['YAPE', 'PLIN', 'TRANSFERENCIA'].includes(metodo.value)

                  return (
                    <button
                      key={metodo.value}
                      type="button"
                      onClick={() => setMetodoPago(metodo.value)}
                      className={`relative rounded-xl border-2 p-4 text-left transition ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`font-semibold ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>
                              {metodo.label}
                            </p>
                            {isSelected && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600">
                                <div className="h-2 w-2 rounded-full bg-white" />
                              </div>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-600">{metodo.description}</p>
                          {requiereComprobante && (
                            <p className="mt-1 text-xs font-medium text-amber-600">
                              * Requiere comprobante
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Subir comprobante (si aplica) */}
            {metodoPago && ['YAPE', 'PLIN', 'TRANSFERENCIA'].includes(metodoPago) && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Comprobante de pago {metodoPago === 'YAPE' || metodoPago === 'PLIN' ? '(captura de pantalla)' : '(voucher)'}
                </label>
                <div className="space-y-3">
                  {previewComprobante ? (
                    <div className="relative rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
                      <img
                        src={previewComprobante}
                        alt="Comprobante de pago"
                        className="max-h-64 w-full rounded-lg object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveComprobante}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white transition hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition hover:border-slate-400 hover:bg-slate-100"
                    >
                      <Upload className="mb-2 h-10 w-10 text-slate-400" />
                      <p className="text-sm font-semibold text-slate-700">
                        Haz clic para subir comprobante
                      </p>
                      <p className="mt-1 text-xs text-slate-500">JPG, PNG o GIF. Máximo 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isProcesando}
                  />
                </div>
              </div>
            )}

            {/* Información adicional */}
            {metodoPago === 'EFECTIVO' && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-900">
                  💡 Recordatorio: El pago en efectivo se realizará al momento de la entrega.
                </p>
              </div>
            )}

            </form>
          </div>
            </form>
          </div>

          {/* Footer con botones */}
          <div className="flex-shrink-0 flex gap-3 border-t border-slate-200 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcesando}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="pago-form"
              disabled={isProcesando || !metodoPago}
              className="flex-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcesando ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Procesando...
                </span>
              ) : (
                'Confirmar Pago'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

