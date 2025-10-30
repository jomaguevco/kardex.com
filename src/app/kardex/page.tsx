'use client'

import { useState, useEffect } from 'react';
import { kardexService, MovimientoKardex, KardexProductoResponse } from '@/services/kardexService';
import { productoService, Producto } from '@/services/productoService';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function KardexPage() {
  return <KardexContent />;
}

function KardexContent() {
  const [movimientos, setMovimientos] = useState<MovimientoKardex[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [kardexProducto, setKardexProducto] = useState<KardexProductoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    producto_id: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movimientosResponse, productosResponse] = await Promise.all([
        kardexService.getMovimientos({ limit: 50 }),
        productoService.getProductos({ limit: 100 })
      ]);
      setMovimientos(movimientosResponse.movimientos);
      setProductos(productosResponse.productos);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarKardexProducto = async (productoId: number) => {
    try {
      const producto = productos.find(p => p.id === productoId);
      if (producto) {
        setProductoSeleccionado(producto);
        const kardex = await kardexService.getKardexProducto(productoId, {
          fecha_inicio: filtros.fecha_inicio || undefined,
          fecha_fin: filtros.fecha_fin || undefined
        });
        setKardexProducto(kardex);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar KARDEX del producto');
    }
  };

  const getTipoMovimientoColor = (tipo: string) => {
    if (tipo.includes('ENTRADA')) {
      return { color: '#16a34a', bg: '#f0fdf4' };
    } else if (tipo.includes('SALIDA')) {
      return { color: '#dc2626', bg: '#fef2f2' };
    }
    return { color: '#6b7280', bg: '#f9fafb' };
  };

  const getProductoNombre = (productoId: number) => {
    const producto = productos.find(p => p.id === productoId);
    return producto ? producto.nombre : 'Producto no encontrado';
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
              onClick={() => alert('KARDEX clickeado!')}
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
            KARDEX - Control de Inventario
          </h1>
          <p style={{ color: '#6b7280', margin: '0' }}>
            Consulta el movimiento de inventario por producto
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

        {/* Filtros */}
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Consultar KARDEX por Producto
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Producto
              </label>
              <select
                value={filtros.producto_id}
                onChange={(e) => setFiltros({ ...filtros, producto_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Seleccionar producto</option>
                {productos.map(producto => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre} - Stock: {producto.stock_actual}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filtros.fecha_inicio}
                onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
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
                Fecha Fin
              </label>
              <input
                type="date"
                value={filtros.fecha_fin}
                onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <button
              onClick={() => {
                if (filtros.producto_id) {
                  cargarKardexProducto(Number(filtros.producto_id));
                }
              }}
              disabled={!filtros.producto_id}
              style={{
                backgroundColor: filtros.producto_id ? '#3b82f6' : '#9ca3af',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: filtros.producto_id ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Consultar
            </button>
          </div>
        </div>

        {/* KARDEX del Producto */}
        {kardexProducto && productoSeleccionado && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '24px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>
                KARDEX - {productoSeleccionado.nombre}
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                Código: {productoSeleccionado.codigo_interno} | Stock Actual: {productoSeleccionado.stock_actual}
              </p>
            </div>

            {/* Resumen */}
            <div style={{ padding: '16px', backgroundColor: '#f9fafb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
                    {kardexProducto.resumen.total_entradas}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Entradas</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                    {kardexProducto.resumen.total_salidas}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Salidas</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b7280' }}>
                    {kardexProducto.resumen.stock_inicial}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Stock Inicial</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8' }}>
                    {kardexProducto.resumen.stock_final}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Stock Final</div>
                </div>
              </div>
            </div>

            {/* Tabla de Movimientos */}
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Fecha
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Tipo Movimiento
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Cantidad
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Precio Unit.
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Stock Anterior
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Stock Nuevo
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Documento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {kardexProducto.movimientos.map((movimiento) => {
                    const tipoColor = getTipoMovimientoColor(movimiento.tipo_movimiento);
                    return (
                      <tr key={movimiento.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                          {new Date(movimiento.fecha_movimiento).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                          <span style={{
                            backgroundColor: tipoColor.bg,
                            color: tipoColor.color,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {movimiento.tipo_movimiento.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>
                          {movimiento.cantidad}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>
                          ${Number(movimiento.precio_unitario).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>
                          {movimiento.stock_anterior}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>
                          {movimiento.stock_nuevo}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                          {movimiento.numero_documento || movimiento.documento_referencia}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Movimientos Recientes */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0' }}>
              Movimientos Recientes
            </h3>
          </div>
          
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', color: '#6b7280' }}>Cargando movimientos...</div>
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Fecha
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Producto
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Tipo Movimiento
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Cantidad
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Stock Final
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      Documento
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((movimiento) => {
                    const tipoColor = getTipoMovimientoColor(movimiento.tipo_movimiento);
                    return (
                      <tr key={movimiento.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                          {new Date(movimiento.fecha_movimiento).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                          {getProductoNombre(movimiento.producto_id)}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                          <span style={{
                            backgroundColor: tipoColor.bg,
                            color: tipoColor.color,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {movimiento.tipo_movimiento.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>
                          {movimiento.cantidad}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>
                          {movimiento.stock_nuevo}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>
                          {movimiento.numero_documento || movimiento.documento_referencia}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}