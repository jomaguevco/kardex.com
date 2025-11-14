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
    return await apiService.post('/pedidos', data);
  }

  /**
   * Obtener mis pedidos (Cliente)
   */
  async getMisPedidos(): Promise<PedidosResponse> {
    return await apiService.get('/pedidos/mis-pedidos');
  }

  /**
   * Obtener pedidos pendientes (Vendedor/Admin)
   */
  async getPedidosPendientes(): Promise<PedidosResponse> {
    return await apiService.get('/pedidos/pendientes');
  }

  /**
   * Obtener detalle de un pedido
   */
  async getPedidoDetalle(id: number): Promise<PedidoResponse> {
    return await apiService.get(`/pedidos/${id}`);
  }

  /**
   * Aprobar un pedido (Vendedor/Admin)
   */
  async aprobarPedido(id: number, data?: AprobarPedidoData): Promise<PedidoResponse> {
    return await apiService.put(`/pedidos/${id}/aprobar`, data || {});
  }

  /**
   * Rechazar un pedido (Vendedor/Admin)
   */
  async rechazarPedido(id: number, data: RechazarPedidoData): Promise<PedidoResponse> {
    return await apiService.put(`/pedidos/${id}/rechazar`, data);
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

