'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { getDailyCashStorageStatus } from '@/lib/daily-cash-client';

type CashStatus = 'ABERTO' | 'FECHADO';

type CashStatusBadgeProps = {
  className?: string;
};

export function CashStatusBadge({ className }: CashStatusBadgeProps) {
  const [status, setStatus] = useState<CashStatus>('FECHADO');
  const [loading, setLoading] = useState(true);

  const loadStatus = useCallback(async () => {
    try {
      const localStatus = getDailyCashStorageStatus();
      if (localStatus === 'FECHADO') {
        setStatus('FECHADO');
        setLoading(false);
        return;
      }
      const response = await api.get('/financial/daily-entries/status');
      const isOpen = Boolean(response.data?.data?.isOpen ?? response.data?.isOpen);
      setStatus(isOpen ? 'ABERTO' : 'FECHADO');
    } catch {
      setStatus('FECHADO');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
    const interval = window.setInterval(() => {
      void loadStatus();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [loadStatus]);

  return (
    <div className={className ?? 'fixed top-20 right-4 z-40'}>
      <Badge
        className={
          loading
            ? 'bg-slate-800 text-slate-300 border border-slate-600 px-3 py-1'
            : status === 'ABERTO'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 px-3 py-1'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/40 px-3 py-1'
        }
      >
        Caixa: {loading ? 'CARREGANDO' : status}
      </Badge>
    </div>
  );
}
