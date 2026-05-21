'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditUser {
  name?: string | null;
  email?: string | null;
}

interface AuditLogItem {
  id: string;
  createdAt: string;
  action: string;
  module: string;
  ip?: string | null;
  user?: AuditUser | null;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/logs');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs de Auditoria</CardTitle>
        <CardDescription>Rastreamento de atividades críticas do sistema em tempo real.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead className="text-right">IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-400">
                    Nenhum log encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-gray-400">
                      {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-white">{log.user?.name || 'Sistema'}</div>
                      <div className="text-[10px] text-gray-400">{log.user?.email || ''}</div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-300">{log.action}</TableCell>
                    <TableCell>
                      <Badge variant="neon" className="text-[10px] uppercase">{log.module}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-gray-400">{log.ip || 'Local'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
