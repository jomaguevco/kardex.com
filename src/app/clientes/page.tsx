'use client'

import { useMemo, useState, ChangeEvent, FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Sparkles, Users, Plus, Search, Phone, Mail, Building2, MapPin, X } from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { clienteService, Cliente, CreateClienteData } from '@/services/clienteService'

const initialFormState: CreateClienteData = {
  nombre: '',
  numero_documento: '',
  tipo_documento: 'DNI',
  direccion: '',
  telefono: '',
  email: '',
  contacto: '',
  tipo_cliente: 'NATURAL'
}

const tipoClienteOptions = [
  { value: 'NATURAL', label: 'Persona natural' },
  { value: 'JURIDICA', label: 'Persona jurídica' }
] as const

const tipoDocumentoOptions = [
  { value: 'DNI', label: 'DNI' },
  { value: 'RUC', label: 'RUC' },
  { value: 'CE', label: 'Carné de extranjería' },
  { value: 'PASAPORTE', label: 'Pasaporte' }
] as const

export default function ClientesPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <ClientesContent />
      </Layout>
    </ProtectedRoute>
  )
}

function ClientesContent() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateClienteData>(initialFormState)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['clientes', searchTerm],
    queryFn: () =>
      clienteService.getClientes({
        limit: 200,
        search: searchTerm.trim() || undefined
      })
  })

  const clientes = data?.clientes || []

  const resumenEstado = useMemo(() => {
    const total = clientes.length
    const activos = clientes.filter((cliente) => cliente.activo).length
    const juridicos = clientes.filter((cliente) => cliente.tipo_cliente === 'JURIDICA').length
    return { total, activos, juridicos }
  }, [clientes])

  const handleInputChange = (field: keyof CreateClienteData) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = event.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateCliente = () => {
    setEditingCliente(null)
    setFormData(initialFormState)
    setIsModalOpen(true)
  }

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setFormData({
      nombre: cliente.nombre,
      numero_documento: cliente.numero_documento,
      tipo_documento: cliente.tipo_documento,
      direccion: cliente.direccion ?? '',
      telefono: cliente.telefono ?? '',
      email: cliente.email ?? '',
      contacto: cliente.contacto ?? '',
      tipo_cliente: cliente.tipo_cliente
    })
    setIsModalOpen(true)
  }

  const handleViewCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setIsDetailOpen(true)
  }

  const handleDeleteCliente = async (cliente: Cliente) => {
    if (!window.confirm(`¿Deseas eliminar a ${cliente.nombre}?`)) return

    try {
      await clienteService.deleteCliente(cliente.id)
      toast.success('Cliente eliminado correctamente')
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'No se pudo eliminar el cliente')
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
      if (editingCliente) {
        await clienteService.updateCliente(editingCliente.id, formData)
        toast.success('Cliente actualizado correctamente')
      } else {
        await clienteService.createCliente(formData)
        toast.success('Cliente creado correctamente')
      }
      setIsModalOpen(false)
      setEditingCliente(null)
      setFormData(initialFormState)
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'No se pudo guardar el cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCliente(null)
    setFormData(initialFormState)
  }

  const filteredClientes = useMemo(() => clientes, [clientes])

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-sky-500 to-blue-600 px-6 py-10 text-white shadow-xl">
        <div className="absolute -right-16 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/20 blur-3xl lg:block" />
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <Sparkles className="mr-2 h-3.5 w-3.5" /> Experiencia centrada en clientes
            </span>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Gestiona tu cartera de clientes con un diseño refinado y coherente
            </h1>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">
              Registra datos, contactos y seguimientos en una interfaz alineada al dashboard. Simplifica tus operaciones comerciales y satisface a tus clientes con procesos claros.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={handleCreateCliente}
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-600 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Plus className="mr-2 h-4 w-4" /> Nuevo cliente
              </button>
              <div className="inline-flex items-center rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white/90">
                <Users className="mr-2 h-4 w-4" /> {resumenEstado.total} clientes registrados
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/15 p-6 backdrop-blur-md">
            <div className="space-y-3 text-sm text-white/85">
              <p className="font-semibold uppercase tracking-wide text-white">Resumen del directorio</p>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 p-3">
                <span>Activos</span>
                <span className="font-semibold">{resumenEstado.activos}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 p-3">
                <span>Personas jurídicas</span>
                <span className="font-semibold">{resumenEstado.juridicos}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 p-3">
                <span>Última actualización</span>
                <span className="font-semibold">Hace unos minutos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <div className="card space-y-4 p-5">
            <h2 className="text-lg font-semibold text-slate-900">Filtros rápidos</h2>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nombre, documento o email"
                className="input-field pl-9"
              />
            </div>
            <p className="text-xs text-slate-500">
              Usa palabras clave o documentos para localizar clientes al instante y mantener tus datos limpios.
            </p>
          </div>

          <div className="card space-y-3 p-5 text-sm text-slate-600">
            <p className="font-medium text-slate-800">Sugerencia</p>
            <p>Registra los contactos clave de cada cliente para dinamizar tu proceso de ventas y atención.</p>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="card flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 shadow-lg shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Directorio de clientes</h2>
              <p className="text-sm text-slate-500">Administra tus relaciones comerciales desde una interfaz consistente.</p>
            </div>
            <button
              onClick={handleCreateCliente}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Plus className="mr-2 h-4 w-4" /> Nuevo cliente
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cliente</th>
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
                          Cargando clientes...
                        </div>
                      </td>
                    </tr>
                  ) : error && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-500">
                        {(error as any)?.message || 'No pudimos cargar los clientes. Intenta nuevamente.'}
                      </td>
                    </tr>
                  ) : filteredClientes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-500">
                        No encontramos clientes con esos criterios.
                      </td>
                    </tr>
                  ) : (
                    filteredClientes.map((cliente) => (
                      <tr key={cliente.id} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4 align-top text-sm text-slate-700">
                          <p className="font-semibold text-slate-900">{cliente.nombre}</p>
                          {cliente.codigo && (
                            <p className="text-xs text-slate-500">Código: {cliente.codigo}</p>
                          )}
                          {cliente.direccion && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="h-3.5 w-3.5" /> {cliente.direccion}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-slate-700">
                          <p className="font-medium text-slate-900">
                            {cliente.tipo_documento}: {cliente.numero_documento}
                          </p>
                          <p className="text-xs text-slate-500">Creado: {new Date(cliente.fecha_creacion).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-slate-700">
                          <div className="space-y-1">
                            {cliente.telefono && (
                              <p className="flex items-center gap-2 text-xs text-slate-500">
                                <Phone className="h-3.5 w-3.5" /> {cliente.telefono}
                              </p>
                            )}
                            {cliente.email && (
                              <p className="flex items-center gap-2 text-xs text-slate-500">
                                <Mail className="h-3.5 w-3.5" /> {cliente.email}
                              </p>
                            )}
                            {cliente.contacto && (
                              <p className="flex items-center gap-2 text-xs text-slate-500">
                                <Building2 className="h-3.5 w-3.5" /> Contacto: {cliente.contacto}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center align-top">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              cliente.tipo_cliente === 'JURIDICA'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-600'
                            }`}
                          >
                            {cliente.tipo_cliente === 'JURIDICA' ? 'Jurídica' : 'Natural'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center align-top">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              cliente.activo
                                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                            }`}
                          >
                            {cliente.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center align-top">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewCliente(cliente)}
                              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => handleEditCliente(cliente)}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteCliente(cliente)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-10 backdrop-blur-sm">
          <div className="glass-card w-full max-w-3xl rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {editingCliente ? 'Editar cliente' : 'Nuevo cliente'}
                </span>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {editingCliente ? 'Actualiza la información' : 'Registra un nuevo cliente'}
                </h2>
                <p className="text-sm text-slate-500">
                  Completa los datos básicos para mantener una base de clientes consistente.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full bg-white/25 p-2 text-white transition hover:bg-white/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nombre *</label>
                  <input
                    value={formData.nombre}
                    onChange={handleInputChange('nombre')}
                    className="input-field"
                    placeholder="Nombre completo o razón social"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Tipo de cliente *</label>
                  <select
                    value={formData.tipo_cliente}
                    onChange={handleInputChange('tipo_cliente')}
                    className="input-field"
                  >
                    {tipoClienteOptions.map((option) => (
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

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={closeModal} className="btn-outline sm:min-w-[150px]">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary inline-flex items-center justify-center sm:min-w-[180px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Guardando...' : editingCliente ? 'Actualizar cliente' : 'Crear cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailOpen && selectedCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-10 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  {selectedCliente.tipo_cliente === 'JURIDICA' ? 'Cliente corporativo' : 'Cliente individual'}
                </span>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">{selectedCliente.nombre}</h2>
                <p className="text-sm text-slate-500">
                  {selectedCliente.direccion || 'Sin dirección registrada'}
                </p>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="rounded-full bg-white/25 p-2 text-white transition hover:bg-white/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <DetalleItem label="Documento" value={`${selectedCliente.tipo_documento}: ${selectedCliente.numero_documento}`} />
              <DetalleItem label="Estado" value={selectedCliente.activo ? 'Activo' : 'Inactivo'} />
              <DetalleItem label="Teléfono" value={selectedCliente.telefono || 'No registrado'} />
              <DetalleItem label="Email" value={selectedCliente.email || 'No registrado'} />
              <DetalleItem label="Contacto" value={selectedCliente.contacto || 'No asignado'} />
              <DetalleItem
                label="Fecha de creación"
                value={new Date(selectedCliente.fecha_creacion).toLocaleString()}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setIsDetailOpen(false)} className="btn-outline">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ResumenCard({ titulo, valor, color }: { titulo: string; valor: number; color: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/15 p-4 text-center backdrop-blur-sm">
      <p className={`text-xs font-semibold uppercase tracking-wide ${color}`}>{titulo}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{valor}</p>
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