'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { 
  X, Send, Loader2, Sparkles, 
  Bot, User, ChevronDown, Minimize2 
} from 'lucide-react'

// Icono SVG de Robot/IA
const AIIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
    <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2zM7.5 13a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 9a5 5 0 00-5 5v1h10v-1a5 5 0 00-5-5z"/>
  </svg>
)

interface Message {
  role: 'user' | 'model'
  parts: string
  timestamp: Date
}

export default function GeminiChatWidget() {
  const { token, user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sugerencias, setSugerencias] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cargar sugerencias al abrir
  useEffect(() => {
    if (isOpen && sugerencias.length === 0) {
      fetchSugerencias()
    }
  }, [isOpen])

  // Focus en input al abrir
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  const fetchSugerencias = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gemini/sugerencias`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setSugerencias(data.data)
      }
    } catch (error) {
      console.error('Error al cargar sugerencias:', error)
    }
  }

  const sendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim()
    if (!messageText || isLoading) return

    // Agregar mensaje del usuario
    const userMessage: Message = {
      role: 'user',
      parts: messageText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Preparar historial para el API
      const history = messages.map(m => ({
        role: m.role,
        parts: m.parts
      }))

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gemini/chat`, {
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

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success && data.data?.message) {
        const modelMessage: Message = {
          role: 'model',
          parts: data.data.message,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, modelMessage])
      } else {
        // Mensaje de error del servidor
        const errorMessage: Message = {
          role: 'model',
          parts: `❌ ${data.message || 'Lo siento, hubo un error al procesar tu consulta. Por favor intenta de nuevo.'}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error: any) {
      console.error('Error en chat:', error)
      
      // Mensaje de error más específico
      let errorText = '❌ No se pudo conectar con el asistente. Verifica tu conexión e intenta de nuevo.'
      
      if (error?.message) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorText = '❌ Error de conexión. Verifica tu internet e intenta de nuevo.'
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorText = '❌ Error de autenticación. Por favor recarga la página e intenta de nuevo.'
        } else if (error.message.includes('500')) {
          errorText = '❌ Error del servidor. Por favor intenta más tarde o contacta a soporte.'
        } else {
          errorText = `❌ ${error.message}`
        }
      }
      
      const errorMessage: Message = {
        role: 'model',
        parts: errorText,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  }

  // Solo mostrar para clientes
  if (user?.rol !== 'CLIENTE') return null

  return (
    <>
      {/* Botón flotante de IA - Posición más arriba para no chocar con WhatsApp */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/30 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        title="Asistente IA KARDEX"
      >
        <AIIcon />
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-xs font-bold animate-pulse">
          <Sparkles className="h-3 w-3 text-amber-900" />
        </span>
      </button>

      {/* Panel de chat */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-2xl transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        } ${isMinimized ? 'h-16 w-80' : 'h-[500px] w-96'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-white">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold">Asistente KARDEX</h3>
              <p className="text-xs text-white/80">Powered by Gemini AI ✨</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="rounded-full p-2 transition hover:bg-white/20"
            >
              {isMinimized ? <ChevronDown className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
              {messages.length === 0 ? (
                <div className="space-y-4">
                  {/* Mensaje de bienvenida */}
                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-none bg-white p-4 shadow-sm">
                      <p className="text-slate-700">
                        ¡Hola! 👋 Soy tu asistente virtual de KARDEX. 
                        Puedo ayudarte con información sobre productos, pedidos y tu historial de compras.
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        ¿En qué puedo ayudarte hoy?
                      </p>
                    </div>
                  </div>

                  {/* Sugerencias */}
                  {sugerencias.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 px-2">Sugerencias rápidas:</p>
                      <div className="flex flex-wrap gap-2">
                        {sugerencias.slice(0, 4).map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(sug)}
                            className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex items-start space-x-3 ${
                        msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                        } text-white`}
                      >
                        {msg.role === 'user' ? (
                          <User className="h-5 w-5" />
                        ) : (
                          <Bot className="h-5 w-5" />
                        )}
                      </div>
                      <div
                        className={`flex-1 rounded-2xl p-4 shadow-sm ${
                          msg.role === 'user'
                            ? 'rounded-tr-none bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                            : 'rounded-tl-none bg-white text-slate-700'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{msg.parts}</p>
                        <p
                          className={`mt-2 text-xs ${
                            msg.role === 'user' ? 'text-white/70' : 'text-slate-400'
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-start space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="rounded-2xl rounded-tl-none bg-white p-4 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                          <span className="text-sm text-slate-500">Pensando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 bg-white p-4">
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white transition hover:shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

