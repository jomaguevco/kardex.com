# 🔍 Verificación del Proxy

## Pasos para Diagnosticar:

1. **Verificar que el servidor está corriendo**:
   ```bash
   lsof -ti:3000
   ```

2. **Probar el proxy directamente**:
   ```bash
   curl http://localhost:3000/api-proxy/health
   ```

3. **Probar el login con curl**:
   ```bash
   curl -X POST http://localhost:3000/api-proxy/auth/login \
     -H "Content-Type: application/json" \
     -d '{"nombre_usuario":"admin","contrasena":"admin123"}'
   ```

4. **Verificar en el navegador**:
   - Abre la consola (F12)
   - Busca logs que digan `[ApiService]`
   - Revisa la pestaña Network para ver qué URL se está llamando

## Posibles Problemas:

1. **Next.js no está cargando .env.local**: Reinicia el servidor
2. **El proxy no está funcionando correctamente**: Verifica next.config.js
3. **El backend está rechazando la petición**: Verifica los headers
