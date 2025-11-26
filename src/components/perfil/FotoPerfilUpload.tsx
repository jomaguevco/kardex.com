'use client'

import { useState, useRef } from 'react'
import { Upload, User, X } from 'lucide-react'
import toast from 'react-hot-toast'
import usuarioService from '@/services/usuarioService'
import { useAuthStore } from '@/store/authStore'
import { getFotoPerfilUrl } from '@/utils/fotoPerfil'

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
      
      console.log('FotoPerfilUpload: Respuesta del servidor:', response)
      
      if (user && response?.foto_perfil) {
        const updatedUser = { ...user, foto_perfil: response.foto_perfil }
        console.log('FotoPerfilUpload: Actualizando usuario con foto:', updatedUser.foto_perfil)
        setUser(updatedUser)
        toast.success('Foto de perfil actualizada')
      } else {
        console.error('FotoPerfilUpload: No se recibió foto_perfil en respuesta:', response)
        toast.error('Error: No se recibió la URL de la foto')
      }

      setPreview(null)
    } catch (error: any) {
      console.error('FotoPerfilUpload: Error al subir:', error)
      toast.error(error?.response?.data?.message || error?.message || 'Error al subir la foto')
      setPreview(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Obtener URL de la foto usando el helper compartido
  const fotoUrl = preview || getFotoPerfilUrl(user?.foto_perfil, false) || null

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-slate-900">Foto de perfil</h3>
      <p className="mt-1 text-sm text-slate-500">Personaliza tu imagen de perfil</p>

      <div className="mt-6 flex items-center gap-6">
        {/* Preview de la foto */}
        <div className="relative">
          <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-indigo-500 to-emerald-500 shadow-xl">
            {/* Placeholder siempre visible como fondo */}
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <User className="h-16 w-16" />
            </div>
            {/* Imagen encima del placeholder */}
            {fotoUrl && (
              <img
                src={fotoUrl}
                alt="Foto de perfil"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  console.error('Error al cargar imagen:', fotoUrl)
                  e.currentTarget.style.display = 'none'
                }}
              />
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
                  setUploading(true)
                  await usuarioService.eliminarFoto()
                  if (user) {
                    setUser({ ...user, foto_perfil: null })
                  }
                  toast.success('Foto eliminada exitosamente')
                } catch (error: any) {
                  console.error('Error al eliminar foto:', error)
                  toast.error(error?.response?.data?.message || 'Error al eliminar la foto')
                } finally {
                  setUploading(false)
                }
              }}
              disabled={uploading}
              className="btn-secondary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
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

