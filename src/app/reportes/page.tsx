'use client'

import { useState, useEffect } from 'react';
import { reporteService } from '@/services/reporteService';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function ReportesPage() {
  return <ReportesContent />;
}

function ReportesContent() {
  const [activeTab, setActiveTab] = useState<'ventas' | 'compras' | 'inventario' | 'rentabilidad' | 'movimientos'>('ventas');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros comunes
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  // Datos de reportes
  const [reporteVentas, setReporteVentas] = useState<any>(null);
  const [reporteCompras, setReporteCompras] = useState<any>(null);
  const [reporteInventario, setReporteInventario] = useState<any>(null);
  const [reporteRentabilidad, setReporteRentabilidad] = useState<any>(null);
  const [reporteMovimientos, setReporteMovimientos] = useState<any>(null);

  const cargarReporte = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case 'ventas':
          const ventas = await reporteService.getReporteVentas({
            fecha_inicio: fechaInicio || undefined,
            fecha_fin: fechaFin || undefined
          });
          setReporteVentas(ventas);
          break;
        case 'compras':
          const compras = await reporteService.getReporteCompras({
            fecha_inicio: fechaInicio || undefined,
            fecha_fin: fechaFin || undefined
          });
          setReporteCompras(compras);
          break;
        case 'inventario':
          const inventario = await reporteService.getReporteInventario({});
          setReporteInventario(inventario);
          break;
        case 'rentabilidad':
          const rentabilidad = await reporteService.getReporteRentabilidad({
            fecha_inicio: fechaInicio || undefined,
            fecha_fin: fechaFin || undefined
          });
          setReporteRentabilidad(rentabilidad);
          break;
        case 'movimientos':
          const movimientos = await reporteService.getReporteMovimientos({
            fecha_inicio: fechaInicio || undefined,
            fecha_fin: fechaFin || undefined
          });
          setReporteMovimientos(movimientos);
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, [activeTab]);

  const renderReporteVentas = () => {
    if (!reporteVentas) return null;
    
    return (
      <div>
        <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Ventas</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              ${Number(reporteVentas.estadisticas?.total_ventas || 0).toFixed(2)}
            </div>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Cantidad de Ventas</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              {reporteVentas.estadisticas?.cantidad_ventas || 0}
            </div>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Promedio por Venta</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              ${Number(reporteVentas.estadisticas?.promedio_venta || 0).toFixed(2)}
            </div>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Factura</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Cliente</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Fecha</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(reporteVentas.ventas || []).map((venta: any, index: number) => (
                <tr key={venta.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{venta.numero_factura}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{(venta.cliente as any)?.nombre || 'N/A'}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{new Date(venta.fecha_venta).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827', textAlign: 'right', fontWeight: '600' }}>${Number(venta.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReporteCompras = () => {
    if (!reporteCompras) return null;
    
    return (
      <div>
        <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Compras</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              ${Number(reporteCompras.estadisticas?.total_compras || 0).toFixed(2)}
            </div>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Cantidad de Compras</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              {reporteCompras.estadisticas?.cantidad_compras || 0}
            </div>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Promedio por Compra</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              ${Number(reporteCompras.estadisticas?.promedio_compra || 0).toFixed(2)}
            </div>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Factura</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Proveedor</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Fecha</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(reporteCompras.compras || []).map((compra: any, index: number) => (
                <tr key={compra.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{compra.numero_factura}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{(compra.proveedor as any)?.nombre || 'N/A'}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{new Date(compra.fecha_compra).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827', textAlign: 'right', fontWeight: '600' }}>${Number(compra.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReporteInventario = () => {
    if (!reporteInventario) return null;
    
    return (
      <div>
        <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Productos</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              {reporteInventario.estadisticas?.total_productos || 0}
            </div>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Valor Total Inventario</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              ${Number(reporteInventario.estadisticas?.valor_total_inventario || 0).toFixed(2)}
            </div>
          </div>
          <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Productos Stock Bajo</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
              {reporteInventario.estadisticas?.productos_stock_bajo || 0}
            </div>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Producto</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Stock Actual</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Stock Mínimo</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Precio Compra</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {(reporteInventario.productos || []).slice(0, 50).map((producto: any, index: number) => (
                <tr key={producto.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{producto.nombre}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: producto.stock_actual <= producto.stock_minimo ? '#dc2626' : '#111827', textAlign: 'right', fontWeight: producto.stock_actual <= producto.stock_minimo ? '600' : 'normal' }}>
                    {producto.stock_actual}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>{producto.stock_minimo}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>${Number(producto.precio_compra).toFixed(2)}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827', textAlign: 'right', fontWeight: '600' }}>
                    ${(Number(producto.stock_actual) * Number(producto.precio_compra)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReporteRentabilidad = () => {
    if (!reporteRentabilidad) return null;
    
    return (
      <div>
        <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Ingresos</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              ${Number(reporteRentabilidad.estadisticas_generales?.total_ingresos || 0).toFixed(2)}
            </div>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Costos</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
              ${Number(reporteRentabilidad.estadisticas_generales?.total_costos || 0).toFixed(2)}
            </div>
          </div>
          <div style={{ backgroundColor: '#dcfce7', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Ganancia Total</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>
              ${Number(reporteRentabilidad.estadisticas_generales?.ganancia_total || 0).toFixed(2)}
            </div>
          </div>
          <div style={{ backgroundColor: '#dbeafe', padding: '16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Margen General</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8' }}>
              {Number(reporteRentabilidad.estadisticas_generales?.margen_general || 0).toFixed(2)}%
            </div>
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Producto</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Cant. Vendida</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Ingresos</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Costos</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Ganancia</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Margen %</th>
              </tr>
            </thead>
            <tbody>
              {(reporteRentabilidad.rentabilidad_por_producto || []).slice(0, 50).map((item: any, index: number) => (
                <tr key={item.producto?.id || index} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{item.producto?.nombre || 'N/A'}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>{Number(item.cantidad_vendida || 0).toFixed(2)}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>${Number(item.ingreso_total || 0).toFixed(2)}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>${Number(item.costo_total || 0).toFixed(2)}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: item.ganancia_total >= 0 ? '#15803d' : '#dc2626', textAlign: 'right', fontWeight: '600' }}>
                    ${Number(item.ganancia_total || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: item.margen_promedio >= 0 ? '#15803d' : '#dc2626', textAlign: 'right', fontWeight: '600' }}>
                    {Number(item.margen_promedio || 0).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderReporteMovimientos = () => {
    if (!reporteMovimientos) return null;
    
    return (
      <div>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Fecha</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Producto</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Tipo Movimiento</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Cantidad</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Stock Anterior</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Stock Nuevo</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '600', color: '#111827' }}>Costo Total</th>
              </tr>
            </thead>
            <tbody>
              {(reporteMovimientos.movimientos || []).slice(0, 100).map((movimiento: any, index: number) => (
                <tr key={movimiento.id} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{new Date(movimiento.fecha_movimiento).toLocaleDateString()}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{(movimiento.producto as any)?.nombre || 'N/A'}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{movimiento.tipo_movimiento}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>{movimiento.cantidad}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>{movimiento.stock_anterior}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827', textAlign: 'right', fontWeight: '600' }}>{movimiento.stock_nuevo}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#111827', textAlign: 'right' }}>${Number(movimiento.costo_total || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
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
          maxWidth: '1400px',
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

      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Sidebar */}
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
            {[
              { href: '/dashboard', icon: '📊', label: 'Dashboard' },
              { href: '/productos', icon: '📦', label: 'Productos' },
              { href: '/ventas', icon: '🛒', label: 'Ventas' },
              { href: '/compras', icon: '🛍️', label: 'Compras' },
              { href: '/kardex', icon: '📈', label: 'KARDEX' },
              { href: '/clientes', icon: '👥', label: 'Clientes' },
              { href: '/proveedores', icon: '🏢', label: 'Proveedores' },
              { href: '/reportes', icon: '📄', label: 'Reportes', active: true },
              { href: '/configuracion', icon: '⚙️', label: 'Configuración' }
            ].map((item) => (
              <div key={item.href} style={{ marginBottom: '4px' }}>
                <button
                  onClick={() => window.location.href = item.href}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '6px',
                    backgroundColor: item.active ? '#dbeafe' : 'transparent',
                    color: item.active ? '#1d4ed8' : '#6b7280',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ marginRight: '12px' }}>{item.icon}</span>
                  {item.label}
                </button>
              </div>
            ))}
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
        <div style={{ marginLeft: '256px', padding: '24px', width: '100%' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
              Reportes
            </h1>
            <p style={{ color: '#6b7280', margin: '0' }}>
              Genera y visualiza reportes del sistema
            </p>
          </div>

          {/* Tabs */}
          <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', borderBottom: '2px solid #e5e7eb' }}>
            {[
              { id: 'ventas', label: '📊 Reporte de Ventas' },
              { id: 'compras', label: '🛍️ Reporte de Compras' },
              { id: 'inventario', label: '📦 Reporte de Inventario' },
              { id: 'rentabilidad', label: '💰 Reporte de Rentabilidad' },
              { id: 'movimientos', label: '📈 Movimientos KARDEX' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: activeTab === tab.id ? '#1d4ed8' : '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #1d4ed8' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filtros de Fecha */}
          {(activeTab === 'ventas' || activeTab === 'compras' || activeTab === 'rentabilidad' || activeTab === 'movimientos') && (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              display: 'flex',
              gap: '16px',
              alignItems: 'end'
            }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
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
                onClick={cargarReporte}
                disabled={loading}
                style={{
                  padding: '8px 24px',
                  backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Cargando...' : '🔍 Filtrar'}
              </button>
            </div>
          )}

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

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '16px', color: '#6b7280' }}>Cargando reporte...</div>
            </div>
          )}

          {/* Report Content */}
          {!loading && (
            <>
              {activeTab === 'ventas' && renderReporteVentas()}
              {activeTab === 'compras' && renderReporteCompras()}
              {activeTab === 'inventario' && renderReporteInventario()}
              {activeTab === 'rentabilidad' && renderReporteRentabilidad()}
              {activeTab === 'movimientos' && renderReporteMovimientos()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
