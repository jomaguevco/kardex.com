'use client'

export default function ConfiguracionPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      fontFamily: 'Arial, sans-serif'
    }}>
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

      <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto' }}>
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
                onClick={() => alert('Configuración clickeado!')}
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

        <div style={{ marginLeft: '256px', padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 8px 0' }}>
              Configuración
            </h1>
            <p style={{ color: '#6b7280', margin: '0' }}>
              Ajustes y configuración del sistema
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#111827', margin: '0 0 16px 0' }}>
                Módulo de Configuración
              </h3>
              <p style={{ color: '#6b7280', margin: '0 0 16px 0' }}>
                Esta sección está funcionando correctamente
              </p>
              <div style={{
                backgroundColor: '#dcfce7',
                border: '1px solid #16a34a',
                color: '#15803d',
                padding: '12px 16px',
                borderRadius: '6px'
              }}>
                ✅ Configuración funcionando - Navegación activa
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}