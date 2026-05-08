'use client';

import { useState } from 'react';
import { Search, Loader2, CheckCircle, Smartphone, Wrench, ShieldCheck, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface PublicOS {
  id: string;
  device: string;
  status: string;
  defect: string;
  total: number;
  technician?: {
    name: string;
  };
  customer: {
    name: string;
  };
}

const STATUS_LABELS: Record<string, string> = {
  ENTRADA: 'Fila de Entrada',
  DIAGNOSTICO: 'Em Diagnóstico',
  ORCAMENTO: 'Orçamento Pronto',
  AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
  APROVADO: 'Aprovado (Em Fila)',
  EM_REPARO: 'Em Reparo',
  AGUARDANDO_PECA: 'Aguardando Peça',
  FINALIZADO: 'Pronto para Retirada',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado. Aguardando Retirada na Loja',
};

const STATUS_ORDER = [
  'ENTRADA',
  'DIAGNOSTICO',
  'ORCAMENTO',
  'AGUARDANDO_APROVACAO',
  'APROVADO',
  'EM_REPARO',
  'AGUARDANDO_PECA',
  'FINALIZADO',
  'ENTREGUE',
];

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    const message = response?.data?.message;
    if (message) return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export function ServicesSection() {
  type ApprovalDecision = 'APPROVE' | 'REJECT';
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [osData, setOsData] = useState<PublicOS | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [approvalStep, setApprovalStep] = useState<'DETAILS' | 'SUCCESS'>('DETAILS');
  const [approvalDecision, setApprovalDecision] = useState<ApprovalDecision>('APPROVE');
  const [submittedDecision, setSubmittedDecision] = useState<ApprovalDecision>('APPROVE');
  const [submittingApproval, setSubmittingApproval] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
        toast.error('Digite o número da OS');
        return;
    }

    const sanitizedQuery = searchQuery.replace(/#/g, '').trim();

    if (!sanitizedQuery) {
        toast.error('Digite um número de OS válido');
        return;
    }

    setLoading(true);
    try {
        const response = await api.get(`/public/os?query=${sanitizedQuery}`);
        setOsData(response.data.data || response.data);
        setApprovalStep('DETAILS');
        setApprovalDecision('APPROVE');
        setSubmittedDecision('APPROVE');
        setIsModalOpen(true);
    } catch (error) {
        toast.error('Ordem de Serviço não encontrada.');
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  const handleConfirmApproval = async () => {
    if (!osData) return;
    setSubmittingApproval(true);

    try {
        await api.post(`/public/os/${osData.id}/approve`, {
            decision: approvalDecision
        });
        setSubmittedDecision(approvalDecision);
        setApprovalStep('SUCCESS');
        setOsData(prev => prev ? ({ ...prev, status: approvalDecision === 'APPROVE' ? 'APROVADO' : 'CANCELADO' }) : null);
    } catch (error: unknown) {
        const msg = getApiErrorMessage(error, 'Erro ao processar decisão.');
        toast.error(msg);
    } finally {
        setSubmittingApproval(false);
    }
  };

  const getStatusProgress = (status: string) => {
    const idx = STATUS_ORDER.indexOf(status);
    if (idx === -1) return 0;
    return ((idx + 1) / STATUS_ORDER.length) * 100;
  };

  return (
    <section id="servicos" className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(0,212,255,0.06),transparent_60%)] z-0 pointer-events-none" />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-orbitron mb-4">
            <span className="text-white">Nossos</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Serviços</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
            Especialistas em reviver seu setup. Acompanhe o status do seu equipamento em tempo real.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16 sm:mb-20">
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] p-1.5 sm:p-2 rounded-2xl flex gap-2 shadow-2xl shadow-neon-blue/5 backdrop-blur-sm focus-within:border-neon-blue/40 transition-all duration-300">
            <Input
              placeholder="Digite o número da sua OS (ex: IP7DJP)"
              className="bg-transparent border-none text-white placeholder:text-gray-500 h-11 sm:h-12 text-base sm:text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              size="lg"
              className="bg-neon-blue hover:bg-neon-blue-dark text-black font-bold h-11 sm:h-12 px-6 sm:px-8 rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.2)] hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] transition-all duration-300 shrink-0"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3">
            *O número da OS encontra-se no comprovante entregue na loja.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <ServiceCard
            icon={<Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-neon-purple" />}
            title="Reparo Mobile"
            description="Troca de telas, baterias e reparos em placas de iPhones e Androids com peças originais."
          />
          <ServiceCard
            icon={<Wrench className="w-8 h-8 sm:w-10 sm:h-10 text-neon-blue" />}
            title="Manutenção de Consoles"
            description="Limpeza completa, troca de pasta térmica e reparo de hardware para PS5, Xbox e Switch."
          />
          <ServiceCard
            icon={<ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-cta-gold" />}
            title="Upgrade & PC Gamer"
            description="Montagem, otimização e upgrades para extrair o máximo de FPS do seu computador."
          />
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#12121a] border border-[rgba(255,255,255,0.08)] text-white sm:max-w-[520px] shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          {osData && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl font-orbitron flex items-center flex-wrap gap-2">
                  STATUS DO SERVIÇO
                  <Badge variant="outline" className="bg-white/5 text-neon-blue border-neon-blue/40 text-xs">
                    #{osData.id.slice(-6).toUpperCase()}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              {approvalStep === 'DETAILS' && (
                <div className="space-y-5 sm:space-y-6 py-2 sm:py-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                      <div className="bg-white/5 p-3 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-1">Equipamento</p>
                        <p className="font-medium text-white">{osData.device}</p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-1">Status Atual</p>
                        <p className="font-bold text-neon-blue text-sm">{STATUS_LABELS[osData.status] || osData.status}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs uppercase font-bold mb-2">Progresso do Serviço</p>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full transition-all duration-700"
                          style={{ width: `${getStatusProgress(osData.status)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] text-gray-500">Entrada</span>
                        <span className="text-[10px] text-gray-500">Entrega</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs uppercase font-bold mb-1">Defeito Relatado</p>
                      <p className="text-sm text-gray-300 bg-white/5 p-3 rounded-xl border border-white/5">{osData.defect}</p>
                    </div>

                    {osData.technician && (
                      <div className="bg-white/5 p-3 rounded-xl">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-1">Técnico Responsável</p>
                        <p className="text-sm font-medium text-white flex items-center gap-2">
                          <span className="w-2 h-2 bg-neon-blue rounded-full animate-pulse" />
                          {osData.technician.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {osData.status === 'AGUARDANDO_APROVACAO' && (
                    <div className="bg-neon-purple/10 border border-neon-purple/30 rounded-xl p-4 sm:p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-neon-purple">Orçamento Total:</span>
                        <span className="text-xl sm:text-2xl font-bold text-white">
                          {Number(osData.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Selecione sua decisão sobre o orçamento para continuar.
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setApprovalDecision('APPROVE')}
                          className={approvalDecision === 'APPROVE'
                            ? 'border-green-500 bg-green-500/15 text-green-400 hover:bg-green-500/25'
                            : 'border-white/20 text-gray-300 hover:bg-white/10'}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Eu aprovo o orçamento e a continuidade do serviço.
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setApprovalDecision('REJECT')}
                          className={approvalDecision === 'REJECT'
                            ? 'border-red-500 bg-red-500/15 text-red-400 hover:bg-red-500/25'
                            : 'border-white/20 text-gray-300 hover:bg-white/10'}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Eu não aprovo o orçamento.
                        </Button>
                      </div>
                      <Button
                        onClick={handleConfirmApproval}
                        className={`w-full text-white font-bold ${
                          approvalDecision === 'APPROVE'
                            ? 'bg-green-600 hover:bg-green-500'
                            : 'bg-red-600 hover:bg-red-500'
                        }`}
                        disabled={submittingApproval}
                      >
                        {submittingApproval ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {approvalDecision === 'APPROVE' ? 'Enviar Aprovação' : 'Enviar Desaprovação'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {approvalStep === 'SUCCESS' && (
                <div className="space-y-5 sm:space-y-6 py-6 sm:py-8 text-center">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto border-2 ${
                    submittedDecision === 'APPROVE'
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-red-500/20 border-red-500/50'
                  }`}>
                    {submittedDecision === 'APPROVE'
                      ? <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                      : <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {submittedDecision === 'APPROVE' ? 'Aprovação Confirmada!' : 'Desaprovação Confirmada!'}
                    </h3>
                    {submittedDecision === 'APPROVE' ? (
                      <p className="text-gray-400 text-sm sm:text-base">
                        Sua Ordem de Serviço foi aprovada.<br />
                        Nossos técnicos iniciarão o reparo em breve.
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm sm:text-base">
                        Sua Ordem de Serviço foi marcada como cancelada.<br />
                        A loja seguirá com o processo de devolução do equipamento.
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => { setIsModalOpen(false); setApprovalStep('DETAILS'); setApprovalDecision('APPROVE'); setSubmittedDecision('APPROVE'); }}
                    className="w-full bg-white hover:bg-gray-200 text-black font-bold"
                  >
                    Fechar
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ServiceCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:border-neon-blue/30 transition-all duration-500 group overflow-hidden hover:shadow-[0_0_30px_rgba(0,212,255,0.05)]">
      <CardHeader>
        <div className="mb-3 sm:mb-4 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">{icon}</div>
        <CardTitle className="text-lg sm:text-xl text-white group-hover:text-neon-blue transition-colors duration-300">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        <div className="mt-4 flex items-center text-neon-blue text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Saiba mais <ArrowRight className="w-3 h-3 ml-1" />
        </div>
      </CardContent>
    </Card>
  );
}
