/**
 * Security Check — Fail-fast verification for CI pipeline.
 *
 * Runs static analysis and runtime checks to catch common security issues
 * before deployment. Aligned with the project's existing security patterns:
 * - NextAuth v5 session-based auth
 * - RBAC permission system (hasApiPermission)
 * - CSRF via Origin validation (with-security.ts)
 * - Rate limiting (rate-limit.ts)
 * - Zod input validation
 * - Prisma ORM (parameterized queries)
 * - ESLint security plugin
 */

/* eslint-disable no-console, security/detect-object-injection, @typescript-eslint/no-require-imports */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = path.resolve(__dirname, '..');

// ─── Helpers ────────────────────────────────────────────────────────────────

let exitCode = 0;
const errors: string[] = [];
const warnings: string[] = [];

function fail(message: string) {
  errors.push(`  ❌ ${message}`);
  exitCode = 1;
}

function warn(message: string) {
  warnings.push(`  ⚠️  ${message}`);
}

function printDivider(title: string) {
  console.log(`\n━━━ ${title} ━━━`);
}

// ─── 1. Required Environment Variables ───────────────────────────────────────

function checkRequiredEnvVars() {
  printDivider('Environment Variables');

  const required = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'OS_APPROVAL_SECRET',
  ];

  const optional = [
    'COSMOS_TOKEN',
    'WHATSAPP_BOT_TOKEN',
    'WHATSAPP_BOT_URL',
    'INTERNAL_API_URL',
  ];

  let hasMissingRequired = false;

  for (const name of required) {
    if (!process.env[name]) {
      fail(`Variável de ambiente obrigatória ausente: ${name}`);
      hasMissingRequired = true;
    }
  }

  if (hasMissingRequired) {
    console.log('  ℹ️  Verifique se o arquivo .env está presente e completo.');
  }

  for (const name of optional) {
    if (!process.env[name]) {
      warn(`Variável de ambiente opcional ausente (pode causar falha parcial): ${name}`);
    }
  }
}

// ─── 2. Secrets in Source Code ──────────────────────────────────────────────

const SECRET_PATTERNS = [
  // JWT / Auth tokens
  { pattern: /(?:JWT|TOKEN|SECRET|PASSWORD|PASSWD|API_KEY)\s*[:=]\s*['"][A-Za-z0-9_\-+./]{20,}['"]/gi, label: 'possível segredo hardcoded' },
  // Private/secret env references missing from .env
  { pattern: /process\.env\.\w*(?:SECRET|TOKEN|PASSWORD|KEY)\w*/g, label: 'variável de segredo referenciada' },
  // bcrypt salt rounds in source (should be in config)
  { pattern: /bcrypt\.genSaltSync\(\s*\d+\s*\)/g, label: 'salt rounds fixos no código (prefira config)' },
];

function checkHardcodedSecrets() {
  printDivider('Hardcoded Secrets');

  const srcDir = path.join(ROOT, 'app');
  const libDir = path.join(ROOT, 'lib');
  const dirsToScan = [srcDir, libDir];

  const ignoreFiles = [
    'node_modules',
    '.next',
    'next-env.d.ts',
  ];

  const foundSecrets: Array<{ file: string; line: number; match: string }> = [];

  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (ignoreFiles.some((ig) => entry.name.includes(ig))) continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (
        entry.isFile() &&
        (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.mjs'))
      ) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n');

        for (const { pattern, label } of SECRET_PATTERNS) {
          for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(pattern);
            if (match) {
              const relativePath = path.relative(ROOT, fullPath);
              // Ignore known safe patterns (e.g. .env.example, template files)
              if (relativePath.includes('.env') || relativePath.includes('template')) continue;
              // Ignore imports and type declarations
              if (lines[i].includes('import ') || lines[i].includes('type ')) continue;
              foundSecrets.push({ file: relativePath, line: i + 1, match: match[0].substring(0, 60) });
            }
          }
        }
      }
    }
  }

  for (const dir of dirsToScan) {
    scanDir(dir);
  }

  if (foundSecrets.length > 0) {
    for (const s of foundSecrets) {
      fail(`${s.file}:${s.line} — ${s.match}`);
    }
  } else {
    console.log('  ✅ Nenhum segredo hardcoded detectado nos arquivos de código.');
  }
}

// ─── 3. Permission Checks on API Routes ─────────────────────────────────────

