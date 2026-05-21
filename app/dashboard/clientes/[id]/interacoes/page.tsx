'use client';

import { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { MessageSquare } from 'lucide-react';

interface Interaction {
  id: string;
  type: string;
  content: string;
  createdAt: string;
}

export default function ClientInteractionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInteractions = async () => {
    try {
      const res = await api.get(`/clients/${id}/interactions`);
      setInteractions(res.data);
    } catch (error) {
      console.error('Failed to fetch interactions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-300">
      <Card>
        <CardHeader className="border-b border-[rgba(255,255,255,0.06)] pb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-neon-blue" />
            Registro de Interações
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <p className="text-sm text-gray-400">
            Novas interações são geradas automaticamente pelo módulo Atendimento durante movimentações e atualizações de cards.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {interactions.map((interaction) => (
          <Card key={interaction.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-1 rounded bg-neon-blue/10 text-neon-blue uppercase">
                    {interaction.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(interaction.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{interaction.content}</p>
            </CardContent>
          </Card>
        ))}
        {interactions.length === 0 && !loading && (
          <p className="text-center text-gray-400 py-8">Nenhuma interação registrada.</p>
        )}
      </div>
    </div>
  );
}
