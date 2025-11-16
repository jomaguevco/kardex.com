'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { MessageCircle, Phone, Mail, Clock, HelpCircle, Loader2 } from 'lucide-react'

export default function SoportePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.rol !== 'CLIENTE') {
      router.push('/')
      return
    }
    setIsLoading(false)
  }, [isAuthenticated, user, router])

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

      {/* Agente Virtual (Webchat unificado) */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Agente Virtual</h3>
            <p className="mt-2 text-sm text-slate-600">
              Es el mismo bot que usa WhatsApp (ChatDex), pero aquí dentro del portal. Puedes pedir, consultar precios, ver tu pedido y pagar.
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
              <iframe
                src="/webchat"
                title="Agente Virtual"
                className="w-full h-[500px] rounded-xl border-0"
              />
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

