'use client'

import { useState, useEffect } from 'react';
import { productoService, Producto, CreateProductoData } from '@/services/productoService';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function ProductosPage() {
  return <ProductosContent />;
}

function ProductosContent() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<CreateProductoData>({
    codigo_interno: '',
    nombre: '',
    descripcion: '',
    precio_venta: 0,
    costo_promedio: 0,
    precio_compra: 0,
    stock_minimo: 0,
    stock_maximo: 0,
    punto_reorden: 0,
    stock_actual: 0
  });

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      setLoading(true);
      const response = await productoService.getProductos({ limit: 50 });
      setProductos(response.productos);
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProducto) {
        await productoService.updateProducto(editingProducto.id, formData);
      } else {
        await productoService.createProducto(formData);
      }
      setShowModal(false);
      setEditingProducto(null);
      setFormData({
        codigo_interno: '',
        nombre: '',
        descripcion: '',
        precio_venta: 0,
        costo_promedio: 0,
        precio_compra: 0,
        stock_minimo: 0,
        stock_maximo: 0,
        punto_reorden: 0,
        stock_actual: 0
      });
      loadProductos();
    } catch (err: any) {
      setError(err.message || 'Error al guardar producto');
    }
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      codigo_interno: producto.codigo_interno,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio_venta: Number(producto.precio_venta),
      costo_promedio: Number(producto.costo_promedio),
      precio_compra: Number(producto.precio_compra),
      stock_minimo: Number(producto.stock_minimo),
      stock_maximo: Number(producto.stock_maximo),
      punto_reorden: Number(producto.punto_reorden),
      stock_actual: Number(producto.stock_actual)
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await productoService.deleteProducto(id);
        loadProductos();
      } catch (err: any) {
        setError(err.message || 'Error al eliminar producto');
      }
    }
  };

  const getStockStatus = (producto: Producto) => {
    const stockActual = Number(producto.stock_actual);
    const stockMinimo = Number(producto.stock_minimo);
    const stockMaximo = Number(producto.stock_maximo);
    
    if (stockActual <= stockMinimo) {
      return { text: 'Stock Bajo', color: '#dc2626', bg: '#fef2f2' };
    } else if (stockActual >= stockMaximo) {
      return { text: 'Stock Alto', color: '#16a34a', bg: '#f0fdf4' };
    }
    return { text: 'Normal', color: '#6b7280', bg: '#f9fafb' };
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
              onClick={() => alert('Productos clickeado!')}
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
            Gestión de Productos
          </h1>
          <p style={{ color: '#6b7280', margin: '0' }}>
            Administra el inventario de productos
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
              Lista de Productos
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              {productos.length} productos registrados
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProducto(null);
              setFormData({
                codigo_interno: '',
                nombre: '',
                descripcion: '',
                precio_venta: 0,
                costo_promedio: 0,
                precio_compra: 0,
                stock_minimo: 0,
                stock_maximo: 0,
                punto_reorden: 0,
                stock_actual: 0
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
            + Nuevo Producto
          </button>
        </div>

        {/* Products Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', color: '#6b7280' }}>Cargando productos...</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Código
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Nombre
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Precio Venta
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    Stock
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
                {productos.map((producto) => {
                  const stockStatus = getStockStatus(producto);
                  return (
                    <tr key={producto.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                        {producto.codigo_interno}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>{producto.nombre}</div>
                          {producto.descripcion && (
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{producto.descripcion}</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>
                        ${Number(producto.precio_venta).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>
                        {producto.stock_actual}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{
                          backgroundColor: stockStatus.bg,
                          color: stockStatus.color,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEdit(producto)}
                            style={{
                              backgroundColor: '#f3f4f6',
                              color: '#374151',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(producto.id)}
                            style={{
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              width: '500px',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
                {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Código Interno *
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_interno}
                    onChange={(e) => setFormData({ ...formData, codigo_interno: e.target.value })}
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

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
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

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Precio Venta
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precio_venta}
                      onChange={(e) => setFormData({ ...formData, precio_venta: Number(e.target.value) })}
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
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Stock Actual
                    </label>
                    <input
                      type="number"
                      value={formData.stock_actual}
                      onChange={(e) => setFormData({ ...formData, stock_actual: Number(e.target.value) })}
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
                    {editingProducto ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}