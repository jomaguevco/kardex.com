import api from '@/lib/api';

export interface Resena {
  id: number;
  producto_id: number;
  usuario_id: number;
  puntuacion: number;
  comentario?: string;
  fecha_creacion: string;
  usuario?: {
    id: number;
    nombre_completo: string;
    foto_perfil?: string;
  };
}

export interface EstadisticasResenas {
  promedio: number;
  totalResenas: number;
  distribucion: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ResenasPaginadas {
  data: Resena[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  estadisticas: EstadisticasResenas;
}

export const resenaService = {
  // Obtener reseñas de un producto
  getResenasPorProducto: async (productoId: number, page = 1, limit = 10): Promise<ResenasPaginadas> => {
    const response = await api.get(`/resenas/producto/${productoId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Crear o actualizar reseña
  crearResena: async (data: { producto_id: number; puntuacion: number; comentario?: string }): Promise<Resena> => {
    const response = await api.post('/resenas', data);
    return response.data.data;
  },

  // Obtener mi reseña para un producto
  getMiResena: async (productoId: number): Promise<Resena | null> => {
    const response = await api.get(`/resenas/mi-resena/${productoId}`);
    return response.data.data;
  },

  // Eliminar reseña
  eliminarResena: async (id: number): Promise<void> => {
    await api.delete(`/resenas/${id}`);
  }
};

export default resenaService;

