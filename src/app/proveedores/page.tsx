'use client'

import { useMemo, useState, ChangeEvent, FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Sparkles, Factory, Plus, Phone, Mail, MapPin, Globe2, Home, X } from 'lucide-react'
import toast from 'react-hot-toast'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { proveedorService, Proveedor, CreateProveedorData } from '@/services/proveedorService'

const initialFormState: CreateProveedorData = {
  nombre: '',
  numero_documento: '',
  tipo_documento: 'RUC',
  direccion: '',
  telefono: '',
  email: '',
  contacto: '',
  tipo_proveedor: 'NACIONAL'
}

const tipoProveedorOptions = [
  { value: 'NACIONAL', label: 'Proveedor nacional', icon: <Home className="mr-2 h-3.5 w-3.5" /> },
  { value: 'INTERNACIONAL', label: 'Proveedor internacional', icon: <Globe2 className="mr-2 h-3.5 w-3.5" /> }
] as const

const tipoDocumentoOptions = [
  { value: 'RUC', label: 'RUC' },
  { value: 'DNI', label: 'DNI' },
  { value: 'CE', label: 'Carné de extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' }
] as const

export default function ProveedoresPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <ProveedoresContent />
      </Layout>
    </ProtectedRoute>
  )
}

function ProveedoresContent() {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<CreateProveedorData>(initialFormState)
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [proveedorToDelete, setProveedorToDelete] = useState<Proveedor | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['proveedores', searchTerm],
    queryFn: () =>
      proveedorService.getProveedores({
        limit: 200,
        search: searchTerm.trim() || undefined
      })
  })

  const proveedores = data?.proveedores || []

  const filteredProveedores = useMemo(() => proveedores, [proveedores])

  const resumen = useMemo(() => {
    const total = proveedores.length
    const internacionales = proveedores.filter((prov) => prov.tipo_proveedor === 'INTERNACIONAL').length
    const activos = proveedores.filter((prov) => prov.activo).length
    return { total, internacionales, activos }
  }, [proveedores])

  const handleInputChange = (field: keyof CreateProveedorData) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = event.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateProveedor = () => {
    setEditingProveedor(null)
    setFormData(initialFormState)
    setIsModalOpen(true)
  }

  const handleEditProveedor = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor)
    setFormData({
      nombre: proveedor.nombre,
      numero_documento: proveedor.numero_documento,
      tipo_documento: proveedor.tipo_documento,
      direccion: proveedor.direccion ?? '',
      telefono: proveedor.telefono ?? '',
      email: proveedor.email ?? '',
      contacto: proveedor.contacto ?? '',
      tipo_proveedor: proveedor.tipo_proveedor
    })
    setIsModalOpen(true)
  }

  const handleViewProveedor = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor)
    setIsDetailOpen(true)
  }

  const handleDeleteClick = (proveedor: Proveedor) => {
    setProveedorToDelete(proveedor)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!proveedorToDelete) return

    try {
      await proveedorService.deleteProveedor(proveedorToDelete.id)
      toast.success('Proveedor eliminado correctamente')
      queryClient.invalidateQueries({ queryKey: ['proveedores'] })
      setIsDeleteModalOpen(false)
      setProveedorToDelete(null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'No se pudo eliminar el proveedor')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.nombre.trim() || !formData.numero_documento.trim()) {
      toast.error('Completa nombre y número de documento')
      return
    }

    try {
      setIsSubmitting(true)
      if (editingProveedor) {
        await proveedorService.updateProveedor(editingProveedor.id, formData)
        toast.success('Proveedor actualizado correctamente')
      } else {
        await proveedorService.createProveedor(formData)
        toast.success('Proveedor creado correctamente')
      }
      setIsModalOpen(false)
      setEditingProveedor(null)
      setFormData(initialFormState)
      queryClient.invalidateQueries({ queryKey: ['proveedores'] })
    } catch (error: any) {
      toast.error(error?.message || 'No se pudo guardar el proveedor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProveedor(null)
    setFormData(initialFormState)
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-600 px-6 py-8 text-white shadow-xl">
        <div className="absolute -right-12 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl lg:block" />
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Gestión de proveedores
            </span>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Coordina a tus aliados comerciales con una experiencia consistente
            </h1>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">
              Controla documentos, contactos y tipo de proveedor en una interfaz alineada al dashboard para acelerar tus procesos de compra y abastecimiento.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={handleCreateProveedor}
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Plus className="mr-2 h-4 w-4" /> Nuevo proveedor
              </button>
              <div className="inline-flex items-center rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white/90">
                <Factory className="mr-2 h-4 w-4" /> {resumen.total} proveedores registrados
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/15 p-6 backdrop-blur-md">
            <div className="grid gap-4 sm:grid-cols-3">
              <ResumenCard titulo="Activos" valor={resumen.activos} subtitulo="Disponibles" />
              <ResumenCard titulo="Internacionales" valor={resumen.internacionales} subtitulo="Con logística externa" />
              <ResumenCard titulo="Últimos 30 días" valor={proveedores.slice(-5).length} subtitulo="Nuevos registros" />
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <section className="space-y-6">
          {error && (
            <div className="card border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {(error as any)?.message || 'No pudimos cargar los proveedores. Intenta nuevamente.'}
            </div>
          )}

          <div className="card flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 shadow-lg shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Directorio de proveedores</h2>
              <p className="text-sm text-slate-500">Centraliza tus aliados comerciales con la misma estética y fluidez del dashboard.</p>
            </div>
            <button
              onClick={handleCreateProveedor}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Plus className="mr-2 h-4 w-4" /> Nuevo proveedor
            </button>
          </div>

          {/* Filtros rápidos y tip operativo debajo del header y antes de la tabla */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card space-y-4 p-5">
              <h2 className="text-lg font-semibold text-slate-900">Filtros rápidos</h2>
              <div>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por nombre, documento o email"
                  className="input-field"
                />
              </div>
              <p className="text-xs text-slate-500">
                Identifica rápidamente proveedores por documento o contacto para mantener negociaciones al día.
              </p>
            </div>
            <div className="card space-y-3 p-5 text-sm text-slate-600">
              <p className="font-medium text-slate-800">Tip operativo</p>
              <p>Registra el contacto principal de cada proveedor para agilizar pedidos y seguimientos logísticos.</p>
            </div>
          </div>

          <div className="card overflow-hidden relative">
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="min-w-full divide-y divide-slate-200" style={{ minWidth: '1000px' }}>
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Proveedor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Documento</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Contacto</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16">
                        <div className="flex flex-col items-center justify-center gap-3 text-sm text-slate-500">
                          <LoadingSpinner size="lg" />
                          Cargando proveedores...
                        </div>
                      </td>
                    </tr>
                  ) : filteredProveedores.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-500">
                        No encontramos proveedores con esos criterios.
                      </td>
                    </tr>
                  ) : (
                    filteredProveedores.map((proveedor) => (
                      <tr key={proveedor.id} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4 align-top text-sm text-slate-700">
                          <p className="font-semibold text-slate-900">{proveedor.nombre}</p>
                          {proveedor.codigo && (
                            <p className="text-xs text-slate-500">Código: {proveedor.codigo}</p>
                          )}
                          {proveedor.direccion && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="h-3.5 w-3.5" /> {proveedor.direccion}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-slate-700">
                          <p className="font-medium text-slate-900">
                            {proveedor.tipo_documento}: {proveedor.numero_documento}
                          </p>
                          <p className="text-xs text-slate-500">Creado: {new Date(proveedor.fecha_creacion).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-slate-700">
                          <div className="space-y-1">
                            {proveedor.telefono && (
                              <p className="flex items-center gap-2 text-xs text-slate-500">
                                <Phone className="h-3.5 w-3.5" /> {proveedor.telefono}
                              </p>
                            )}
                            {proveedor.email && (
                              <p className="flex items-center gap-2 text-xs text-slate-500">
                                <Mail className="h-3.5 w-3.5" /> {proveedor.email}
                              </p>
                            )}
                            {proveedor.contacto && (
                              <p className="flex items-center gap-2 text-xs text-slate-500">
                                <Building2 className="h-3.5 w-3.5" /> Contacto: {proveedor.contacto}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center align-top">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              proveedor.tipo_proveedor === 'INTERNACIONAL'
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {proveedor.tipo_proveedor === 'INTERNACIONAL' ? 'Internacional' : 'Nacional'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center align-top">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              proveedor.activo
                                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                            }`}
                          >
                            {proveedor.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center align-top">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewProveedor(proveedor)}
                              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => handleEditProveedor(proveedor)}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteClick(proveedor)}
                              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 px-4 py-4 sm:py-10 backdrop-blur-sm">
          <div className="glass-card w-full max-w-5xl max-h-[90vh] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
            <div className="flex-shrink-0 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {editingProveedor ? 'Editar proveedor' : 'Nuevo proveedor'}
                </span>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  {editingProveedor ? 'Actualiza la información comercial' : 'Registra un nuevo aliado comercial'}
                </h2>
                <p className="text-xs text-slate-500">
                  Mantén tu cartera de proveedores sincronizada para agilizar compras y logística.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full bg-white/25 p-2 text-white transition hover:bg-white/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mt-6">
              <form id="proveedor-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nombre *</label>
                  <input
                    value={formData.nombre}
                    onChange={handleInputChange('nombre')}
                    className="input-field"
                    placeholder="Nombre comercial o razón social"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Tipo de proveedor *</label>
                  <select
                    value={formData.tipo_proveedor}
                    onChange={handleInputChange('tipo_proveedor')}
                    className="input-field"
                  >
                    {tipoProveedorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Tipo de documento *</label>
                  <select
                    value={formData.tipo_documento}
                    onChange={handleInputChange('tipo_documento')}
                    className="input-field"
                  >
                    {tipoDocumentoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Número de documento *</label>
                  <input
                    value={formData.numero_documento}
                    onChange={handleInputChange('numero_documento')}
                    className="input-field"
                    placeholder="Ingresa el documento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                  <input
                    value={formData.telefono}
                    onChange={handleInputChange('telefono')}
                    className="input-field"
                    placeholder="Ej. +51 999 999 999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    className="input-field"
                    placeholder="correo@empresa.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Dirección</label>
                  <input
                    value={formData.direccion}
                    onChange={handleInputChange('direccion')}
                    className="input-field"
                    placeholder="Dirección fiscal o comercial"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Contacto principal</label>
                  <input
                    value={formData.contacto}
                    onChange={handleInputChange('contacto')}
                    className="input-field"
                    placeholder="Nombre del representante o contacto directo"
                  />
                </div>
              </div>

              </form>
            </div>

            <div className="flex-shrink-0 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-6 border-t border-slate-200 mt-6">
              <button type="button" onClick={closeModal} className="btn-outline sm:min-w-[150px]">
                Cancelar
              </button>
              <button
                type="submit"
                form="proveedor-form"
                disabled={isSubmitting}
                className="btn-primary inline-flex items-center justify-center sm:min-w-[180px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Guardando...' : editingProveedor ? 'Actualizar proveedor' : 'Crear proveedor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDetailOpen && selectedProveedor && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 px-4 py-4 sm:py-10 backdrop-blur-sm">
          <div className="glass-card w-full max-w-4xl max-h-[90vh] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col">
            <div className="flex-shrink-0 flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {selectedProveedor.tipo_proveedor === 'INTERNACIONAL' ? 'Proveedor internacional' : 'Proveedor nacional'}
                </span>
                <h2 className="mt-3 text-xl font-semibold text-slate-900">{selectedProveedor.nombre}</h2>
                <p className="text-xs text-slate-500">
                  {selectedProveedor.direccion || 'Sin dirección registrada'}
                </p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="rounded-full bg-white/25 p-2 text-white transition hover:bg-white/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 mt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetalleItem label="Documento" value={`${selectedProveedor.tipo_documento}: ${selectedProveedor.numero_documento}`} />
                <DetalleItem label="Estado" value={selectedProveedor.activo ? 'Activo' : 'Inactivo'} />
                <DetalleItem label="Teléfono" value={selectedProveedor.telefono || 'No registrado'} />
                <DetalleItem label="Email" value={selectedProveedor.email || 'No registrado'} />
                <DetalleItem label="Contacto" value={selectedProveedor.contacto || 'No asignado'} />
                <DetalleItem
                  label="Fecha de creación"
                  value={new Date(selectedProveedor.fecha_creacion).toLocaleString()}
                />
              </div>
            </div>

            <div className="flex-shrink-0 flex justify-end pt-6 border-t border-slate-200 mt-6">
              <button onClick={() => setIsDetailOpen(false)} className="btn-outline">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && proveedorToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl max-h-[90vh] rounded-3xl p-6 shadow-2xl animate-fade-in">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Confirmar eliminación</h2>
                <p className="text-sm text-slate-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/50 p-4">
              <p className="text-sm text-slate-700">
                ¿Estás seguro de que deseas eliminar al proveedor <span className="font-semibold">{proveedorToDelete.nombre}</span>?
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Documento: {proveedorToDelete.numero_documento}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setProveedorToDelete(null)
                }}
                className="btn-outline flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ResumenCard({ titulo, valor, subtitulo }: { titulo: string; valor: number; subtitulo: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/20 p-4 text-center backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{titulo}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{valor}</p>
      <p className="text-xs text-white/70">{subtitulo}</p>
    </div>
  )
}

function DetalleItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/75 p-4 shadow-inner">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 break-words">{value}</p>
    </div>
  )
}
