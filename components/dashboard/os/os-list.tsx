'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Printer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { OSReceipt } from '@/components/dashboard/os/os-receipt';
import { toast } from 'sonner';

interface OS {
  id: string;
  status: string;
  device: string;
  defect: string;
  entryDate: string;
  serial?: string;
  accessories?: string;
  condition?: string;
  notes?: string;
  report?: string;
  totalServices?: number;
  items?: Array<{ id?: string; type: 'PART' | 'SERVICE'; name: string; quantity: number; unitPrice: number; total: number }>;
  receivable?: { value: number; status: string; paymentMethod?: string | null; paidAt?: string | null } | null;
  customer: { name: string; document: string; phone?: string };
  technician?: { name: string };
  total?: number;
}

interface OSListProps {
  statusFilter: string | string[];
}

const STATUS_MAP: Record<string, string> = {
  'Fila de Entrada': 'ENTRADA',
  'Diagnóstico': 'DIAGNOSTICO',
  'Orçamento': 'ORCAMENTO',
  'Aguardando Aprovação': 'AGUARDANDO_APROVACAO',
  'Aprovado': 'APROVADO',
  'Aguardando Peça': 'AGUARDANDO_PECA',
  'Em Reparo': 'EM_REPARO',
  'Entregue': 'ENTREGUE',
  'Finalizado': 'FINALIZADO',
  'Finalizada': 'FINALIZADO',
  'Finalizadas': 'FINALIZADO',
  'Cancelado': 'CANCELADO',
};

const STATUS_BADGE: Record<string, 'default' | 'warning' | 'success' | 'destructive' | 'purple'> = {
  ENTRADA: 'default',
  DIAGNOSTICO: 'warning',
  ORCAMENTO: 'warning',
  AGUARDANDO_APROVACAO: 'purple',
  APROVADO: 'success',
  EM_REPARO: 'default',
  AGUARDANDO_PECA: 'warning',
  FINALIZADO: 'success',
  ENTREGUE: 'success',
  CANCELADO: 'destructive',
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function OSList({ statusFilter }: OSListProps) {
  const router = useRouter();
  const [osList, setOsList] = useState<OS[]>([]);
  const [loading, setLoading] = useState(true);
  const [receiptOS, setReceiptOS] = useState<OS | null>(null);
  const [deletingOSId, setDeletingOSId] = useState<string | null>(null);

  const fetchOS = useCallback(async () => {
    const statuses = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
    try {
      setLoading(true);
      let apiStatus = '';
      for (const s of statuses) {
        if (STATUS_MAP[s]) { apiStatus = STATUS_MAP[s]; break; }
      }
      const response = await api.get(`/os${apiStatus ? `?status=${apiStatus}` : ''}`);
      const responseData = response.data;
      let fetchedOS: OS[] = [];
      if (responseData.data && Array.isArray(responseData.data.data)) fetchedOS = responseData.data.data;
      else if (Array.isArray(responseData.data)) fetchedOS = responseData.data;
      setOsList(fetchedOS);
    } catch { setOsList([]); } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchOS(); }, [fetchOS]);

  const handleDeleteOS = async (os: OS) => {
    if (os.status !== 'ENTRADA') return;
    if (!window.confirm(`Deseja excluir a OS #${os.id.slice(-6).toUpperCase()}?`)) return;
    setDeletingOSId(os.id);
    try {
      await api.delete(`/os/${os.id}`);
      toast.success('OS excluída com sucesso');
      await fetchOS();
    } catch { toast.error('Não foi possível excluir a OS'); } finally { setDeletingOSId(null); }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Carregando...</div>;
  }

  if (receiptOS) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
        onClick={() => setReceiptOS(null)}>
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[800px]">
          <OSReceipt os={receiptOS} onClose={() => setReceiptOS(null)} />
        </div>
      </div>
    );
  }

  if (osList.length === 0) {
    return (
      <div className="text-center py-12 bg-white/[0.02] rounded-xl border border-dashed border-[rgba(255,255,255,0.08)]">
        <p className="text-gray-500">Nenhuma OS nesta fila.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-white/[0.02]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>OS</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Equipamento</TableHead>
            <TableHead>Defeito</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Técnico</TableHead>
            <TableHead>Entrada</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {osList.map((os) => (
            <TableRow key={os.id} className="cursor-pointer" onClick={() => router.push(`/dashboard/os/${os.id}`)}>
              <TableCell className="font-mono text-xs text-neon-blue font-bold">#{os.id.slice(-6).toUpperCase()}</TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE[os.status] || 'default'} className="text-[10px] uppercase whitespace-nowrap">
                  {os.status}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-white">{os.device}</TableCell>
              <TableCell className="text-gray-400 text-sm max-w-[200px] truncate">{os.defect}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-300">{os.customer.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-gray-400 text-sm">{os.technician?.name || '-'}</TableCell>
              <TableCell className="text-xs text-gray-500">{formatDate(os.entryDate)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setReceiptOS(os); }}
                    className="text-neon-blue hover:text-neon-blue hover:bg-neon-blue/10 h-8 w-8">
                    <Printer className="w-3.5 h-3.5" />
                  </Button>
                  {os.status === 'ENTRADA' && (
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteOS(os); }}
                      disabled={deletingOSId === os.id}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
