'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer, ShoppingCart, User, CreditCard, MessageCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { SaleReceipt } from '@/components/dashboard/vendas/sale-receipt';

type SaleItem = { id: string; quantity: number; unitPrice: number; total: number; product: { id: string; commercialName: string } };
type SaleDetail = {
  id: string; date: string; total: number; discount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'; paymentMethod: string;
  customer: { id: string; name: string; document: string; phone?: string | null } | null;
  items: SaleItem[];
  receivable: { status: string } | null;
};
const STATUS_LABEL: Record<SaleDetail['status'], string> = { PENDING: 'Em Andamento', COMPLETED: 'Finalizada', CANCELLED: 'Cancelada' };
const STATUS_VARIANT: Record<SaleDetail['status'], 'warning' | 'success' | 'destructive'> = { PENDING: 'warning', COMPLETED: 'success', CANCELLED: 'destructive' };

function fmt(value: number) { return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);

  useEffect(() => {
    const fetchSale = async () => {
      setLoading(true);
      try { const r = await api.get(`/sales/${id}`); setSale(r.data?.data ?? null); }
      catch { setSale(null); } finally { setLoading(false); }
    };
    fetchSale();
  }, [id]);

  const subtotal = useMemo(() => (sale?.items ?? []).reduce((acc, item) => acc + Number(item.total), 0), [sale]);

  const handleCancelSale = async () => {
    if (!sale || sale.status !== 'PENDING') return;
    await api.patch(`/sales/${sale.id}`, { status: 'CANCELLED' });
    const r = await api.get(`/sales/${id}`); setSale(r.data?.data ?? null);
  };

  const handleSendWhatsappReceipt = async () => {
    if (!sale) return;
    setSendingWhatsapp(true);
    try { await api.post(`/sales/${sale.id}/receipt-whatsapp`); toast.success('Recibo enviado'); }
    catch { toast.error('Erro ao enviar'); } finally { setSendingWhatsapp(false); }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando venda...</div>;
  if (!sale) return <div className="p-8 text-center text-gray-400">Venda não encontrada.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron flex items-center gap-3 flex-wrap">
              Venda #{sale.id.slice(-6).toUpperCase()}
              <Badge variant={STATUS_VARIANT[sale.status]}>{STATUS_LABEL[sale.status]}</Badge>
            </h1>
            <p className="text-sm text-gray-400">Realizada em {new Date(sale.date).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setReceiptOpen(true)}><Printer className="w-4 h-4 mr-2" /> Recibo</Button>
          <Button variant="outline" onClick={handleSendWhatsappReceipt} disabled={sendingWhatsapp || !sale.customer?.phone}>
            <MessageCircle className="w-4 h-4 mr-2" /> {sendingWhatsapp ? 'Enviando...' : 'WhatsApp'}
          </Button>
          {sale.status === 'PENDING' && (
            <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleCancelSale}>
              <XCircle className="w-4 h-4 mr-2" /> Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-[rgba(255,255,255,0.06)] pb-4">
              <CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-neon-blue" /> Itens</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Produto</TableHead><TableHead>Qtd</TableHead><TableHead>Unitário</TableHead><TableHead>Total</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {sale.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-white">{item.product.commercialName}</TableCell>
                      <TableCell className="text-gray-400">{item.quantity}</TableCell>
                      <TableCell className="text-gray-400">{fmt(item.unitPrice)}</TableCell>
                      <TableCell className="font-bold text-neon-blue">{fmt(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-[rgba(255,255,255,0.06)] pb-4">
              <CardTitle>Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="flex justify-between items-center p-4 bg-white/[0.02] rounded-xl border border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-neon-blue/70" />
                  <div>
                    <p className="text-sm font-bold text-white">{sale.paymentMethod}</p>
                    <p className="text-xs text-gray-400">Status: {sale.receivable?.status ?? 'N/A'}</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-neon-blue">{fmt(sale.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-[rgba(255,255,255,0.06)] pb-4">
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-neon-blue" /> Cliente</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Nome</p>
                <p className="text-lg font-bold text-white">{sale.customer?.name ?? 'Consumidor final'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">CPF / CNPJ</p>
                <p className="text-gray-300">{sale.customer?.document ?? '-'}</p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => sale.customer?.id && router.push(`/dashboard/clientes/${sale.customer.id}/visao-geral`)} disabled={!sale.customer?.id}>
                Ver Perfil
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-[rgba(255,255,255,0.06)] pb-4">
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-2">
              <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="flex justify-between text-gray-400"><span>Desconto</span><span>- {fmt(Number(sale.discount))}</span></div>
              <div className="pt-2 mt-2 border-t border-[rgba(255,255,255,0.06)] flex justify-between items-center">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-2xl font-bold text-neon-blue font-orbitron">{fmt(Number(sale.total))}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-5xl p-0 border-white/10 bg-transparent">
          <DialogHeader className="sr-only"><DialogTitle>Recibo</DialogTitle></DialogHeader>
          <SaleReceipt sale={{
            id: sale.id, date: sale.date, paymentMethod: sale.paymentMethod, subtotal,
            discount: Number(sale.discount), total: Number(sale.total),
            customer: { name: sale.customer?.name || 'Consumidor final', document: sale.customer?.document || '-', phone: sale.customer?.phone || null },
            items: sale.items.map((item, idx) => ({ id: `${item.id}-${idx}`, name: item.product.commercialName, quantity: item.quantity, unitPrice: Number(item.unitPrice), total: Number(item.total) })),
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
