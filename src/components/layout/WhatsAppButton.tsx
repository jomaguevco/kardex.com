'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

interface WhatsAppButtonProps {
  phoneNumber?: string
  message?: string
}

export default function WhatsAppButton({ 
  phoneNumber = '51999999999', // Número por defecto (cambiar por el real)
  message = '¡Hola! Necesito ayuda con mi pedido.'
}: WhatsAppButtonProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  if (!isVisible) return null

  return (
    <>
      {/* Botón flotante */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2">
        {/* Tooltip */}
        {showTooltip && (
          <div className="animate-fade-in rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
            ¿Necesitas ayuda?
          </div>
        )}

        {/* Botón principal */}
        <button
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          aria-label="Contactar por WhatsApp"
        >
          {/* Animación de pulso */}
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          
          {/* Icono de WhatsApp */}
          <MessageCircle className="relative h-7 w-7 text-white" />
        </button>

        {/* Botón para cerrar (opcional) */}
        <button
          onClick={() => setIsVisible(false)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 opacity-0 transition-opacity hover:bg-slate-300 hover:opacity-100"
          aria-label="Cerrar botón de WhatsApp"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Estilos para la animación */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

