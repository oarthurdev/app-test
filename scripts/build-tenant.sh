
#!/bin/bash

# Script para fazer build de um tenant específico

if [ -z "$1" ]; then
  echo "❌ Uso: ./scripts/build-tenant.sh <tenant-slug> [platform]"
  echo "Exemplo: ./scripts/build-tenant.sh barbearia-central android"
  exit 1
fi

TENANT_SLUG=$1
PLATFORM=${2:-all}
BUILD_DIR="./builds/$TENANT_SLUG"

if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ Diretório não encontrado: $BUILD_DIR"
  echo "Execute primeiro: npm run generate-builds"
  exit 1
fi

echo "🚀 Iniciando build para: $TENANT_SLUG"
echo "📱 Plataforma: $PLATFORM"

# Copiar app.json para raiz
cp "$BUILD_DIR/app.json" ./app.json

# Executar build
echo "📦 Executando EAS Build..."
eas build --platform $PLATFORM --profile preview --non-interactive

echo "✅ Build concluído!"
