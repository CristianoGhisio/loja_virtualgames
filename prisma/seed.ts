import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

async function main(): Promise<void> {
  const seedFilePath = resolve(process.cwd(), 'prisma', 'seed.sql');
  const seedSql = readFileSync(seedFilePath, 'utf-8');
  const result = spawnSync(
    'docker',
    [
      'compose',
      'exec',
      '-T',
      'postgres',
      'sh',
      '-lc',
      'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -f -'
    ],
    {
      input: seedSql,
      encoding: 'utf-8'
    }
  );

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.status !== 0) {
    throw new Error(`Falha ao aplicar seed.sql. Código de saída: ${result.status ?? -1}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
