import api from './api';

export interface Notificacion {
  id: number;
  usuario_id: number;
  tipo: 'STOCK_BAJO' | 'COMPRA_PENDIENTE' | 'VENTA_PENDIENTE' | 'TRANSACCION' | 'SISTEMA';
  titulo: string;
  mensaje: string;
  leido: boolean;
  referencia_id?: number;
  referencia_tipo?: string;
  fecha_creacion: string;
}

export interface ResumenNotificaciones {
  total: number;
  noLeidas: number;
  porTipo: Array<{
    tipo: string;
    cantidad: number;
  }>;
}

class NotificacionService {
  async getNotificaciones(params?: {
    tipo?: string;
    leido?: boolean;
    limit?: number;
  }): Promise<Notificacion[]> {
    const response = await api.get<Notificacion[]>('/notificaciones', { params });
    return Array.isArray(response) ? response : (response as any)?.data || [];
  }

  async getResumen(): Promise<ResumenNotificaciones> {
    const response = await api.get<ResumenNotificaciones>('/notificaciones/resumen');
    return (response as any)?.data || response;
  }

  async marcarComoLeida(id: number): Promise<Notificacion> {
    const response = await api.put<Notificacion>(`/notificaciones/${id}/marcar-leida`);
    return (response as any)?.data || response;
  }

  async marcarTodasComoLeidas(): Promise<void> {
    await api.put('/notificaciones/marcar-todas-leidas');
  }

  async generarNotificaciones(): Promise<void> {
    await api.post('/notificaciones/generar');
  }
}

export default new NotificacionService();

