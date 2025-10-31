'use client'

import { useState, useEffect } from 'react';
import { ventaService } from '@/services/ventaService';
import { Venta, VentaForm, DetalleVentaForm } from '@/types';
import { clienteService, Cliente } from '@/services/clienteService';
import { productoService, Producto } from '@/services/productoService';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function VentasPage() {
  return <VentasContent />;
}

function VentasContent() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [formData, setFormData] = useState<VentaForm>({
    numero_factura: '',
    cliente_id: 0,
    fecha_venta: new Date().toISOString().split('T')[0],
    subtotal: 0,
    descuento: 0,
    impuestos: 0,
    total: 0,
    observaciones: '',
    detalles: []
  });
  const [nuevoDetalle, setNuevoDetalle] = useState<DetalleVentaForm>({
    producto_id: 0,
    cantidad: 1,
    precio_unitario: 0,
    descuento: 0,
    subtotal: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ventasResponse, clientesResponse, productosResponse] = await Promise.all([
        ventaService.getVentas({ limit: 50 }),
        clienteService.getClientesActivos(),
        productoService.getProductos({ limit: 100 })
      ]);

      // Backend devuelve { success, data: { ventas, pagination } }
      const ventasLista = (ventasResponse as any)?.data?.ventas || (ventasResponse as any)?.ventas || [];
      const clientesLista = (clientesResponse as any)?.data || clientesResponse || [];
      const productosLista = (productosResponse as any)?.data?.productos || (productosResponse as any)?.productos || [];

      setVentas(ventasLista);
      setClientes(clientesLista);
      setProductos(productosLista);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.detalles.length === 0) {
        setError('Debe agregar al menos un producto');
        return;
      }

      // Calcular totales
      const subtotal = formData.detalles.reduce((sum, detalle) => sum + (detalle.cantidad * detalle.precio_unitario), 0);
      const total = subtotal; // Por simplicidad, sin descuentos ni impuestos

      const ventaData = {
        ...formData,
        subtotal,
        total
      };

      // Asegurar que los detalles tengan todos los campos requeridos
      const detallesCompletos = ventaData.detalles.map(detalle => ({
        producto_id: detalle.producto_id,
        cantidad: detalle.cantidad,
        precio_unitario: detalle.precio_unitario,
        descuento: detalle.descuento || 0,
        subtotal: detalle.subtotal || (detalle.cantidad * detalle.precio_unitario)
      }));

      // Limpiar campos vacíos antes de enviar
      const ventaDataCompleto: any = {
        ...ventaData,
        detalles: detallesCompletos,
        numero_factura: ventaData.numero_factura || `FAC-${Date.now()}`
      };
      
      // Eliminar observaciones si está vacía
      if (!ventaDataCompleto.observaciones || ventaDataCompleto.observaciones.trim() === '') {
        delete ventaDataCompleto.observaciones;
      }

      console.log('Enviando venta:', ventaDataCompleto);
      await ventaService.createVenta(ventaDataCompleto);
      setShowModal(false);
      setFormData({
        numero_factura: '',
        cliente_id: 0,
        fecha_venta: new Date().toISOString().split('T')[0],
        subtotal: 0,
        descuento: 0,
        impuestos: 0,
        total: 0,
        observaciones: '',
        detalles: []
      });
      loadData();
    } catch (err: any) {
      console.error('Error al crear venta:', err);
      const errorMessage = err.response?.data?.details 
        ? err.response.data.details.join(', ')
        : err.response?.data?.message || err.message || 'Error al crear venta';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  const agregarDetalle = () => {
    if (nuevoDetalle.producto_id && nuevoDetalle.cantidad > 0) {
      const producto = productos.find(p => p.id === nuevoDetalle.producto_id);
      if (producto) {
        const precioUnitario = nuevoDetalle.precio_unitario || producto.precio_venta;
        const subtotal = nuevoDetalle.cantidad * precioUnitario - (nuevoDetalle.descuento || 0);
        const detalle = {
          producto_id: nuevoDetalle.producto_id,
          cantidad: nuevoDetalle.cantidad,
          precio_unitario: precioUnitario,
          descuento: nuevoDetalle.descuento || 0,
          subtotal: subtotal
        };
        setFormData({
          ...formData,
          detalles: [...formData.detalles, detalle]
        });
        setNuevoDetalle({
          producto_id: 0,
          cantidad: 1,
          precio_unitario: 0,
          descuento: 0,
          subtotal: 0
        });
      }
    }
  };

  const eliminarDetalle = (index: number) => {
    setFormData({
      ...formData,
      detalles: formData.detalles.filter((_, i) => i !== index)
    });
  };

  const getClienteNombre = (clienteId: number, venta?: any) => {
    // 1) Si la venta viene con cliente incluido desde backend
    if (venta?.cliente?.nombre) {
      const apellido = venta.cliente.apellido || '';
      return `${venta.cliente.nombre}${apellido ? ' ' + apellido : ''}`;
    }

    // 2) Buscar en la lista de clientes cargada
    if (clientes && Array.isArray(clientes)) {
      const cliente = clientes.find(c => c.id === clienteId);
      if (cliente) {
        // Algunos esquemas usan nombre + apellido
        const anyCliente: any = cliente as any;
        const apellido = anyCliente.apellido || '';
        return `${cliente.nombre}${apellido ? ' ' + apellido : ''}`;
      }
    }
    return 'Cliente no encontrado';
  };

  const getProductoNombre = (productoId: number) => {
    if (!productos || !Array.isArray(productos)) {
      return 'Producto no encontrado';
    }
    const producto = productos.find(p => p.id === productoId);
    return producto ? producto.nombre : 'Producto no encontrado';
  };

  const calcularTotalVenta = (detalles: any[]) => {
    return detalles.reduce((sum, detalle) => sum + (detalle.cantidad * detalle.precio_unitario), 0);
  };

  const handleViewDetails = async (venta: Venta) => {
    setSelectedVenta(venta);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    
    try {
      const ventaCompleta = await ventaService.getVentaById(venta.id);
      setSelectedVenta(ventaCompleta as Venta);
    } catch (err: any) {
      console.error('Error al cargar detalles:', err);
      setError('Error al cargar los detalles de la venta');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleReloadDetails = async () => {
    if (!selectedVenta) return;
    
    setLoadingDetails(true);
    try {
      const ventaCompleta = await ventaService.getVentaById(selectedVenta.id);
      setSelectedVenta(ventaCompleta as Venta);
    } catch (err: any) {
      console.error('Error al recargar detalles:', err);
      setError('Error al recargar los detalles de la venta');
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
              onClick={() => alert('Ventas clickeado!')}
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
        
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '16px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
            Sistema de Ventas KARDEX v1.0
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '256px', padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
            Gestión de Ventas
          </h1>
          <p style={{ color: '#6b7280', margin: '0' }}>
            Administra las ventas del sistema
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>
              Lista de Ventas
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {ventas.length} ventas registradas
            </p>
          </div>
          <button
            onClick={() => {
              setFormData({
                numero_factura: '',
                cliente_id: 0,
                fecha_venta: new Date().toISOString().split('T')[0],
                subtotal: 0,
                descuento: 0,
                impuestos: 0,
                total: 0,
                observaciones: '',
                detalles: []
              });
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
          >
            + Nueva Venta
          </button>
        </div>

        {/* Sales Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', color: '#6b7280' }}>Cargando ventas...</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Factura
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Cliente
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Fecha
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Total
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
                {ventas.map((venta) => (
                  <tr key={venta.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                      {venta.numero_factura}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                      {getClienteNombre(venta.cliente_id, venta as any)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                      {new Date(venta.fecha_venta).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>
                      ${Number(venta.total).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: venta.estado === 'PROCESADA' ? '#f0fdf4' : '#fef3c7',
                        color: venta.estado === 'PROCESADA' ? '#16a34a' : '#d97706',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {venta.estado}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(venta);
                        }}
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
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '1000'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              width: '90%',
              maxWidth: '1200px',
              maxHeight: '95vh',
              overflow: 'auto'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                Nueva Venta
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Cliente *
                  </label>
                  <select
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({ ...formData, cliente_id: Number(e.target.value) })}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value={0}>Seleccionar cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                </div>


                {/* Agregar Producto */}
                <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
                    Agregar Producto
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <select
                      value={nuevoDetalle.producto_id}
                      onChange={(e) => {
                        const productoId = Number(e.target.value);
                        const producto = productos.find(p => p.id === productoId);
                        setNuevoDetalle({
                          ...nuevoDetalle,
                          producto_id: productoId,
                          precio_unitario: producto?.precio_venta || 0
                        });
                      }}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value={0}>Seleccionar producto</option>
                      {productos.map(producto => (
                        <option key={producto.id} value={producto.id}>
                          {producto.nombre} - Stock: {producto.stock_actual}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={nuevoDetalle.cantidad}
                      onChange={(e) => setNuevoDetalle({ ...nuevoDetalle, cantidad: Number(e.target.value) })}
                      placeholder="Cantidad"
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={nuevoDetalle.precio_unitario}
                      onChange={(e) => setNuevoDetalle({ ...nuevoDetalle, precio_unitario: Number(e.target.value) })}
                      placeholder="Precio"
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={agregarDetalle}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Agregar
                  </button>
                </div>

                {/* Lista de Productos */}
                {formData.detalles.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
                      Productos Seleccionados
                    </h3>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f3f4f6' }}>
                            <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#111827', borderBottom: '2px solid #e5e7eb' }}>Producto</th>
                            <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#111827', borderBottom: '2px solid #e5e7eb' }}>Cantidad</th>
                            <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#111827', borderBottom: '2px solid #e5e7eb' }}>Precio</th>
                            <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#111827', borderBottom: '2px solid #e5e7eb' }}>Subtotal</th>
                            <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#111827', borderBottom: '2px solid #e5e7eb' }}>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.detalles.map((detalle, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                              <td style={{ padding: '12px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                                {getProductoNombre(detalle.producto_id)}
                              </td>
                              <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right', color: '#374151' }}>
                                {detalle.cantidad}
                              </td>
                              <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right', color: '#374151' }}>
                                ${Number(detalle.precio_unitario).toFixed(2)}
                              </td>
                              <td style={{ padding: '12px', fontSize: '14px', textAlign: 'right', color: '#111827', fontWeight: '600' }}>
                                ${(Number(detalle.cantidad) * Number(detalle.precio_unitario)).toFixed(2)}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => eliminarDetalle(index)}
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
                    <div style={{ padding: '16px', backgroundColor: '#f9fafb', textAlign: 'right', borderTop: '2px solid #e5e7eb' }}>
                      <strong style={{ fontSize: '18px', color: '#111827', fontWeight: '700' }}>
                        Total: ${Number(calcularTotalVenta(formData.detalles)).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                )}

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
                  >
                    Crear Venta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Detalles de Venta */}
        {showDetailsModal && selectedVenta && (
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
                Detalle de Venta - {selectedVenta.numero_factura}
              </h2>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Cliente
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
                      {getClienteNombre(selectedVenta.cliente_id, selectedVenta as any)}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Fecha
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
                      {new Date(selectedVenta.fecha_venta).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Estado
                    </label>
                    <select
                      value={selectedVenta.estado}
                      onChange={async (e) => {
                        try {
                          await ventaService.updateVenta(selectedVenta.id, { estado: e.target.value as any });
                          setSelectedVenta({ ...selectedVenta, estado: e.target.value as any });
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
                      Subtotal
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', color: '#111827' }}>
                      ${Number((selectedVenta as any).subtotal || selectedVenta.total).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                      Total
                    </label>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                      ${Number(selectedVenta.total).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    Productos Vendidos
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
                
                {loadingDetails ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '16px', color: '#6b7280' }}>Cargando detalles...</div>
                  </div>
                ) : (selectedVenta as any).detalles && (selectedVenta as any).detalles.length > 0 ? (
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>
                            Producto
                          </th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
                            Cantidad
                          </th>
                          <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>
                            Precio Unit.
                          </th>
                          <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedVenta as any).detalles.map((detalle: any, index: number) => (
                          <tr key={index} style={{ borderTop: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>
                              {getProductoNombre(detalle.producto_id)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#111827' }}>
                              {detalle.cantidad}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#111827' }}>
                              ${Number(detalle.precio_unitario).toFixed(2)}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#111827' }}>
                              ${Number(detalle.subtotal || (detalle.cantidad * detalle.precio_unitario)).toFixed(2)}
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
                      No se encontraron detalles de productos para esta venta.
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#7f1d1d' }}>
                      Esta venta puede haberse creado sin detalles o los detalles no se guardaron correctamente.
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#7f1d1d' }}>
                      Total de la venta: <strong>${Number(selectedVenta.total).toFixed(2)}</strong>
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