function checkApiRoutePermissions() {
  printDivider('API Route Permission Checks');

  const apiDir = path.join(ROOT, 'app', 'api');
  if (!fs.existsSync(apiDir)) {
    console.log('  ℹ️  Diretório app/api não encontrado, pulando verificação.');
    return;
  }

  const routeFiles: string[] = [];

  function collectRouteFiles(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectRouteFiles(fullPath);
      } else if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
        routeFiles.push(fullPath);
      }
    }
  }

  collectRouteFiles(apiDir);

  const publicPrefixes = [
    '/api/auth/',
    '/api/public/',
    '/api/login/',
    '/api/integrations/whatsapp/',
    '/api/health',
  ];

  // Routes that should always have permission checks
  const sensitiveResources = ['credits', 'financial', 'admin', 'users', 'roles'];

  let checked = 0;
  let publicSensitiveRoutes = 0;

  for (const routeFile of routeFiles) {
    const relativePath = path.relative(ROOT, routeFile);
    const content = fs.readFileSync(routeFile, 'utf-8');

    // Skip public routes
    const isPublic = publicPrefixes.some((p) => relativePath.replace(/\\/g, '/').includes(p));
    if (isPublic) continue;

    // Check if it's a sensitive route
    const isSensitive = sensitiveResources.some((r) => relativePath.replace(/\\/g, '/').includes(r));

    // Check for auth/permission check patterns
    const hasAuthCheck =
      content.includes('checkAuth()') ||
      content.includes('hasApiPermission(') ||
      content.includes('withSecurity(') ||
      content.includes('auth()');

    const hasErrorHandling =
      content.includes('errorResponse(') ||
      content.includes('401') ||
      content.includes('403') ||
      content.includes('Unauthorized');

    if (isSensitive && !hasAuthCheck) {
      fail(`Rota sensível sem verificação de permissão: ${relativePath}`);
      publicSensitiveRoutes++;
    }

    if (!hasAuthCheck && !hasErrorHandling) {
      warn(`Rota API pode estar sem autenticação: ${relativePath}`);
    }

    checked++;
  }

  console.log(`  📊 ${checked} rotas de API verificadas.`);
  if (publicSensitiveRoutes === 0) {
    console.log('  ✅ Todas as rotas sensíveis possuem verificação de permissão.');
  }
}

// ─── 4. Dependency Audit for Critical Packages ──────────────────────────────

