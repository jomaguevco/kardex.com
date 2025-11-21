#!/bin/bash

# Script para iniciar el servidor de desarrollo local
# Conectado al backend de Railway

echo "🚀 Iniciando servidor de desarrollo local..."
echo "📡 Conectado al backend: https://kardexaplicacion.up.railway.app/api"
echo ""

# Verificar que existe .env.local
if [ ! -f .env.local ]; then
    echo "⚠️  Archivo .env.local no encontrado. Creándolo..."
    cat > .env.local << 'EOF'
# Configuración LOCAL para desarrollo
NEXT_PUBLIC_API_URL=https://kardexaplicacion.up.railway.app/api
NEXT_PUBLIC_APP_NAME=Sistema de Ventas KARDEX
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF
    echo "✅ Archivo .env.local creado"
fi

# Mostrar configuración
echo "📋 Configuración actual:"
cat .env.local | grep NEXT_PUBLIC_API_URL
echo ""

# Verificar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Iniciar servidor
echo "✅ Iniciando servidor de desarrollo..."
echo "🌐 El servidor estará disponible en: http://localhost:3000"
echo ""

npm run dev

