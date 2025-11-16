'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'

export default function WebchatPage() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-[500px] flex items-center justify-center">
      {!ready ? (
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      ) : (
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Agente Virtual</h2>
          <p className="text-sm text-slate-600">
            Estamos preparando el chat embebido. Mientras tanto, puedes continuar por WhatsApp desde el botón de la esquina inferior derecha.
          </p>
        </div>
      )}
    </div>
  )
}


