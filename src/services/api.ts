import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api',
      timeout: 30000, // 30 segundos para operaciones que pueden tomar más tiempo (crear ventas con múltiples productos)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        // Solo cerrar sesión si es un 401/403 y no es un error de validación
        // Evitar cerrar sesión en errores temporales o de validación
        if (error.response?.status === 401 || error.response?.status === 403) {
          const errorMessage = error.response?.data?.message || '';
          
          // No cerrar sesión si es un error de validación o datos inválidos
          const esErrorValidacion = 
            errorMessage.includes('requerido') ||
            (errorMessage.includes('inválido') && !errorMessage.includes('Token')) ||
            errorMessage.includes('insuficiente') ||
            errorMessage.includes('stock') ||
            errorMessage.includes('Producto') ||
            errorMessage.includes('No encontrado') ||
            (error.response?.status === 403 && errorMessage.includes('Permisos'));
          
          if (esErrorValidacion) {
            // Solo mostrar el error sin cerrar sesión
            return Promise.reject(error);
          }
          
          // Solo cerrar sesión si es un problema de token claramente identificado
          const esErrorToken = 
            errorMessage.includes('Token') ||
            errorMessage.includes('acceso requerido') ||
            errorMessage.includes('Autenticación requerida') ||
            (error.response?.status === 401 && !esErrorValidacion);
          
          if (esErrorToken) {
            console.error('Error de autenticación:', errorMessage);
            
            // Dar un pequeño delay para evitar cerrar sesión inmediatamente
            setTimeout(() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('permisos');
                
                // Solo redirigir si no estamos ya en la página de login
                if (window.location.pathname !== '/') {
                  window.location.href = '/';
                }
              }
            }, 100);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T> | any> {
    const response = await this.api.get(url, config);
    // Si es blob, retornar la respuesta completa
    if (config?.responseType === 'blob') {
      return response;
    }
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.delete(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.api.patch(url, data, config);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;

