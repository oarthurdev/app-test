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

  // 2. Inicializar EAS para o tenant (se necessário)
  console.log(chalk.yellow('\n🔧 Inicializando projeto EAS...'));
  
  const easInitProcess = spawn('npx', ['eas', 'init', '--force'], {
    stdio: 'inherit',
    shell: true
  });

  const initExitCode: number = await new Promise((resolve) => {
    easInitProcess.on('close', resolve);
  });

  if (initExitCode !== 0) {
    console.error(chalk.redBright(`❌ Falha ao inicializar EAS para ${tenant.slug}`));
    return;
  }

  console.log(chalk.green('✅ EAS inicializado com sucesso!\n'));

  // 3. Submeter build LOCAL para EAS
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

  // 5. Limpar empresa.json
  if (fs.existsSync('empresa.json')) {
    fs.unlinkSync('empresa.json');
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