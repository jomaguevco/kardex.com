import api from '@/services/api';

export interface OAuthStatus {
  google: { enabled: boolean; name: string };
  microsoft: { enabled: boolean; name: string };
}

export interface OAuthLoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    nombre_usuario: string;
    nombre_completo: string;
    email: string;
    telefono?: string;
    rol: string;
    foto_perfil?: string;
    proveedor_oauth?: string;
  };
}

export const oauthService = {
  // Verificar qué proveedores están habilitados
  getStatus: async (): Promise<{ providers: OAuthStatus }> => {
    const response = await api.get('/oauth/status');
    // api.get() ya devuelve response.data de axios
    return response;
  },

  // Login con token OAuth (para Google Sign-In del lado del cliente)
  loginWithToken: async (data: {
    provider: string;
    token: string;
    email: string;
    name: string;
    picture?: string;
    oauth_id: string;
  }): Promise<OAuthLoginResponse> => {
    const response = await api.post('/oauth/token', data);
    // api.post() ya devuelve response.data de axios
    return response;
  },

  // Vincular cuenta OAuth a usuario existente
  linkAccount: async (data: {
    provider: string;
    oauth_id: string;
    email: string;
    foto_perfil?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/oauth/link', data);
    return response;
  },

  // Desvincular cuenta OAuth
  unlinkAccount: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete('/oauth/unlink');
    return response;
  },

  // URL para iniciar autenticación OAuth del lado del servidor
  getGoogleAuthUrl: (): string => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';
    return `${backendUrl}/api/oauth/google`;
  }
};

export default oauthService;

