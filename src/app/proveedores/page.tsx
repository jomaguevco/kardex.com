'use client'

import { useState, useEffect } from 'react';
import { proveedorService, Proveedor, CreateProveedorData } from '@/services/proveedorService';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function ProveedoresPage() {
  return <ProveedoresContent />;
}

function ProveedoresContent() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateProveedorData>({
    nombre: '',
    numero_documento: '',
    tipo_documento: 'RUC',
    direccion: '',
    telefono: '',
    email: '',
    contacto: '',
    tipo_proveedor: 'NACIONAL'
  });

  useEffect(() => {
    loadProveedores();
  }, []);

  const loadProveedores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await proveedorService.getProveedores({ limit: 100 });
      setProveedores(response.proveedores || []);
    } catch (err: any) {
      console.error('Error al cargar proveedores:', err);
      setError(err.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (editingProveedor) {
        await proveedorService.updateProveedor(editingProveedor.id, formData);
      } else {
        await proveedorService.createProveedor(formData);
      }

      setShowModal(false);
      setEditingProveedor(null);
      resetForm();
      loadProveedores();
    } catch (err: any) {
      console.error('Error al guardar proveedor:', err);
      setError(err.message || 'Error al guardar proveedor');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      numero_documento: proveedor.numero_documento,
      tipo_documento: proveedor.tipo_documento,
      direccion: proveedor.direccion || '',
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
      contacto: proveedor.contacto || '',
      tipo_proveedor: proveedor.tipo_proveedor
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      try {
        setLoading(true);
        await proveedorService.deleteProveedor(id);
        loadProveedores();
      } catch (err: any) {
        console.error('Error al eliminar proveedor:', err);
        setError(err.message || 'Error al eliminar proveedor');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetails = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      numero_documento: '',
      tipo_documento: 'RUC',
      direccion: '',
      telefono: '',
      email: '',
      contacto: '',
      tipo_proveedor: 'NACIONAL'
    });
  };

  const filteredProveedores = proveedores.filter(proveedor =>
    proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proveedor.numero_documento.includes(searchTerm) ||
    proveedor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoProveedorColor = (tipo: string) => {
    return tipo === 'INTERNACIONAL' ? '#f59e0b' : '#3b82f6';
  };

  const getTipoProveedorBg = (tipo: string) => {
    return tipo === 'INTERNACIONAL' ? '#fef3c7' : '#dbeafe';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginLeft: '256px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
            Sistema de Ventas KARDEX
          </h1>
          <div style={{ fontSize: '14px' }}>
            <p style={{ fontWeight: '500', color: '#111827', margin: '0' }}>
              Administrador del Sistema
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>
              ADMINISTRADOR
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar Fixed */}
      <div style={{
        width: '256px',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        minHeight: '100vh',
        padding: '16px 0',
        position: 'fixed',
        left: '0',
        top: '0',
        zIndex: '50'
      }}>
        <div style={{ padding: '0 16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0' }}>
            Sistema KARDEX
          </h2>
        </div>
        
        <nav style={{ marginTop: '16px', padding: '0 8px' }}>
          <div style={{ marginBottom: '4px' }}>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
            >
              <span style={{ marginRight: '12px' }}>📊</span>
              Dashboard
            </button>
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            <button
              onClick={() => window.location.href = '/productos'}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
            >
              <span style={{ marginRight: '12px' }}>📦</span>
              Productos
            </button>
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            <button
              onClick={() => window.location.href = '/ventas'}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
            >
              <span style={{ marginRight: '12px' }}>🛒</span>
              Ventas
            </button>
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            <button
              onClick={() => window.location.href = '/compras'}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
            >
              <span style={{ marginRight: '12px' }}>🛍️</span>
              Compras
            </button>
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            <button
              onClick={() => window.location.href = '/kardex'}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
            >
              <span style={{ marginRight: '12px' }}>📈</span>
              KARDEX
            </button>
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            <button
              onClick={() => window.location.href = '/clientes'}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
            >
              <span style={{ marginRight: '12px' }}>👥</span>
              Clientes
            </button>
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            <button
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px',
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <span style={{ marginRight: '12px' }}>🏢</span>
              Proveedores
            </button>
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            <button
              onClick={() => window.location.href = '/reportes'}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
            >
              <span style={{ marginRight: '12px' }}>📄</span>
              Reportes
            </button>
          </div>
          
          <div style={{ marginBottom: '4px' }}>
            <button
              onClick={() => window.location.href = '/configuracion'}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
            >
              <span style={{ marginRight: '12px' }}>⚙️</span>
              Configuración
            </button>
          </div>
        </nav>
        
        <div style={{ padding: '0 16px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            Sistema de Ventas KARDEX v1.0
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '256px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Gestión de Proveedores
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              Administra los proveedores del sistema
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingProveedor(null);
              setShowModal(true);
            }}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#3b82f6'}
          >
            + Nuevo Proveedor
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Buscar proveedores por nombre, documento o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '16px', color: '#6b7280' }}>Cargando proveedores...</div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Lista de Proveedores
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  {filteredProveedores.length} proveedores registrados
                </p>
              </div>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f9fafb' }}>
                    <tr>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Proveedor
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Documento
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Contacto
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Tipo
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Estado
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProveedores.map((proveedor) => (
                      <tr key={proveedor.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                          <div>
                            <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                              {proveedor.nombre}
                            </div>
                            {proveedor.codigo && (
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                Código: {proveedor.codigo}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                          <div>
                            <div style={{ fontWeight: '500' }}>
                              {proveedor.tipo_documento}: {proveedor.numero_documento}
                            </div>
                            {proveedor.direccion && (
                              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                {proveedor.direccion}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                          <div>
                            {proveedor.telefono && (
                              <div style={{ marginBottom: '2px' }}>
                                📞 {proveedor.telefono}
                              </div>
                            )}
                            {proveedor.email && (
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                ✉️ {proveedor.email}
                              </div>
                            )}
                            {proveedor.contacto && (
                              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                Contacto: {proveedor.contacto}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: getTipoProveedorBg(proveedor.tipo_proveedor),
                            color: getTipoProveedorColor(proveedor.tipo_proveedor)
                          }}>
                            {proveedor.tipo_proveedor === 'INTERNACIONAL' ? '🌍 Internacional' : '🏠 Nacional'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: proveedor.activo ? '#dcfce7' : '#fef2f2',
                            color: proveedor.activo ? '#16a34a' : '#dc2626'
                          }}>
                            {proveedor.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleViewDetails(proveedor)}
                              style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
                              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#3b82f6'}
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => handleEdit(proveedor)}
                              style={{
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#e5e7eb'}
                              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(proveedor.id)}
                              style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#dc2626'}
                              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#ef4444'}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal Crear/Editar Proveedor */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                {editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Tipo de Proveedor *
                    </label>
                    <select
                      value={formData.tipo_proveedor}
                      onChange={(e) => setFormData({ ...formData, tipo_proveedor: e.target.value as 'NACIONAL' | 'INTERNACIONAL' })}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="NACIONAL">Nacional</option>
                      <option value="INTERNACIONAL">Internacional</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Tipo de Documento *
                    </label>
                    <select
                      value={formData.tipo_documento}
                      onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value as 'RUC' | 'DNI' | 'CE' | 'PASAPORTE' })}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="RUC">RUC</option>
                      <option value="DNI">DNI</option>
                      <option value="CE">Carné de Extranjería</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Número de Documento *
                    </label>
                    <input
                      type="text"
                      value={formData.numero_documento}
                      onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                    Contacto
                  </label>
                  <input
                    type="text"
                    value={formData.contacto}
                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                    placeholder="Nombre de la persona de contacto"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {loading ? 'Guardando...' : (editingProveedor ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Detalles de Proveedor */}
        {showDetailsModal && selectedProveedor && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                Detalle del Proveedor
              </h2>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Nombre
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                      {selectedProveedor.nombre}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Código
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
                      {selectedProveedor.codigo || 'No asignado'}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Tipo de Proveedor
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
                      {selectedProveedor.tipo_proveedor === 'INTERNACIONAL' ? '🌍 Internacional' : '🏠 Nacional'}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Estado
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: selectedProveedor.activo ? '#dcfce7' : '#fef2f2',
                        color: selectedProveedor.activo ? '#16a34a' : '#dc2626'
                      }}>
                        {selectedProveedor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Documento
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
                      {selectedProveedor.tipo_documento}: {selectedProveedor.numero_documento}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Teléfono
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
                      {selectedProveedor.telefono || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Email
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
                      {selectedProveedor.email || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Contacto
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
                      {selectedProveedor.contacto || 'No especificado'}
                    </p>
                  </div>
                </div>
                
                {selectedProveedor.direccion && (
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Dirección
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
                      {selectedProveedor.direccion}
                    </p>
                  </div>
                )}

                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>
                        Fecha de Creación
                      </label>
                      <p style={{ margin: 0 }}>
                        {new Date(selectedProveedor.fecha_creacion).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>
                        Última Actualización
                      </label>
                      <p style={{ margin: 0 }}>
                        {new Date(selectedProveedor.fecha_actualizacion).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}