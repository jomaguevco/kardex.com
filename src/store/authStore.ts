import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario } from '@/types';
import { authService } from '@/services/authService';

interface AuthState {
  user: Usuario | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (nombre_usuario: string, contrasena: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setUser: (user: Usuario) => void;
  setToken: (token: string) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      // Actions
      login: async (nombre_usuario: string, contrasena: string) => {
        set({ isLoading: true, error: null });
        
        // Timeout para evitar que se quede colgado
        const timeoutId = setTimeout(() => {
          set({ 
            error: 'Tiempo de espera agotado. Intenta nuevamente.',
            isLoading: false 
          });
        }, 10000); // 10 segundos timeout
        
        try {
          const response = await authService.login(nombre_usuario, contrasena);
          clearTimeout(timeoutId);
          
          if (response.success) {
            set({
              user: (response.data as any).user,
              token: (response.data as any).token,
              isAuthenticated: true,
              isLoading: false
            });
            
            // Guardar manualmente en localStorage para asegurar persistencia
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', (response.data as any).token);
              localStorage.setItem('user', JSON.stringify((response.data as any).user));
            }
          } else {
            // Si la respuesta no es exitosa, resetear loading
            set({ 
              error: response.message || 'Error al iniciar sesión',
              isLoading: false 
            });
            throw new Error(response.message || 'Error al iniciar sesión');
          }
        } catch (error: any) {
          clearTimeout(timeoutId);
          set({ 
            error: error.response?.data?.message || error.message || 'Error al iniciar sesión',
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
        
        // Limpiar localStorage solo en el cliente
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      },

      checkAuth: async () => {
        // Verificar si estamos en el cliente
        if (typeof window === 'undefined') {
          return;
        }
        
        // Evitar múltiples llamadas simultáneas
        if (get().isLoading) {
          return;
        }
        
        set({ isLoading: true });
        
        // Verificar si ya tenemos datos en el store (de Zustand persist)
        const currentState = get();
        if (currentState.user && currentState.token && currentState.isAuthenticated) {
          // Sincronizar con localStorage si no está presente
          if (!localStorage.getItem('token') || !localStorage.getItem('user')) {
            localStorage.setItem('token', currentState.token);
            localStorage.setItem('user', JSON.stringify(currentState.user));
          }
          set({ isLoading: false });
          return;
        }
        
        // Si no hay datos en el store, verificar localStorage
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            // Token inválido, limpiar estado
            get().logout();
            set({ isLoading: false });
          }
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setUser: (user: Usuario) => {
        set({ user });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
      },

      setToken: (token: string) => {
        set({ token });
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);