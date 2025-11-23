import apiService from './api';

export interface Pedido {
  id: number;
  cliente_id: number;
  usuario_id: number;
  numero_pedido: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'APROBADO' | 'PAGADO' | 'PROCESADO' | 'EN_CAMINO' | 'CANCELADO' | 'RECHAZADO';
  tipo_pedido: 'PEDIDO_APROBACION' | 'COMPRA_DIRECTA';
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  observaciones?: string;
  fecha_pedido: string;
  aprobado_por?: number;
  fecha_aprobacion?: string;
  venta_id?: number;
  motivo_rechazo?: string;
  metodo_pago?: string;
  fecha_pago?: string;
  comprobante_pago?: string;
  fecha_envio?: string;
  detalles?: DetallePedido[];
  cliente?: any;
  usuario?: any;
  aprobador?: any;
}

export interface DetallePedido {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  producto?: any;
}

export interface CrearPedidoData {
  tipo_pedido: 'PEDIDO_APROBACION' | 'COMPRA_DIRECTA';
  productos: {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
  }[];
  observaciones?: string;
}

export interface AprobarPedidoData {
  metodo_pago?: string;
}

export interface RechazarPedidoData {
  motivo_rechazo: string;
}

export interface MarcarComoPagadoData {
  metodo_pago: string;
  comprobante_pago?: string;
}

export interface PedidoResponse {
  success: boolean;
  data: Pedido;
  message?: string;
}

