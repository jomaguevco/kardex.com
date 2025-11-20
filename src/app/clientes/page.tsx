'use client'

import { useMemo, useState, ChangeEvent, FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Sparkles, Users, Plus, Phone, Mail, Building2, MapPin, X } from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Layout from '@/components/layout/Layout'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import TableWrapper from '@/components/ui/TableWrapper'
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null)

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

  const handleDeleteClick = (cliente: Cliente) => {
    setClienteToDelete(cliente)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!clienteToDelete) return

    try {
      await clienteService.deleteCliente(clienteToDelete.id)
      toast.success('Cliente eliminado correctamente')
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      setIsDeleteModalOpen(false)
      setClienteToDelete(null)
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

  const filteredClientes = clientes

  return (
    <div className="space-y-10 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-sky-500 to-blue-600 px-6 py-8 text-white shadow-xl">
        <div className="absolute -right-12 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl lg:block" />
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Experiencia centrada en clientes
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

      {/* Controles superiores: buscador y acciones rápidas (como en proveedores) */}
      <section className="space-y-6">
        <div className="card flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 px-6 py-4 shadow-lg shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Directorio de clientes</h2>
            <p className="text-sm text-slate-500">Gestiona clientes con la misma estética y fluidez del dashboard.</p>
          </div>
          <button
            onClick={handleCreateCliente}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Plus className="mr-2 h-4 w-4" /> Nuevo cliente
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Buscar cliente</h2>
            <input
              type="text"
              placeholder="Nombre, documento o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="card p-5 text-sm text-slate-600">
            <p className="font-medium text-slate-800">Acciones rápidas</p>
            <div className="mt-3">
              <button
                onClick={handleCreateCliente}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Nuevo cliente
              </button>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden relative">
          <div className="overflow-x-auto -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-sm text-red-600">Error al cargar clientes</p>
            </div>
          ) : (
            <TableWrapper>
              <table className="min-w-full divide-y divide-slate-200" style={{ minWidth: '1000px' }}>
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredClientes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <Users className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                        <p className="text-sm font-medium text-slate-600">No hay clientes registrados</p>
                        <p className="mt-1 text-xs text-slate-400">Crea tu primer cliente para comenzar</p>
                      </td>
                    </tr>
                  ) : (
                    filteredClientes.map((cliente) => (
                      <tr key={cliente.id} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-sm font-semibold text-white shadow-sm">
                              {cliente.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{cliente.nombre}</p>
                              {cliente.email && (
                                <p className="text-xs text-slate-500">{cliente.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{cliente.numero_documento}</p>
                            <p className="text-xs text-slate-500">{cliente.tipo_documento}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {cliente.telefono && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <Phone className="h-3 w-3" />
                                {cliente.telefono}
                              </div>
                            )}
                            {cliente.direccion && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <MapPin className="h-3 w-3" />
                                {cliente.direccion.substring(0, 30)}...
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                            cliente.tipo_cliente === 'JURIDICA'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {cliente.tipo_cliente === 'JURIDICA' ? (
                              <>
                                <Building2 className="mr-1 h-3 w-3" />
                                Jurídica
                              </>
                            ) : (
                              <>
                                <Users className="mr-1 h-3 w-3" />
                                Natural
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewCliente(cliente)}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => handleEditCliente(cliente)}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-100"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteClick(cliente)}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm transition hover:bg-red-100"
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
            </TableWrapper>
          )}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/50 backdrop-blur-sm">
          <div className="flex h-full w-full items-center justify-center px-4 sm:px-12 py-4">
            <div className="glass-card relative w-full max-w-4xl max-h-[85vh] ml-auto rounded-3xl animate-fade-in flex flex-col overflow-hidden">
              <div className="flex-shrink-0 border-b border-slate-200/70 px-6 pt-3 pb-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  {editingCliente ? 'Editar cliente' : 'Nuevo cliente'}
                </h2>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pl-10 sm:pl-16 pr-4 sm:pr-6">
                <form id="cliente-form" onSubmit={handleSubmit} className="py-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Nombre completo *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={handleInputChange('nombre')}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Tipo de documento *</label>
                  <select
                    value={formData.tipo_documento}
                    onChange={handleInputChange('tipo_documento')}
                    className="input-field"
                  >
                    {tipoDocumentoOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Número de documento *</label>
                  <input
                    type="text"
                    value={formData.numero_documento}
                    onChange={handleInputChange('numero_documento')}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Tipo de cliente</label>
                  <select
                    value={formData.tipo_cliente}
                    onChange={handleInputChange('tipo_cliente')}
                    className="input-field"
                  >
                    {tipoClienteOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={handleInputChange('telefono')}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    className="input-field"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={handleInputChange('direccion')}
                    className="input-field"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Persona de contacto</label>
                  <input
                    type="text"
                    value={formData.contacto}
                    onChange={handleInputChange('contacto')}
                    className="input-field"
                  />
                </div>
              </div>

                </form>
              </div>

              <div className="flex-shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-outline"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="cliente-form"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : editingCliente ? 'Actualizar' : 'Crear cliente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDetailOpen && selectedCliente && (
        <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/50 backdrop-blur-sm">
          <div className="flex h-full w-full items-center justify-center px-4 sm:px-12 py-4">
            <div className="glass-card relative w-full max-w-4xl max-h-[85vh] ml-auto rounded-3xl animate-fade-in flex flex-col overflow-hidden">
              <div className="flex-shrink-0 border-b border-slate-200/70 px-6 pt-3 pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">Detalles del cliente</h2>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pl-10 sm:pl-16 pr-4 sm:pr-6 py-6">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 text-2xl font-bold text-white shadow-lg">
                  {selectedCliente.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{selectedCliente.nombre}</h3>
                  <p className="text-sm text-slate-500">
                    {selectedCliente.tipo_cliente === 'JURIDICA' ? 'Persona jurídica' : 'Persona natural'}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <DetalleItem label="Tipo de documento" value={selectedCliente.tipo_documento} />
                <DetalleItem label="Número de documento" value={selectedCliente.numero_documento} />
                <DetalleItem label="Teléfono" value={selectedCliente.telefono || 'No especificado'} />
                <DetalleItem label="Email" value={selectedCliente.email || 'No especificado'} />
                <DetalleItem
                  label="Dirección"
                  value={selectedCliente.direccion || 'No especificada'}
                />
                <DetalleItem
                  label="Persona de contacto"
                  value={selectedCliente.contacto || 'No especificado'}
                />
              </div>

            </div>

            <div className="flex-shrink-0 flex justify-end pt-6 border-t border-slate-200 px-6 pb-6">
              <button onClick={() => setIsDetailOpen(false)} className="btn-outline">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && clienteToDelete && (
        <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/50 backdrop-blur-sm">
          <div className="flex h-full w-full items-center justify-center p-4">
            <div className="glass-card w-full max-w-2xl max-h-[85vh] rounded-3xl p-6 shadow-2xl animate-fade-in overflow-hidden">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Confirmar eliminación</h2>
                <p className="text-[10px] text-slate-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/50 p-4">
              <p className="text-sm text-slate-700">
                ¿Estás seguro de que deseas eliminar al cliente <span className="font-semibold">{clienteToDelete.nombre}</span>?
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Documento: {clienteToDelete.numero_documento}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setClienteToDelete(null)
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

function DetalleItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/75 p-4 shadow-inner">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 break-words">{value}</p>
    </div>
  )
}
