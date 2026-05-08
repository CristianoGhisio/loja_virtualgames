'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Database, Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type BackupItem = {
  id: string;
  createdAt: string;
  sizeBytes: number;
  hasUploads: boolean;
};

type BackupApiResponse = {
  backups: BackupItem[];
  paths: {
    backupDir: string;
    uploadsDir: string;
  };
};

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

export default function BackupPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningAction, setRunningAction] = useState<'create' | 'restore' | null>(null);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [backupDir, setBackupDir] = useState('');
  const [uploadsDir, setUploadsDir] = useState('');
  const [selectedBackupId, setSelectedBackupId] = useState('');

  const loadBackups = useCallback(async (silent?: boolean) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const response = await fetch('/api/settings/backup', { cache: 'no-store' });
      const payload = (await response.json()) as BackupApiResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || 'Falha ao carregar backups');
      }
      setBackups(payload.backups);
      setBackupDir(payload.paths.backupDir);
      setUploadsDir(payload.paths.uploadsDir);
      if (payload.backups.length > 0) {
        setSelectedBackupId((current) =>
          current && payload.backups.some((item) => item.id === current) ? current : payload.backups[0].id
        );
      } else {
        setSelectedBackupId('');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao carregar backups';
      toast.error(message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBackups();
  }, [loadBackups]);

  const handleCreateBackup = useCallback(async () => {
    setRunningAction('create');
    try {
      const response = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || 'Falha ao criar backup');
      }
      toast.success('Backup manual concluído');
      await loadBackups(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao criar backup';
      toast.error(message);
    } finally {
      setRunningAction(null);
    }
  }, [loadBackups]);

  const selectedBackup = useMemo(
    () => backups.find((item) => item.id === selectedBackupId) || null,
    [backups, selectedBackupId]
  );

  const handleRestore = useCallback(async () => {
    if (!selectedBackupId) {
      toast.error('Selecione um backup para restaurar');
      return;
    }

    const confirmed = window.confirm(
      'A restauração substitui o banco atual e os uploads pelo backup selecionado. Confirma a restauração?'
    );
    if (!confirmed) return;

    setRunningAction('restore');
    try {
      const response = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', backupId: selectedBackupId }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || 'Falha ao restaurar backup');
      }
      toast.success('Restauração concluída com sucesso');
      await loadBackups(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao restaurar backup';
      toast.error(message);
    } finally {
      setRunningAction(null);
    }
  }, [loadBackups, selectedBackupId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-blue">
            <Database className="w-5 h-5" /> Backup e Restauração
          </CardTitle>
          <CardDescription>
            Backup manual inclui banco PostgreSQL e uploads do sistema. A restauração aplica o backup escolhido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-2 text-xs text-gray-300">
            <div>
              Pasta de backups: <span className="text-neon-blue">{backupDir || 'Não carregado'}</span>
            </div>
            <div>
              Pasta de uploads: <span className="text-neon-blue">{uploadsDir || 'Não carregado'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleCreateBackup}
              disabled={runningAction !== null}
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500/10"
            >
              {runningAction === 'create' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Realizar Backup Manual
            </Button>
            <Button
              onClick={() => loadBackups(true)}
              disabled={refreshing || runningAction !== null}
              variant="outline"
              className="text-neon-blue hover:bg-neon-blue/10 border-neon-blue/30"
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Atualizar Lista
            </Button>
          </div>

          {loading ? (
            <div className="text-neon-blue flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando backups...
            </div>
          ) : (
            <div className="space-y-4">
              {backups.length === 0 ? (
                <div className="rounded-md border border-gray-500/30 p-3 text-sm text-gray-300">
                  Nenhum backup disponível no diretório configurado.
                </div>
              ) : (
                <>
                  <div className="rounded-md border border-[rgba(255,255,255,0.06)] bg-black/20 p-3">
                    <label className="text-xs text-gray-300 block mb-2">Selecionar backup para restauração</label>
                    <select
                      className="w-full rounded-md bg-slate-900 border border-cyan-400/30 text-slate-100 p-2 text-sm"
                      value={selectedBackupId}
                      onChange={(event) => setSelectedBackupId(event.target.value)}
                      disabled={runningAction !== null}
                    >
                      {backups.map((backup) => (
                        <option key={backup.id} value={backup.id}>
                          {backup.id} — {new Date(backup.createdAt).toLocaleString('pt-BR')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedBackup ? (
                    <div className="rounded-md border border-slate-500/30 p-3 text-sm text-slate-200 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>Data: {new Date(selectedBackup.createdAt).toLocaleString('pt-BR')}</div>
                      <div>Tamanho: {formatSize(selectedBackup.sizeBytes)}</div>
                      <div>Uploads: {selectedBackup.hasUploads ? 'Incluídos' : 'Não incluídos'}</div>
                    </div>
                  ) : null}

                  <Button
                    onClick={handleRestore}
                    disabled={runningAction !== null || !selectedBackupId}
                    variant="outline"
                    className="border-rose-400/60 text-rose-200 hover:bg-rose-500/10"
                  >
                    {runningAction === 'restore' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldAlert className="w-4 h-4" />
                    )}
                    Restaurar Backup Selecionado
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
