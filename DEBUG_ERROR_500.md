# 🔍 Debug del Error 500

## ✅ Logs Agregados

He agregado logs detallados en `api.ts` para ayudar a diagnosticar el problema:

1. **Log de configuración inicial**: Verás `[ApiService] baseURL: ...` al cargar la página
2. **Log de errores en POST**: Verás `[ApiService] Error en POST:` con detalles completos si falla

## 🔧 Pasos para Diagnosticar

1. **Abre la consola del navegador** (F12 → Console)

2. **Recarga la página** (`Ctrl+R` o `Cmd+R`)
   - Deberías ver: `[ApiService] baseURL: /api-proxy, apiUrl: https://kardexaplicacion.up.railway.app/api, useProxy: true`

3. **Intenta hacer login**
   - Si falla, verás en la consola un error detallado con:
     - URL que se intentó llamar
     - baseURL que se está usando
     - Status code (500)
     - Mensaje de error del backend

4. **Revisa la pestaña Network** (F12 → Network)
   - Busca la petición a `/api-proxy/auth/login`
   - Revisa los headers de la petición
   - Revisa la respuesta del servidor

## 🚨 Posibles Causas

1. **El servidor Next.js necesita reiniciarse**: 
   - Detén el servidor (Ctrl+C)
   - Reinicia con `npm run dev`

2. **El proxy no está funcionando correctamente**:
   - Verifica que `.env.local` tiene la URL correcta
   - Verifica que `next.config.js` tiene la configuración de rewrites

3. **El backend está devolviendo error 500**:
   - Los logs te dirán exactamente qué error está devolviendo Railway
