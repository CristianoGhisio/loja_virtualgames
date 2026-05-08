'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle, CircleDollarSign, Lock, LockOpen, ShieldMinus, ShieldPlus, Wallet } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

type Entry = {
  id: string;
  date: string;
  value: number;
  type: 'IN' | 'OUT';
  category: string;
  account: string;
  note: string;
  canEdit: boolean;
  canDelete: boolean;
  userId?: string | null;
};

type SessionStatus = 'ABERTO' | 'FECHADO';
type MovementKind = 'ABERTURA' | 'SUPRIMENTO' | 'SANGRIA' | 'ENTRADA' | 'SAIDA' | 'FECHAMENTO';

type ClosingMovement = {
  id: string;
  date: string;
  countedAmount: number;
  systemAmount: number;
  difference: number;
  justification: string;
  operator: string;
};

type DailyCashState = {
  status: SessionStatus;
  lastOpenAt: string | null;
  lastOpenedBy: string;
  closings: ClosingMovement[];
};

type DisplayMovement = {
  id: string;
  date: string;
  kind: MovementKind;
  description: string;
  value: number;
  operator: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const STORAGE_PREFIX = 'virtual-games-caixa-diario';

const getMovementKind = (entry: Entry): MovementKind => {
  if (entry.category === 'Caixa Diário' && entry.account === 'Caixa Físico') {
    if (entry.note.startsWith('[ABERTURA]')) return 'ABERTURA';
    if (entry.note.startsWith('[SUPRIMENTO]')) return 'SUPRIMENTO';
    if (entry.note.startsWith('[SANGRIA]')) return 'SANGRIA';
    if (entry.note.startsWith('[FECHAMENTO]')) return 'FECHAMENTO';
  }
  return entry.type === 'IN' ? 'ENTRADA' : 'SAIDA';
};

const stripPrefix = (text: string) =>
  text
    .replace('[ABERTURA]', '')
    .replace('[SUPRIMENTO]', '')
    .replace('[SANGRIA]', '')
    .replace('[FECHAMENTO]', '')
    .trim();

export default function DiarioPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Entry[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [openOpenModal, setOpenOpenModal] = useState(false);
  const [openSupplyModal, setOpenSupplyModal] = useState(false);
  const [openWithdrawModal, setOpenWithdrawModal] = useState(false);
  const [openCloseModal, setOpenCloseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [openingValue, setOpeningValue] = useState('');
  const [supplyValue, setSupplyValue] = useState('');
  const [supplyReason, setSupplyReason] = useState('');
  const [withdrawValue, setWithdrawValue] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [countedValue, setCountedValue] = useState('');
  const [closeJustification, setCloseJustification] = useState('');

  const [cashState, setCashState] = useState<DailyCashState>({
    status: 'FECHADO',
    lastOpenAt: null,
    lastOpenedBy: '',
    closings: [],
  });

  const storageKey = useMemo(
    () => `${STORAGE_PREFIX}:${format(new Date(), 'yyyy-MM-dd')}`,
    []
  );

  const fetchEntries = useCallback(async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await api.get('/financial/daily-entries', {
        params: {
          start: startOfDay.toISOString(),
          end: endOfDay.toISOString(),
        },
      });
      const data = response.data?.data as Entry[] | undefined;
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Falha ao carregar as movimentações do caixa.');
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchEntries();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchEntries]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as DailyCashState;
        setCashState({
          status: parsed.status === 'ABERTO' ? 'ABERTO' : 'FECHADO',
          lastOpenAt: parsed.lastOpenAt ?? null,
          lastOpenedBy: parsed.lastOpenedBy ?? '',
          closings: Array.isArray(parsed.closings) ? parsed.closings : [],
        });
      } else {
        setCashState((prev) => ({
          ...prev,
          lastOpenedBy: user?.name ?? '',
        }));
      }
    } catch {
      setCashState({
        status: 'FECHADO',
        lastOpenAt: null,
        lastOpenedBy: user?.name ?? '',
        closings: [],
      });
    } finally {
      setIsHydrated(true);
    }
  }, [storageKey, user?.name]);

  const persistCashState = useCallback(
    (next: DailyCashState) => {
      setCashState(next);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      }
    },
    [storageKey]
  );

  const movements = useMemo<DisplayMovement[]>(() => {
    const fromEntries = items.map((item) => {
      const kind = getMovementKind(item);
      const description =
        kind === 'ABERTURA' || kind === 'SUPRIMENTO' || kind === 'SANGRIA'
          ? stripPrefix(item.note)
          : item.note;

      return {
        id: item.id,
        date: item.date,
        kind,
        description,
        value: Number(item.value),
        operator: item.canEdit ? (user?.name || 'Operador') : 'Sistema',
      };
    });

    const fromClosings = cashState.closings.map((closeItem) => ({
      id: closeItem.id,
      date: closeItem.date,
      kind: 'FECHAMENTO' as const,
      description:
        closeItem.justification.trim().length > 0
          ? `Conferência concluída. ${closeItem.justification.trim()}`
          : 'Conferência concluída sem divergência.',
      value: closeItem.countedAmount,
      operator: closeItem.operator,
    }));

    return [...fromEntries, ...fromClosings].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [cashState.closings, items, user?.name]);

  const kpis = useMemo(() => {
    const opening = movements.find((movement) => movement.kind === 'ABERTURA')?.value ?? 0;
    const supplies = movements
      .filter((movement) => movement.kind === 'SUPRIMENTO')
      .reduce((acc, movement) => acc + movement.value, 0);
    const withdrawals = movements
      .filter((movement) => movement.kind === 'SANGRIA')
      .reduce((acc, movement) => acc + movement.value, 0);
    const currentCash = opening + supplies - withdrawals;

    return {
      opening,
      supplies,
      withdrawals,
      currentCash,
    };
  }, [movements]);

  const closeDifference = useMemo(() => {
    const counted = Number(countedValue);
    if (!Number.isFinite(counted) || counted < 0) return 0;
    return counted - kpis.currentCash;
  }, [countedValue, kpis.currentCash]);

  const createCashMovement = async (
    kind: 'ABERTURA' | 'SUPRIMENTO' | 'SANGRIA' | 'FECHAMENTO',
    value: number,
    reason: string
  ) => {
    const prefixes: Record<'ABERTURA' | 'SUPRIMENTO' | 'SANGRIA' | 'FECHAMENTO', string> = {
      ABERTURA: '[ABERTURA]',
      SUPRIMENTO: '[SUPRIMENTO]',
      SANGRIA: '[SANGRIA]',
      FECHAMENTO: '[FECHAMENTO]',
    };

    await api.post('/financial/daily-entries', {
      date: new Date().toISOString(),
      // eslint-disable-next-line security/detect-object-injection
      description: `${prefixes[kind]} ${reason}`,
      value,
      category: 'Caixa Diário',
      account: 'Caixa Físico',
      type: kind === 'SANGRIA' || kind === 'FECHAMENTO' ? 'SAIDA' : 'ENTRADA',
    });
  };

  const handleOpenCash = async () => {
    const value = Number(openingValue);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Informe um valor inicial válido.');
      return;
    }
    setSubmitting(true);
    try {
      await createCashMovement('ABERTURA', value, 'Abertura do caixa');
      const openedAt = new Date().toISOString();
      persistCashState({
        ...cashState,
        status: 'ABERTO',
        lastOpenAt: openedAt,
        lastOpenedBy: user?.name ?? cashState.lastOpenedBy ?? '',
      });
      setOpeningValue('');
      setOpenOpenModal(false);
      await fetchEntries();
      toast.success('Caixa aberto com sucesso.');
    } catch {
      toast.error('Não foi possível abrir o caixa.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupply = async () => {
    const value = Number(supplyValue);
    const reason = supplyReason.trim();
    if (!Number.isFinite(value) || value <= 0 || reason.length < 3) {
      toast.error('Informe valor e motivo válidos para o suprimento.');
      return;
    }
    setSubmitting(true);
    try {
      await createCashMovement('SUPRIMENTO', value, reason);
      setSupplyValue('');
      setSupplyReason('');
      setOpenSupplyModal(false);
      await fetchEntries();
      toast.success('Suprimento registrado.');
    } catch {
      toast.error('Falha ao registrar suprimento.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const value = Number(withdrawValue);
    const reason = withdrawReason.trim();
    if (!Number.isFinite(value) || value <= 0 || reason.length < 3) {
      toast.error('Informe valor e motivo válidos para a sangria.');
      return;
    }
    setSubmitting(true);
    try {
      await createCashMovement('SANGRIA', value, reason);
      setWithdrawValue('');
      setWithdrawReason('');
      setOpenWithdrawModal(false);
      await fetchEntries();
      toast.success('Sangria registrada.');
    } catch {
      toast.error('Falha ao registrar sangria.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseCash = async () => {
    const counted = Number(countedValue);
    if (!Number.isFinite(counted) || counted < 0) {
      toast.error('Informe o valor contado em dinheiro.');
      return;
    }
    if (closeDifference !== 0 && closeJustification.trim().length < 3) {
      toast.error('Justificativa obrigatória para fechamento com diferença.');
      return;
    }

    setSubmitting(true);
    try {
      const justification = closeJustification.trim();
      const detail = justification.length > 0
        ? `Fechamento do caixa. Contado: ${counted.toFixed(2)} | Sistema: ${kpis.currentCash.toFixed(2)} | Diferença: ${closeDifference.toFixed(2)} | ${justification}`
        : `Fechamento do caixa. Contado: ${counted.toFixed(2)} | Sistema: ${kpis.currentCash.toFixed(2)} | Diferença: ${closeDifference.toFixed(2)}`;
      await createCashMovement('FECHAMENTO', 0, detail);

      persistCashState({
        ...cashState,
        status: 'FECHADO',
        closings: cashState.closings,
      });

      setCountedValue('');
      setCloseJustification('');
      setOpenCloseModal(false);
      await fetchEntries();
      toast.success('Fechamento registrado.');
    } catch {
      toast.error('Não foi possível registrar o fechamento.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-sm text-gray-400">Carregando caixa diário...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-6 grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-4 rounded-lg border border-[rgba(255,255,255,0.06)] bg-black/20 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-300 font-orbitron">Caixa Diário</h2>
                <Badge className={cashState.status === 'ABERTO' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}>
                  {cashState.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  <span className="font-semibold text-slate-300">Operador:</span> {cashState.lastOpenedBy || user?.name || 'Não identificado'}
                </p>
                <p className="text-sm text-slate-400">
                  <span className="font-semibold text-slate-300">Abertura:</span> {cashState.lastOpenAt ? format(new Date(cashState.lastOpenAt), 'dd/MM/yyyy HH:mm') : 'Sem abertura hoje'}
                </p>
                <p className="text-sm text-slate-400">
                  <span className="font-semibold text-gray-300">Data op:</span> <span className="text-neon-blue font-semibold">{format(new Date(), 'dd/MM/yyyy')}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 rounded-lg border border-[#539FA2]/20 bg-slate-950/40 p-4">
            <p className="text-base text-neon-blue font-semibold mb-3">Ações Rápidas</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cashState.status === 'FECHADO' ? (
                <Button variant="ghost" className="h-12 border border-[#539FA2]/30 bg-transparent text-[#539FA2] hover:bg-[#539FA2] hover:text-slate-900 hover:border-[#539FA2] transition-all" onClick={() => setOpenOpenModal(true)}>
                  <LockOpen className="w-4 h-4 mr-2" /> Abrir Caixa
                </Button>
              ) : (
                <Button variant="ghost" className="h-12 border border-slate-700 bg-slate-800/50 text-slate-500 hover:bg-slate-800/50 hover:text-slate-500 opacity-100" disabled>
                  <LockOpen className="w-4 h-4 mr-2" /> Caixa Aberto
                </Button>
              )}
              <Button
                variant="ghost"
                className="h-12 border border-[#539FA2]/30 bg-transparent text-[#539FA2] hover:bg-[#539FA2] hover:text-slate-900 hover:border-[#539FA2] transition-all disabled:border-slate-700 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:opacity-100"
                onClick={() => setOpenSupplyModal(true)}
                disabled={cashState.status !== 'ABERTO'}
              >
                <ShieldPlus className="w-4 h-4 mr-2" /> Suprimento
              </Button>
              <Button
                variant="ghost"
                className="h-12 border border-[#539FA2]/30 bg-transparent text-[#539FA2] hover:bg-[#539FA2] hover:text-slate-900 hover:border-[#539FA2] transition-all disabled:border-slate-700 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:opacity-100"
                onClick={() => setOpenWithdrawModal(true)}
                disabled={cashState.status !== 'ABERTO'}
              >
                <ShieldMinus className="w-4 h-4 mr-2" /> Sangria
              </Button>
              <Button
                variant="ghost"
                className="h-12 border border-[#539FA2]/30 bg-transparent text-[#539FA2] hover:bg-[#539FA2] hover:text-slate-900 hover:border-[#539FA2] transition-all disabled:border-slate-700 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:opacity-100"
                onClick={() => setOpenCloseModal(true)}
                disabled={cashState.status !== 'ABERTO'}
              >
                <Lock className="w-4 h-4 mr-2" /> Fechar Caixa
              </Button>
            </div>
          </div>

          <div className="lg:col-span-12 rounded-lg border border-[#539FA2]/20 bg-slate-950/40 p-4">
            <p className="text-base text-neon-blue font-semibold mb-3">Resumo de Caixa</p>
            <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-[#539FA2]/20 [&::-webkit-scrollbar-track]:bg-transparent">
              <Card className="min-w-[220px] flex-1 bg-white/5 backdrop-blur-md border-[#539FA2]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-300">Saldo de Abertura</CardTitle>
                  <LockOpen className="h-5 w-5 text-[#539FA2]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#539FA2]">{formatCurrency(kpis.opening)}</div>
                </CardContent>
              </Card>
              <Card className="min-w-[220px] flex-1 bg-white/5 backdrop-blur-md border-emerald-400/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-300">Entradas (Suprimentos)</CardTitle>
                  <ArrowUpCircle className="h-5 w-5 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-400">{formatCurrency(kpis.supplies)}</div>
                </CardContent>
              </Card>
              <Card className="min-w-[220px] flex-1 bg-white/5 backdrop-blur-md border-rose-400/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-300">Saídas (Sangrias)</CardTitle>
                  <ArrowDownCircle className="h-5 w-5 text-rose-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-rose-400">{formatCurrency(kpis.withdrawals)}</div>
                </CardContent>
              </Card>
              <Card className="min-w-[220px] flex-1 bg-white/5 backdrop-blur-md border-[#539FA2]/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-300">Saldo Atual em Espécie</CardTitle>
                  <CircleDollarSign className="h-5 w-5 text-[#539FA2]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#539FA2]">{formatCurrency(kpis.currentCash)}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0f172a] border-[#539FA2]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-blue">
            <Wallet className="w-5 h-5 text-neon-blue" /> Movimentações de Hoje ({format(new Date(), 'dd/MM/yyyy')})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border border-[#539FA2]/20 bg-slate-950/40">
            <Table className="w-full min-w-[900px] border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-left text-xs uppercase tracking-wide text-[#539FA2] px-3 py-3">Horário</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-[#539FA2] px-3 py-3">Tipo</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-[#539FA2] px-3 py-3">Descrição/Motivo</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide text-[#539FA2] px-3 py-3">Valor</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-[#539FA2] px-3 py-3">Operador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-400 border-b-0">
                      Nenhuma movimentação registrada hoje.
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((movement) => {
                    const isPositive = ['ABERTURA', 'SUPRIMENTO', 'ENTRADA'].includes(movement.kind);
                    const isNegative = ['SANGRIA', 'SAIDA'].includes(movement.kind);
                    const label =
                      movement.kind === 'SUPRIMENTO'
                        ? 'Entrada'
                        : movement.kind === 'SANGRIA'
                          ? 'Saída'
                          : movement.kind === 'ABERTURA'
                            ? 'Abertura'
                            : movement.kind === 'FECHAMENTO'
                              ? 'Fechamento'
                              : movement.kind === 'ENTRADA'
                                ? 'Entrada'
                                : 'Saída';

                    return (
                      <TableRow key={movement.id} className="bg-slate-900/70 border-none hover:bg-slate-800/70 transition-colors">
                        <TableCell className="px-3 py-3 text-slate-200 border-b-0">{format(new Date(movement.date), 'HH:mm')}</TableCell>
                        <TableCell className="px-3 py-3 border-b-0">
                          <Badge
                            className={
                              movement.kind === 'FECHAMENTO'
                                ? 'bg-[#539FA2]/15 text-[#539FA2] border border-[#539FA2]/30'
                                : isPositive
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }
                          >
                            {label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-slate-200 border-b-0">{movement.description}</TableCell>
                        <TableCell
                          className={`px-3 py-3 text-right font-semibold border-b-0 ${
                            movement.kind === 'FECHAMENTO'
                              ? 'text-[#539FA2]'
                              : isNegative
                                ? 'text-rose-400'
                                : 'text-emerald-400'
                          }`}
                        >
                          {formatCurrency(movement.value)}
                        </TableCell>
                        <TableCell className="px-3 py-3 text-slate-200 border-b-0">{movement.operator}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={openOpenModal} onOpenChange={setOpenOpenModal}>
        <DialogContent className="bg-[#0f172a] border-[#539FA2]/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-[#539FA2]">Abrir Caixa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              label="Valor Inicial"
              value={openingValue}
              onChange={(event) => setOpeningValue(event.target.value)}
              min="0"
              step="0.01"
              className="bg-slate-950/60 border-[#539FA2]/30 text-slate-200"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setOpenOpenModal(false)}>Cancelar</Button>
            <Button className="bg-[#539FA2] text-slate-900 hover:bg-[#72B1A4]" onClick={() => void handleOpenCash()} disabled={submitting}>
              Confirmar Abertura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openSupplyModal} onOpenChange={setOpenSupplyModal}>
        <DialogContent className="bg-[#0f172a] border-[#539FA2]/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-[#539FA2]">Registrar Suprimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              label="Valor"
              value={supplyValue}
              onChange={(event) => setSupplyValue(event.target.value)}
              min="0"
              step="0.01"
              className="bg-slate-950/60 border-[#539FA2]/30 text-slate-200"
            />
            <Input
              label="Motivo"
              value={supplyReason}
              onChange={(event) => setSupplyReason(event.target.value)}
              className="bg-slate-950/60 border-[#539FA2]/30 text-slate-200"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setOpenSupplyModal(false)}>Cancelar</Button>
            <Button className="bg-[#539FA2] text-slate-900 hover:bg-[#72B1A4]" onClick={() => void handleSupply()} disabled={submitting}>
              Confirmar Suprimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openWithdrawModal} onOpenChange={setOpenWithdrawModal}>
        <DialogContent className="bg-[#0f172a] border-[#539FA2]/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-[#539FA2]">Registrar Sangria</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              label="Valor"
              value={withdrawValue}
              onChange={(event) => setWithdrawValue(event.target.value)}
              min="0"
              step="0.01"
              className="bg-slate-950/60 border-[#539FA2]/30 text-slate-200"
            />
            <Input
              label="Motivo"
              value={withdrawReason}
              onChange={(event) => setWithdrawReason(event.target.value)}
              className="bg-slate-950/60 border-[#539FA2]/30 text-slate-200"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setOpenWithdrawModal(false)}>Cancelar</Button>
            <Button className="bg-[#539FA2] text-slate-900 hover:bg-[#72B1A4]" onClick={() => void handleWithdraw()} disabled={submitting}>
              Confirmar Sangria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openCloseModal} onOpenChange={setOpenCloseModal}>
        <DialogContent className="bg-[#0f172a] border-[#539FA2]/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-[#539FA2]">Fechar Caixa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-md border border-[#539FA2]/20 bg-slate-950/40 p-3">
                <p className="text-xs uppercase text-slate-400">Saldo do Sistema</p>
                <p className="text-lg font-bold text-[#539FA2]">{formatCurrency(kpis.currentCash)}</p>
              </div>
              <div className="rounded-md border border-[#539FA2]/20 bg-slate-950/40 p-3">
                <p className="text-xs uppercase text-slate-400">Diferença</p>
                <p className={`text-lg font-bold ${closeDifference === 0 ? 'text-[#539FA2]' : closeDifference > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(closeDifference)}
                </p>
              </div>
            </div>
            <Input
              type="number"
              label="Valor em Dinheiro Contado no Físico"
              value={countedValue}
              onChange={(event) => setCountedValue(event.target.value)}
              min="0"
              step="0.01"
              className="bg-slate-950/60 border-[#539FA2]/30 text-slate-200"
            />
            <div className="space-y-2 w-full">
              <label className="text-xs uppercase font-bold text-slate-400 tracking-wider ml-1">
                Justificativa {closeDifference !== 0 ? '(Obrigatória)' : '(Opcional)'}
              </label>
              <textarea
                value={closeJustification}
                onChange={(event) => setCloseJustification(event.target.value)}
                className="flex min-h-28 w-full rounded-md border border-[#539FA2]/30 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#539FA2] focus-visible:border-[#539FA2]/50 transition-all duration-300"
                placeholder="Descreva a causa da diferença de caixa."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setOpenCloseModal(false)}>Cancelar</Button>
            <Button className="bg-[#539FA2] text-slate-900 hover:bg-[#72B1A4]" onClick={handleCloseCash}>
              Confirmar Fechamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
