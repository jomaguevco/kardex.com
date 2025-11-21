import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    // En desarrollo local, usar proxy si la URL es de Railway (para evitar CORS)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
    
    // Detectar si estamos en el navegador (cliente)
    const isClient = typeof window !== 'undefined';
    
    // Detectar si la URL apunta a Railway
    const isRailwayBackend = apiUrl.includes('railway.app');
    
    // Usar proxy si estamos en el cliente (navegador) y la URL es de Railway
    // Esto evita problemas de CORS porque Next.js hace el proxy desde el servidor
    const useProxy = isClient && isRailwayBackend;
    
    const baseURL = useProxy 
      ? '/api-proxy' // Usar proxy para evitar CORS en desarrollo local
      : apiUrl;
    
    // Log para debugging (solo en desarrollo)
    if (isClient && process.env.NODE_ENV === 'development') {
      console.log(`[ApiService] baseURL: ${baseURL}, apiUrl: ${apiUrl}, useProxy: ${useProxy}`);
    }
    
    this.api = axios.create({
      baseURL,
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
        // Log de petición en desarrollo
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log('[ApiService] Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`,
            data: config.data
          });
        }
        
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
    try {
      const response = await this.api.get(url, config);
      // Si es blob, retornar la respuesta completa
      if (config?.responseType === 'blob') {
        return response;
      }
      return response.data;
    } catch (error: any) {
      // Log detallado para debugging
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.error('[ApiService] Error en GET:', {
          url,
          baseURL: this.api.defaults.baseURL,
          error: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      throw error;
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post(url, data, config);
      return response.data;
    } catch (error: any) {
      // Log detallado para debugging
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.error('[ApiService] Error en POST:', url);
        console.error('[ApiService] baseURL:', this.api.defaults.baseURL);
        console.error('[ApiService] Error completo:', error);
        console.error('[ApiService] Status:', error.response?.status);
        console.error('[ApiService] Status Text:', error.response?.statusText);
        console.error('[ApiService] Response Data:', JSON.stringify(error.response?.data, null, 2));
        if (error.response?.data) {
          console.error('[ApiService] Response Data (parsed):', error.response.data);
        }
        console.error('[ApiService] Request URL:', error.config?.url);
        console.error('[ApiService] Request Method:', error.config?.method);
        console.error('[ApiService] Request Data:', error.config?.data);
      }
      throw error;
    }
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

