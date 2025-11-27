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
      // Importar axios dinámicamente
      const axios = (await import('axios')).default;
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
      
      const response = await axios.get(`${apiUrl}/ventas/${id}/pdf`, {
        responseType: 'blob',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        timeout: 30000
      });
      
      // Verificar que la respuesta sea un blob válido
      if (!response || !response.data) {
        throw new Error('No se recibió un PDF válido del servidor');
      }
      
      // Verificar que el blob no esté vacío
      if (response.data.size === 0) {
        throw new Error('El PDF recibido está vacío');
      }
      
      // Verificar que sea un PDF válido leyendo los primeros bytes
      const firstBytes = await response.data.slice(0, 4).arrayBuffer();
      const uint8Array = new Uint8Array(firstBytes);
      const header = String.fromCharCode(...uint8Array);
      
      if (header !== '%PDF') {
        // Si no es un PDF válido, puede ser un JSON con error
        const text = await response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Error al generar el PDF');
        } catch {
          throw new Error('El archivo recibido no es un PDF válido');
        }
      }
      
      // Crear un blob y descargarlo
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
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