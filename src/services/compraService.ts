import apiService from './api';

export interface DetalleCompra {
  id?: number;
  compra_id?: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  subtotal: number;
  producto?: any;
}

export interface Compra {
  id: number;
  proveedor_id: number;
  numero_factura: string;
  fecha_compra: string;
  fecha_vencimiento?: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  estado: string;
  observaciones?: string;
  usuario_id: number;
  fecha_creacion: string;
  proveedor?: any;
  usuario?: any;
  detalles: DetalleCompra[];
}

export interface CreateCompraData {
  proveedor_id: number;
  numero_factura?: string;
  fecha_compra?: string;
  fecha_vencimiento?: string;
  subtotal?: number;
  descuento?: number;
  impuestos?: number;
  total?: number;
  estado?: string;
  observaciones?: string;
  detalles: {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
  }[];
}

export interface UpdateCompraData {
  estado?: string;
  observaciones?: string;
  fecha_vencimiento?: string;
}

export interface ComprasResponse {
  compras: Compra[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EstadisticasCompras {
  total_compras: number;
  total_monto: number;
  total_subtotal: number;
  total_descuentos: number;
  total_impuestos: number;
  promedio_compra: number;
}

class CompraService {
  async getCompras(params?: {
    page?: number;
    limit?: number;
    search?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    proveedor_id?: number;
  }): Promise<ComprasResponse> {
    const response = await apiService.get('/compras', { params });
    return response.data as ComprasResponse;
  }

  async getCompraById(id: number): Promise<Compra> {
    const response = await apiService.get(`/compras/${id}`);
    return (response.data as any).data;
  }

  async createCompra(data: CreateCompraData): Promise<Compra> {
    const response = await apiService.post('/compras', data);
    return (response.data as any).data;
  }

  async updateCompra(id: number, data: UpdateCompraData): Promise<Compra> {
    const response = await apiService.put(`/compras/${id}`, data);
    return (response.data as any).data;
  }

  async deleteCompra(id: number): Promise<void> {
    await apiService.delete(`/compras/${id}`);
  }

  async getEstadisticasCompras(params?: {
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<EstadisticasCompras> {
    const response = await apiService.get('/compras/estadisticas', { params });
    return (response.data as any).data;
  }
}

export const compraService = new CompraService();
export default compraService;