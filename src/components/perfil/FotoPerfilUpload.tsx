'use client'

import { useState, useRef } from 'react'
import { Upload, User, X } from 'lucide-react'
import toast from 'react-hot-toast'
import usuarioService from '@/services/usuarioService'
import { useAuthStore } from '@/store/authStore'

const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'
  // Remover /api del final si existe
  return apiUrl.replace(/\/api$/, '') || 'http://localhost:4001'
}

export default function FotoPerfilUpload() {
  const { user, setUser } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Subir archivo
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    try {
      setUploading(true)
      const response = await usuarioService.uploadFoto(file)
      
      if (user) {
        const updatedUser = { ...user, foto_perfil: response.foto_perfil }
        setUser(updatedUser)
      }

      toast.success('Foto de perfil actualizada')
      setPreview(null)
    } catch (error: any) {
      toast.error(error?.message || 'Error al subir la foto')
      setPreview(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const getFotoUrl = () => {
    if (preview) return preview
    if (user?.foto_perfil) {
      const baseUrl = (process.env.NEXT_PUBLIC_FILES_BASE_URL || getApiBaseUrl()).replace(/\/$/, '')
      let url = user.foto_perfil
      // Si ya incluye http, usar directo pero forzar https si la app está en https
      if (url.startsWith('http://') && typeof window !== 'undefined' && window.location.protocol === 'https:') {
        url = url.replace(/^http:\/\//, 'https://')
      } else if (!url.startsWith('http')) {
        // Asegurar slash inicial y componer con baseUrl
        const path = url.startsWith('/') ? url : `/${url}`
        url = `${baseUrl}${path}`
      }
      return url
    }
    return null
  }

  const fotoUrl = getFotoUrl()

  return (
    <div className="card p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-slate-900">Foto de perfil</h3>
      <p className="mt-1 text-sm text-slate-500">Personaliza tu imagen de perfil</p>

      <div className="mt-6 flex items-center gap-6">
        {/* Preview de la foto */}
        <div className="relative">
          <div className="h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-indigo-500 to-emerald-500 shadow-xl">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt="Foto de perfil"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white">
                <User className="h-16 w-16" />
              </div>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/50 backdrop-blur-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {user?.foto_perfil ? 'Cambiar foto' : 'Subir foto'}
          </button>

          {user?.foto_perfil && (
            <button
              onClick={async () => {
                try {
                  await usuarioService.uploadFoto(new File([], ''))
                  if (user) {
                    setUser({ ...user, foto_perfil: undefined })
                  }
                  toast.success('Foto eliminada')
                } catch (error) {
                  // Silently fail
                }
              }}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Eliminar foto
            </button>
          )}

          <p className="text-xs text-slate-500">
            JPG, PNG o GIF. Máximo 5MB.
          </p>
        </div>
      </div>
    </div>
  )
}

