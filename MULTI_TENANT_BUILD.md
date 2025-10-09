
# Sistema de Builds Multi-Tenant

Este sistema permite gerar builds customizados para cada tenant (estabelecimento) cadastrado no sistema.

## 📋 Estrutura

Cada tenant terá seu próprio app customizado com:
- Nome personalizado
- Logo própria
- Cor primária customizada
- Package/Bundle ID único
- Configurações específicas

## 🚀 Como Usar

### 1. Adicionar Cor Primária aos Tenants

Primeiro, execute a migration para adicionar o campo `primary_color`:

```bash
npm run db:push
```

### 2. Atualizar Tenants no Banco

Adicione cores primárias aos seus tenants:

```sql
UPDATE tenants SET primary_color = '#FF5733' WHERE slug = 'barbearia-central';
UPDATE tenants SET primary_color = '#33FF57' WHERE slug = 'salao-beleza';
```

### 3. Gerar Configurações de Build

Execute o script para gerar as configurações:

```bash
npm run generate-builds
```

Este comando irá:
- Criar uma pasta `builds/` na raiz do projeto
- Para cada tenant ativo, criar um subdiretório com:
  - `app.json` - Configuração customizada do Expo
  - `theme.ts` - Configurações de tema
  - `build-commands.txt` - Comandos de build
  - `README.md` - Instruções específicas

### 4. Configurar Projeto EAS para Cada Tenant

Para cada tenant, você precisa criar um projeto EAS separado:

```bash
cd builds/barbearia-central
eas init
```

Anote o Project ID gerado e adicione ao `.env`:

```
EAS_PROJECT_ID_BARBEARIA_CENTRAL=seu-project-id-aqui
EAS_PROJECT_ID_SALAO_BELEZA=outro-project-id-aqui
```

### 5. Fazer o Build

Para fazer o build de um tenant específico:

```bash
npm run build-tenant barbearia-central android
```

Ou manualmente:

```bash
cd builds/barbearia-central
cp app.json ../../app.json
eas build --platform android --profile preview
```

## 📦 Estrutura de Diretórios

```
builds/
├── barbearia-central/
│   ├── app.json
│   ├── theme.ts
│   ├── build-commands.txt
│   └── README.md
├── salao-beleza/
│   ├── app.json
│   ├── theme.ts
│   ├── build-commands.txt
│   └── README.md
└── ...
```

## 🎨 Customização de Cores

As cores são aplicadas automaticamente em:
- Splash screen background
- Ícone adaptativo (Android)
- Tema do app através do `TenantContext`

## 📱 Package/Bundle IDs

Os IDs são gerados automaticamente baseados no slug:
- **iOS**: `com.vortex.barbeariacentral`
- **Android**: `com.vortex.barbeariacentral`

## ⚙️ Profiles de Build (eas.json)

Você pode customizar os profiles de build editando `eas.json`:

```json
{
  "build": {
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

## 🔄 Workflow Recomendado

1. Cadastre um novo tenant no sistema
2. Defina nome, logo e cor primária
3. Execute `npm run generate-builds`
4. Configure o projeto EAS para o novo tenant
5. Faça o build usando `npm run build-tenant <slug> <platform>`
6. Distribua o app gerado

## 🛠️ Troubleshooting

### Build falha com "Project not configured"
Execute `eas init` no diretório do tenant.

### Cores não aplicadas
Verifique se o campo `primary_color` está preenchido no banco de dados.

### Bundle ID duplicado
Cada tenant deve ter um slug único.
