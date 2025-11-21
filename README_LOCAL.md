# 🚀 Desarrollo Local con Backend de Railway

Este proyecto está configurado para permitir desarrollo local conectado al backend de Railway sin afectar los despliegues de producción.

## ⚙️ Configuración Local

### 1. Archivo `.env.local`

Ya está creado el archivo `.env.local` que apunta al backend de Railway:
- **URL del Backend**: `https://kardexaplicacion.up.railway.app/api`
- **Estado**: Este archivo está en `.gitignore`, por lo que NO se sube al repositorio
- **Efecto**: Solo afecta el entorno local de desarrollo

### 2. Iniciar el servidor de desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000` y se conectará automáticamente al backend de Railway.

## 🔄 Hot Reload / Cambios en Tiempo Real

Next.js incluye hot reload automático. Cualquier cambio que hagas en el código se reflejará inmediatamente en el navegador sin necesidad de reiniciar el servidor.

## 🎯 Ventajas de esta configuración

✅ **No afecta despliegues**: El archivo `.env.local` está en `.gitignore`
✅ **Conexión directa**: Se conecta al backend real de Railway
✅ **Desarrollo rápido**: Hot reload automático con Next.js
✅ **Independiente**: Los despliegues en Vercel usan sus propias variables de entorno

## 📝 Notas Importantes

- El archivo `.env.local` es solo para desarrollo local
- Los despliegues en Vercel usan las variables de entorno configuradas en el dashboard de Vercel
- Si necesitas cambiar la URL del backend local, edita `.env.local`
- Si quieres usar un backend local, cambia `NEXT_PUBLIC_API_URL` en `.env.local` a `http://localhost:4001/api`

## 🔧 Troubleshooting

Si el frontend no se conecta al backend:
1. Verifica que el archivo `.env.local` existe
2. Verifica que la URL del backend es correcta
3. Verifica que el backend de Railway esté funcionando
4. Reinicia el servidor de desarrollo (`npm run dev`)

