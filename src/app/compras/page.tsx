'use client'

import { useState, useEffect } from 'react';
import { compraService, Compra, CreateCompraData } from '@/services/compraService';
import { proveedorService, Proveedor } from '@/services/proveedorService';
import { productoService, Producto } from '@/services/productoService';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function ComprasPage() {
  return <ComprasContent />;
}

function ComprasContent() {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<Compra | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [formData, setFormData] = useState<CreateCompraData>({
    proveedor_id: 0,
    detalles: []
  });
  const [nuevoDetalle, setNuevoDetalle] = useState({
    producto_id: 0,
    cantidad: 1,
    precio_unitario: 0,
    descuento: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar datos por separado para mejor manejo de errores
      try {
        const comprasResponse = await compraService.getCompras({ limit: 50 });
        setCompras(comprasResponse.compras || []);
        console.log('Compras cargadas:', comprasResponse.compras?.length || 0);
      } catch (err: any) {
        console.error('Error al cargar compras:', err);
        setCompras([]);
      }

      try {
        const proveedoresResponse = await proveedorService.getProveedoresActivos();
        setProveedores(proveedoresResponse || []);
        console.log('Proveedores cargados:', proveedoresResponse?.length || 0);
      } catch (err: any) {
        console.error('Error al cargar proveedores:', err);
        setProveedores([]);
        setError('Error al cargar proveedores. Algunas funciones pueden no estar disponibles.');
      }

      try {
        const productosResponse = await productoService.getProductos({ limit: 100 });
        setProductos(productosResponse.productos || []);
        console.log('Productos cargados:', productosResponse.productos?.length || 0);
      } catch (err: any) {
        console.error('Error al cargar productos:', err);
        setProductos([]);
      }

    } catch (err: any) {
      console.error('Error general al cargar datos:', err);
      setError('Error al cargar datos del sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await compraService.createCompra(formData);
      setShowModal(false);
      setFormData({ proveedor_id: 0, detalles: [] });
      loadData();
    } catch (err: any) {
      console.error('Error al crear compra:', err);
      setError(err.message || 'Error al crear compra');
    } finally {
      setLoading(false);
    }
  };

  const addDetalle = () => {
    if (nuevoDetalle.producto_id && nuevoDetalle.cantidad > 0 && nuevoDetalle.precio_unitario > 0) {
      setFormData({
        ...formData,
        detalles: [...formData.detalles, nuevoDetalle]
      });
      setNuevoDetalle({ producto_id: 0, cantidad: 1, precio_unitario: 0, descuento: 0 });
    }
  };

  const removeDetalle = (index: number) => {
    setFormData({
      ...formData,
      detalles: formData.detalles.filter((_, i) => i !== index)
    });
  };

  const getProveedorNombre = (compra: any) => {
    // Primero intentar usar el proveedor que viene en la respuesta de la compra
    if (compra.proveedor && compra.proveedor.nombre) {
      return compra.proveedor.nombre;
    }
    
    // Si no está disponible, buscar en la lista de proveedores
    if (!proveedores || !Array.isArray(proveedores)) {
      console.log('Proveedores no disponibles:', proveedores);
      return 'Proveedor no encontrado';
    }
    
    const proveedor = proveedores.find(p => p.id === compra.proveedor_id);
    return proveedor ? proveedor.nombre : 'Proveedor no encontrado';
  };

  const getProductoNombre = (detalle: any) => {
    // Primero intentar usar el producto que viene en el detalle
    if (detalle.producto && detalle.producto.nombre) {
      return detalle.producto.nombre;
    }
    
    // Si no está disponible, buscar en la lista de productos
    if (!productos || !Array.isArray(productos)) {
      return 'Producto no encontrado';
    }
    
    const producto = productos.find(p => p.id === detalle.producto_id);
    return producto ? producto.nombre : 'Producto no encontrado';
  };

  const calcularTotalCompra = (detalles: any[]) => {
    // Lógica del profesor: precio_real = precio_unitario - descuento, subtotal = precio_real * cantidad
    return detalles.reduce((sum, detalle) => {
      const precioReal = Number(detalle.precio_unitario) - Number(detalle.descuento || 0);
      const subtotalDetalle = precioReal * Number(detalle.cantidad);
      return sum + subtotalDetalle;
    }, 0);
  };

  const handleViewDetails = (compra: Compra) => {
    setSelectedCompra(compra);
    setShowDetailsModal(true);
  };

  const handleReloadDetails = async () => {
    if (!selectedCompra) return;
    
    setLoadingDetails(true);
    try {
      const compraCompleta = await compraService.getCompraById(selectedCompra.id);
      setSelectedCompra(compraCompleta);
    } catch (err: any) {
      console.error('Error al recargar detalles:', err);
      setError('Error al recargar los detalles de la compra');
    } finally {
      setLoadingDetails(false);
    }
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
        marginLeft: '250px'
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
        width: '250px',
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
                onClick={() => window.location.href = '/proveedores'}
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
      <div style={{ marginLeft: '250px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Gestión de Compras
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              Administra las compras del sistema
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
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
            + Nueva Compra
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '16px', color: '#6b7280' }}>Cargando compras...</div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Lista de Compras
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  {compras.length} compras registradas
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
                <thead style={{ backgroundColor: '#f3f4f6' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#000000', borderBottom: '2px solid #e5e7eb' }}>
                      Factura
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#000000', borderBottom: '2px solid #e5e7eb' }}>
                      Proveedor
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#000000', borderBottom: '2px solid #e5e7eb' }}>
                      Fecha
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '700', color: '#000000', borderBottom: '2px solid #e5e7eb' }}>
                      Total
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#000000', borderBottom: '2px solid #e5e7eb' }}>
                      Estado
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#000000', borderBottom: '2px solid #e5e7eb' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {compras.map((compra, index) => (
                    <tr key={compra.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#000000', fontWeight: '600' }}>
                        {compra.numero_factura}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#000000', fontWeight: '500' }}>
                        {getProveedorNombre(compra)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#000000', fontWeight: '500' }}>
                        {new Date(compra.fecha_compra).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#000000', fontWeight: '700', textAlign: 'right' }}>
                        ${(() => {
                          // Calcular total basándose en detalles si el total es 0
                          // Lógica: precio_real = precio_unitario - descuento, subtotal = precio_real * cantidad
                          if (Number(compra.total) === 0 && (compra as any).detalles && (compra as any).detalles.length > 0) {
                            const detalles = (compra as any).detalles;
                            const subtotalCalc = detalles.reduce((sum: number, det: any) => {
                              const precioReal = Number(det.precio_unitario) - Number(det.descuento || 0);
                              return sum + (precioReal * Number(det.cantidad));
                            }, 0);
                            return (subtotalCalc + Number(compra.impuestos || 0)).toFixed(2);
                          }
                          return Number(compra.total).toFixed(2);
                        })()}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: compra.estado === 'PROCESADA' ? '#dcfce7' : 
                                          compra.estado === 'PENDIENTE' ? '#fef3c7' : '#fecaca',
                          color: compra.estado === 'PROCESADA' ? '#166534' : 
                                 compra.estado === 'PENDIENTE' ? '#92400e' : '#dc2626'
                        }}>
                          {compra.estado}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleViewDetails(compra)}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                          onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#2563eb'}
                          onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#3b82f6'}
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        )}

        {/* Modal Nueva Compra */}
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
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                Nueva Compra
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Proveedor *
                    </label>
                    <select
                      value={formData.proveedor_id}
                      onChange={(e) => setFormData({ ...formData, proveedor_id: Number(e.target.value) })}
                      required
                      className="select-visible"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '2px solid #000000',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontWeight: '600'
                      }}
                    >
                      <option value={0} style={{ color: '#000000', backgroundColor: '#ffffff', fontWeight: '600' }}>Seleccionar proveedor</option>
                      {proveedores.map((proveedor) => (
                        <option key={proveedor.id} value={proveedor.id} style={{ color: '#000000', backgroundColor: '#ffffff', fontWeight: '600' }}>
                          {proveedor.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Número de Factura
                    </label>
                    <input
                      type="text"
                      value={formData.numero_factura || ''}
                      onChange={(e) => setFormData({ ...formData, numero_factura: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '2px solid #000000',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontWeight: '500'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
                    Productos
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '12px', marginBottom: '12px' }}>
                    <select
                      value={nuevoDetalle.producto_id}
                      onChange={(e) => setNuevoDetalle({ ...nuevoDetalle, producto_id: Number(e.target.value) })}
                      className="select-visible"
                      style={{
                        padding: '8px 12px',
                        border: '2px solid #000000',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontWeight: '600'
                      }}
                    >
                      <option value={0} style={{ color: '#000000', backgroundColor: '#ffffff', fontWeight: '600' }}>Seleccionar producto</option>
                      {productos.map((producto) => (
                        <option key={producto.id} value={producto.id} style={{ color: '#000000', backgroundColor: '#ffffff', fontWeight: '600' }}>
                          {producto.nombre} - ${Number(producto.precio_compra).toFixed(2)}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      placeholder="Cantidad"
                      value={nuevoDetalle.cantidad}
                      onChange={(e) => setNuevoDetalle({ ...nuevoDetalle, cantidad: Number(e.target.value) })}
                      min="1"
                      style={{
                        padding: '8px 12px',
                        border: '2px solid #000000',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontWeight: '500'
                      }}
                    />
                    
                    <input
                      type="number"
                      placeholder="Precio Compra"
                      value={nuevoDetalle.precio_unitario}
                      onChange={(e) => setNuevoDetalle({ ...nuevoDetalle, precio_unitario: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      style={{
                        padding: '8px 12px',
                        border: '2px solid #000000',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontWeight: '500'
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Descuento"
                      value={nuevoDetalle.descuento}
                      onChange={(e) => setNuevoDetalle({ ...nuevoDetalle, descuento: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      style={{
                        padding: '8px 12px',
                        border: '2px solid #000000',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontWeight: '500'
                      }}
                    />
                    
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', color: '#000000' }}>
                      ${((Number(nuevoDetalle.precio_unitario) - Number(nuevoDetalle.descuento || 0)) * Number(nuevoDetalle.cantidad)).toFixed(2)}
                    </div>
                    
                    <button
                      type="button"
                      onClick={addDetalle}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Agregar
                    </button>
                  </div>

                  {formData.detalles.length > 0 && (
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f3f4f6' }}>
                          <tr>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#000000', borderBottom: '2px solid #e5e7eb' }}>
                              Producto
                            </th>
                            <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#000000', borderBottom: '2px solid #e5e7eb' }}>
                              Cantidad
                            </th>
                            <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '700', color: '#000000', borderBottom: '2px solid #e5e7eb' }}>
                              Precio Compra
                            </th>
                            <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '700', color: '#000000', borderBottom: '2px solid #e5e7eb' }}>
                              Descuento
                            </th>
                            <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '700', color: '#000000', borderBottom: '2px solid #e5e7eb' }}>
                              Precio Real
                            </th>
                            <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '700', color: '#000000', borderBottom: '2px solid #e5e7eb' }}>
                              Precio Total
                            </th>
                            <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#000000', borderBottom: '2px solid #e5e7eb' }}>
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.detalles.map((detalle, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                              <td style={{ padding: '12px', fontSize: '14px', color: '#000000', fontWeight: '600' }}>
                                {getProductoNombre(detalle)}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#000000', fontWeight: '500' }}>
                                {detalle.cantidad}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#000000', fontWeight: '500' }}>
                                ${Number(detalle.precio_unitario).toFixed(2)}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#000000', fontWeight: '500' }}>
                                ${Number(detalle.descuento || 0).toFixed(2)}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#000000', fontWeight: '600' }}>
                                ${(Number(detalle.precio_unitario) - Number(detalle.descuento || 0)).toFixed(2)}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#000000', fontWeight: '700' }}>
                                ${((Number(detalle.precio_unitario) - Number(detalle.descuento || 0)) * Number(detalle.cantidad)).toFixed(2)}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => removeDetalle(index)}
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
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                    Total: ${Number(calcularTotalCompra(formData.detalles)).toFixed(2)}
                  </div>
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
                    disabled={formData.detalles.length === 0}
                    style={{
                      backgroundColor: formData.detalles.length === 0 ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      cursor: formData.detalles.length === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Crear Compra
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Detalles de Compra */}
        {showDetailsModal && selectedCompra && (
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
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                Detalle de Compra - {selectedCompra.numero_factura}
              </h2>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Proveedor
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>{getProveedorNombre(selectedCompra)}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Fecha
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>{new Date(selectedCompra.fecha_compra).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Estado
                    </label>
                    <select
                      value={selectedCompra.estado}
                      onChange={async (e) => {
                        try {
                          await compraService.updateCompra(selectedCompra.id, { estado: e.target.value });
                          setSelectedCompra(prev => prev ? { ...prev, estado: e.target.value } : null);
                          loadData(); // Recargar lista
                        } catch (err: any) {
                          alert('Error al actualizar el estado: ' + (err.response?.data?.message || err.message));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        color: '#111827',
                        fontWeight: '500'
                      }}
                    >
                      <option value="PENDIENTE" style={{ color: '#111827', backgroundColor: 'white' }}>PENDIENTE</option>
                      <option value="PROCESADA" style={{ color: '#111827', backgroundColor: 'white' }}>PROCESADA</option>
                      <option value="ANULADA" style={{ color: '#111827', backgroundColor: 'white' }}>ANULADA</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Total
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                      ${(() => {
                        // Calcular total basándose en detalles si el total es 0
                        // Lógica: precio_real = precio_unitario - descuento, subtotal = precio_real * cantidad
                        if (Number(selectedCompra.total) === 0 && selectedCompra.detalles && selectedCompra.detalles.length > 0) {
                          const subtotalCalc = selectedCompra.detalles.reduce((sum: number, det: any) => {
                            const precioReal = Number(det.precio_unitario) - Number(det.descuento || 0);
                            return sum + (precioReal * Number(det.cantidad));
                          }, 0);
                          return (subtotalCalc + Number(selectedCompra.impuestos || 0)).toFixed(2);
                        }
                        return Number(selectedCompra.total).toFixed(2);
                      })()}
                    </p>
                  </div>
                </div>
                
                {/* Información adicional */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#6b7280' }}>
                      Subtotal
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
                      ${(() => {
                        if (Number(selectedCompra.subtotal) === 0 && selectedCompra.detalles && selectedCompra.detalles.length > 0) {
                          // Lógica: precio_real = precio_unitario - descuento, subtotal = precio_real * cantidad
                          return selectedCompra.detalles.reduce((sum: number, det: any) => {
                            const precioReal = Number(det.precio_unitario) - Number(det.descuento || 0);
                            return sum + (precioReal * Number(det.cantidad));
                          }, 0).toFixed(2);
                        }
                        return Number(selectedCompra.subtotal).toFixed(2);
                      })()}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#6b7280' }}>
                      Descuento
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
                      ${(() => {
                        if (Number(selectedCompra.descuento) === 0 && selectedCompra.detalles && selectedCompra.detalles.length > 0) {
                          // Descuento total = suma de (descuento * cantidad) de cada detalle
                          return selectedCompra.detalles.reduce((sum: number, det: any) => sum + (Number(det.descuento || 0) * Number(det.cantidad)), 0).toFixed(2);
                        }
                        return Number(selectedCompra.descuento).toFixed(2);
                      })()}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#6b7280' }}>
                      Impuestos
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>${Number(selectedCompra.impuestos || 0).toFixed(2)}</p>
                  </div>
                </div>
                
                {selectedCompra.observaciones && (
                  <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', border: '1px solid #f59e0b' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#92400e' }}>
                      Observaciones
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>{selectedCompra.observaciones}</p>
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    Productos Comprados
              </h3>
                  <button
                    type="button"
                    onClick={handleReloadDetails}
                    disabled={loadingDetails}
                    style={{
                      backgroundColor: loadingDetails ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: loadingDetails ? 'not-allowed' : 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {loadingDetails ? 'Cargando...' : '🔄 Recargar'}
                  </button>
                </div>
                {selectedCompra.detalles && selectedCompra.detalles.length > 0 ? (
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#ffffff' }}>
                        <tr>
                          <th className="table-header-visible" style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#000000', backgroundColor: '#ffffff', borderBottom: '2px solid #000000' }}>
                            Producto
                          </th>
                          <th className="table-header-visible" style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#000000', backgroundColor: '#ffffff', borderBottom: '2px solid #000000' }}>
                            Cantidad
                          </th>
                          <th className="table-header-visible" style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 700, color: '#000000', backgroundColor: '#ffffff', borderBottom: '2px solid #000000' }}>
                            Precio Compra
                          </th>
                          <th className="table-header-visible" style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 700, color: '#000000', backgroundColor: '#ffffff', borderBottom: '2px solid #000000' }}>
                            Descuento
                          </th>
                          <th className="table-header-visible" style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 700, color: '#000000', backgroundColor: '#ffffff', borderBottom: '2px solid #000000' }}>
                            Precio Real
                          </th>
                          <th className="table-header-visible" style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 700, color: '#000000', backgroundColor: '#ffffff', borderBottom: '2px solid #000000' }}>
                            Precio Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCompra.detalles.map((detalle, index) => (
                          <tr key={index} className="table-row-visible" style={{ borderBottom: '1px solid #000000', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                            <td className="table-cell-visible" style={{ padding: '12px', fontSize: '14px', color: '#000000', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb', fontWeight: 600 }}>
                              {getProductoNombre(detalle)}
                            </td>
                            <td className="table-cell-visible" style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#000000', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb', fontWeight: 500 }}>
                              {detalle.cantidad}
                            </td>
                            <td className="table-cell-visible" style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#000000', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb', fontWeight: 500 }}>
                              ${Number(detalle.precio_unitario).toFixed(2)}
                            </td>
                            <td className="table-cell-visible" style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#000000', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb', fontWeight: 500 }}>
                              ${Number(detalle.descuento || 0).toFixed(2)}
                            </td>
                            <td className="table-cell-visible" style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#000000', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb', fontWeight: 600 }}>
                              ${(Number(detalle.precio_unitario) - Number(detalle.descuento || 0)).toFixed(2)}
                            </td>
                            <td className="table-cell-visible" style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#000000', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb', fontWeight: 700 }}>
                              ${Number(detalle.subtotal || ((Number(detalle.precio_unitario) - Number(detalle.descuento || 0)) * Number(detalle.cantidad))).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
              <div style={{
                    padding: '20px', 
                    textAlign: 'center', 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fecaca', 
                borderRadius: '6px'
              }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#dc2626', fontWeight: '500' }}>
                      No se encontraron detalles de productos para esta compra.
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#7f1d1d' }}>
                      Esta compra puede haberse creado sin detalles o los detalles no se guardaron correctamente.
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#7f1d1d' }}>
                      Total de la compra: <strong>${Number(selectedCompra.total).toFixed(2)}</strong>
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#7f1d1d' }}>
                      Usa el botón &quot;Recargar&quot; para intentar cargar los detalles nuevamente.
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
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