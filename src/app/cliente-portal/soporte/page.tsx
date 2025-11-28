'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { MessageCircle, Phone, Mail, Clock, HelpCircle, Loader2, MapPin, Bot, Send, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SoportePage() {
  const router = useRouter()
  const { user, isAuthenticated, token } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [sugerencias, setSugerencias] = useState<string[]>([])
  const [loadingSugerencias, setLoadingSugerencias] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'model', parts: string}>>([])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      router.push('/')
      return
    }
    setIsLoading(false)
    if (token) {
      fetchSugerencias()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, router, token])

  const fetchSugerencias = async () => {
    if (!token) return
    try {
      setLoadingSugerencias(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'}/gemini/sugerencias`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success && data.data) {
        setSugerencias(data.data)
      }
    } catch (error) {
      console.error('Error al cargar sugerencias:', error)
      // Sugerencias por defecto si falla
      setSugerencias([
        '¿Cuáles son los productos más vendidos?',
        '¿Cuál es el estado de mi último pedido?',
        '¿Tienen productos en oferta?',
        '¿Cómo puedo hacer un pedido?',
        '¿Cuál es mi historial de compras?',
        '¿Qué productos tienen disponible?'
      ])
    } finally {
      setLoadingSugerencias(false)
    }
  }

  const sendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim()
    if (!messageText || isSending || !token) return

    // Agregar mensaje del usuario
    const userMessage = { role: 'user' as const, parts: messageText }
    setChatMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsSending(true)

    try {
      const history = chatMessages.map(m => ({
        role: m.role,
        parts: m.parts
      }))

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'}/gemini/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: messageText,
          history
        })
      })

      const data = await response.json()
      
      if (data.success && data.data?.message) {
        const modelMessage = { role: 'model' as const, parts: data.data.message }
        setChatMessages(prev => [...prev, modelMessage])
      } else {
        toast.error(data.message || 'Error al procesar la consulta')
      }
    } catch (error: any) {
      console.error('Error en chat:', error)
      toast.error('Error al conectar con el asistente')
    } finally {
      setIsSending(false)
    }
  }

  const handleWhatsAppClick = () => {
    const phoneNumber = '51956216912' // Teléfono oficial de contacto
    const message = encodeURIComponent('¡Hola! Necesito ayuda con mi pedido.')
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  const faqs = [
    {
      pregunta: '¿Cómo puedo hacer un pedido?',
      respuesta: 'Ve al catálogo, selecciona los productos que deseas, agrégalos al carrito y haz clic en "Crear Pedido". Un vendedor revisará tu pedido antes de procesarlo.'
    },
    {
      pregunta: '¿Cuánto tiempo tarda en aprobarse mi pedido?',
      respuesta: 'Los pedidos suelen aprobarse en un plazo de 24 horas hábiles. Recibirás una notificación cuando tu pedido sea aprobado o si necesitamos más información.'
    },
    {
      pregunta: '¿Cómo puedo ver el estado de mi pedido?',
      respuesta: 'Puedes ver todos tus pedidos y su estado en la sección "Mis Pedidos" del menú lateral.'
    },
    {
      pregunta: '¿Puedo cancelar un pedido?',
      respuesta: 'Sí, puedes cancelar un pedido mientras esté en estado "PENDIENTE". Una vez aprobado, deberás contactar a soporte para solicitar la cancelación.'
    },
    {
      pregunta: '¿Dónde puedo ver mis facturas?',
      respuesta: 'Todas tus facturas están disponibles en la sección "Mis Facturas" del menú lateral. Puedes descargarlas en formato PDF.'
    },
    {
      pregunta: '¿Cómo actualizo mi información de contacto?',
      respuesta: 'Ve a "Mi Perfil" en el menú lateral para actualizar tu información personal y de contacto.'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Agente Virtual y Soporte</h1>
        <p className="mt-2 text-slate-600">
          Habla con nuestro Agente Virtual (el mismo de WhatsApp/ChatDex) o contáctanos por los otros canales.
        </p>
      </div>

      {/* Canales de contacto */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* WhatsApp */}
        <button
          onClick={handleWhatsAppClick}
          className="glass-card group rounded-2xl p-6 text-left transition hover:shadow-xl"
        >
          <div className="flex items-start space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">WhatsApp</h3>
              <p className="mt-1 text-sm text-slate-600">
                Chatea con nosotros en tiempo real
              </p>
              <p className="mt-2 text-xs font-semibold text-green-600 group-hover:underline">
                Abrir chat →
              </p>
            </div>
          </div>
        </button>

        {/* Teléfono */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Phone className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Teléfono</h3>
              <p className="mt-1 text-sm text-slate-600">
                Llámanos directamente
              </p>
              <p className="mt-2 text-sm font-semibold text-blue-600">
                +51 956 216 912
              </p>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <Mail className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Email</h3>
              <p className="mt-1 text-sm text-slate-600">
                Envíanos un correo
              </p>
              <p className="mt-2 text-sm font-semibold text-purple-600">
                soporte@kardex.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Horarios de atención */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <Clock className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Horarios de Atención</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-slate-700">Lunes a Viernes</p>
                <p className="text-sm text-slate-600">9:00 AM - 6:00 PM</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Sábados</p>
                <p className="text-sm text-slate-600">9:00 AM - 1:00 PM</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Domingos</p>
                <p className="text-sm text-slate-600">Cerrado</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Emergencias</p>
                <p className="text-sm text-slate-600">WhatsApp 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ubícanos - Google Maps */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white">
            <MapPin className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Ubícanos</h3>
            <p className="mt-2 text-sm text-slate-600">
              Visítanos en nuestra tienda física
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Información de dirección */}
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="font-semibold text-slate-900">Dirección</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Av. Principal 123, Centro Comercial Plaza Norte
                  </p>
                  <p className="text-sm text-slate-600">
                    Lima, Perú
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="font-semibold text-slate-900">Referencias</p>
                  <p className="mt-1 text-sm text-slate-600">
                    A una cuadra del metro, frente al parque central
                  </p>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Lima+Peru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
                >
                  <MapPin className="h-5 w-5" />
                  <span>Abrir en Google Maps</span>
                </a>
              </div>
              {/* Mapa embed */}
              <div className="h-[300px] overflow-hidden rounded-xl border border-slate-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.8664557936796!2d-77.03687582395983!3d-12.046373988146156!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8b5d35662c7%3A0x15f0bda5ccbd31eb!2sPlaza%20Mayor%20de%20Lima!5e0!3m2!1sen!2spe!4v1700000000000!5m2!1sen!2spe"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de KARDEX"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agente Virtual (Chatbot Gemini) */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <Bot className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Agente Virtual</h3>
            <p className="mt-2 text-sm text-slate-600">
              Es el mismo bot que usa WhatsApp (ChatDex), pero aquí dentro del portal. Puedes pedir, consultar precios, ver tu pedido y pagar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Área de chat principal con robot */}
          <div className="lg:col-span-2 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 min-h-[500px] flex flex-col">
            {chatMessages.length === 0 ? (
              /* Estado inicial con robot grande */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl animate-pulse">
                    <Bot className="h-16 w-16" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">¡Hola! 👋</h4>
                  <p className="text-slate-600">
                    Soy tu asistente virtual de KARDEX. ¿En qué puedo ayudarte hoy?
                  </p>
                </div>
              </div>
            ) : (
              /* Área de mensajes cuando hay conversación */
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {msg.role === 'model' && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex-shrink-0">
                          <Bot className="h-5 w-5" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                            : 'bg-white text-slate-700 shadow-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.parts}</p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex-shrink-0">
                          <span className="text-xs font-bold">{user?.nombre_completo?.charAt(0) || 'U'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex-shrink-0">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Input de chat */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Escribe tu mensaje..."
                disabled={isSending}
                className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isSending}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white transition hover:shadow-lg disabled:opacity-50"
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Panel de preguntas sugeridas */}
          <div className="space-y-4">
            <div className="rounded-xl border-2 border-slate-200 bg-white p-4">
              <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Preguntas Sugeridas
              </h4>
              {loadingSugerencias ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-slate-200 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {sugerencias.map((sugerencia, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(sugerencia)}
                      disabled={isSending}
                      className="w-full text-left rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
                    >
                      {sugerencia}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preguntas Frecuentes */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Preguntas Frecuentes</h3>
            <div className="mt-4 space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-primary-300"
                >
                  <summary className="cursor-pointer font-semibold text-slate-900 group-open:text-primary-600">
                    {faq.pregunta}
                  </summary>
                  <p className="mt-3 text-sm text-slate-600">
                    {faq.respuesta}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botón de acción rápida */}
      <div className="glass-card rounded-2xl bg-gradient-to-r from-primary-50 to-indigo-50 p-8 text-center">
        <h3 className="text-xl font-bold text-slate-900">¿Necesitas ayuda inmediata?</h3>
        <p className="mt-2 text-slate-600">
          Nuestro equipo está listo para asistirte por WhatsApp
        </p>
        <button
          onClick={handleWhatsAppClick}
          className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-8 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
        >
          <MessageCircle className="h-5 w-5" />
          <span>Chatear por WhatsApp</span>
        </button>
      </div>
    </div>
  )
}

