'use client'

export default function DashboardPage() {
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
              onClick={() => alert('Dashboard clickeado!')}
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
            Dashboard
          </h1>
          <p style={{ color: '#6b7280', margin: '0' }}>
            Resumen general del sistema
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
            Acciones Rápidas
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <button
              onClick={() => window.location.href = '/ventas'}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#e0f2fe';
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#f0f9ff';
                (e.target as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '12px' }}>🛒</span>
              <div>
                <div style={{ fontWeight: '600', color: '#0c4a6e' }}>Nueva Venta</div>
                <div style={{ fontSize: '12px', color: '#0369a1' }}>Registrar venta</div>
              </div>
            </button>
            
            <button
              onClick={() => window.location.href = '/compras'}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#dcfce7';
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#f0fdf4';
                (e.target as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '12px' }}>🛍️</span>
              <div>
                <div style={{ fontWeight: '600', color: '#14532d' }}>Nueva Compra</div>
                <div style={{ fontSize: '12px', color: '#16a34a' }}>Registrar compra</div>
              </div>
            </button>
            
            <button
              onClick={() => window.location.href = '/productos'}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#fde68a';
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#fef3c7';
                (e.target as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '12px' }}>📦</span>
              <div>
                <div style={{ fontWeight: '600', color: '#92400e' }}>Gestionar Productos</div>
                <div style={{ fontSize: '12px', color: '#d97706' }}>Inventario</div>
              </div>
            </button>
            
            <button
              onClick={() => window.location.href = '/reportes'}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#f3e8ff',
                border: '1px solid #a855f7',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#e9d5ff';
                (e.target as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#f3e8ff';
                (e.target as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <span style={{ fontSize: '24px', marginRight: '12px' }}>📊</span>
              <div>
                <div style={{ fontWeight: '600', color: '#6b21a8' }}>Ver Reportes</div>
                <div style={{ fontSize: '12px', color: '#9333ea' }}>Análisis</div>
              </div>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>
                  Ventas del Día
                </p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>
                  $12,450
                </p>
                <p style={{ fontSize: '12px', color: '#16a34a', margin: '0' }}>
                  +12% vs ayer
                </p>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#dcfce7',
                borderRadius: '12px'
              }}>
                <span style={{ color: '#16a34a', fontSize: '24px' }}>💰</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>
                  Ventas Totales
                </p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>
                  156
                </p>
                <p style={{ fontSize: '12px', color: '#16a34a', margin: '0' }}>
                  +8% vs mes anterior
                </p>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#dbeafe',
                borderRadius: '12px'
              }}>
                <span style={{ color: '#2563eb', fontSize: '24px' }}>🛒</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>
                  Productos
                </p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>
                  1,234
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>
                  Stock actualizado
                </p>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#f3e8ff',
                borderRadius: '12px'
              }}>
                <span style={{ color: '#9333ea', fontSize: '24px' }}>📦</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>
                  Crecimiento
                </p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>
                  23.5%
                </p>
                <p style={{ fontSize: '12px', color: '#16a34a', margin: '0' }}>
                  +2.1% vs mes anterior
                </p>
              </div>
              <div style={{
                padding: '12px',
                backgroundColor: '#fed7aa',
                borderRadius: '12px'
              }}>
                <span style={{ color: '#ea580c', fontSize: '24px' }}>📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
              Ventas Recientes
            </h3>
            <div style={{ gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: '0' }}>Venta #001</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Cliente: Juan Pérez</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a', margin: '0' }}>$450.00</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Hace 2 min</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: '0' }}>Venta #002</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Cliente: María García</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a', margin: '0' }}>$320.00</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Hace 15 min</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: '0' }}>Venta #003</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Cliente: Carlos López</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a', margin: '0' }}>$680.00</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Hace 1 hora</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/ventas'}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '8px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#e5e7eb'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
            >
              Ver todas las ventas
            </button>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 16px 0' }}>
              Productos con Stock Bajo
            </h3>
            <div style={{ gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: '0' }}>Producto A</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Categoría: Electrónicos</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626', margin: '0' }}>5 unidades</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Stock crítico</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: '0' }}>Producto B</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Categoría: Hogar</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626', margin: '0' }}>3 unidades</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Stock crítico</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: '0' }}>Producto C</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Categoría: Oficina</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626', margin: '0' }}>2 unidades</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>Stock crítico</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/productos'}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#dc2626'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#fee2e2'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#fef2f2'}
            >
              Gestionar inventario
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}