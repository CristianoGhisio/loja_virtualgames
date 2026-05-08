'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BellRing } from 'lucide-react';

type BudgetComparison = {
  budgetRevenue: number;
  budgetExpense: number;
  actualRevenue: number;
  actualExpense: number;
  revenueVariance: number;
  expenseVariance: number;
};

type AlertRow = {
  id: string;
  type: string;
  message: string;
  dueDate: string;
  value: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function RealtimePanel() {
  const [budgetComparison, setBudgetComparison] = useState<BudgetComparison | null>(null);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [budgetRevenue, setBudgetRevenue] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('financial_budget_revenue') ?? '';
  });
  const [budgetExpense, setBudgetExpense] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('financial_budget_expense') ?? '';
  });

  const fetchData = useCallback(async (revenue: string, expense: string) => {
    try {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      
      const params: Record<string, string> = { from, to };
      if (revenue) params.budgetRevenue = revenue;
      if (expense) params.budgetExpense = expense;

      const response = await api.get('/financial/intelligence', { params });
      return response.data?.data as { budgetComparison: BudgetComparison; alerts: AlertRow[] } | undefined;
    } catch (error) {
      console.error('Error loading realtime data', error);
      return undefined;
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      const payload = await fetchData(budgetRevenue, budgetExpense);
      if (!active || !payload) return;
      setBudgetComparison(payload.budgetComparison);
      setAlerts(payload.alerts);
    };

    void run();
    const interval = setInterval(() => {
      void run();
    }, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [budgetRevenue, budgetExpense, fetchData]);

  const saveBudget = async () => {
    localStorage.setItem('financial_budget_revenue', budgetRevenue || '0');
    localStorage.setItem('financial_budget_expense', budgetExpense || '0');
    const payload = await fetchData(budgetRevenue, budgetExpense);
    if (!payload) return;
    setBudgetComparison(payload.budgetComparison);
    setAlerts(payload.alerts);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#0f172a] border-cyan-400/20">
          <CardHeader><CardTitle className="text-sm font-bold uppercase text-neon-blue">Planejamento Orçamentário</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" label="Orçamento Receita" value={budgetRevenue} onChange={(event) => setBudgetRevenue(event.target.value)} className="bg-slate-950/60 border-cyan-400/30 text-slate-200" />
              <Input type="number" label="Orçamento Despesa" value={budgetExpense} onChange={(event) => setBudgetExpense(event.target.value)} className="bg-slate-950/60 border-cyan-400/30 text-slate-200" />
            </div>
            <Button variant="outline" size="sm" onClick={saveBudget} className="text-neon-blue hover:bg-neon-blue/10 border-neon-blue/30">Salvar orçamento</Button>
            {budgetComparison ? (
              <div className="text-sm space-y-1 mt-4 p-3 bg-slate-950/40 rounded border border-cyan-400/20">
                <div className="flex justify-between text-slate-300"><span>Receita Orçada x Realizada:</span> <span>{formatCurrency(budgetComparison.budgetRevenue)} x {formatCurrency(budgetComparison.actualRevenue)}</span></div>
                <div className="flex justify-between text-slate-300"><span>Despesa Orçada x Realizada:</span> <span>{formatCurrency(budgetComparison.budgetExpense)} x {formatCurrency(budgetComparison.actualExpense)}</span></div>
                <div className={`flex justify-between ${budgetComparison.revenueVariance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}><span>Variação Receita:</span> <span>{formatCurrency(budgetComparison.revenueVariance)}</span></div>
                <div className={`flex justify-between ${budgetComparison.expenseVariance <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}><span>Variação Despesa:</span> <span>{formatCurrency(budgetComparison.expenseVariance)}</span></div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="bg-[#0f172a] border-cyan-400/20">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm font-bold uppercase text-neon-blue"><BellRing className="w-5 h-5 text-yellow-300" /> Alertas Automáticos</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
            {alerts.length === 0 ? <div className="text-sm text-slate-400">Sem alertas no período.</div> : alerts.map((item, index) => (
              <div key={`${item.type}-${item.id}-${item.dueDate}-${index}`} className="p-3 rounded border border-cyan-400/10 bg-slate-950/40 flex justify-between items-center">
                <div>
                  <div className="text-sm text-slate-200">{item.message}</div>
                  <div className="text-xs text-slate-400">{new Date(item.dueDate).toLocaleDateString('pt-BR')}</div>
                </div>
                <div className="font-semibold text-rose-400">{formatCurrency(item.value)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
