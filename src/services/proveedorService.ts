import apiService from './api';

export interface Proveedor {
  id: number;
  codigo: string;
  nombre: string;
  tipo_documento: 'RUC' | 'DNI' | 'CE' | 'PASAPORTE';
  numero_documento: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  tipo_proveedor: 'NACIONAL' | 'INTERNACIONAL';
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CreateProveedorData {
  codigo?: string;
  nombre: string;
  tipo_documento?: 'RUC' | 'DNI' | 'CE' | 'PASAPORTE';
  numero_documento: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  tipo_proveedor?: 'NACIONAL' | 'INTERNACIONAL';
}

export interface UpdateProveedorData extends Partial<CreateProveedorData> {}

export interface ProveedoresResponse {
  proveedores: Proveedor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ProveedorService {
  async getProveedores(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ProveedoresResponse> {
    const response = await apiService.get('/proveedores', { params });
    return response.data as ProveedoresResponse;
  }

  async getProveedorById(id: number): Promise<Proveedor> {
    const response = await apiService.get(`/proveedores/${id}`);
    return (response.data as any).data;
  }

  async createProveedor(data: CreateProveedorData): Promise<Proveedor> {
    const response = await apiService.post('/proveedores', data);
    return (response.data as any).data;
  }

  async updateProveedor(id: number, data: UpdateProveedorData): Promise<Proveedor> {
    const response = await apiService.put(`/proveedores/${id}`, data);
    return (response.data as any).data;
  }

  async deleteProveedor(id: number): Promise<void> {
    await apiService.delete(`/proveedores/${id}`);
  }

  async getProveedoresActivos(): Promise<Proveedor[]> {
    const response = await apiService.get('/proveedores/activos');
    // El backend devuelve { success: true, data: proveedores }
    // apiService.get ya extrae el .data, entonces tenemos { success: true, data: proveedores }
    return (response as any)?.data || [];
  }
}

export const proveedorService = new ProveedorService();
export default proveedorService;