export interface PedidosResponse {
  success: boolean;
  data: Pedido[];
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class PedidoService {
  /**
   * Crear un nuevo pedido (Cliente)
   */
  async crearPedido(data: CrearPedidoData): Promise<PedidoResponse> {
    try {
      // El backend espera 'detalles' pero el frontend envía 'productos'
      // Convertir productos a detalles
      const requestData = {
        tipo_pedido: data.tipo_pedido,
        detalles: data.productos.map(p => ({
          producto_id: p.producto_id,
          cantidad: p.cantidad,
          precio_unitario: p.precio_unitario,
          descuento: p.descuento || 0
        })),
        observaciones: data.observaciones
      };
      
      console.log('crearPedido - Enviando request:', requestData);
      
      const response = await apiService.post('/pedidos', requestData);
      
      console.log('crearPedido - Respuesta recibida:', response);
      
      // El backend retorna { success: true, data: {...}, message: "..." }
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'Pedido creado exitosamente'
        };
      }
      
      // Si no tiene success, podría ser un error
      throw new Error(response?.message || 'Error al crear el pedido');
    } catch (error: any) {
      console.error('crearPedido - Error:', error);
      
      // Si axios lanza un error (4xx, 5xx), extraer el mensaje del response
      if (error?.response?.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || errorData.error || 'Error al crear el pedido';
        
        // Si es un error de autenticación, loguearlo pero no lanzar error de cierre de sesión
        if (error.response.status === 401 || error.response.status === 403) {
          console.error('Error de autenticación al crear pedido:', errorMessage);
          // No cerrar sesión automáticamente, solo mostrar el error
        }
        
        throw new Error(errorMessage);
      }
      
      // Si es un error de red u otro tipo, usar el mensaje del error
      throw error instanceof Error ? error : new Error('Error al crear el pedido');
    }
  }

  /**
   * Obtener mis pedidos (Cliente)
   */
  async getMisPedidos(): Promise<PedidosResponse> {
    const response = await apiService.get('/pedidos/mis-pedidos');
    // El backend retorna { success: true, data: [...] }
    if (response && response.success) {
      return {
        success: true,
        data: response.data || [],
        message: response.message
      };
    }
    // Fallback si la estructura es diferente
    return {
      success: true,
      data: Array.isArray(response) ? response : response?.data || [],
      message: response?.message
    };
  }

  /**
   * Obtener pedidos pendientes (Vendedor/Admin)
   */
  async getPedidosPendientes(params?: {
    estado?: string;
    page?: number;
    limit?: number;
  }): Promise<PedidosResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.estado) queryParams.append('estado', params.estado);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      // Si no se especifica límite, usar 1000 para obtener todos los pedidos
      else queryParams.append('limit', '1000');

      const query = queryParams.toString();
      const url = `/pedidos/pendientes${query ? `?${query}` : ''}`;
      
      console.log('getPedidosPendientes - Iniciando petición:', url);
      const response = await apiService.get(url);
      console.log('getPedidosPendientes - Respuesta recibida:', response);
      
      // El backend retorna { success: true, data: [...], pagination: {...} }
      if (response && response.success) {
        return {
          success: true,
          data: Array.isArray(response.data) ? response.data : [],
          message: response.message,
          pagination: response.pagination
        };
      }
      
      // Fallback si la estructura es diferente
      console.warn('getPedidosPendientes - Respuesta sin success, usando fallback:', response);
      return {
        success: true,
        data: Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []),
        message: response?.message
      };
    } catch (error: any) {
      console.error('getPedidosPendientes - Error:', error);
      if (error?.response?.data) {
        const errorData = error.response.data;
        console.error('getPedidosPendientes - Error del servidor:', errorData);
        throw new Error(errorData.message || errorData.error || 'Error al obtener pedidos');
      }
      throw error instanceof Error ? error : new Error('Error al obtener pedidos');
    }
  }

  /**
   * Obtener detalle de un pedido
   */
  async getPedidoDetalle(id: number): Promise<PedidoResponse> {
    const response = await apiService.get(`/pedidos/${id}`);
    // El backend retorna { success: true, data: {...} }
    if (response && response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    }
    return {
      success: true,
      data: response.data || response,
      message: response?.message
    };
  }

  /**
   * Aprobar un pedido (Vendedor/Admin)
   */
  async aprobarPedido(id: number, data?: AprobarPedidoData): Promise<PedidoResponse> {
    try {
      console.log('aprobarPedido - Iniciando aprobación:', { id, data });
      const response = await apiService.put(`/pedidos/${id}/aprobar`, data || {});
      console.log('aprobarPedido - Respuesta del servidor:', response);
      
      // El backend retorna { success: true, data: { pedido: {...} }, message: "..." }
      if (response && response.success) {
        return {
          success: true,
          data: response.data?.pedido || response.data,
          message: response.message || 'Pedido aprobado exitosamente'
        };
      }
      
      // Si no tiene success, podría ser un error
      const errorMessage = response?.message || response?.error || 'Error al aprobar el pedido';
      console.error('aprobarPedido - Respuesta sin success:', response);
      throw new Error(errorMessage);
    } catch (error: any) {
      console.error('aprobarPedido - Error capturado:', error);
      
      // Si axios lanza un error (4xx, 5xx), extraer el mensaje del response
      if (error?.response?.data) {
        const errorData = error.response.data;
        const errorMessage = errorData.message || errorData.error || `Error ${error.response.status}: Error al aprobar el pedido`;
        console.error('aprobarPedido - Error del servidor:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Si es un error de red u otro tipo, usar el mensaje del error
      const finalError = error instanceof Error ? error : new Error('Error al aprobar el pedido');
      console.error('aprobarPedido - Error final:', finalError.message);
      throw finalError;
    }
  }

  /**
   * Rechazar un pedido (Vendedor/Admin)
   */
  async rechazarPedido(id: number, data: RechazarPedidoData): Promise<PedidoResponse> {
    try {
      const response = await apiService.put(`/pedidos/${id}/rechazar`, data);
      // El backend retorna { success: true, data: {...}, message: "..." }
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'Pedido rechazado exitosamente'
        };
      }
      // Si no tiene success, podría ser un error
      throw new Error(response?.message || 'Error al rechazar el pedido');
    } catch (error: any) {
      // Si axios lanza un error (4xx, 5xx), extraer el mensaje del response
      if (error?.response?.data) {
        const errorData = error.response.data;
        throw new Error(errorData.message || errorData.error || 'Error al rechazar el pedido');
      }
      // Si es un error de red u otro tipo, usar el mensaje del error
      throw error instanceof Error ? error : new Error('Error al rechazar el pedido');
    }
  }

  /**
   * Cancelar mi pedido (Cliente)
   */
  async cancelarPedido(id: number): Promise<PedidoResponse> {
    return await apiService.put(`/pedidos/${id}/cancelar`, {});
  }

  /**
   * Marcar pedido como pagado (Cliente)
   */
  /**
   * Subir comprobante de pago
   */
  async uploadComprobante(id: number, file: File): Promise<{ comprobante_pago: string }> {
    try {
      const formData = new FormData();
      formData.append('comprobante', file);

      // No establecer Content-Type manualmente - axios lo hace automáticamente para FormData
      const response = await apiService.post(`/pedidos/${id}/upload-comprobante`, formData);

      if (response && response.success) {
        return {
          comprobante_pago: response.data.comprobante_pago
        };
      }

      throw new Error(response?.message || 'Error al subir comprobante');
    } catch (error: any) {
      console.error('uploadComprobante - Error:', error);

      if (error?.response?.data) {
        const errorData = error.response.data;
        throw new Error(errorData.message || errorData.error || 'Error al subir comprobante');
      }

      throw error instanceof Error ? error : new Error('Error al subir comprobante');
    }
  }

  async marcarComoPagado(id: number, data: MarcarComoPagadoData): Promise<PedidoResponse> {
    try {
      console.log('marcarComoPagado - Enviando request:', { id, data });
      const response = await apiService.post(`/pedidos/${id}/marcar-pagado`, data);
      console.log('marcarComoPagado - Respuesta recibida:', response);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'Pedido marcado como pagado exitosamente'
        };
      }
      
      throw new Error(response?.message || 'Error al marcar pedido como pagado');
    } catch (error: any) {
      console.error('marcarComoPagado - Error:', error);
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        throw new Error(errorData.message || errorData.error || 'Error al marcar pedido como pagado');
      }
      
      throw error instanceof Error ? error : new Error('Error al marcar pedido como pagado');
    }
  }

  /**
   * Procesar envío de pedido - Crear venta y descontar stock (Vendedor/Admin)
   */
  async procesarEnvio(id: number): Promise<PedidoResponse> {
    try {
      console.log('procesarEnvio - Enviando request:', { id });
      const response = await apiService.post(`/pedidos/${id}/procesar-envio`);
      console.log('procesarEnvio - Respuesta recibida:', response);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'Envío procesado exitosamente'
        };
      }
      
      throw new Error(response?.message || 'Error al procesar envío');
    } catch (error: any) {
      console.error('procesarEnvio - Error:', error);
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        throw new Error(errorData.message || errorData.error || 'Error al procesar envío');
      }
      
      throw error instanceof Error ? error : new Error('Error al procesar envío');
    }
  }

  /**
   * Obtener todos los pedidos (Admin)
   */
  async getAllPedidos(params?: {
    estado?: string;
    limit?: number;
    offset?: number;
  }): Promise<PedidosResponse> {
    const queryParams = new URLSearchParams();
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return await apiService.get(`/pedidos${query ? `?${query}` : ''}`);
  }
}

export default new PedidoService();

