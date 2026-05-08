import { spawn } from 'node:child_process';
import { createReadStream, createWriteStream } from 'node:fs';
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

// File paths are constructed from validated/sanitized arguments or hardcoded constants
/* eslint-disable security/detect-non-literal-fs-filename */

type BackupMetadata = {
  id: string;
  createdAt: string;
  databaseFile: string;
  uploadsDir: string;
};

export type BackupEntry = {
  id: string;
  createdAt: string;
  sizeBytes: number;
  hasUploads: boolean;
};

function sanitizeDockerArg(value: string, maxLength = 128): string {
  const sanitized = value.replace(/[^a-zA-Z0-9_.-]/g, '');
  if (sanitized.length === 0 || sanitized.length > maxLength) {
    throw new Error('Argumento Docker inválido');
  }
  return sanitized;
}

function sanitizeDbName(value: string): string {
  const sanitized = value.replace(/[^a-zA-Z0-9_]/g, '');
  if (sanitized.length === 0) {
    throw new Error('Nome de banco de dados inválido');
  }
  return sanitized;
}

const BACKUP_STORAGE_DIR = process.env.BACKUP_STORAGE_DIR || path.join(process.cwd(), 'storage', 'backups');
const UPLOADS_STORAGE_DIR = process.env.UPLOADS_STORAGE_DIR || path.join(process.cwd(), 'public', 'uploads');
const DB_CONTAINER_NAME = sanitizeDockerArg(process.env.DB_CONTAINER_NAME || 'loja_postgres');
const POSTGRES_USER = sanitizeDockerArg(process.env.POSTGRES_USER || 'postgres');
const POSTGRES_DB = sanitizeDbName(process.env.POSTGRES_DB || 'postgres');

function buildBackupId() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    '-',
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join('');
}

function validateBackupId(backupId: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(backupId)) {
    throw new Error('Backup inválido');
  }
}

async function ensureDirectories() {
  await mkdir(BACKUP_STORAGE_DIR, { recursive: true });
}

async function runDockerDump(targetFile: string) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      'docker',
      [
        'exec',
        '-i',
        DB_CONTAINER_NAME,
        'pg_dump',
        '-U',
        POSTGRES_USER,
        '-d',
        POSTGRES_DB,
        '--clean',
        '--if-exists',
        '--no-owner',
        '--no-privileges',
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    const output = createWriteStream(targetFile);
    let stderr = '';

    child.stdout?.pipe(output);
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += String(chunk);
    });

    child.on('error', (error) => {
      output.close();
      reject(error);
    });

    child.on('close', (code) => {
      output.close();
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr.trim() || 'Falha ao executar pg_dump'));
    });
  });
}

async function runDockerRestore(sourceFile: string) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      'docker',
      ['exec', '-i', DB_CONTAINER_NAME, 'psql', '-U', POSTGRES_USER, '-d', POSTGRES_DB],
      { stdio: ['pipe', 'ignore', 'pipe'] }
    );

    const input = createReadStream(sourceFile);
    let stderr = '';

    input.pipe(child.stdin);
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += String(chunk);
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr.trim() || 'Falha ao executar restauração com psql'));
    });
  });
}

async function directorySize(targetDir: string): Promise<number> {
  const entries = await readdir(targetDir, { withFileTypes: true });
  let total = 0;
  for (const entry of entries) {
    const currentPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      total += await directorySize(currentPath);
      continue;
    }
    const fileStat = await stat(currentPath);
    total += fileStat.size;
  }
  return total;
}

async function readMetadata(backupDir: string): Promise<BackupMetadata | null> {
  const metadataPath = path.join(backupDir, 'metadata.json');
  try {
    const raw = await readFile(metadataPath, 'utf8');
    return JSON.parse(raw) as BackupMetadata;
  } catch {
    return null;
  }
}

export async function createManualBackup() {
  await ensureDirectories();
  const backupId = `backup-${buildBackupId()}`;
  const backupDir = path.join(BACKUP_STORAGE_DIR, backupId);
  const databaseFile = path.join(backupDir, 'database.sql');
  const uploadsDir = path.join(backupDir, 'uploads');

  await mkdir(backupDir, { recursive: true });
  await runDockerDump(databaseFile);

  let hasUploads = false;
  try {
    const uploadsStats = await stat(UPLOADS_STORAGE_DIR);
    if (uploadsStats.isDirectory()) {
      await cp(UPLOADS_STORAGE_DIR, uploadsDir, { recursive: true });
      hasUploads = true;
    }
  } catch {
  }

  const metadata: BackupMetadata = {
    id: backupId,
    createdAt: new Date().toISOString(),
    databaseFile: 'database.sql',
    uploadsDir: hasUploads ? 'uploads' : '',
  };

  await writeFile(path.join(backupDir, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf8');

  const sizeBytes = await directorySize(backupDir);
  return {
    id: backupId,
    createdAt: metadata.createdAt,
    sizeBytes,
    hasUploads,
  };
}

export async function listBackups(): Promise<BackupEntry[]> {
  await ensureDirectories();
  const entries = await readdir(BACKUP_STORAGE_DIR, { withFileTypes: true });
  const backups: BackupEntry[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const backupDir = path.join(BACKUP_STORAGE_DIR, entry.name);
    const databaseFile = path.join(backupDir, 'database.sql');

    try {
      await stat(databaseFile);
    } catch {
      continue;
    }

    const metadata = await readMetadata(backupDir);
    const sizeBytes = await directorySize(backupDir);
    const hasUploads = metadata?.uploadsDir === 'uploads';
    const directoryStat = await stat(backupDir);

    backups.push({
      id: entry.name,
      createdAt: metadata?.createdAt || directoryStat.birthtime.toISOString(),
      sizeBytes,
      hasUploads,
    });
  }

  backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return backups;
}

export async function restoreBackupById(backupId: string) {
  validateBackupId(backupId);
  const backupDir = path.join(BACKUP_STORAGE_DIR, backupId);
  const databaseFile = path.join(backupDir, 'database.sql');
  const uploadsSource = path.join(backupDir, 'uploads');

  await stat(databaseFile);
  await runDockerRestore(databaseFile);

  let restoredUploads = false;
  try {
    const uploadsStat = await stat(uploadsSource);
    if (uploadsStat.isDirectory()) {
      await rm(UPLOADS_STORAGE_DIR, { recursive: true, force: true });
      await cp(uploadsSource, UPLOADS_STORAGE_DIR, { recursive: true });
      restoredUploads = true;
    }
  } catch {
  }

  return {
    id: backupId,
    restoredAt: new Date().toISOString(),
    restoredUploads,
  };
}

export function backupStoragePaths() {
  return {
    backupDir: BACKUP_STORAGE_DIR,
    uploadsDir: UPLOADS_STORAGE_DIR,
  };
}
