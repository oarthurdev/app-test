
# Sistema de Builds Multi-Tenant com Supabase

Este sistema permite gerar builds APK customizados **localmente** para cada tenant (estabelecimento) cadastrado no Supabase.

## 📋 Como Funciona

O sistema busca automaticamente todos os tenants ativos no Supabase e gera builds APK locais para cada um, com:
- Nome personalizado
- Logo própria (se configurada)
- Cor primária customizada
- Package ID único baseado no slug
- Configurações específicas de cada empresa

## 🚀 Pré-requisitos

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Preencha as variáveis do Supabase:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
```

### 2. Estrutura da Tabela Tenants

Certifique-se que a tabela `tenants` no Supabase possui os campos:

- `id` (integer)
- `name` (text) - Nome do estabelecimento
- `slug` (text) - Identificador único
- `business_type` (text, nullable) - Tipo de negócio
- `phone` (text, nullable) - Telefone
- `logo` (text, nullable) - URL do logo
- `primary_color` (text, nullable) - Cor primária (#hex)
- `subdomain` (text, nullable) - Subdomínio
- `active` (boolean) - Se está ativo

### 3. Instalar Dependências

```bash
npm install @supabase/supabase-js chalk
```

## 🏗️ Como Fazer os Builds

### Opção 1: Build de Todos os Tenants Ativos

```bash
npm run build-tenants
```

Este comando irá:
1. Buscar todos os tenants ativos no Supabase
2. Para cada tenant:
   - Gerar `empresa.json` com os dados
   - Executar `eas build --local` para Android
   - Salvar o APK em `builds/{slug}/`

### Opção 2: Build Manual de um Tenant Específico

```bash
# 1. Buscar dados do tenant no Supabase manualmente
# 2. Criar empresa.json com os dados
# 3. Executar:
npx eas build --platform android --local --profile production
```

## 📦 Estrutura de Saída

```
builds/
├── barbearia-central/
│   ├── barbearia-central-1234567890.apk
│   └── barbearia-central-1234567891.apk
├── salao-beleza/
│   ├── salao-beleza-1234567892.apk
│   └── ...
└── ...
```

## 🎨 Customização Automática

Para cada tenant, o build aplica automaticamente:

- **Nome do App**: `tenant.name`
- **Package ID Android**: `com.vortex.{slug}` (ex: `com.vortex.barbeariacentral`)
- **Bundle ID iOS**: `com.vortex.{slug}`
- **Cor Primária**: `tenant.primary_color` (aplicada no splash e ícone adaptativo)
- **Logo**: `tenant.logo` (se disponível)

## ⚙️ Configuração de Build (eas.json)

O arquivo `eas.json` possui os perfis:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

## 🔄 Workflow Completo

1. **Cadastrar novo tenant no Supabase**
   - Preencher nome, slug, cor primária, etc.
   - Marcar como `active = true`

2. **Executar script de build**
   ```bash
   npm run build-tenants
   ```

3. **Aguardar conclusão**
   - O script processa cada tenant sequencialmente
   - APKs são salvos automaticamente

4. **Distribuir os APKs**
   - Encontre os APKs em `builds/{slug}/`
   - Distribua para os clientes

## 🛠️ Troubleshooting

### Erro: "SUPABASE_URL must be set"
Configure as variáveis de ambiente no `.env`

### Build falha com erro de permissão
Execute: `chmod +x gradlew`

### APK não encontrado após build
Verifique os logs do EAS Build para erros

### Cores não aplicadas
Verifique se o campo `primary_color` está preenchido no formato `#RRGGBB`

## 📝 Scripts Disponíveis

```json
{
  "build-tenants": "tsx scripts/build-tenant.ts",
  "generate-builds": "tsx scripts/generate-tenant-builds.ts"
}
```

## 🔐 Segurança

- As variáveis de ambiente não devem ser commitadas
- Use `.env.example` como template
- Mantenha as chaves do Supabase seguras

## 📱 Próximos Passos

1. Configurar EAS Project IDs individuais (opcional)
2. Implementar versionamento automático
3. Adicionar suporte para builds iOS
4. Implementar upload automático para Play Store
