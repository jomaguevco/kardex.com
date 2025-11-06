import apiService from './api';
import { VentaFilters, VentaForm } from '@/types';

export const ventaService = {
  async getVentas(filters: VentaFilters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
    if (filters.estado) params.append('estado', filters.estado);

    const response = await apiService.get(`/ventas?${params.toString()}`);
    return response.data!;
  },

  async getVentaById(id: number) {
    const response = await apiService.get(`/ventas/${id}`);
    return response.data!;
  },

  async createVenta(venta: VentaForm) {
    const response = await apiService.post('/ventas', venta);
    return response.data!;
  },

  async updateVenta(id: number, venta: Partial<VentaForm>) {
    const response = await apiService.put(`/ventas/${id}`, venta);
    return response.data!;
  },

  async deleteVenta(id: number) {
    const response = await apiService.delete(`/ventas/${id}`);
    return response.data!;
  },

  async getClientes() {
    const response = await apiService.get('/ventas/clientes');
    return response.data!;
  },

  async downloadFacturaPDF(id: number): Promise<void> {
    try {
      const response = await apiService.get(`/ventas/${id}/pdf`, {
        responseType: 'blob'
      });
      
      // Crear un blob y descargarlo
      const blob = new Blob([(response as any).data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error al descargar PDF:', error);
      throw error;
    }
  }
};