import apiService from './api';
import { MonitoreoTransaccion } from '@/types';

export const monitorService = {
  async getTransacciones(limit = 10) {
    const response = await apiService.get<{ data: MonitoreoTransaccion[] }>(`/monitor-transacciones`, {
      params: { limit }
    });

    if ((response as any)?.data) {
      return (response as any).data as MonitoreoTransaccion[];
    }

    return response as unknown as MonitoreoTransaccion[];
  }
};

export default monitorService;

