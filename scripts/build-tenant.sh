
#!/bin/bash

# Script para fazer build de um tenant específico
# Uso: npm run build-tenant <slug-do-tenant>

if [ -z "$1" ]; then
  echo "❌ Erro: Especifique o slug do tenant"
  echo "Uso: npm run build-tenant <slug-do-tenant>"
  exit 1
fi

TENANT_SLUG=$1
TENANT_DIR="builds/$TENANT_SLUG"
PROJECT_ROOT=$(pwd)

if [ ! -d "$TENANT_DIR" ]; then
  echo "❌ Erro: Diretório do tenant não encontrado: $TENANT_DIR"
  echo "Execute primeiro: npm run generate-builds"
  exit 1
fi

echo "🚀 Preparando build para: $TENANT_SLUG"

# Criar diretório temporário de build
BUILD_DIR="$TENANT_DIR/build_temp"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

echo "📦 Copiando arquivos do projeto..."

# Copiar estrutura do projeto
cp -r "$PROJECT_ROOT/app" "$BUILD_DIR/"
cp -r "$PROJECT_ROOT/assets" "$BUILD_DIR/"
cp -r "$PROJECT_ROOT/components" "$BUILD_DIR/"
cp -r "$PROJECT_ROOT/constants" "$BUILD_DIR/"
cp -r "$PROJECT_ROOT/contexts" "$BUILD_DIR/"
cp -r "$PROJECT_ROOT/hooks" "$BUILD_DIR/"
cp -r "$PROJECT_ROOT/shared" "$BUILD_DIR/"

# Copiar arquivos de configuração
cp "$PROJECT_ROOT/package.json" "$BUILD_DIR/"
cp "$PROJECT_ROOT/tsconfig.json" "$BUILD_DIR/"
cp "$PROJECT_ROOT/metro.config.js" "$BUILD_DIR/"
cp "$PROJECT_ROOT/babel.config.js" "$BUILD_DIR/"

# Copiar configurações específicas do tenant
cp "$TENANT_DIR/app.json" "$BUILD_DIR/"
cp "$TENANT_DIR/app.config.js" "$BUILD_DIR/"

# Copiar eas.json se existir
if [ -f "$TENANT_DIR/eas.json" ]; then
  cp "$TENANT_DIR/eas.json" "$BUILD_DIR/"
else
  cp "$PROJECT_ROOT/eas.json" "$BUILD_DIR/"
fi

echo "✅ Arquivos copiados com sucesso!"
echo ""
echo "📍 Diretório de build: $BUILD_DIR"
echo ""
echo "Para fazer o build EAS:"
echo "  cd $BUILD_DIR"
echo "  npm install"
echo "  eas build --platform android --profile preview"
