import apiService from './api';

export interface Cliente {
  id: number;
  codigo: string;
  nombre: string;
  tipo_documento: 'RUC' | 'DNI' | 'CE' | 'PASAPORTE';
  numero_documento: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  tipo_cliente: 'NATURAL' | 'JURIDICA';
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface CreateClienteData {
  nombre: string;
  numero_documento: string;
  tipo_documento?: 'RUC' | 'DNI' | 'CE' | 'PASAPORTE';
  direccion?: string;
  telefono?: string;
  email?: string;
  contacto?: string;
  tipo_cliente?: 'NATURAL' | 'JURIDICA';
  activo?: boolean;
}

export interface UpdateClienteData extends Partial<CreateClienteData> {}

export interface ClientesResponse {
  clientes: Cliente[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ClienteService {
  async getClientes(params?: {
    page?: number;
    limit?: number;
    search?: string;
    includeInactivos?: boolean;
  }): Promise<ClientesResponse> {
    const response = await apiService.get('/clientes', { 
      params: {
        ...params,
        includeInactivos: params?.includeInactivos ? 'true' : undefined
      }
    });
    return response.data as ClientesResponse;
  }

  async getClienteById(id: number): Promise<Cliente> {
    const response = await apiService.get(`/clientes/${id}`);
    return response.data as Cliente;
  }

  async createCliente(data: CreateClienteData): Promise<Cliente> {
    const response = await apiService.post('/clientes', data);
    return (response as any).data;
  }

  async updateCliente(id: number, data: UpdateClienteData): Promise<Cliente> {
    const response = await apiService.put(`/clientes/${id}`, data);
    return (response as any).data;
  }

  async deleteCliente(id: number): Promise<void> {
    await apiService.delete(`/clientes/${id}`);
  }

  async getClientesActivos(): Promise<Cliente[]> {
    const response = await apiService.get('/clientes/activos');
    return response.data as Cliente[];
  }
}

export const clienteService = new ClienteService();
export default clienteService;