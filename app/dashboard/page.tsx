'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Wrench, ShoppingCart, Headset, Loader2, Clock, CalendarDays, CalendarRange, Calendar, TrendingDown, Wallet, AlertCircle, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type DashboardServiceOrder = {
  id: string;
  device: string;
  status: string;
  customerName: string;
  createdAt: string;
};

type DashboardSale = {
  id: string;
  total: number;
  paymentMethod: string;
  status: string;
  customerName: string;
  createdAt: string;
};

type DashboardContact = {
  id: string;
  customerName: string;
  createdAt: string;
  itemInterest: string | null;
};

type DashboardSummary = {
  serviceOrders: DashboardServiceOrder[];
  sales: DashboardSale[];
  pendingContacts: {
    count: number;
    items: DashboardContact[];
  };
  financialSnapshot: {
    dailyRevenue: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    monthlyBalance: number;
    pendingReceivablesValue: number;
    pendingReceivablesCount: number;
    updatedAt: string;
  };
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelative(value: string): string {
  const now = Date.now();
  const target = new Date(value).getTime();
  const minutes = Math.max(0, Math.floor((now - target) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} d`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const OS_STATUS_LABELS: Record<string, string> = {
  ENTRADA: 'Entrada',
  DIAGNOSTICO: 'Diagnóstico',
  ORCAMENTO: 'Orçamento',
  AGUARDANDO_APROVACAO: 'Aguard. aprovação',
  APROVADO: 'Aprovado',
  EM_REPARO: 'Em reparo',
  AGUARDANDO_PECA: 'Aguard. peça',
  FINALIZADO: 'Finalizado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

const OS_STATUS_BADGE: Record<string, string> = {
  ENTRADA: 'destructive',
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

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary>({
    serviceOrders: [],
    sales: [],
    pendingContacts: { count: 0, items: [] },
    financialSnapshot: {
      dailyRevenue: 0,
      weeklyRevenue: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      monthlyBalance: 0,
      pendingReceivablesValue: 0,
      pendingReceivablesCount: 0,
      updatedAt: new Date(0).toISOString(),
    },
  });

  useEffect(() => {
    const emptySummary: DashboardSummary = {
      serviceOrders: [],
      sales: [],
      pendingContacts: { count: 0, items: [] },
      financialSnapshot: {
        dailyRevenue: 0,
        weeklyRevenue: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        monthlyBalance: 0,
        pendingReceivablesValue: 0,
        pendingReceivablesCount: 0,
        updatedAt: new Date(0).toISOString(),
      },
    };

    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/summary');
        const json = await response.json();
        if (!response.ok || !json.success) {
          setSummary(emptySummary);
          return;
        }
        setSummary(json.data as DashboardSummary);
      } catch {
        setSummary(emptySummary);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const cards = useMemo(() => {
    return [
      {
        key: 'service-orders',
        show: hasPermission('os'),
        title: 'Últimas Ordens de Serviço',
        description: 'Registros mais recentes da assistência técnica',
        icon: Wrench,
      },
      {
        key: 'sales',
        show: hasPermission('sales'),
        title: 'Últimas Vendas',
        description: 'Movimentações comerciais mais recentes',
        icon: ShoppingCart,
      },
      {
        key: 'contacts',
        show: hasPermission('atendimento'),
        title: 'Novos Contatos',
        description: 'Contatos aguardando retorno da loja',
        icon: Headset,
      },
    ].filter((item) => item.show);
  }, [hasPermission]);
  const canViewFinancial = hasPermission('financial');

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neon-blue/10 rounded-xl border border-neon-blue/20">
            <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-neon-blue" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron">
              Dashboard{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Virtual</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400">Visão executiva da operação em tempo real.</p>
          </div>
        </div>
        <Badge variant="neon" className="w-fit">
          {user?.role.toUpperCase()}
        </Badge>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-16 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-neon-blue" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {canViewFinancial && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <FinCard
                  title="Faturamento Diário"
                  description="Recebimentos pagos hoje"
                  value={formatCurrency(summary.financialSnapshot.dailyRevenue)}
                  icon={CalendarDays}
                  accent="from-emerald-500/20 to-emerald-500/5"
                  border="hover:border-emerald-500/30"
                  textColor="text-emerald-400"
                />
                <FinCard
                  title="Faturamento Semanal"
                  description="Recebimentos pagos na semana"
                  value={formatCurrency(summary.financialSnapshot.weeklyRevenue)}
                  icon={CalendarRange}
                  accent="from-neon-blue/20 to-neon-blue/5"
                  border="hover:border-neon-blue/30"
                  textColor="text-neon-blue"
                />
                <FinCard
                  title="Faturamento Mensal"
                  description="Recebimentos pagos no mês"
                  value={formatCurrency(summary.financialSnapshot.monthlyRevenue)}
                  icon={Calendar}
                  accent="from-blue-500/20 to-blue-500/5"
                  border="hover:border-blue-500/30"
                  textColor="text-blue-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <FinCard
                  title="Saídas no Mês"
                  description="Pagamentos já realizados"
                  value={formatCurrency(summary.financialSnapshot.monthlyExpenses)}
                  icon={TrendingDown}
                  accent="from-rose-500/20 to-rose-500/5"
                  border="hover:border-rose-500/30"
                  textColor="text-rose-400"
                />
                <FinCard
                  title="Saldo no Mês"
                  description="Faturamento mensal menos saídas"
                  value={formatCurrency(summary.financialSnapshot.monthlyBalance)}
                  icon={Wallet}
                  accent="from-violet-500/20 to-violet-500/5"
                  border="hover:border-violet-500/30"
                  textColor={summary.financialSnapshot.monthlyBalance >= 0 ? 'text-violet-400' : 'text-red-400'}
                />
                <FinCard
                  title="A Receber em Aberto"
                  description={`${summary.financialSnapshot.pendingReceivablesCount} títulos pendentes`}
                  value={formatCurrency(summary.financialSnapshot.pendingReceivablesValue)}
                  icon={AlertCircle}
                  accent="from-amber-500/20 to-amber-500/5"
                  border="hover:border-amber-500/30"
                  textColor="text-amber-400"
                />
              </div>
            </div>
          )}

          <div className={`grid grid-cols-1 md:grid-cols-2 ${cards.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-3 sm:gap-4 items-start`}>
            {cards.some((item) => item.key === 'service-orders') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
                  <div>
                    <CardTitle className="text-sm sm:text-base">Últimas OS</CardTitle>
                    <CardDescription>Histórico recente da oficina</CardDescription>
                  </div>
                  <div className="p-2 rounded-xl bg-neon-blue/10 border border-neon-blue/20">
                    <Wrench className="w-4 h-4 text-neon-blue" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-3 px-3 pb-3">
                  {summary.serviceOrders.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">Nenhuma ordem de serviço recente.</p>
                  ) : (
                    summary.serviceOrders.map((item) => (
                      <div key={item.id} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-white/[0.02] p-2.5 flex items-center justify-between gap-2 hover:bg-neon-blue/5 transition-colors">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">{item.device}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400 truncate">{item.customerName}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant={(OS_STATUS_BADGE[item.status] || 'default') as 'default' | 'destructive' | 'success' | 'warning' | 'purple'} className="text-[9px] uppercase px-1.5 py-0.5 h-auto">
                            {OS_STATUS_LABELS[item.status] || item.status}
                          </Badge>
                          <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 flex items-center justify-end gap-1">
                            <Clock className="w-2.5 h-2.5" /> {formatRelative(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {cards.some((item) => item.key === 'sales') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
                  <div>
                    <CardTitle className="text-sm sm:text-base">Últimas Vendas</CardTitle>
                    <CardDescription>Transações recentes do caixa</CardDescription>
                  </div>
                  <div className="p-2 rounded-xl bg-neon-blue/10 border border-neon-blue/20">
                    <ShoppingCart className="w-4 h-4 text-neon-blue" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-3 px-3 pb-3">
                  {summary.sales.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">Nenhuma venda recente.</p>
                  ) : (
                    summary.sales.map((item) => (
                      <div key={item.id} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-white/[0.02] p-2.5 flex items-center justify-between gap-2 hover:bg-neon-blue/5 transition-colors">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-white">{formatCurrency(item.total)}</p>
                          <p className="text-[10px] sm:text-xs text-gray-400 truncate">{item.customerName}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant="neon" className="text-[9px] uppercase px-1.5 py-0.5 h-auto">
                            {item.paymentMethod}
                          </Badge>
                          <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">{formatDateTime(item.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {cards.some((item) => item.key === 'contacts') && (
              <Card>
                <CardHeader className="flex flex-row items-start justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
                  <div>
                    <CardTitle className="text-sm sm:text-base">Novos Contatos</CardTitle>
                    <CardDescription>Aguardando atendimento</CardDescription>
                  </div>
                  <div className="text-right flex gap-2 items-center">
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold text-white leading-none">{summary.pendingContacts.count}</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">pendentes</p>
                    </div>
                    <div className="p-2 rounded-xl bg-neon-blue/10 border border-neon-blue/20">
                      <Headset className="w-4 h-4 text-neon-blue" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-3 px-3 pb-3">
                  {summary.pendingContacts.items.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">Não há contatos pendentes no momento.</p>
                  ) : (
                    summary.pendingContacts.items.map((item) => (
                      <div key={item.id} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-white/[0.02] p-2.5 flex flex-col justify-between gap-1 hover:bg-neon-blue/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">{item.customerName}</p>
                          <p className="text-[9px] sm:text-[10px] text-gray-500 shrink-0">{formatDateTime(item.createdAt)}</p>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-400 truncate flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-neon-blue/50 shrink-0" />
                          {item.itemInterest && item.itemInterest.trim().length > 0 ? item.itemInterest : 'Sem interesse informado'}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {cards.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12">
            <p className="text-gray-500 text-center">Sem módulos liberados para exibição do dashboard.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FinCard({
  title,
  description,
  value,
  icon: Icon,
  accent,
  textColor,
}: {
  title: string;
  description: string;
  value: string;
  icon: typeof CalendarDays;
  accent: string;
  border: string;
  textColor: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-50 pointer-events-none`} />
      <CardHeader className="flex flex-row items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3 relative">
        <div>
          <CardTitle className="text-xs sm:text-sm">{title}</CardTitle>
          <CardDescription className="text-[10px] sm:text-xs">{description}</CardDescription>
        </div>
        <Icon className={`w-4 h-4 ${textColor}`} />
      </CardHeader>
      <CardContent className="pt-4 relative">
        <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${textColor}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