function checkDependencySecurity() {
  printDivider('Dependency Security');

  const pkgPath = path.join(ROOT, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.log('  ℹ️  package.json não encontrado, pulando.');
    return;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  // Check for outdated known-vulnerable patterns in dependencies
  const knownVulnerableDeps: Record<string, { maxVersion: string; issue: string }> = {
    'whatsapp-web.js': {
      maxVersion: '1.26.0',
      issue: 'puppeteer dependency com vulnerabilidades conhecidas — mantenha atualizado',
    },
  };

  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  for (const [depName, depInfo] of Object.entries(knownVulnerableDeps)) {
    // eslint-disable-next-line security/detect-object-injection
    if (allDeps[depName]) {
      warn(`${depName}: ${depInfo.issue}`);
    }
  }

  // Check for deprecated packages with known issues
  const deprecatedPackages = ['request', 'urllib', 'superagent', 'axios@<0.28.0'];
  for (const badPkg of deprecatedPackages) {
    const [name, versionConstraint] = badPkg.split('@');
    // eslint-disable-next-line security/detect-object-injection
    if (allDeps[name]) {
      warn(`Dependência com histórico de vulnerabilidades: ${badPkg}`);
    }
  }

  // Check for exact version pins (should use ^ or ~ for patch updates)
  for (const [name, version] of Object.entries(allDeps)) {
    if (typeof version === 'string' && /^\d+\.\d+\.\d+$/.test(version)) {
      warn(`Dependência fixada sem range (^ ou ~): ${name}@${version} — considere usar range para receber patches de segurança.`);
    }
  }

  // Check if next-auth is on a supported version
  // eslint-disable-next-line security/detect-object-injection
  const nextAuthVersion = allDeps['next-auth'];
  if (nextAuthVersion && typeof nextAuthVersion === 'string') {
    const versionNum = nextAuthVersion.replace(/[^0-9.]/g, '');
    if (versionNum.startsWith('4')) {
      warn(`next-auth@4 — considere migrar para v5 para suporte de segurança contínuo.`);
    }
  }

  console.log('  ✅ Verificação de dependências concluída.');
}

// ─── 5. NextAuth Configuration Security ────────────────────────────────────

function checkAuthConfig() {
  printDivider('Auth Configuration');

  const authConfigPath = path.join(ROOT, 'auth.config.ts');
  const authPath = path.join(ROOT, 'auth.ts');

  // Check auth.config.ts
  if (fs.existsSync(authConfigPath)) {
    const content = fs.readFileSync(authConfigPath, 'utf-8');

    if (!content.includes('secret') && !content.includes('AUTH_SECRET') && !content.includes('NEXTAUTH_SECRET')) {
      fail('auth.config.ts: Nenhuma configuração de secret encontrada.');
    }

    if (content.includes('jwt') && !content.includes('encryption')) {
      warn('auth.config.ts: JWT sem criptografia habilitada — dados do token ficam legíveis.');
    }
  } else {
    warn('auth.config.ts não encontrado.');
  }

  // Check auth.ts for secure patterns
  if (fs.existsSync(authPath)) {
    const content = fs.readFileSync(authPath, 'utf-8');

    if (!content.includes('bcrypt') && !content.includes('compare')) {
      warn('auth.ts: Nenhuma comparação de hash (bcrypt) encontrada na autorização.');
    }

    // Check for credential provider (password-based auth)
    if (content.includes('Credentials') && !content.includes('authorize')) {
      fail('auth.ts: Credentials provider sem função authorize.');
    }
  }

  console.log('  ✅ Configuração de autenticação verificada.');
}

// ─── 6. Error Handling ──────────────────────────────────────────────────────

function checkErrorHandling() {
  printDivider('Error Handling');

  const apiDir = path.join(ROOT, 'app', 'api');
  if (!fs.existsSync(apiDir)) return;

  const routeFiles: string[] = [];

  function collectRouteFiles(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collectRouteFiles(fullPath);
      } else if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
        routeFiles.push(fullPath);
      }
    }
  }

  collectRouteFiles(apiDir);

  let catchWithoutErrorResponse = 0;

  for (const routeFile of routeFiles) {
    const content = fs.readFileSync(routeFile, 'utf-8');

    // Check for try/catch that might leak stack traces
    const tryCatchBlocks = content.match(/catch\s*\(/g);
    if (tryCatchBlocks) {
      const hasErrorResponse = content.includes('errorResponse(') || content.includes('NextResponse.json');
      if (!hasErrorResponse) {
        const relativePath = path.relative(ROOT, routeFile);
        warn(`${relativePath}: try/catch detectado mas sem errorResponse() — pode expor stack traces.`);
        catchWithoutErrorResponse++;
      }
    }

    // Check for direct console.log of request data (might leak PII)
    const consoleLogMatch = content.match(/console\.(log|dir|table)\(/g);
    if (consoleLogMatch && content.includes('req') && !content.includes('//')) {
      const relativePath = path.relative(ROOT, routeFile);
      warn(`${relativePath}: console.log no handler de requisição — cuidado com dados sensíveis.`);
    }
  }

  if (catchWithoutErrorResponse === 0) {
    console.log('  ✅ Tratamento de erros adequado nas rotas de API.');
  }
}

// ─── 7. Security Headers & Configuration ────────────────────────────────────

function checkSecurityConfig() {
  printDivider('Security Configuration');

  const nextConfigPath = path.join(ROOT, 'next.config.ts');
  const nextConfigMjs = path.join(ROOT, 'next.config.mjs');
  const configPath = fs.existsSync(nextConfigPath) ? nextConfigPath : nextConfigMjs;

  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf-8');
    if (!content.includes('poweredByHeader') && content.includes('headers')) {
      warn('next.config: Considere remover o header X-Powered-By.');
    }
  }

  // Check docker-compose for security concerns
  const dockerComposePath = path.join(ROOT, 'docker-compose.yml');
  if (fs.existsSync(dockerComposePath)) {
    const content = fs.readFileSync(dockerComposePath, 'utf-8');
    if (!content.includes('restart: unless-stopped') && !content.includes('restart: always')) {
      warn('docker-compose.yml: Sem política de restart configurada.');
    }
  }

  console.log('  ✅ Configuração de segurança verificada.');
}

// ─── 8. TypeScript Strictness ────────────────────────────────────────────────

function checkTypeScriptConfig() {
  printDivider('TypeScript Configuration');

  const tsconfigPath = path.join(ROOT, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
    const compilerOptions = tsconfig.compilerOptions || {};

    if (!compilerOptions.strict) {
      warn('tsconfig.json: strict mode desativado — considere ativar para maior segurança de tipos.');
    }

    if (!compilerOptions.noUncheckedIndexedAccess) {
      warn('tsconfig.json: noUncheckedIndexedAccess desativado — pode causar acessos inseguros a índices.');
    }
  }

  console.log('  ✅ TypeScript config verificado.');
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🔒 Security Check — Loja Virtual Games');
  console.log(`  📅 ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════════');

  checkRequiredEnvVars();
  checkHardcodedSecrets();
  checkApiRoutePermissions();
  checkDependencySecurity();
  checkAuthConfig();
  checkErrorHandling();
  checkSecurityConfig();
  checkTypeScriptConfig();

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  📋 Resumo');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  ❌ Erros:     ${errors.length}`);
  console.log(`  ⚠️  Alertas:  ${warnings.length}`);

  if (errors.length > 0) {
    console.log('\n  Erros encontrados:');
    for (const err of errors) {
      console.log(err);
    }
  }

  if (warnings.length > 0) {
    console.log('\n  Alertas (não bloqueantes):');
    for (const w of warnings) {
      console.log(w);
    }
  }

  console.log(`\n  Saída: ${exitCode === 0 ? '✅ Aprovado' : '❌ Reprovado'}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  process.exit(exitCode);
}

main().catch((err) => {
  console.error('Erro fatal no security check:', err);
  process.exit(1);
});
