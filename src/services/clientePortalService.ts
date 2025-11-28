import apiService from './api';

export interface MisComprasResponse {
  success: boolean;
  data: any[];
  message?: string;
}

export interface CatalogoResponse {
  success: boolean;
  data: any[];
  message?: string;
}

export interface CategoriasResponse {
  success: boolean;
  data: Array<{
    id: number;
    nombre: string;
    descripcion?: string;
    imagen_url?: string;
    productos_count: number;
  }>;
  message?: string;
}

export interface EstadoCuentaResponse {
  success: boolean;
  data: {
    cliente: any;
    totalCompras: number;
    totalGastado: number;
    comprasPorMes: any[];
    productosMasComprados: any[];
  };
  message?: string;
}

export interface FacturaResponse {
  success: boolean;
  data: any;
  message?: string;
}

class ClientePortalService {
  /**
   * Obtener historial de compras del cliente autenticado
   */
  async getMisCompras(): Promise<MisComprasResponse> {
    return await apiService.get('/cliente-portal/mis-compras');
  }

  /**
   * Obtener catálogo de productos disponibles
   */
  async getCatalogo(params?: {
    search?: string;
    categoria?: string;
    limit?: number;
    offset?: number;
  }): Promise<CatalogoResponse> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoria) queryParams.append('categoria', params.categoria);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return await apiService.get(`/cliente-portal/catalogo${query ? `?${query}` : ''}`);
  }

  /**
   * Obtener categorías con conteo de productos
   */
  async getCategorias(): Promise<CategoriasResponse> {
    return await apiService.get('/cliente-portal/categorias');
  }

  /**
   * Obtener facturas del cliente
   */
  async getMisFacturas(): Promise<MisComprasResponse> {
    return await apiService.get('/cliente-portal/mis-facturas');
  }

  /**
   * Obtener estado de cuenta del cliente
   */
  async getEstadoCuenta(): Promise<EstadoCuentaResponse> {
    return await apiService.get('/cliente-portal/estado-cuenta');
  }

  /**
   * Obtener detalle de una factura específica
   */
  async getFacturaDetalle(id: number): Promise<FacturaResponse> {
    return await apiService.get(`/cliente-portal/factura/${id}`);
  }

  /**
   * Obtener detalle de una compra específica (con productos)
   */
  async getDetalleCompra(id: string | number): Promise<FacturaResponse> {
    return await apiService.get(`/cliente-portal/compra/${id}`);
  }

  /**
   * Obtener dashboard del cliente (resumen)
   */
  async getDashboard(): Promise<any> {
    return await apiService.get('/cliente-portal/dashboard');
  }

  /**
   * Verificar si el cliente está activo por DNI
   */
  async verificarClienteActivo(): Promise<{ success: boolean; data: { activo: boolean; cliente_id: number; nombre: string } }> {
    return await apiService.get('/cliente-portal/verificar-activo');
  }

  /**
   * Descargar PDF de factura
   */
  async descargarFacturaPDF(ventaId: number): Promise<Blob> {
    // Importar axios dinámicamente
    const axios = (await import('axios')).default;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
    
    const response = await axios.get(`${apiUrl}/ventas/${ventaId}/pdf`, {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 30000
    });
    
    // Verificar que la respuesta sea un blob válido
    if (!response || !response.data) {
      throw new Error('No se recibió un PDF válido del servidor');
    }
    
    // Verificar que el blob no esté vacío
    if (response.data.size === 0) {
      throw new Error('El PDF recibido está vacío');
    }
    
    // Verificar que sea un PDF válido leyendo los primeros bytes
    const firstBytes = await response.data.slice(0, 4).arrayBuffer();
    const uint8Array = new Uint8Array(firstBytes);
    const header = String.fromCharCode(...uint8Array);
    
    if (header !== '%PDF') {
      // Si no es un PDF válido, puede ser un JSON con error
      const text = await response.data.text();
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Error al generar el PDF');
      } catch {
        throw new Error('El archivo recibido no es un PDF válido');
      }
    }
    
    // Crear un blob explícitamente para asegurar que sea válido
    const blob = new Blob([response.data], { type: 'application/pdf' });
    
    return blob;
  }
}

export default new ClientePortalService();

