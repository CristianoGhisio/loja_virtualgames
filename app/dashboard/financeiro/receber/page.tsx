'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/native-select';
import { Banknote, Calendar, Check, CreditCard, Filter, Plus, QrCode, Search, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

type PaymentMethod = 'PIX' | 'DINHEIRO' | 'CARTAO' | 'CREDITO' | 'DEBITO' | 'CREDITO_LOJA';

type ReceivableRow = {
  id: string;
  description: string;
  dueDate: string;
  paidAt: string | null;
  value: number;
  computedStatus: 'PENDING' | 'PAID' | 'OVERDUE';
  paymentMethod: PaymentMethod | null;
  cardFeePercent: number | null;
  grossValue: number | null;
  commissionValue: number | null;
  netValue: number | null;
  customer: { name: string } | null;
  costCenter: { id: string; name: string } | null;
  origin: 'MANUAL' | 'SALE' | 'SERVICE';
};

const formatCurrencyLocal = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function ReceberPage() {
  const [rows, setRows] = useState<ReceivableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openReceive, setOpenReceive] = useState(false);
  const [selectedReceiveId, setSelectedReceiveId] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    date: '',
    category: '',
    origin: '',
  });
  const [createForm, setCreateForm] = useState({
    description: '',
    value: '',
    category: '',
    paymentMethod: 'PIX' as PaymentMethod,
    cardFeePercent: '',
  });
  const [receiveForm, setReceiveForm] = useState({
    paymentMethod: 'PIX' as PaymentMethod,
    cardFeePercent: '',
    paidAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      params.limit = '200';
      if (filters.q.trim()) params.q = filters.q.trim();
      if (filters.category.trim()) params.category = filters.category.trim();
      if (filters.origin) params.origin = filters.origin;
      if (filters.date) {
        params.period = 'custom';
        params.from = filters.date;
        params.to = filters.date;
      }
      const response = await api.get('/financial/receivables', { params });
      const data = response.data?.data?.data as ReceivableRow[] | undefined;
      const normalized = Array.isArray(data) ? data : [];
      setRows(normalized);
    } catch {
      setRows([]);
      toast.error('Falha ao carregar receitas.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    rows.forEach((item) => {
      if (item.costCenter?.name) unique.add(item.costCenter.name);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const kpis = useMemo(() => {
    const now = new Date();
    const monthPaid = rows.filter((item) => {
      if (item.computedStatus !== 'PAID') return false;
      const referenceDate = new Date(item.paidAt ?? item.dueDate);
      return referenceDate.getMonth() === now.getMonth() && referenceDate.getFullYear() === now.getFullYear();
    });

    const totalGross = monthPaid.reduce((acc, item) => acc + Number(item.grossValue ?? item.value), 0);
    const totalCommission = monthPaid.reduce((acc, item) => acc + Number(item.commissionValue ?? 0), 0);
    const totalNet = monthPaid.reduce((acc, item) => acc + Number(item.netValue ?? item.value), 0);

    return { totalGross, totalCommission, totalNet };
  }, [rows]);

  const paymentBadge = (method: PaymentMethod | null) => {
    if (method === 'PIX') {
      return (
        <Badge className="border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
          <QrCode className="mr-1 h-3.5 w-3.5" /> Pix
        </Badge>
      );
    }
    if (method === 'DINHEIRO') {
      return (
        <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
          <Banknote className="mr-1 h-3.5 w-3.5" /> Dinheiro
        </Badge>
      );
    }
    if (method === 'CARTAO' || method === 'CREDITO' || method === 'DEBITO') {
      return (
        <Badge className="border-violet-400/30 bg-violet-500/10 text-violet-200">
          <CreditCard className="mr-1 h-3.5 w-3.5" /> Cartão
        </Badge>
      );
    }
    if (method === 'CREDITO_LOJA') {
      return (
        <Badge className="border-slate-300/30 bg-slate-500/20 text-slate-100">
          <Wallet className="mr-1 h-3.5 w-3.5" /> Crédito Loja
        </Badge>
      );
    }
    return <Badge className="border-slate-400/20 bg-slate-700/30 text-slate-300">Não informado</Badge>;
  };

  const handleCreateReceivable = async () => {
    try {
      await api.post('/financial/receivables', {
        action: 'create',
        description: createForm.description,
        value: Number(createForm.value),
        origin: 'MANUAL',
        category: createForm.category || undefined,
        paymentMethod: createForm.paymentMethod,
        cardFeePercent:
          createForm.paymentMethod === 'CARTAO' || createForm.paymentMethod === 'CREDITO' || createForm.paymentMethod === 'DEBITO'
            ? Number(createForm.cardFeePercent || 0)
            : undefined,
        paidAt: new Date().toISOString(),
      });
      setOpenCreate(false);
      setCreateForm({
        description: '',
        value: '',
        category: '',
        paymentMethod: 'PIX',
        cardFeePercent: '',
      });
      await fetchData();
      toast.success('Receita cadastrada.');
    } catch {
      toast.error('Falha ao cadastrar receita.');
    }
  };

  const openReceiveModal = (id: string) => {
    setSelectedReceiveId(id);
    setReceiveForm({
      paymentMethod: 'PIX',
      cardFeePercent: '',
      paidAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    });
    setOpenReceive(true);
  };

  const handleReceive = async () => {
    if (!selectedReceiveId) return;
    try {
      await api.post('/financial/receivables', {
        id: selectedReceiveId,
        paymentMethod: receiveForm.paymentMethod,
        cardFeePercent:
          receiveForm.paymentMethod === 'CARTAO' || receiveForm.paymentMethod === 'CREDITO' || receiveForm.paymentMethod === 'DEBITO'
            ? Number(receiveForm.cardFeePercent || 0)
            : undefined,
        paidAt: new Date(receiveForm.paidAt).toISOString(),
      });
      setOpenReceive(false);
      setSelectedReceiveId('');
      await fetchData();
      toast.success('Receita confirmada.');
    } catch {
      toast.error('Falha ao confirmar recebimento.');
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="rounded-xl border border-cyan-400/20 bg-[#0f172a] p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-300">Receitas</h1>
            <p className="text-sm text-slate-400">Controle de entradas com detalhamento por pagamento</p>
          </div>
          <Button className="ml-auto bg-cyan-400 text-slate-900 hover:bg-cyan-300" onClick={() => setOpenCreate(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Receita
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white/5 backdrop-blur-md border-emerald-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Entradas Brutas (Mês)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-400">{formatCurrencyLocal(kpis.totalGross)}</CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-cyan-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Comissão Provisionada (Mês)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-yellow-300">{formatCurrencyLocal(kpis.totalCommission)}</CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-cyan-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Entradas Líquidas (Mês)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-gray-300">{formatCurrencyLocal(kpis.totalNet)}</CardContent>
        </Card>
      </div>

      <Card className="bg-[#0f172a] border-cyan-400/20">
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-4">
            <Input
              label="Busca"
              placeholder="Descrição ou cliente"
              icon={<Search className="h-4 w-4 text-gray-300" />}
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Input
              type="date"
              label="Data"
              icon={<Calendar className="h-4 w-4 text-gray-300" />}
              value={filters.date}
              onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Select
              label="Categoria"
              value={filters.category}
              onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            >
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            <Select
              label="Origem"
              value={filters.origin}
              onChange={(event) => setFilters((current) => ({ ...current, origin: event.target.value }))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            >
              <option value="">Todas</option>
              <option value="MANUAL">Manual</option>
              <option value="SALE">Venda de produto</option>
              <option value="SERVICE">Serviço pago</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0f172a] border-cyan-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-300">
            <Filter className="h-4 w-4 text-gray-300" /> Lançamentos de Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border border-cyan-400/20 bg-slate-950/40">
            <Table className="w-full min-w-[1050px] border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Data/Hora</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Origem</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Referência</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Meio de Pagamento</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Valor Bruto</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Comissão</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Valor Líquido</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-slate-400 border-b-0">
                      Carregando receitas...
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-slate-400 border-b-0">
                      Nenhuma receita encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((item) => (
                    <TableRow key={item.id} className="bg-slate-900/70 border-none hover:bg-slate-800/70 transition-colors">
                      <TableCell className="px-3 py-3 text-slate-200 border-b-0">
                        {format(new Date(item.paidAt ?? item.dueDate), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-slate-200 border-b-0">
                        {item.origin === 'MANUAL'
                          ? 'Manual'
                          : item.origin === 'SALE'
                            ? 'Venda'
                            : 'Serviço'}
                      </TableCell>
                      <TableCell className="px-3 py-3 font-medium text-slate-100 border-b-0">
                        <div>{item.description}</div>
                        <div className="text-xs text-slate-400">{item.costCenter?.name ?? 'Sem categoria'}</div>
                      </TableCell>
                      <TableCell className="px-3 py-3 border-b-0">{paymentBadge(item.paymentMethod)}</TableCell>
                      <TableCell className="px-3 py-3 text-right font-semibold text-emerald-400 border-b-0">
                        {formatCurrencyLocal(Number(item.grossValue ?? item.value))}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-right font-semibold text-yellow-300 border-b-0">
                        {formatCurrencyLocal(Number(item.commissionValue ?? 0))}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-right font-semibold text-slate-100 border-b-0">
                        {formatCurrencyLocal(Number(item.netValue ?? item.value))}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-right border-b-0">
                        {item.computedStatus !== 'PAID' ? (
                          <Button
                            size="sm"
                            className="bg-emerald-400 text-slate-900 hover:bg-emerald-300"
                            onClick={() => openReceiveModal(item.id)}
                          >
                            <Check className="mr-1 h-4 w-4" /> Receber
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-400 font-medium">Confirmada</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="bg-[#0f172a] border-cyan-400/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Nova Receita</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Descrição"
              value={createForm.description}
              onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Venda de acessórios"
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Input
              type="number"
              label="Valor"
              value={createForm.value}
              onChange={(event) => setCreateForm((current) => ({ ...current, value: event.target.value }))}
              placeholder="0,00"
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Input
              label="Categoria"
              value={createForm.category}
              onChange={(event) => setCreateForm((current) => ({ ...current, category: event.target.value }))}
              placeholder="Receita de vendas"
              list="receitas-categorias"
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <datalist id="receitas-categorias">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <Select
              label="Meio de Pagamento"
              value={createForm.paymentMethod}
              onChange={(event) =>
                setCreateForm((current) => ({ ...current, paymentMethod: event.target.value as PaymentMethod }))
              }
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            >
              <option value="PIX">Pix</option>
              <option value="DINHEIRO">Dinheiro</option>
              <option value="CARTAO">Cartão</option>
              <option value="CREDITO">Crédito</option>
              <option value="DEBITO">Débito</option>
              <option value="CREDITO_LOJA">Crédito Loja</option>
            </Select>
            <Input
              type="number"
              label="Taxa de Operadora (%)"
              value={createForm.cardFeePercent}
              onChange={(event) => setCreateForm((current) => ({ ...current, cardFeePercent: event.target.value }))}
              placeholder="Opcional"
              disabled={
                !['CARTAO', 'CREDITO', 'DEBITO'].includes(createForm.paymentMethod)
              }
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200 disabled:opacity-50"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setOpenCreate(false)}>
              Cancelar
            </Button>
            <Button className="bg-cyan-400 text-slate-900 hover:bg-cyan-300" onClick={handleCreateReceivable}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openReceive} onOpenChange={setOpenReceive}>
        <DialogContent className="bg-[#0f172a] border-cyan-400/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Confirmar Recebimento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              label="Meio de Pagamento"
              value={receiveForm.paymentMethod}
              onChange={(event) =>
                setReceiveForm((current) => ({ ...current, paymentMethod: event.target.value as PaymentMethod }))
              }
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            >
              <option value="PIX">Pix</option>
              <option value="DINHEIRO">Dinheiro</option>
              <option value="CARTAO">Cartão</option>
              <option value="CREDITO">Crédito</option>
              <option value="DEBITO">Débito</option>
              <option value="CREDITO_LOJA">Crédito Loja</option>
            </Select>
            <Input
              type="datetime-local"
              label="Data do Recebimento"
              value={receiveForm.paidAt}
              onChange={(event) => setReceiveForm((current) => ({ ...current, paidAt: event.target.value }))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Input
              type="number"
              label="Taxa de Operadora (%)"
              value={receiveForm.cardFeePercent}
              onChange={(event) => setReceiveForm((current) => ({ ...current, cardFeePercent: event.target.value }))}
              disabled={!['CARTAO', 'CREDITO', 'DEBITO'].includes(receiveForm.paymentMethod)}
              placeholder="Opcional"
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200 disabled:opacity-50"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setOpenReceive(false)}>
              Cancelar
            </Button>
            <Button className="bg-emerald-400 text-slate-900 hover:bg-emerald-300" onClick={handleReceive}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
