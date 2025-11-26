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
   * Descargar PDF de factura
   */
  async descargarFacturaPDF(ventaId: number): Promise<Blob> {
    const response = await apiService.get(`/ventas/${ventaId}/pdf`, {
      responseType: 'blob'
    });
    return response as unknown as Blob;
  }
}

export default new ClientePortalService();

