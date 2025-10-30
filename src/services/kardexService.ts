import apiService from './api';

export interface MovimientoKardex {
  id: number;
  producto_id: number;
  almacen_id: number;
  tipo_movimiento: string;
  tipo_movimiento_id?: number;
  almacen_destino_id?: number;
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
  estado_movimiento: string;
  fecha_creacion: string;
  producto?: any;
  almacen?: any;
  usuario?: any;
}

export interface CreateMovimientoManualData {
  producto_id: number;
  almacen_id?: number;
  tipo_movimiento: string;
  cantidad: number;
  precio_unitario: number;
  documento_referencia: string;
  numero_documento?: string;
  fecha_movimiento?: string;
  observaciones?: string;
  motivo_movimiento?: string;
}

export interface TipoMovimientoKardex {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo_operacion: string;
  afecta_stock: boolean;
  requiere_documento: boolean;
  requiere_autorizacion: boolean;
  activo: boolean;
}

export interface KardexProductoResponse {
  movimientos: MovimientoKardex[];
  resumen: {
    total_entradas: number;
    total_salidas: number;
    stock_inicial: number;
    stock_final: number;
    valor_total_entradas: number;
    valor_total_salidas: number;
  };
}

export interface MovimientosResponse {
  movimientos: MovimientoKardex[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ResumenKardex {
  total_movimientos: number;
  total_entradas: number;
  total_salidas: number;
  valor_total_entradas: number;
  valor_total_salidas: number;
  productos_afectados: number;
  tipos_movimiento: Record<string, number>;
}

class KardexService {
  async getMovimientos(params?: {
    page?: number;
    limit?: number;
    producto_id?: number;
    almacen_id?: number;
    tipo_movimiento?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    search?: string;
  }): Promise<MovimientosResponse> {
    const response = await apiService.get('/kardex', { params });
    return response.data as MovimientosResponse;
  }

  async getMovimientoById(id: number): Promise<MovimientoKardex> {
    const response = await apiService.get(`/kardex/${id}`);
    return (response.data as any).data;
  }

  async getKardexProducto(productoId: number, params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<KardexProductoResponse> {
    const response = await apiService.get(`/kardex/producto/${productoId}`, { params });
    return response.data as KardexProductoResponse;
  }

  async createMovimientoManual(data: CreateMovimientoManualData): Promise<MovimientoKardex> {
    const response = await apiService.post('/kardex/manual', data);
    return (response.data as any).data;
  }

  async getTiposMovimiento(): Promise<TipoMovimientoKardex[]> {
    const response = await apiService.get('/kardex/tipos-movimiento');
    return (response.data as any).data;
  }

  async getResumenKardex(params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<ResumenKardex> {
    const response = await apiService.get('/kardex/resumen', { params });
    return response.data as ResumenKardex;
  }
}

export const kardexService = new KardexService();
export default kardexService;