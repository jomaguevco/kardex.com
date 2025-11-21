# 🚀 Instrucciones para Desarrollo Local

## ⚠️ IMPORTANTE: Reiniciar el servidor

Si ya tienes el servidor corriendo (`npm run dev`), **DEBES REINICIARLO** para que cargue el archivo `.env.local`.

## 📋 Pasos para iniciar:

1. **Detener el servidor actual** (si está corriendo):
   - Presiona `Ctrl + C` en la terminal donde está corriendo `npm run dev`
   - O ejecuta: `lsof -ti:3000 | xargs kill -9`

2. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador**:
   - El servidor estará en: `http://localhost:3000`
   - Se conectará automáticamente al backend de Railway

## ✅ Verificación

El archivo `.env.local` ya está configurado con:
- **Backend**: `https://kardexaplicacion.up.railway.app/api`
- **Estado**: En `.gitignore` (no afecta despliegues)

## 🔄 Hot Reload

Una vez iniciado, los cambios en el código se verán automáticamente en tiempo real.

## ❌ Si aún no funciona

1. Verifica que el archivo `.env.local` existe
2. Reinicia completamente el servidor (detén y vuelve a iniciar)
3. Verifica en la consola del navegador si hay errores de CORS o conexión
