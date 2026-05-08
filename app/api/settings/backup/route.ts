import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAuth, hasApiPermission } from '@/lib/api-auth';
import { backupStoragePaths, createManualBackup, listBackups, restoreBackupById } from '@/lib/services/backup';


export const dynamic = 'force-dynamic';

const backupActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('create') }),
  z.object({
    action: z.literal('restore'),
    backupId: z.string().min(1),
  }),
]);

export async function GET() {
  try {
    const { authorized, response, user } = await checkAuth();
    if (!authorized) return response;
    if (!hasApiPermission(user, 'admin', 'manage')) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });
    }

    const backups = await listBackups();
    return NextResponse.json({
      backups,
      paths: backupStoragePaths(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao carregar backups';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, response, user } = await checkAuth();
    if (!authorized) return response;
    if (!hasApiPermission(user, 'admin', 'manage')) {
      return NextResponse.json({ error: 'Permissão negada' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = backupActionSchema.parse(body);

    if (parsed.action === 'create') {
      const backup = await createManualBackup();
      const backups = await listBackups();
      return NextResponse.json({ action: parsed.action, backup, backups });
    }

    const restored = await restoreBackupById(parsed.backupId);
    const backups = await listBackups();
    return NextResponse.json({ action: parsed.action, restored, backups });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao executar operação de backup';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
