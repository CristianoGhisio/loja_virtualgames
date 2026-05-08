'use client';

import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type PaymentFeeConfig = {
  creditFixedFee: string;
  creditVariableFee: string;
  debitFixedFee: string;
  debitVariableFee: string;
};

export default function PagamentosPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PaymentFeeConfig>({
    creditFixedFee: '0',
    creditVariableFee: '0',
    debitFixedFee: '0',
    debitVariableFee: '0',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/settings/payment-fees');
        const data = response.data?.data;
        setForm({
          creditFixedFee: String(Number(data?.creditFixedFee ?? 0)),
          creditVariableFee: String(Number(data?.creditVariableFee ?? 0)),
          debitFixedFee: String(Number(data?.debitFixedFee ?? 0)),
          debitVariableFee: String(Number(data?.debitVariableFee ?? 0)),
        });
      } catch {
        toast.error('Erro ao carregar configuração de taxas');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleSave = async () => {
    const payload = {
      creditFixedFee: Number(form.creditFixedFee || 0),
      creditVariableFee: Number(form.creditVariableFee || 0),
      debitFixedFee: Number(form.debitFixedFee || 0),
      debitVariableFee: Number(form.debitVariableFee || 0),
    };

    if (Object.values(payload).some((value) => !Number.isFinite(value) || value < 0)) {
      toast.error('Informe apenas valores numéricos maiores ou iguais a zero');
      return;
    }

    setSaving(true);
    try {
      await api.post('/settings/payment-fees', payload);
      toast.success('Taxas de cartão salvas');
    } catch {
      toast.error('Erro ao salvar taxas de cartão');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Métodos de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-gray-400">Carregando configuração...</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                type="number"
                label="Crédito - Taxa fixa (R$)"
                value={form.creditFixedFee}
                onChange={(event) => setForm((state) => ({ ...state, creditFixedFee: event.target.value }))}
              />
              <Input
                type="number"
                label="Crédito - Taxa variável (%)"
                value={form.creditVariableFee}
                onChange={(event) => setForm((state) => ({ ...state, creditVariableFee: event.target.value }))}
              />
              <Input
                type="number"
                label="Débito - Taxa fixa (R$)"
                value={form.debitFixedFee}
                onChange={(event) => setForm((state) => ({ ...state, debitFixedFee: event.target.value }))}
              />
              <Input
                type="number"
                label="Débito - Taxa variável (%)"
                value={form.debitVariableFee}
                onChange={(event) => setForm((state) => ({ ...state, debitVariableFee: event.target.value }))}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="bg-neon-blue text-black font-bold">
                {saving ? 'Salvando...' : 'Salvar Taxas'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
