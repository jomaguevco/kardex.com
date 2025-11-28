'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import clientePortalService from '@/services/clientePortalService'
import { TrendingUp, Loader2, Package, ShoppingBag, DollarSign, FileDown, CreditCard, X, Copy, Check, Smartphone, Building } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EstadoCuentaPage() {
  const router = useRouter()
  const { user, isAuthenticated, token } = useAuthStore()
  const [estadoCuenta, setEstadoCuenta] = useState<any>(null)
  const [facturas, setFacturas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedFactura, setSelectedFactura] = useState<any>(null)
  const [configPagos, setConfigPagos] = useState<any>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      router.push('/')
      return
    }

    fetchEstadoCuenta()
  }, [isAuthenticated, user, router])

  const fetchEstadoCuenta = async () => {
    try {
      const response = await clientePortalService.getEstadoCuenta()
      if (response.success) {
        setEstadoCuenta(response.data)
      }
      const fact = await clientePortalService.getMisFacturas()
      if ((fact as any).success) {
        setFacturas((fact as any).data?.slice(0, 5) || [])
      }
      // Cargar configuración de pagos
      const configResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cliente-portal/configuracion-pagos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const configData = await configResponse.json()
      if (configData.success) {
        setConfigPagos(configData.data)
      }
    } catch (error) {
      console.error('Error al cargar estado de cuenta:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePagar = (factura: any) => {
    setSelectedFactura(factura)
    setShowPaymentModal(true)
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast.success('Copiado al portapapeles')
    setTimeout(() => setCopiedField(null), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Estado de Cuenta</h1>
        <p className="mt-2 text-slate-600">
          Resumen de tu actividad y estadísticas de compras
        </p>
      </div>

      {/* Información del cliente */}
      {estadoCuenta?.cliente && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Información del Cliente
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-600">Nombre</p>
              <p className="font-semibold text-slate-900">
                {estadoCuenta.cliente.nombre}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Documento</p>
              <p className="font-semibold text-slate-900">
                {estadoCuenta.cliente.numero_documento}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Email</p>
              <p className="font-semibold text-slate-900">
                {estadoCuenta.cliente.email || 'No registrado'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Teléfono</p>
              <p className="font-semibold text-slate-900">
                {estadoCuenta.cliente.telefono || 'No registrado'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Compras</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {estadoCuenta?.totalCompras || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Gastado</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                S/ {Number(estadoCuenta?.totalGastado || 0).toFixed(2)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Productos Únicos</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {estadoCuenta?.productosMasComprados?.length || 0}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Compras por mes */}
      {estadoCuenta?.comprasPorMes && estadoCuenta.comprasPorMes.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Compras por Mes (Últimos 6 meses)
          </h2>
          <div className="space-y-3">
            {estadoCuenta.comprasPorMes.map((mes: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">{mes.mes}</p>
                  <p className="text-sm text-slate-600">
                    {mes.cantidad} compra(s)
                  </p>
                </div>
                <p className="text-xl font-bold text-primary-600">
                  S/ {Number(mes.total || 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facturas recientes */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Facturas recientes</h2>
          <button
            onClick={() => router.push('/cliente-portal/facturas')}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Ver todas
          </button>
        </div>
        {facturas.length === 0 ? (
          <p className="text-sm text-slate-600">Aún no tienes facturas emitidas.</p>
        ) : (
          <div className="space-y-3">
            {facturas.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{f.numero_factura}</p>
                  <p className="text-xs text-slate-600">{new Date(f.fecha_venta).toLocaleDateString('es-ES')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-primary-600">S/ {Number(f.total || 0).toFixed(2)}</p>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => alert('Descarga de PDF desde Reportes (próx.)')}
                  >
                    <FileDown className="h-4 w-4" /> PDF
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:shadow"
                    onClick={() => handlePagar(f)}
                    title="Ver métodos de pago"
                  >
                    <CreditCard className="h-4 w-4" /> Pagar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Productos más comprados */}
      {estadoCuenta?.productosMasComprados && estadoCuenta.productosMasComprados.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Productos Más Comprados
          </h2>
          <div className="space-y-3">
            {estadoCuenta.productosMasComprados.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {item.producto?.nombre || 'Producto'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {item.total_cantidad} unidades compradas
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-primary-600">
                  S/ {Number(item.total_gastado || 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Pago */}
      {showPaymentModal && selectedFactura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold">Métodos de Pago</h2>
              <p className="text-sm opacity-90 mt-1">
                Factura: {selectedFactura.numero_factura}
              </p>
              <p className="text-2xl font-bold mt-2">
                S/ {Number(selectedFactura.total || 0).toFixed(2)}
              </p>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Yape/Plin */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-4">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  Yape / Plin
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Yape */}
                  <div className="border border-purple-200 rounded-xl p-4 text-center">
                    {configPagos?.yape?.qr_url && configPagos.yape.qr_url !== '/images/qr-yape.png' && (
                      <div className="w-32 h-32 mx-auto mb-3 bg-white rounded-lg p-2 border border-purple-200">
                        <img 
                          src={configPagos.yape.qr_url} 
                          alt="QR Yape" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // Ocultar la imagen si falla al cargar
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <p className="font-semibold text-slate-900 dark:text-white">Yape</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {configPagos?.yape?.numero || '999888777'}
                    </p>
                    <button
                      onClick={() => copyToClipboard(configPagos?.yape?.numero || '999888777', 'yape')}
                      className="mt-2 text-xs text-purple-600 hover:underline flex items-center justify-center gap-1"
                    >
                      {copiedField === 'yape' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedField === 'yape' ? 'Copiado' : 'Copiar número'}
                    </button>
                  </div>
                  {/* Plin */}
                  <div className="border border-teal-200 rounded-xl p-4 text-center">
                    {configPagos?.plin?.qr_url && configPagos.plin.qr_url !== '/images/qr-plin.png' && (
                      <div className="w-32 h-32 mx-auto mb-3 bg-white rounded-lg p-2 border border-teal-200">
                        <img 
                          src={configPagos.plin.qr_url} 
                          alt="QR Plin" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // Ocultar la imagen si falla al cargar
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <p className="font-semibold text-slate-900 dark:text-white">Plin</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {configPagos?.plin?.numero || '999888777'}
                    </p>
                    <button
                      onClick={() => copyToClipboard(configPagos?.plin?.numero || '999888777', 'plin')}
                      className="mt-2 text-xs text-teal-600 hover:underline flex items-center justify-center gap-1"
                    >
                      {copiedField === 'plin' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedField === 'plin' ? 'Copiado' : 'Copiar número'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Cuentas Bancarias */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-4">
                  <Building className="h-5 w-5 text-blue-600" />
                  Transferencia Bancaria
                </h3>
                <div className="space-y-3">
                  {(configPagos?.cuentas_bancarias || [
                    { banco: 'BCP', tipo: 'Cuenta Corriente', numero: '30572053360058', cci: '00230572053360058', titular: 'KARDEX S.A.C.' }
                  ]).map((cuenta: any, index: number) => (
                    <div key={index} className="border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 dark:text-white">{cuenta.banco}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{cuenta.tipo}</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-300">Número:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-900 dark:text-white">{cuenta.numero}</span>
                            <button onClick={() => copyToClipboard(cuenta.numero, `num-${index}`)}>
                              {copiedField === `num-${index}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-300">CCI:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-900 dark:text-white text-xs">{cuenta.cci}</span>
                            <button onClick={() => copyToClipboard(cuenta.cci, `cci-${index}`)}>
                              {copiedField === `cci-${index}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-slate-400" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-300">Titular:</span>
                          <span className="text-slate-900 dark:text-white">{cuenta.titular}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nota importante */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Importante:</strong> Después de realizar el pago, envía el comprobante a nuestro WhatsApp o 
                  usa el chat de soporte para confirmar tu pago.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 bg-slate-50 dark:bg-slate-900">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:shadow-lg transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
