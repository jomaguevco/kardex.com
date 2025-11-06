import apiService from './api';

export interface ReporteVentasFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  cliente_id?: number;
  estado?: string;
}

export interface ReporteComprasFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  proveedor_id?: number;
  estado?: string;
}

export interface ReporteInventarioFilters {
  categoria_id?: number;
  marca_id?: number;
  stock_bajo?: boolean;
}

export interface ReporteRentabilidadFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface ReporteMovimientosFilters {
  fecha_inicio?: string;
  fecha_fin?: string;
  producto_id?: number;
}

export const reporteService = {
  async getReporteVentas(filters: ReporteVentasFilters = {}) {
    const params = new URLSearchParams();
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters.cliente_id) params.append('cliente_id', filters.cliente_id.toString());
    if (filters.estado) params.append('estado', filters.estado);
    
    const response = await apiService.get(`/reportes/ventas?${params.toString()}`);
    return (response as any)?.data || response;
  },

  async getReporteCompras(filters: ReporteComprasFilters = {}) {
    const params = new URLSearchParams();
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters.proveedor_id) params.append('proveedor_id', filters.proveedor_id.toString());
    if (filters.estado) params.append('estado', filters.estado);
    
    const response = await apiService.get(`/reportes/compras?${params.toString()}`);
    return (response as any)?.data || response;
  },

  async getReporteInventario(filters: ReporteInventarioFilters = {}) {
    const params = new URLSearchParams();
    if (filters.categoria_id) params.append('categoria_id', filters.categoria_id.toString());
    if (filters.marca_id) params.append('marca_id', filters.marca_id.toString());
    if (filters.stock_bajo !== undefined) params.append('stock_bajo', filters.stock_bajo.toString());
    
    const response = await apiService.get(`/reportes/inventario?${params.toString()}`);
    return (response as any)?.data || response;
  },

  async getReporteRentabilidad(filters: ReporteRentabilidadFilters = {}) {
    const params = new URLSearchParams();
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    
    const response = await apiService.get(`/reportes/rentabilidad?${params.toString()}`);
    return (response as any)?.data || response;
  },

  async getReporteMovimientos(filters: ReporteMovimientosFilters = {}) {
    const params = new URLSearchParams();
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters.producto_id) params.append('producto_id', filters.producto_id.toString());
    
    const response = await apiService.get(`/reportes/movimientos?${params.toString()}`);
    return (response as any)?.data || response;
  }
};
