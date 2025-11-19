import apiService from './api';

export interface Pedido {
  id: number;
  cliente_id: number;
  usuario_id: number;
  numero_pedido: string;
  estado: 'PENDIENTE' | 'APROBADO' | 'PROCESADO' | 'CANCELADO' | 'RECHAZADO';
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

export interface PedidoResponse {
  success: boolean;
  data: Pedido;
  message?: string;
}

export interface PedidosResponse {
  success: boolean;
  data: Pedido[];
  message?: string;
}

class PedidoService {
  /**
   * Crear un nuevo pedido (Cliente)
   */
  async crearPedido(data: CrearPedidoData): Promise<PedidoResponse> {
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
    const response = await apiService.post('/pedidos', requestData);
    // El backend retorna { success: true, data: {...}, message: "..." }
    if (response && response.success) {
      return {
        success: true,
        data: response.data,
        message: response.message
      };
    }
    return response;
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
  async getPedidosPendientes(): Promise<PedidosResponse> {
    const response = await apiService.get('/pedidos/pendientes');
    // El backend retorna { success: true, data: {...}, pagination: {...} }
    if (response && response.success) {
      return {
        success: true,
        data: response.data || [],
        message: response.message
      };
    }
    return {
      success: true,
      data: Array.isArray(response) ? response : response?.data || [],
      message: response?.message
    };
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
      const response = await apiService.put(`/pedidos/${id}/aprobar`, data || {});
      // El backend retorna { success: true, data: {...}, message: "..." }
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'Pedido aprobado exitosamente'
        };
      }
      // Si no tiene success, podría ser un error
      throw new Error(response?.message || 'Error al aprobar el pedido');
    } catch (error: any) {
      // Si axios lanza un error (4xx, 5xx), extraer el mensaje del response
      if (error?.response?.data) {
        const errorData = error.response.data;
        throw new Error(errorData.message || errorData.error || 'Error al aprobar el pedido');
      }
      // Si es un error de red u otro tipo, usar el mensaje del error
      throw error instanceof Error ? error : new Error('Error al aprobar el pedido');
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

