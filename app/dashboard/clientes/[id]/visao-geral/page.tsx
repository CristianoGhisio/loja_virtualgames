'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, Edit, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface Client {
  id: string;
  name: string;
  email: string;
  document: string;
  type: string;
  phone?: string | null;
  cep?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
}

function getStageLabel(label: Record<string, string>, key: string | null | undefined): string | null {
  if (!key) return null;
  // eslint-disable-next-line security/detect-object-injection
  return label[key] ?? key;
}

export default function ClientGeneralPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [funnelStage, setFunnelStage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const stageLabel: Record<string, string> = {
    NOVO_CONTATO: 'Novo Contato',
    EM_ANDAMENTO: 'Em Andamento',
    CONTATO_QUENTE: 'Contato Quente',
    VENDA_CONCLUIDA: 'Venda Concluída',
  };

  useEffect(() => {
    const loadClient = async () => {
      try {
        const response = await api.get<Client>(`/clients/${id}`);
        setClient(response.data);
        const funnelResponse = await api.get(`/clients/${id}/funnel`);
        setFunnelStage(funnelResponse.data?.stage ?? null);
      } catch (error) {
        console.error('Erro ao carregar cliente', error);
      } finally {
        setLoading(false);
      }
    };
    loadClient();
  }, [id]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-400">
          Carregando dados do cliente...
        </CardContent>
      </Card>
    );
  }

  if (!client) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-400">
          Cliente não encontrado.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center border-b border-[rgba(255,255,255,0.06)] pb-4">
        <CardTitle className="flex items-center gap-2">
          {client.type === 'PJ' ? <Building2 className="w-5 h-5 text-neon-blue" /> : <User className="w-5 h-5 text-neon-blue" />}
          Informações Cadastrais
          {funnelStage ? <Badge variant="neon" className="ml-2">{getStageLabel(stageLabel, funnelStage)}</Badge> : null}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/clientes/${id}/editar`)}>
          <Edit className="w-4 h-4 mr-2" /> Editar
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Nome / Razão Social</p>
            <p className="text-base font-bold text-white">{client.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">CPF / CNPJ</p>
            <p className="text-base text-gray-300">{client.document}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Tipo</p>
            <p className="text-base text-gray-300">{client.type === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
            <p className="text-base text-gray-300">{client.email || '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1"><Phone className="w-3 h-3" /> Telefone</p>
            <p className="text-base text-gray-300">{client.phone || '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1"><MapPin className="w-3 h-3" /> Endereço</p>
            <p className="text-base text-gray-300">
              {[client.street, client.number, client.complement, client.neighborhood, client.city, client.state].filter(Boolean).join(', ') || '-'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
