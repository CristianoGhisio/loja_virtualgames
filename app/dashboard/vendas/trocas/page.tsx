'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type ReturnRecord = {
  id: string;
  saleId: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  type: 'RETURN' | 'EXCHANGE';
  customer: { name: string } | null;
};

type SaleLookup = {
  id: string;
  customer: { id: string; name: string } | null;
  items: Array<{ quantity: number; unitPrice: number; product: { id: string; commercialName: string } }>;
};

type ReturnDraftItem = { productId: string; quantity: number; unitPrice: number };

const STATUS_LABEL: Record<ReturnRecord['status'], string> = {
  PENDING: 'Pendente', APPROVED: 'Aprovada', REJECTED: 'Rejeitada', COMPLETED: 'Concluída',
};

const STATUS_VARIANT: Record<ReturnRecord['status'], 'warning' | 'success' | 'destructive' | 'default'> = {
  PENDING: 'warning', APPROVED: 'success', REJECTED: 'destructive', COMPLETED: 'default',
};

export default function TrocasDevolucoesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<ReturnRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [saleLookup, setSaleLookup] = useState('');
  const [sale, setSale] = useState<SaleLookup | null>(null);
  const [returnType, setReturnType] = useState<'RETURN' | 'EXCHANGE'>('RETURN');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ReturnDraftItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sales/returns');
      setRecords(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch { setRecords([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchReturns(); }, []);

  const filteredRecords = useMemo(
    () => records.filter((r) => r.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.includes(searchTerm)),
    [records, searchTerm]
  );

  const handleLookupSale = async () => {
    if (!saleLookup.trim()) return;
    try {
      const res = await api.get(`/sales/${saleLookup.trim()}`);
      const data = res.data?.data;
      if (data) {
        setSale(data);
        setItems(data.items.map((i: { product: { id: string }; quantity: number; unitPrice: number }) => ({ productId: i.product.id, quantity: 0, unitPrice: i.unitPrice })));
      } else { toast.error('Venda não encontrada'); }
    } catch { toast.error('Erro ao buscar venda'); }
  };

  const addReturnItem = () => {
    if (!selectedProductId || selectedQuantity < 1) return;
    setItems((prev) => [...prev.filter((i) => i.productId !== selectedProductId), { productId: selectedProductId, quantity: selectedQuantity, unitPrice: 0 }]);
    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const handleSubmitReturn = async () => {
    if (!sale || items.length === 0 || reason.trim().length < 3) { toast.error('Preencha todos os campos'); return; }
    try {
      await api.post('/sales/returns', { saleId: sale.id, type: returnType, reason, notes, items: items.filter((i) => i.quantity > 0) });
      toast.success('Devolução registrada');
      setOpen(false);
      setSale(null);
      setItems([]);
      setReason('');
      setNotes('');
      setSaleLookup('');
      fetchReturns();
    } catch { toast.error('Erro ao registrar devolução'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Button variant="neon" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Nova Devolução</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Trocas e Devoluções</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Troca</TableHead><TableHead>Venda</TableHead><TableHead>Cliente</TableHead><TableHead>Motivo</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">Carregando...</TableCell></TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">Nenhum registro encontrado.</TableCell></TableRow>
              ) : (
                filteredRecords.map((ret) => (
                  <TableRow key={ret.id}>
                    <TableCell className="font-mono text-xs text-gray-400">{ret.id.slice(0, 8)}</TableCell>
                    <TableCell className="text-neon-blue font-mono text-xs">{ret.saleId}</TableCell>
                    <TableCell className="text-white">{ret.customer?.name || '-'}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{ret.reason}</TableCell>
                    <TableCell><Badge variant={STATUS_VARIANT[ret.status]}>{STATUS_LABEL[ret.status]}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Nova Devolução / Troca</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="ID da venda..." value={saleLookup} onChange={(e) => setSaleLookup(e.target.value)} />
              <Button variant="neon" onClick={handleLookupSale}><RefreshCw className="w-4 h-4" /></Button>
            </div>
            {sale && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">Cliente: <span className="text-white font-bold">{sale.customer?.name}</span></p>
                <div className="flex gap-2">
                  <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 h-10 rounded-md border border-[rgba(255,255,255,0.1)] bg-black/20 px-3 text-sm text-white focus:border-neon-blue">
                    <option value="">Selecione o produto</option>
                    {sale.items.map((item, idx) => (
                      <option key={idx} value={item.product.id}>{item.product.commercialName}</option>
                    ))}
                  </select>
                  <Input type="number" min={1} className="w-20" value={selectedQuantity} onChange={(e) => setSelectedQuantity(Number(e.target.value))} />
                  <Button variant="outline" size="sm" onClick={addReturnItem}><Plus className="w-4 h-4" /></Button>
                </div>
                {items.filter((i) => i.quantity > 0).length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead><TableHead>Qtd</TableHead><TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.filter((i) => i.quantity > 0).map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-white">{sale.items.find((si) => si.product.id === item.productId)?.product.commercialName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="text-red-400" onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}><Trash2 className="w-4 h-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <div className="flex gap-2">
                  <select value={returnType} onChange={(e) => setReturnType(e.target.value as 'RETURN' | 'EXCHANGE')}
                    className="flex-1 h-10 rounded-md border border-[rgba(255,255,255,0.1)] bg-black/20 px-3 text-sm text-white focus:border-neon-blue">
                    <option value="RETURN">Devolução</option><option value="EXCHANGE">Troca</option>
                  </select>
                </div>
                <Input label="Motivo" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Descreva o motivo..." />
                <Textarea placeholder="Observações opcionais" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="neon" onClick={handleSubmitReturn} disabled={!sale || items.length === 0 || reason.trim().length < 3}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
