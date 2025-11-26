'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, X, ScanLine, AlertCircle, CheckCircle } from 'lucide-react'

interface BarcodeCameraScannerProps {
  onScan: (code: string) => void
  onClose?: () => void
  isOpen?: boolean
}

export default function BarcodeCameraScanner({ onScan, onClose, isOpen = true }: BarcodeCameraScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const startScanning = async () => {
    if (!containerRef.current) return

    try {
      setError(null)
      setIsScanning(true)

      const html5QrCode = new Html5Qrcode('barcode-scanner-container')
      scannerRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' }, // Usar cámara trasera
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778
        },
        (decodedText) => {
          // Código escaneado exitosamente
          setLastScanned(decodedText)
          onScan(decodedText)
          
          // Vibrar si está disponible
          if (navigator.vibrate) {
            navigator.vibrate(200)
          }
          
          // Opcional: detener después de escanear
          stopScanning()
        },
        () => {
          // Ignorar errores de escaneo parciales
        }
      )
    } catch (err: any) {
      console.error('Error al iniciar el escáner:', err)
      setIsScanning(false)
      
      if (err.message?.includes('Permission denied')) {
        setError('Permiso de cámara denegado. Por favor, permite el acceso a la cámara.')
      } else if (err.message?.includes('NotFoundError')) {
        setError('No se encontró ninguna cámara. Asegúrate de que tu dispositivo tiene cámara.')
      } else {
        setError('Error al acceder a la cámara. Intenta nuevamente.')
      }
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {
        // Ignorar errores al detener
      }
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleClose = () => {
    stopScanning()
    onClose?.()
  }

  useEffect(() => {
    // Limpiar al desmontar
    return () => {
      stopScanning()
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <Camera className="h-6 w-6 text-white" />
            <h3 className="text-lg font-bold text-white">Escanear Código de Barras</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/20 transition"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Scanner container */}
          <div 
            ref={containerRef}
            className="relative bg-slate-900 rounded-xl overflow-hidden"
            style={{ minHeight: '300px' }}
          >
            <div id="barcode-scanner-container" className="w-full" />
            
            {!isScanning && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <Camera className="h-16 w-16 text-slate-400 mb-4" />
                <p className="text-slate-300 mb-6">
                  Haz clic en "Iniciar Cámara" para escanear códigos de barras
                </p>
                <button
                  onClick={startScanning}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition"
                >
                  <Camera className="h-5 w-5" />
                  <span>Iniciar Cámara</span>
                </button>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-40 border-4 border-blue-500 rounded-lg">
                    <ScanLine className="absolute top-1/2 left-0 right-0 h-8 text-blue-500 animate-bounce" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white text-sm bg-black/50 inline-block px-4 py-2 rounded-full">
                    Apunta al código de barras
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 flex items-start space-x-3 p-4 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">{error}</p>
                <button
                  onClick={startScanning}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Intentar nuevamente
                </button>
              </div>
            </div>
          )}

          {/* Last scanned */}
          {lastScanned && (
            <div className="mt-4 flex items-center space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-xs text-emerald-600">Último código escaneado:</p>
                <p className="text-sm font-bold text-emerald-800 font-mono">{lastScanned}</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 flex space-x-3">
            {isScanning && (
              <button
                onClick={stopScanning}
                className="flex-1 py-3 px-4 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition"
              >
                Detener
              </button>
            )}
            <button
              onClick={handleClose}
              className={`py-3 px-4 bg-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition ${isScanning ? '' : 'flex-1'}`}
            >
              Cerrar
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-4 text-xs text-slate-500 text-center">
            <p>Soporta códigos de barras EAN-13, EAN-8, UPC-A, UPC-E, Code 39, Code 128 y QR.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

