import api from './api';
import { Usuario } from '@/types';

class UsuarioService {
  async actualizarPerfil(data: {
    nombre_completo: string;
    email?: string;
    telefono?: string;
  }): Promise<Usuario> {
    const response = await api.put<Usuario>('/auth/perfil', data);
    return (response as any)?.data || response;
  }

  async cambiarContrasena(data: {
    contrasena_actual: string;
    nueva_contrasena: string;
  }): Promise<void> {
    await api.post('/auth/change-password', data);
  }

  async uploadFoto(file: File): Promise<{ foto_perfil: string }> {
    const formData = new FormData();
    formData.append('foto', file);

    // No establecer Content-Type manualmente - axios lo hace automáticamente con el boundary correcto
    const response = await api.post<{ foto_perfil: string }>('/auth/upload-foto', formData);

    return (response as any)?.data || response;
  }

  async eliminarFoto(): Promise<{ foto_perfil: null }> {
    const response = await api.delete<{ foto_perfil: null }>('/auth/eliminar-foto');
    return (response as any)?.data || response;
  }

  async actualizarPreferencias(preferencias: any): Promise<void> {
    await api.put('/auth/preferencias', { preferencias });
  }
}

export default new UsuarioService();

