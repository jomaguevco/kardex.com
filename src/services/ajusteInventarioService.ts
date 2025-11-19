import apiService from './api';

export interface TipoMovimiento {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo_operacion: 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA';
  afecta_stock: boolean;
  requiere_documento: boolean;
  requiere_autorizacion: boolean;
  activo: boolean;
}

export interface AjusteInventario {
  id: number;
  producto_id: number;
  almacen_id: number;
  tipo_movimiento: string;
  tipo_movimiento_id?: number;
  cantidad: number;
  precio_unitario: number;
  costo_total: number;
  stock_anterior: number;
  stock_nuevo: number;
  documento_referencia: string;
  numero_documento?: string;
  fecha_movimiento: string;
  usuario_id: number;
  autorizado_por?: number;
  fecha_autorizacion?: string;
  observaciones?: string;
  motivo_movimiento?: string;
  estado_movimiento: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fecha_creacion: string;
  producto?: any;
  almacen?: any;
  usuario?: any;
  autorizadoPor?: any;
  tipoMovimiento?: TipoMovimiento;
}

export interface CreateAjusteData {
  producto_id: number;
  almacen_id?: number;
  tipo_movimiento: string;
  cantidad: number;
  precio_unitario?: number;
  motivo_movimiento?: string;
  observaciones?: string;
  numero_documento?: string;
  requiere_autorizacion?: boolean;
}

export interface AjustesResponse {
  success: boolean;
  data: AjusteInventario[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class AjusteInventarioService {
  async getTiposMovimiento(): Promise<TipoMovimiento[]> {
    const response = await apiService.get('/ajustes-inventario/tipos-movimiento');
    // El backend retorna { success: true, data: [...] }
    if (response && response.success) {
      return response.data || [];
    }
    return Array.isArray(response) ? response : [];
  }

  async getAjustes(params?: {
    page?: number;
    limit?: number;
    producto_id?: number;
    tipo_movimiento?: string;
    estado_movimiento?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    search?: string;
  }): Promise<AjustesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.producto_id) queryParams.append('producto_id', params.producto_id.toString());
    if (params?.tipo_movimiento) queryParams.append('tipo_movimiento', params.tipo_movimiento);
    if (params?.estado_movimiento) queryParams.append('estado_movimiento', params.estado_movimiento);
    if (params?.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio);
    if (params?.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin);
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiService.get(`/ajustes-inventario?${queryParams.toString()}`);
    // El backend retorna { success: true, data: [...], pagination: {...} }
    // Necesitamos retornar { data: [...], pagination: {...} }
    if (response && response.success) {
      return {
        success: true,
        data: response.data || [],
        pagination: response.pagination || {
          total: 0,
          page: params?.page || 1,
          limit: params?.limit || 10,
          pages: 0
        }
      };
    }
    // Fallback si la estructura es diferente
    return {
      success: true,
      data: Array.isArray(response) ? response : response?.data || [],
      pagination: response?.pagination || {
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        pages: 0
      }
    };
  }

  async createAjuste(data: CreateAjusteData): Promise<AjusteInventario> {
    const response = await apiService.post('/ajustes-inventario', data);
    // El backend retorna { success: true, data: {...} }
    if (response && response.success) {
      return response.data;
    }
    return response.data || response;
  }

  async aprobarAjuste(id: number): Promise<AjusteInventario> {
    const response = await apiService.put(`/ajustes-inventario/${id}/aprobar`);
    // El backend retorna { success: true, data: {...} }
    if (response && response.success) {
      return response.data;
    }
    return response.data || response;
  }

  async rechazarAjuste(id: number, motivo_rechazo?: string): Promise<AjusteInventario> {
    const response = await apiService.put(`/ajustes-inventario/${id}/rechazar`, { motivo_rechazo });
    // El backend retorna { success: true, data: {...} }
    if (response && response.success) {
      return response.data;
    }
    return response.data || response;
  }
}

export const ajusteInventarioService = new AjusteInventarioService();

