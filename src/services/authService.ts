import apiService from './api';

export const authService = {
  async login(nombre_usuario: string, contrasena: string) {
    const response = await apiService.post('/auth/login', { nombre_usuario, contrasena });
    return response;
  },

  async register(userData: { nombre_usuario: string; nombre_completo: string; email: string; contrasena: string; rol?: string }) {
    const response = await apiService.post('/auth/register', userData);
    return response;
  },

  async getProfile() {
    const response = await apiService.get('/auth/profile');
    return response;
  },

  async requestPasswordReset(email?: string, nombre_usuario?: string) {
    const response = await apiService.post('/auth/forgot-password', { email, nombre_usuario });
    return response;
  },

  async resetPassword(token: string, nueva_contrasena: string) {
    const response = await apiService.post('/auth/reset-password', { token, nueva_contrasena });
    return response;
  },

  async changePassword(contrasena_actual: string, nueva_contrasena: string) {
    const response = await apiService.post('/auth/change-password', { contrasena_actual, nueva_contrasena });
    return response;
  }
};