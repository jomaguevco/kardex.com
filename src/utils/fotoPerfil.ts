/**
 * Helper para construir URLs de fotos de perfil
 * Centraliza la lógica de construcción de URLs para evitar inconsistencias
 */

/**
 * Obtiene la URL base del API
 */
const getApiBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';
  return apiUrl.replace(/\/api\/?$/, '') || 'http://localhost:4001';
};

/**
 * Construye la URL completa de una foto de perfil
 * @param fotoPerfil - Ruta relativa de la foto (ej: /uploads/perfiles/perfil-123.jpg)
 * @param useCacheBusting - Si es true, agrega un parámetro de cache-busting (default: true)
 * @returns URL completa de la foto o null si no hay foto
 */
export const getFotoPerfilUrl = (
  fotoPerfil: string | null | undefined,
  useCacheBusting: boolean = true
): string | null => {
  if (!fotoPerfil) return null;

  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  let url = fotoPerfil;

  // Si ya es una URL completa (http/https), usarla directamente
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Forzar https si la app está en https
    if (url.startsWith('http://') && typeof window !== 'undefined' && window.location.protocol === 'https:') {
      url = url.replace(/^http:\/\//, 'https://');
    }
  } else {
    // Construir URL relativa
    const path = url.startsWith('/') ? url : `/${url}`;
    url = `${baseUrl}${path}`;
  }

  // Cache-busting para evitar imágenes viejas en CDN/navegador
  if (useCacheBusting) {
    const cacheBuster = `v=${Date.now()}`;
    url += url.includes('?') ? `&${cacheBuster}` : `?${cacheBuster}`;
  }

  return url;
};

/**
 * Obtiene la URL base del API (exportada para uso en otros lugares si es necesario)
 */
export { getApiBaseUrl };

