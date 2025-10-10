import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

// ⚙️ Configuração Supabase
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 📦 Pasta onde os APKs serão salvos
const BUILDS_DIR = path.resolve('builds');
if (!fs.existsSync(BUILDS_DIR)) fs.mkdirSync(BUILDS_DIR);

// 🧱 Função principal de build
async function buildTenant(tenant: any) {
  console.log(chalk.blueBright(`\n🏗️  Iniciando build para: ${tenant.name} (${tenant.slug})`));

  // 1. Criar o empresa.json com dados do Supabase
  const empresaData = {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    businessType: tenant.business_type || 'Estabelecimento',
    phone: tenant.phone || '',
    logo: tenant.logo || '',
    primaryColor: tenant.primary_color || '#2563eb',
    subdomain: tenant.subdomain || tenant.slug,
    active: tenant.active,
    projectId: process.env[`EAS_PROJECT_ID_${tenant.slug.toUpperCase().replace(/-/g, '_')}`] || ''
  };

  fs.writeFileSync('empresa.json', JSON.stringify(empresaData, null, 2));
  console.log(chalk.cyan('📁 empresa.json gerado com sucesso.'));
  console.log(chalk.gray(JSON.stringify(empresaData, null, 2)));

  // 2. Criar app.json temporário (EAS CLI precisa de JSON estático)
  const appJsonContent = {
    expo: {
      name: empresaData.name,
      slug: empresaData.slug,
      version: "1.0.0",
      orientation: "portrait",
      icon: empresaData.logo || "./assets/images/icon.png",
      scheme: empresaData.slug,
      userInterfaceStyle: "automatic",
      splash: {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: empresaData.primaryColor || "#2563eb"
      },
      android: {
        package: `com.vortex.${empresaData.slug.replace(/-/g, '')}`,
        adaptiveIcon: {
          foregroundImage: empresaData.logo || "./assets/images/adaptive-icon.png",
          backgroundColor: empresaData.primaryColor || "#2563eb"
        }
      },
      ios: {
        supportsTablet: true,
        bundleIdentifier: `com.vortex.${empresaData.slug.replace(/-/g, '')}`
      },
      web: {
        bundler: "metro",
        output: "static",
        favicon: "./assets/images/favicon.png"
      },
      plugins: ["expo-router"],
      experiments: {
        typedRoutes: true
      },
      extra: {
        tenantId: empresaData.id,
        tenantSlug: empresaData.slug,
        tenantName: empresaData.name,
        primaryColor: empresaData.primaryColor || "#2563eb",
        businessType: empresaData.businessType,
        phone: empresaData.phone,
        logo: empresaData.logo,
        eas: {
          projectId: empresaData.projectId || tenant.project_id || ""
        }
      }
    }
  };

  fs.writeFileSync('app.json', JSON.stringify(appJsonContent, null, 2));
  console.log(chalk.cyan('📁 app.json temporário criado'));

  // 3. Verificar se o projeto EAS já existe e inicializar automaticamente se necessário
  console.log(chalk.yellow('\n🔧 Verificando projeto EAS...'));
  
  let projectId = empresaData.projectId || tenant.project_id;
  
  if (projectId) {
    console.log(chalk.green(`✅ Projeto EAS já configurado: ${projectId}`));
    // Atualizar app.json com o projectId
    appJsonContent.expo.extra.eas.projectId = projectId;
    fs.writeFileSync('app.json', JSON.stringify(appJsonContent, null, 2));
  } else {
    console.log(chalk.yellow('🔧 Criando projeto EAS automaticamente...'));
    
    // Usar --force para criar o projeto sem prompts
    const easInitProcess = spawn('npx', ['eas', 'init', '--force', '--non-interactive'], {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    easInitProcess.stdout?.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    easInitProcess.stderr?.on('data', (data) => {
      output += data.toString();
      process.stderr.write(data);
    });

    const initExitCode: number = await new Promise((resolve) => {
      easInitProcess.on('close', resolve);
    });

    // Extrair o projectId do output ou do app.json
    const projectIdMatch = output.match(/"projectId":\s*"([^"]+)"|projectId['":\s]+([a-f0-9-]{36})/i);
    if (projectIdMatch && (projectIdMatch[1] || projectIdMatch[2])) {
      projectId = projectIdMatch[1] || projectIdMatch[2];
      console.log(chalk.green(`✅ Projeto EAS criado: ${projectId}`));
    } else {
      // Tentar ler do app.json que o EAS acabou de atualizar
      try {
        const appJsonUpdated = JSON.parse(fs.readFileSync('app.json', 'utf-8'));
        if (appJsonUpdated.expo?.extra?.eas?.projectId) {
          projectId = appJsonUpdated.expo.extra.eas.projectId;
          console.log(chalk.green(`✅ ProjectId extraído do app.json: ${projectId}`));
        }
      } catch (err) {
        console.log(chalk.yellow('⚠️ Não foi possível ler app.json atualizado'));
        console.log(chalk.gray('Output do EAS init:'));
        console.log(output);
      }
    }

    if (!projectId) {
      if (initExitCode !== 0) {
        console.error(chalk.redBright(`❌ Falha ao inicializar EAS para ${tenant.slug}`));
        return;
      }
      console.error(chalk.redBright(`❌ ProjectId não encontrado para ${tenant.slug}`));
      return;
    }

    // Atualizar empresa.json com o projectId
    empresaData.projectId = projectId;
    fs.writeFileSync('empresa.json', JSON.stringify(empresaData, null, 2));
    console.log(chalk.cyan('📁 empresa.json atualizado com projectId'));

    // Salvar projectId no Supabase
    console.log(chalk.yellow('💾 Salvando projectId no Supabase...'));
    const { data: updateData, error: updateError } = await supabase
      .from('tenants')
      .update({ project_id: projectId })
      .eq('id', tenant.id)
      .select();

    if (updateError) {
      console.log(chalk.red(`❌ Erro ao salvar projectId no Supabase: ${updateError.message}`));
    } else if (updateData && updateData.length > 0) {
      console.log(chalk.green('✅ ProjectId salvo no Supabase com sucesso!'));
    } else {
      console.log(chalk.yellow('⚠️ Nenhum registro atualizado no Supabase'));
    }
  }

  // 3. Configurar credenciais locais (keystore)
  const keystoreDir = path.join(BUILDS_DIR, tenant.slug, 'credentials');
  const keystorePath = path.join(keystoreDir, 'keystore.jks');
  
  if (!fs.existsSync(keystoreDir)) {
    fs.mkdirSync(keystoreDir, { recursive: true });
  }

  // Gerar keystore local se não existir
  if (!fs.existsSync(keystorePath)) {
    console.log(chalk.yellow('🔐 Gerando keystore local...'));
    
    const keystorePassword = 'vortex123'; // Senha padrão para builds de desenvolvimento
    const keyAlias = tenant.slug;
    
    const keytoolProcess = spawn('keytool', [
      '-genkey',
      '-v',
      '-keystore', keystorePath,
      '-alias', keyAlias,
      '-keyalg', 'RSA',
      '-keysize', '2048',
      '-validity', '10000',
      '-storepass', keystorePassword,
      '-keypass', keystorePassword,
      '-dname', `CN=${tenant.name}, OU=Vortex, O=Vortex, L=City, ST=State, C=BR`
    ], {
      stdio: 'pipe',
      shell: true
    });

    const keytoolExitCode: number = await new Promise((resolve) => {
      keytoolProcess.on('close', resolve);
    });

    if (keytoolExitCode !== 0) {
      console.error(chalk.redBright('❌ Falha ao gerar keystore'));
      return;
    }

    console.log(chalk.green('✅ Keystore local gerado com sucesso'));
    
    // Salvar informações do keystore em um arquivo JSON para referência
    const keystoreInfo = {
      path: keystorePath,
      password: keystorePassword,
      alias: keyAlias,
      tenant: tenant.slug
    };
    
    fs.writeFileSync(
      path.join(keystoreDir, 'keystore-info.json'),
      JSON.stringify(keystoreInfo, null, 2)
    );
  }

  // 4. Criar credentials.json para o EAS usar credenciais locais
  const credentialsJson = {
    android: {
      keystore: {
        keystorePath: keystorePath,
        keystorePassword: 'vortex123',
        keyAlias: tenant.slug,
        keyPassword: 'vortex123'
      }
    }
  };

  fs.writeFileSync('credentials.json', JSON.stringify(credentialsJson, null, 2));
  console.log(chalk.cyan('📁 credentials.json criado'));

  // 5. Submeter build LOCAL para EAS
  console.log(chalk.yellow('⚙️ Iniciando build LOCAL com EAS...'));
  console.log(chalk.gray(`> Executando: npx eas build --platform android --local --non-interactive --profile production\n`));

  const buildProcess = spawn('npx', [
    'eas', 'build',
    '--platform', 'android',
    '--local',
    '--non-interactive',
    '--profile', 'production'
  ], {
    stdio: 'inherit',
    shell: true
  });

  const exitCode: number = await new Promise((resolve) => {
    buildProcess.on('close', resolve);
  });

  if (exitCode !== 0) {
    console.error(chalk.redBright(`❌ Build falhou para ${tenant.slug} (código ${exitCode})`));
    return;
  }

  console.log(chalk.greenBright(`✅ Build LOCAL finalizado com sucesso para ${tenant.name}!`));

  // 4. Mover o APK gerado para a pasta do tenant
  const apkPattern = /\.apk$/;
  const files = fs.readdirSync('.');
  const apkFile = files.find(f => apkPattern.test(f));

  if (apkFile) {
    const tenantBuildDir = path.join(BUILDS_DIR, tenant.slug);
    if (!fs.existsSync(tenantBuildDir)) {
      fs.mkdirSync(tenantBuildDir, { recursive: true });
    }

    const newApkPath = path.join(tenantBuildDir, `${tenant.slug}-${Date.now()}.apk`);
    fs.renameSync(apkFile, newApkPath);
    console.log(chalk.greenBright(`📦 APK movido para: ${newApkPath}`));
  } else {
    console.log(chalk.yellow('⚠️ Nenhum APK encontrado na raiz do projeto.'));
  }

  // 5. Limpar arquivos temporários
  if (fs.existsSync('empresa.json')) {
    fs.unlinkSync('empresa.json');
  }
  if (fs.existsSync('app.json')) {
    fs.unlinkSync('app.json');
  }
  if (fs.existsSync('credentials.json')) {
    fs.unlinkSync('credentials.json');
  }
}

