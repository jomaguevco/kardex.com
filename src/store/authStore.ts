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
  permisos: any | null;
}

interface AuthActions {
  login: (nombre_usuario: string, contrasena: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setUser: (user: Usuario) => void;
  setToken: (token: string) => void;
  getRedirectPath: () => string;
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
      permisos: null,

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
            const { user, token, permisos } = response.data as any;
            
            set({
              user,
              token,
              permisos: permisos || null,
              isAuthenticated: true,
              isLoading: false
            });
            
            // Guardar manualmente en localStorage para asegurar persistencia
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', token);
              localStorage.setItem('user', JSON.stringify(user));
              if (permisos) {
                localStorage.setItem('permisos', JSON.stringify(permisos));
              }
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
          permisos: null,
          isAuthenticated: false,
          error: null
        });
        
        // Limpiar localStorage solo en el cliente
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('permisos');
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
      },

      // Obtener ruta de redirección según rol
      getRedirectPath: () => {
        const { user } = get();
        if (!user || !user.rol) return '/';

        switch (user.rol) {
          case 'ADMINISTRADOR':
            return '/dashboard';
          case 'VENDEDOR':
            return '/ventas';
          case 'CLIENTE':
            return '/cliente-portal';
          case 'ALMACENERO':
            return '/kardex';
          case 'CONTADOR':
            return '/reportes';
          default:
            return '/dashboard';
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        permisos: state.permisos,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);