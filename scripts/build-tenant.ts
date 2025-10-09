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

// 🔁 Intervalo de checagem (30 segundos)
const POLL_INTERVAL = 30_000;

// 🧠 Função para buscar status do build via API Expo
async function getBuildStatus(buildId: string) {
  const res = await fetch(`https://api.expo.dev/v2/builds/${buildId}`);
  if (!res.ok) throw new Error(`Erro ao consultar status do build ${buildId}`);
  return await res.json();
}

// 🧱 Função principal de build
async function buildTenant(tenant: any) {
  console.log(chalk.blueBright(`\n🏗️  Iniciando build para: ${tenant.name} (${tenant.slug})`));

  // 1. Criar o empresa.json
  fs.writeFileSync('empresa.json', JSON.stringify(tenant, null, 2));
  console.log(chalk.cyan('📁 empresa.json gerado com sucesso.'));

  // 2. Submeter build para EAS
  console.log(chalk.yellow('⚙️ Submetendo build para EAS...'));
  console.log(chalk.gray(`> Executando: npx eas build --platform android --local --non-interactive --profile production --json\n`));

  const buildProcess = spawn('npx', [
    'eas', 'build',
    '--platform', 'android',
    '--local',
    '--non-interactive',
    '--profile', 'production',
    '--json'
  ]);

  // Exibir saída em tempo real
  buildProcess.stdout.on('data', (data) => {
    const text = data.toString();
    if (text.includes('✔')) console.log(chalk.green(text.trim()));
    else if (text.includes('✖') || text.includes('Error')) console.log(chalk.red(text.trim()));
    else if (text.includes('›') || text.includes('⠋') || text.includes('RUN_GRADLEW'))
      console.log(chalk.gray(text.trim()));
    else
      console.log(text.trim());
  });

  buildProcess.stderr.on('data', (data) => {
    console.error(chalk.redBright(data.toString().trim()));
  });

  const exitCode: number = await new Promise((resolve) => {
    buildProcess.on('close', resolve);
  });

  if (exitCode !== 0) {
    console.error(chalk.redBright(`❌ Build falhou para ${tenant.slug} (código ${exitCode})`));
    return;
  }

  console.log(chalk.greenBright('✅ EAS Build finalizado com sucesso (fase local concluída)!'));

  // 3. Captura o ID do build (se existir)
  let buildId: string | undefined;
  try {
    const resultPath = path.resolve('build-result.json');
    if (fs.existsSync(resultPath)) {
      const resultData = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
      buildId = resultData.id;
    }

    if (buildId) {
      console.log(chalk.greenBright(`🚀 Build submetido com sucesso!`));
      console.log(chalk.gray(`🔗 https://expo.dev/builds/${buildId}`));
    } else {
      console.log(chalk.yellow('⚠️ Nenhum ID de build encontrado (modo local).'));
    }
  } catch (err) {
    console.error(chalk.red('❌ Falha ao interpretar saída do EAS CLI:'), err);
  }

  // 4. Polling (caso remoto)
  if (buildId) {
    let status = 'queued';
    while (status !== 'finished' && status !== 'errored' && status !== 'canceled') {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL));

      try {
        const data = await getBuildStatus(buildId!);
        status = data.status;
        const emoji =
          status === 'finished' ? '✅' :
          status === 'errored' ? '❌' :
          status === 'canceled' ? '⚠️' : '⏳';
        console.log(chalk.magenta(`[${new Date().toLocaleTimeString()}] ${emoji} [${tenant.slug}] Status: ${status}`));
      } catch (err) {
        console.error(chalk.red(`⚠️ Erro ao verificar status de ${tenant.slug}:`), err);
      }
    }

    if (status === 'finished') {
      console.log(chalk.greenBright(`✅ Build finalizado para ${tenant.name}!`));
    } else {
      console.error(chalk.redBright(`❌ Build ${tenant.slug} falhou ou foi cancelado.`));
    }
  }
}

// 🔥 Função principal com paralelismo controlado
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

  console.log(chalk.magentaBright(`\n🏗️ Iniciando builds para ${tenants.length} tenants...\n`));

  const CONCURRENCY = 2;
  const activeQueue: Promise<void>[] = [];

  for (const tenant of tenants) {
    if (activeQueue.length >= CONCURRENCY) await Promise.race(activeQueue);

    const p = buildTenant(tenant)
      .catch((err) => console.error(chalk.red(`❌ Erro ao buildar ${tenant.slug}:`), err))
      .finally(() => {
        const i = activeQueue.indexOf(p);
        if (i !== -1) activeQueue.splice(i, 1);
      });

    activeQueue.push(p);
  }

  await Promise.allSettled(activeQueue);
  console.log(chalk.greenBright('\n✅ Todos os builds foram concluídos!'));
}

// 🏁 Executa
main();
