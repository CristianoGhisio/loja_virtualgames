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
import { Calendar, Check, Filter, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

type PayableRow = {
  id: string;
  description: string;
  dueDate: string;
  value: number;
  computedStatus: 'PENDING' | 'PAID' | 'OVERDUE';
  category?: string;
  costCenter: { id: string; name: string } | null;
  attachmentUrl: string | null;
  payableType?: 'DEFAULT' | 'TECHNICIAN_COMMISSION';
};

type CommissionPendingRow = {
  technicianUserId: string;
  technicianName: string;
  servicesCount: number;
  totalCommission: number;
  competenceMonth: number;
  competenceYear: number;
};

export default function PagarPage() {
  const [rows, setRows] = useState<PayableRow[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openPay, setOpenPay] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedPayableId, setSelectedPayableId] = useState('');
  const [selectedDeletePayableId, setSelectedDeletePayableId] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    date: '',
    category: '',
  });
  const [form, setForm] = useState({
    description: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    value: '',
    category: '',
    recurring: 'NAO',
    recurringInstallments: '12',
    attachmentUrl: '',
  });
  const [editForm, setEditForm] = useState({
    id: '',
    description: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    value: '',
    category: '',
    attachmentUrl: '',
  });
  const [paymentDate, setPaymentDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [commissionRows, setCommissionRows] = useState<CommissionPendingRow[]>([]);
  const [commissionMonth, setCommissionMonth] = useState(new Date().getMonth() + 1);
  const [commissionYear, setCommissionYear] = useState(new Date().getFullYear());
  const [payingCommissionBatch, setPayingCommissionBatch] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (filters.q.trim()) params.q = filters.q.trim();
      if (filters.category.trim()) params.category = filters.category.trim();
      if (filters.date) params.date = filters.date;
      const payablesResponse = await api.get('/financial/payables', { params });
      const payablesData = payablesResponse.data?.data as PayableRow[] | undefined;
      setRows(Array.isArray(payablesData) ? payablesData : []);
      const commissionResponse = await api.get('/financial/payables', {
        params: {
          scope: 'commissions_pending',
          competenceMonth: commissionMonth,
          competenceYear: commissionYear,
        },
      });
      const commissionData = commissionResponse.data?.data as CommissionPendingRow[] | undefined;
      setCommissionRows(Array.isArray(commissionData) ? commissionData : []);
    } catch {
      setRows([]);
      setCommissionRows([]);
      toast.error('Falha ao carregar despesas.');
    }
  }, [commissionMonth, commissionYear, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    rows.forEach((item) => {
      const name = item.costCenter?.name || item.category;
      if (name) unique.add(name);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const kpis = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthRows = rows.filter((item) => {
      const dueDate = new Date(item.dueDate);
      return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
    });

    const totalToPay = monthRows
      .filter((item) => item.computedStatus !== 'PAID')
      .reduce((acc, item) => acc + Number(item.value), 0);
    const overdueValue = rows
      .filter((item) => item.computedStatus === 'OVERDUE')
      .reduce((acc, item) => acc + Number(item.value), 0);
    const totalPaid = monthRows
      .filter((item) => item.computedStatus === 'PAID')
      .reduce((acc, item) => acc + Number(item.value), 0);

    const pendingCommissions = commissionRows.reduce((acc, item) => acc + Number(item.totalCommission), 0);
    return { totalToPay, overdueValue, totalPaid, pendingCommissions };
  }, [commissionRows, rows]);

  const formatCurrencyLocal = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleCreate = async () => {
    try {
      await api.post('/financial/payables', {
        description: form.description,
        dueDate: form.dueDate,
        value: Number(form.value),
        category: form.category || undefined,
        recurring: form.recurring === 'SIM',
        recurringInstallments:
          form.recurring === 'SIM' ? Math.max(1, Number(form.recurringInstallments || '1')) : 1,
        attachmentUrl: form.attachmentUrl || undefined,
      });
      setOpenCreate(false);
      setForm({
        description: '',
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        value: '',
        category: '',
        recurring: 'NAO',
        recurringInstallments: '12',
        attachmentUrl: '',
      });
      await fetchData();
      toast.success('Despesa cadastrada.');
    } catch {
      toast.error('Falha ao cadastrar despesa.');
    }
  };

  const statusBadge = (status: PayableRow['computedStatus']) => {
    if (status === 'PAID') {
      return <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">Pago</Badge>;
    }
    if (status === 'OVERDUE') {
      return <Badge className="border-rose-400/30 bg-rose-500/10 text-rose-200">Atrasado</Badge>;
    }
    return <Badge className="border-amber-400/30 bg-amber-500/10 text-amber-200">Pendente</Badge>;
  };

  const openPaymentModal = (id: string) => {
    setSelectedPayableId(id);
    setPaymentDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    setOpenPay(true);
  };

  const openEditModal = (item: PayableRow) => {
    setEditForm({
      id: item.id,
      description: item.description,
      dueDate: format(new Date(item.dueDate), 'yyyy-MM-dd'),
      value: String(Number(item.value)),
      category: item.costCenter?.name ?? item.category ?? '',
      attachmentUrl: item.attachmentUrl ?? '',
    });
    setOpenEdit(true);
  };

  const handlePay = async () => {
    if (!selectedPayableId) return;
    try {
      await api.post('/financial/payables', {
        action: 'pay',
        id: selectedPayableId,
        paidAt: new Date(paymentDate).toISOString(),
      });
      setOpenPay(false);
      setSelectedPayableId('');
      await fetchData();
      toast.success('Pagamento confirmado.');
    } catch {
      toast.error('Falha ao confirmar pagamento.');
    }
  };

  const handlePayCommissionsBatch = async () => {
    if (commissionRows.length === 0) return;
    try {
      setPayingCommissionBatch(true);
      await api.post('/financial/payables', {
        action: 'pay_commissions_batch',
        competenceMonth: commissionMonth,
        competenceYear: commissionYear,
        technicianIds: commissionRows.map((item) => item.technicianUserId),
        paidAt: new Date(paymentDate).toISOString(),
      });
      await fetchData();
      toast.success('Comissões pagas com sucesso.');
    } catch {
      toast.error('Falha ao pagar comissões.');
    } finally {
      setPayingCommissionBatch(false);
    }
  };

  const handleEdit = async () => {
    if (!editForm.id) return;
    try {
      await api.put('/financial/payables', {
        id: editForm.id,
        description: editForm.description,
        dueDate: editForm.dueDate,
        value: Number(editForm.value),
        category: editForm.category || undefined,
        attachmentUrl: editForm.attachmentUrl || undefined,
      });
      setOpenEdit(false);
      setEditForm({
        id: '',
        description: '',
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        value: '',
        category: '',
        attachmentUrl: '',
      });
      await fetchData();
      toast.success('Despesa atualizada.');
    } catch {
      toast.error('Falha ao atualizar despesa.');
    }
  };

  const handleDelete = async () => {
    if (!selectedDeletePayableId) return;
    try {
      await api.delete('/financial/payables', {
        params: { id: selectedDeletePayableId },
      });
      setOpenDelete(false);
      setSelectedDeletePayableId('');
      await fetchData();
      toast.success('Despesa excluída.');
    } catch {
      toast.error('Falha ao excluir despesa.');
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="rounded-xl border border-cyan-400/20 bg-[#0f172a] p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-300">Despesas</h1>
            <p className="text-sm text-slate-400">Controle de contas a pagar com alertas de vencimento</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-amber-400/50 text-amber-200 hover:bg-amber-500/10"
              onClick={handlePayCommissionsBatch}
              disabled={commissionRows.length === 0 || payingCommissionBatch}
            >
              {payingCommissionBatch ? 'Processando...' : 'Gerar pagamento de comissões'}
            </Button>
            <Button className="ml-auto bg-cyan-400 text-slate-900 hover:bg-cyan-300" onClick={() => setOpenCreate(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nova Despesa
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 backdrop-blur-md border-amber-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total a Pagar (Mês)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-amber-400">{formatCurrencyLocal(kpis.totalToPay)}</CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-rose-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Contas Atrasadas (Valor)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-rose-400">{formatCurrencyLocal(kpis.overdueValue)}</CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-emerald-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Pago</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-400">{formatCurrencyLocal(kpis.totalPaid)}</CardContent>
        </Card>
        <Card className="bg-white/5 backdrop-blur-md border-yellow-400/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Comissão a Pagar</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-yellow-300">{formatCurrencyLocal(kpis.pendingCommissions)}</CardContent>
        </Card>
      </div>

      <Card className="bg-[#0f172a] border-cyan-400/20">
        <CardHeader className="flex flex-row items-end justify-between">
          <CardTitle className="text-gray-300">Comissões pendentes por técnico</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={String(commissionMonth)}
              onChange={(event) => setCommissionMonth(Number(event.target.value))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')}
                </option>
              ))}
            </Select>
            <Select
              value={String(commissionYear)}
              onChange={(event) => setCommissionYear(Number(event.target.value))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            >
              {[commissionYear - 1, commissionYear, commissionYear + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border border-cyan-400/20 bg-slate-950/40">
            <Table className="w-full min-w-[800px] border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Técnico</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Competência</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Qtd. serviços</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Total comissão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-slate-400 border-b-0">
                      Nenhuma comissão pendente para a competência.
                    </TableCell>
                  </TableRow>
                ) : (
                  commissionRows.map((item) => (
                    <TableRow key={item.technicianUserId} className="bg-slate-900/70 border-none hover:bg-slate-800/70">
                      <TableCell className="px-3 py-3 text-slate-100 border-b-0">{item.technicianName}</TableCell>
                      <TableCell className="px-3 py-3 text-slate-300 border-b-0">
                        {String(item.competenceMonth).padStart(2, '0')}/{item.competenceYear}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-right text-slate-200 border-b-0">{item.servicesCount}</TableCell>
                      <TableCell className="px-3 py-3 text-right text-yellow-300 font-semibold border-b-0">
                        {formatCurrencyLocal(item.totalCommission)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0f172a] border-cyan-400/20">
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              label="Busca"
              placeholder="Descrição"
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
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0f172a] border-cyan-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-300">
            <Filter className="h-4 w-4 text-gray-300" /> Lançamentos de Despesa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border border-cyan-400/20 bg-slate-950/40">
            <Table className="w-full min-w-[900px] border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Vencimento</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Descrição</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Categoria</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Valor</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Status</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-slate-400 border-b-0">
                      Nenhuma despesa encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((item) => (
                    <TableRow
                      key={item.id}
                      className={`border-none hover:bg-slate-800/70 transition-colors ${item.computedStatus === 'OVERDUE' ? 'bg-rose-500/10' : 'bg-slate-900/70'}`}
                    >
                      <TableCell className="px-3 py-3 text-slate-200 border-b-0">
                        {format(new Date(item.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="px-3 py-3 font-medium text-slate-100 border-b-0">{item.description}</TableCell>
                      <TableCell className="px-3 py-3 text-slate-200 border-b-0">{item.costCenter?.name ?? item.category ?? 'Sem categoria'}</TableCell>
                      <TableCell
                        className={`px-3 py-3 text-right font-semibold border-b-0 ${
                          item.computedStatus === 'OVERDUE' ? 'text-rose-400' : 'text-slate-100'
                        }`}
                      >
                        {formatCurrencyLocal(Number(item.value))}
                      </TableCell>
                      <TableCell className="px-3 py-3 border-b-0">{statusBadge(item.computedStatus)}</TableCell>
                      <TableCell className="px-3 py-3 text-right border-b-0">
                        {item.computedStatus !== 'PAID' ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-400 text-slate-900 hover:bg-emerald-300"
                              onClick={() => openPaymentModal(item.id)}
                            >
                              <Check className="mr-1 h-4 w-4" /> Pagar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/10"
                              onClick={() => openEditModal(item)}
                            >
                              <Pencil className="mr-1 h-4 w-4" /> Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-rose-400/40 text-rose-200 hover:bg-rose-500/10"
                              onClick={() => {
                                setSelectedDeletePayableId(item.id);
                                setOpenDelete(true);
                              }}
                            >
                              <Trash2 className="mr-1 h-4 w-4" /> Excluir
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-emerald-400 font-medium">Liquidada</span>
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
            <DialogTitle className="text-gray-300">Nova Despesa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Descrição"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Input
              type="number"
              label="Valor"
              value={form.value}
              onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Input
              type="date"
              label="Vencimento"
              value={form.dueDate}
              onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Input
              label="Categoria"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              list="despesas-categorias"
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <datalist id="despesas-categorias">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <Select
              label="Recorrência"
              value={form.recurring}
              onChange={(event) => setForm((current) => ({ ...current, recurring: event.target.value }))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            >
              <option value="NAO">Não</option>
              <option value="SIM">Sim</option>
            </Select>
            {form.recurring === 'SIM' ? (
              <Input
                type="number"
                label="Quantidade de lançamentos"
                min={1}
                max={120}
                value={form.recurringInstallments}
                onChange={(event) => setForm((current) => ({ ...current, recurringInstallments: event.target.value }))}
                className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
              />
            ) : null}
            <div className="md:col-span-2 space-y-3">
              <input
                type="file"
                className="h-12 w-full rounded-md border border-cyan-400/30 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded file:border-0 file:bg-slate-800 file:px-3 file:py-1 file:text-gray-300"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setForm((current) => ({ ...current, attachmentUrl: file.name }));
                }}
              />
              <Input
                label="Anexo de Boleto/Recibo"
                value={form.attachmentUrl}
                onChange={(event) => setForm((current) => ({ ...current, attachmentUrl: event.target.value }))}
                placeholder="Nome do arquivo ou URL"
                className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setOpenCreate(false)}>
              Cancelar
            </Button>
            <Button className="bg-cyan-400 text-slate-900 hover:bg-cyan-300" onClick={handleCreate}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="bg-[#0f172a] border-cyan-400/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Editar Despesa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Descrição"
              value={editForm.description}
              onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Input
              type="number"
              label="Valor"
              value={editForm.value}
              onChange={(event) => setEditForm((current) => ({ ...current, value: event.target.value }))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Input
              type="date"
              label="Vencimento"
              value={editForm.dueDate}
              onChange={(event) => setEditForm((current) => ({ ...current, dueDate: event.target.value }))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Input
              label="Categoria"
              value={editForm.category}
              onChange={(event) => setEditForm((current) => ({ ...current, category: event.target.value }))}
              list="despesas-categorias"
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <div className="md:col-span-2">
              <Input
                label="Anexo de Boleto/Recibo"
                value={editForm.attachmentUrl}
                onChange={(event) => setEditForm((current) => ({ ...current, attachmentUrl: event.target.value }))}
                placeholder="Nome do arquivo ou URL"
                className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setOpenEdit(false)}>
              Cancelar
            </Button>
            <Button className="bg-cyan-400 text-slate-900 hover:bg-cyan-300" onClick={handleEdit}>
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="bg-[#0f172a] border-rose-400/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-rose-300">Excluir Despesa</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-300">Essa ação remove a despesa pendente de forma definitiva.</p>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setOpenDelete(false)}>
              Cancelar
            </Button>
            <Button className="bg-rose-400 text-slate-900 hover:bg-rose-300" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openPay} onOpenChange={setOpenPay}>
        <DialogContent className="bg-[#0f172a] border-cyan-400/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Confirmar Pagamento</DialogTitle>
          </DialogHeader>
          <Input
            type="datetime-local"
            label="Data real do pagamento"
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
            className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
          />
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setOpenPay(false)}>
              Cancelar
            </Button>
            <Button className="bg-emerald-400 text-slate-900 hover:bg-emerald-300" onClick={handlePay}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