// 🔥 Função principal com execução sequencial
async function main() {
  console.log(chalk.cyanBright('🚀 Buscando tenants ativos no Supabase...'));

  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('active', true);

  if (error) {
    console.error(chalk.red('❌ Erro ao buscar tenants:'), error.message);
    process.exit(1);
  }

  if (!tenants?.length) {
    console.log(chalk.yellow('⚠️ Nenhum tenant ativo encontrado.'));
    return;
  }

  // Verificar se arquivo de configuração existe
  if (!fs.existsSync('app.json') && !fs.existsSync('app.config.js')) {
    console.log(chalk.red('❌ Arquivo app.json ou app.config.js não encontrado.'));
    process.exit(1);
  }

  // Verificar se está logado no EAS
  console.log(chalk.yellow('\n🔧 Verificando login do EAS...'));
  const whoamiProcess = spawn('npx', ['eas', 'whoami'], {
    stdio: 'pipe',
    shell: true
  });

  const isLoggedIn: boolean = await new Promise((resolve) => {
    whoamiProcess.on('close', (code) => {
      resolve(code === 0);
    });
  });

  if (!isLoggedIn) {
    console.log(chalk.red('\n❌ Você não está logado no EAS CLI.'));
    console.log(chalk.yellow('Por favor, execute primeiro:'));
    console.log(chalk.cyan('  npx eas login\n'));
    process.exit(1);
  }

  console.log(chalk.green('✅ Login EAS verificado com sucesso!\n'));
  console.log(chalk.magentaBright(`🏗️ Iniciando builds locais para ${tenants.length} tenants...\n`));

  // Executar builds sequencialmente para evitar conflitos
  for (const tenant of tenants) {
    try {
      await buildTenant(tenant);
      console.log(chalk.green(`\n✅ Build concluído para ${tenant.name}\n`));
      console.log(chalk.gray('─'.repeat(60)));
    } catch (err) {
      console.error(chalk.red(`❌ Erro ao buildar ${tenant.slug}:`), err);
    }
  }

  console.log(chalk.greenBright('\n✨ Todos os builds foram concluídos!'));
  console.log(chalk.cyan(`\n📦 APKs salvos em: ${BUILDS_DIR}/\n`));
}

// 🏁 Executa
main();