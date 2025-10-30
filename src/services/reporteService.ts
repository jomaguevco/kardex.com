import apiService from './api';

export interface ReporteFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  cliente_id?: number;
  proveedor_id?: number;
  categoria_id?: number;
  marca_id?: number;
  estado?: string;
  stock_bajo?: boolean;
  producto_id?: number;
}

export const reporteService = {
  async getReporteVentas(filters: ReporteFilters = {}) {
    const params = new URLSearchParams();
    
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters.cliente_id) params.append('cliente_id', filters.cliente_id.toString());
    if (filters.estado) params.append('estado', filters.estado);

    const response = await apiService.get(`/reportes/ventas?${params.toString()}`);
    return response.data!;
  },

  async getReporteCompras(filters: ReporteFilters = {}) {
    const params = new URLSearchParams();
    
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters.proveedor_id) params.append('proveedor_id', filters.proveedor_id.toString());
    if (filters.estado) params.append('estado', filters.estado);

    const response = await apiService.get(`/reportes/compras?${params.toString()}`);
    return response.data!;
  },

  async getReporteInventario(filters: ReporteFilters = {}) {
    const params = new URLSearchParams();
    
    if (filters.categoria_id) params.append('categoria_id', filters.categoria_id.toString());
    if (filters.marca_id) params.append('marca_id', filters.marca_id.toString());
    if (filters.stock_bajo) params.append('stock_bajo', 'true');

    const response = await apiService.get(`/reportes/inventario?${params.toString()}`);
    return response.data!;
  },

  async getReporteRentabilidad(filters: ReporteFilters = {}) {
    const params = new URLSearchParams();
    
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

    const response = await apiService.get(`/reportes/rentabilidad?${params.toString()}`);
    return response.data!;
  },

  async getReporteMovimientos(filters: ReporteFilters = {}) {
    const params = new URLSearchParams();
    
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters.producto_id) params.append('producto_id', filters.producto_id.toString());

    const response = await apiService.get(`/reportes/movimientos?${params.toString()}`);
    return response.data!;
  }
};

