
import { db } from '../server/db';
import { tenants } from '../shared/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

interface TenantConfig {
  id: number;
  name: string;
  slug: string;
  businessType: string | null;
  phone: string | null;
  logo: string | null;
  primaryColor: string | null;
}

async function generateTenantBuilds() {
  console.log('🚀 Gerando configurações de builds por tenant...\n');

  // Buscar todos os tenants ativos
  const allTenants = await db.select().from(tenants).where(eq(tenants.active, true));

  if (allTenants.length === 0) {
    console.log('❌ Nenhum tenant ativo encontrado.');
    return;
  }

  console.log(`📋 Encontrados ${allTenants.length} tenants ativos:\n`);

  for (const tenant of allTenants) {
    console.log(`\n📦 Processando: ${tenant.name} (${tenant.slug})`);
    
    // Criar diretório para o tenant
    const tenantDir = path.join(process.cwd(), 'builds', tenant.slug);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    // Gerar app.json customizado
    const appConfig = {
      expo: {
        name: tenant.name,
        slug: tenant.slug,
        version: "1.0.0",
        orientation: "portrait",
        icon: tenant.logo || "./assets/images/icon.png",
        scheme: tenant.slug,
        userInterfaceStyle: "automatic",
        splash: {
          image: "./assets/images/splash-icon.png",
          resizeMode: "contain",
          backgroundColor: tenant.primaryColor || "#2563eb"
        },
        ios: {
          supportsTablet: true,
          bundleIdentifier: `com.vortex.${tenant.slug.replace(/-/g, '')}`
        },
        android: {
          adaptiveIcon: {
            foregroundImage: tenant.logo || "./assets/images/adaptive-icon.png",
            backgroundColor: tenant.primaryColor || "#2563eb"
          },
          package: `com.vortex.${tenant.slug.replace(/-/g, '')}`
        },
        web: {
          bundler: "metro",
          output: "static",
          favicon: "./assets/images/favicon.png"
        },
        plugins: [
          "expo-router"
        ],
        experiments: {
          typedRoutes: true
        },
        extra: {
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
          tenantName: tenant.name,
          primaryColor: tenant.primaryColor || "#2563eb",
          eas: {
            projectId: process.env[`EAS_PROJECT_ID_${tenant.slug.toUpperCase().replace(/-/g, '_')}`] || null
          }
        }
      }
    };

    // Salvar app.json
    const appJsonPath = path.join(tenantDir, 'app.json');
    fs.writeFileSync(appJsonPath, JSON.stringify(appConfig, null, 2));
    console.log(`  ✅ app.json gerado em: builds/${tenant.slug}/app.json`);

    // Gerar app.config.js específico para o tenant
    const appConfigJs = `module.exports = ${JSON.stringify(appConfig, null, 2)};`;
    const appConfigJsPath = path.join(tenantDir, 'app.config.js');
    fs.writeFileSync(appConfigJsPath, appConfigJs);
    console.log(`  ✅ app.config.js gerado`);

    // Gerar arquivo de configuração de tema
    const themeConfig = `
// Auto-gerado para ${tenant.name}
export const tenantTheme = {
  tenantId: ${tenant.id},
  tenantName: '${tenant.name}',
  tenantSlug: '${tenant.slug}',
  primaryColor: '${tenant.primaryColor || '#2563eb'}',
  businessType: '${tenant.businessType || 'Estabelecimento'}',
  phone: '${tenant.phone || ''}',
  logo: '${tenant.logo || ''}',
};
`;

    const themeConfigPath = path.join(tenantDir, 'theme.ts');
    fs.writeFileSync(themeConfigPath, themeConfig);
    console.log(`  ✅ theme.ts gerado`);

    // Gerar comandos EAS Build
    const buildCommands = {
      preview: `eas build --platform all --profile preview --non-interactive`,
      production: `eas build --platform all --profile production --non-interactive`
    };

    const buildScriptPath = path.join(tenantDir, 'build-commands.txt');
    fs.writeFileSync(
      buildScriptPath,
      `# Comandos de build para ${tenant.name}\n\n` +
      `# Preview Build:\n${buildCommands.preview}\n\n` +
      `# Production Build:\n${buildCommands.production}\n`
    );
    console.log(`  ✅ build-commands.txt gerado`);

    // Gerar README com instruções
    const readme = `
# Build: ${tenant.name}

## Informações
- **Nome**: ${tenant.name}
- **Slug**: ${tenant.slug}
- **Tipo**: ${tenant.businessType || 'N/A'}
- **Cor Primária**: ${tenant.primaryColor || '#2563eb'}

## Como fazer o build

### 1. Preparar o ambiente de build
\`\`\`bash
# Da raiz do projeto
npm run build-tenant ${tenant.slug}
\`\`\`

### 2. Entrar no diretório de build
\`\`\`bash
cd builds/${tenant.slug}/build_temp
\`\`\`

### 3. Instalar dependências
\`\`\`bash
npm install
\`\`\`

### 4. Inicializar projeto EAS (primeira vez)
\`\`\`bash
eas init --id YOUR_PROJECT_ID
\`\`\`

### 5. Build de Preview
\`\`\`bash
eas build --platform android --profile preview
\`\`\`

### 6. Build de Produção
\`\`\`bash
eas build --platform android --profile production
\`\`\`

## Notas importantes
- O diretório \`build_temp\` é recriado a cada execução do script de build
- As configurações específicas do tenant estão em \`app.json\` e \`app.config.js\`
- Não faça alterações diretas em \`build_temp\`, elas serão perdidas
`;

    const readmePath = path.join(tenantDir, 'README.md');
    fs.writeFileSync(readmePath, readme);
    console.log(`  ✅ README.md gerado`);

    // Gerar eas.json específico (opcional, se necessário customização)
    const easConfig = {
      "cli": {
        "version": ">= 16.20.0",
        "appVersionSource": "remote"
      },
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
      },
      "submit": {
        "production": {}
      }
    };

    const easJsonPath = path.join(tenantDir, 'eas.json');
    fs.writeFileSync(easJsonPath, JSON.stringify(easConfig, null, 2));
    console.log(`  ✅ eas.json gerado`);
  }

  console.log('\n\n✨ Processo concluído! Builds gerados em: ./builds/\n');
  console.log('📝 Próximos passos:');
  console.log('1. Para cada tenant, configure um projeto EAS separado');
  console.log('2. Adicione os IDs dos projetos no .env');
  console.log('3. Execute os comandos de build em cada diretório\n');
}

// Executar
generateTenantBuilds().catch(console.error);
