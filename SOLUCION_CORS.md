# 🔧 Solución para CORS en Desarrollo Local

## ✅ Cambios Realizados

1. **Proxy en Next.js**: Configurado un proxy en `next.config.js` que reescribe `/api-proxy/*` a la URL de Railway
2. **ApiService actualizado**: Modificado para usar el proxy automáticamente en desarrollo local cuando se detecta una URL de Railway

## 🚀 Cómo Funciona

- **En desarrollo local** (`npm run dev`):
  - Si `NEXT_PUBLIC_API_URL` apunta a Railway, las peticiones usan `/api-proxy`
  - Next.js hace el proxy al backend de Railway (evita CORS del navegador)
  
- **En producción** (Vercel):
  - Usa directamente la URL del backend configurada en variables de entorno
  - No usa proxy (el backend permite el origen de Vercel)

## 📋 Para Usar

1. **Reiniciar el servidor** (importante):
   ```bash
   # Detener el servidor actual (Ctrl + C)
   npm run dev
   ```

2. **Verificar**:
   - Abre `http://localhost:3000`
   - El estado del backend debería mostrarse correctamente

## 🔍 Si Aún No Funciona

1. Verifica que `.env.local` existe y tiene:
   ```
   NEXT_PUBLIC_API_URL=https://kardexaplicacion.up.railway.app/api
   ```

2. Asegúrate de haber reiniciado el servidor después de crear `.env.local`

3. Verifica en la consola del navegador (F12) si hay errores de red
