'use client';

import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Smartphone,
  Wrench,
  FileText,
  Send,
  Printer,
  XCircle,
  RefreshCw,
  Play,
  Pause,
  Package,
  Stethoscope,
  ThumbsUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { api } from '@/lib/api';

import { OSBudgetEditor } from '@/components/dashboard/os/os-budget-editor';
import { OSEditModal } from '@/components/dashboard/os/os-edit-modal';
import { OSDeliveryModal } from '@/components/dashboard/os/os-delivery-modal';
import { Pencil } from 'lucide-react';
import { CashClosedDialog } from '@/components/ui/cash-closed-dialog';
import { CashStatusBadge } from '@/components/ui/cash-status-badge';
import { getDailyCashStorageStatus } from '@/lib/daily-cash-client';

// Define types based on Prisma schema
type OSStatus = 
  | 'ENTRADA' 
  | 'DIAGNOSTICO' 
  | 'ORCAMENTO' 
  | 'AGUARDANDO_APROVACAO' 
  | 'APROVADO' 
  | 'EM_REPARO' 
  | 'AGUARDANDO_PECA' 
  | 'FINALIZADO' 
  | 'ENTREGUE' 
  | 'CANCELADO';

interface ServiceOrder {
  id: string;
  customerId: string;
  customer: {
    name: string;
    document: string;
    phone: string | null;
  };
  device: string;
  serial: string | null;
  defect: string;
  status: OSStatus;
  priority: string;
  notes: string | null;
  entryDate: string;
  endDate: string | null;
  total: number;
  totalParts: number;
  totalServices: number;
  history: {
    id: string;
    status: OSStatus;
    notes: string | null;
    createdAt: string;
  }[];
  items: unknown[];
  technicianId?: string;
  technician?: {
    name: string;
  };
}

const STATUS_LABELS: Record<OSStatus, string> = {
  ENTRADA: 'Fila de Entrada',
  DIAGNOSTICO: 'Diagnóstico / Orçamento',
  ORCAMENTO: 'Orçamento',
  AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
  APROVADO: 'Aprovado',
  EM_REPARO: 'Em Reparo',
  AGUARDANDO_PECA: 'Aguardando Peça',
  FINALIZADO: 'Finalizado',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

// Simplified timeline for visual progress
const VISUAL_TIMELINE = [
  { id: 'ENTRADA', label: 'Entrada' },
  { id: 'DIAGNOSTICO', label: 'Diag. / Orçamento' },
  { id: 'AGUARDANDO_APROVACAO', label: 'Aprovação' },
  { id: 'APROVADO', label: 'Aprovado' },
  { id: 'AGUARDANDO_PECA', label: 'Peças' },
  { id: 'EM_REPARO', label: 'Reparo' },
  { id: 'FINALIZADO', label: 'Finalizado' },
  { id: 'CANCELADO', label: 'Cancelado' },
  { id: 'ENTREGUE', label: 'Entregue' }
];

export default function OSDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  
  // Role checks - simplified and robust
  const isTech = ['ADMIN', 'MANAGER', 'TECH', 'tech', 'admin', 'manager', 'owner'].includes(user?.role || '');
  const isManager = ['ADMIN', 'MANAGER', 'manager', 'owner', 'admin'].includes(user?.role || '');

  const [os, setOs] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OSStatus>('ENTRADA');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [cashClosedDialogOpen, setCashClosedDialogOpen] = useState(false);

  const fetchOS = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/os/${id}`);
      
      const osData = response.data.data || response.data;
      
      if (!osData) {
        throw new Error('Dados da OS não retornados pela API');
      }

      setOs(osData);
      setStatus(osData.status);
    } catch (error) {
      console.error('Erro detalhado ao buscar OS:', error);
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err.response?.data?.message || err.message || 'Falha ao carregar detalhes da OS';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch OS Details
  useEffect(() => {
    if (id) {
        fetchOS();
    }
  }, [id, fetchOS]);

  // Auto-assign OS to technician if in ENTRADA
  useEffect(() => {
    // Only proceed if OS exists, user is a TECH (strictly), and user ID is available
    if (!os || !user?.id || user.role !== 'TECH') return;

    const isEntrada = os.status === 'ENTRADA';
    const isUnassigned = !os.technicianId;
    const isAssignedToMe = os.technicianId === user.id;

    // Trigger if (Entrada AND Unassigned) OR (Entrada AND Assigned to Me - to fix stuck state)
    if (isEntrada && (isUnassigned || isAssignedToMe)) {
        const autoAdvance = async () => {
            try {
                // Optimistic Update
                setOs(prev => prev ? ({ ...prev, technicianId: user.id, status: 'DIAGNOSTICO' }) : null);

                // 1. Assign if unassigned
                if (isUnassigned) {
                    await api.put(`/os/${os.id}`, { technicianId: user.id });
                }

                // 2. Update Status to DIAGNOSTICO (Use correct endpoint for status)
                await api.put('/os', { 
                    id: os.id, 
                    status: 'DIAGNOSTICO',
                    notes: 'Atribuição automática e início de diagnóstico.' 
                });
                
                toast.success('Diagnóstico iniciado.');
                await fetchOS();
            } catch (error) {
                console.error('Erro ao avançar OS:', error);
                toast.error('Erro ao iniciar diagnóstico automático.');
            }
        };
        autoAdvance();
    }
  }, [os, user?.role, user?.id, fetchOS]);

  const handleStatusChange = async (newStatus: OSStatus, autoNote?: string) => {
    if (!os) return;
    setSaving(true);
    try {
        const noteToSend = autoNote || note;
        await api.put('/os', {
            id: os.id,
            status: newStatus,
            notes: noteToSend || undefined
        });
        
        toast.success(`Status atualizado para ${STATUS_LABELS[newStatus as keyof typeof STATUS_LABELS] || newStatus}`);
        setNote('');
        await fetchOS();
    } catch (error) {
        console.error('Erro detalhado na requisição handleStatusChange:', error);
        const err = error as {
          response?: { data?: { message?: string; error?: string }; status?: number };
          request?: unknown;
          message?: string;
        };
        if (err.response) {
            console.error('Dados do erro:', err.response.data);
            console.error('Status do erro:', err.response.status);
            
            // Handle Axios error structure correctly
            const errorData = err.response.data;
            const errorMsg = errorData?.message || errorData?.error || 'Falha ao atualizar status';
            
            // Check for insufficient stock error
            if (errorMsg && errorMsg.includes('Insufficient stock')) {
                toast.error('Estoque insuficiente para completar o serviço.');
            } else {
                toast.error(`Erro: ${errorMsg}`);
            }
        } else if (err.request) {
            console.error('Sem resposta do servidor:', err.request);
            toast.error('Erro de conexão com o servidor');
        } else {
            console.error('Erro na configuração da requisição:', err.message);
            toast.error('Erro interno ao processar requisição');
        }
    } finally {
        setSaving(false);
    }
  };

  const handleSaveNote = async () => {
    if (!os || !note.trim()) return;
    setSaving(true);
    try {
        await api.put('/os', {
            id: os.id,
            status: status, // Keep current status
            notes: note
        });
        toast.success('Nota adicionada com sucesso');
        setNote('');
        await fetchOS();
    } catch (error) {
        console.error('Erro ao salvar nota:', error);
        toast.error('Erro ao salvar nota');
    } finally {
        setSaving(false);
    }
  };

  const openDeliveryFlow = useCallback(async () => {
    if (!os) return;
    if (os.status === 'CANCELADO') {
      setShowDeliveryModal(true);
      return;
    }
    try {
      const localStatus = getDailyCashStorageStatus();
      if (localStatus === 'FECHADO') {
        setCashClosedDialogOpen(true);
        return;
      }
      const response = await api.get('/financial/daily-entries/status');
      const isOpen = Boolean(response.data?.data?.isOpen ?? response.data?.isOpen);
      if (!isOpen) {
        setCashClosedDialogOpen(true);
        return;
      }
      setShowDeliveryModal(true);
    } catch {
      setCashClosedDialogOpen(true);
    }
  }, [os]);

  // Helper to determine active step index
  const getActiveStepIndex = (currentStatus: OSStatus) => {
    switch (currentStatus) {
      case 'ENTRADA': return 0;
      case 'DIAGNOSTICO': return 1;
      case 'ORCAMENTO': return 1; // Map legacy to Diagnosis step
      case 'AGUARDANDO_APROVACAO': return 2;
      case 'APROVADO': return 3;
      case 'AGUARDANDO_PECA': return 4;
      case 'EM_REPARO': return 5;
      case 'FINALIZADO': return 6;
      case 'CANCELADO': return 7;
      case 'ENTREGUE': return 8;
      default: return 0;
    }
  };

  const currentStepIndex = os ? getActiveStepIndex(os.status) : 0;

  // Dynamic Actions Component
  const renderActionButtons = () => {
    if (!os) return null;

    // Permissions:
    // 1. Entry: Open to any tech to grab.
    // 2. Assigned: Only the assigned technician can edit.
    // 3. Finished: Open to any tech/admin to deliver.
    // 4. Cancelled/Delivered: Read only (handled by parent checks usually, but safe to check here).
    
    const isAssignedTech = os.technicianId === user?.id;
    // Allow delivery by anyone if finished
    const isDeliveryPhase = os.status === 'FINALIZADO' || os.status === 'CANCELADO';
    // Allow grabbing if entry
    const isEntryPhase = os.status === 'ENTRADA';
    
    // Check restriction
    if (!isAssignedTech && !isDeliveryPhase && !isEntryPhase && os.status !== 'CANCELADO' && os.status !== 'ENTREGUE') {
         return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-center space-y-2">
                <div className="flex justify-center text-red-400">
                    <User className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-red-400 font-bold">Acesso Restrito</p>
                    <p className="text-xs text-gray-300/70 mt-1">
                        Esta OS está atribuída a:
                    </p>
                    <p className="text-sm font-bold text-gray-300 mt-1">
                        {os.technician?.name || 'Outro Técnico'}
                    </p>
                </div>
            </div>
        );
    }

    switch (os.status) {
        case 'ENTRADA':
            return (
                <Button className="w-full bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300" onClick={() => handleStatusChange('DIAGNOSTICO', 'Iniciando diagnóstico técnico.')}>
                    <Stethoscope className="w-4 h-4 mr-2" /> Iniciar Diagnóstico
                </Button>
            );
        case 'DIAGNOSTICO':
            return (
                <div className="space-y-2">
                    <Button className="w-full bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300" onClick={() => handleStatusChange('AGUARDANDO_APROVACAO', 'Diagnóstico/Orçamento concluído. Enviado para aprovação.')}>
                        <Send className="w-4 h-4 mr-2" /> Enviar para Aprovação
                    </Button>
                    <Button variant="outline" className="w-full border-cyan-400 text-gray-300 hover:bg-cyan-400/10" onClick={() => handleStatusChange('EM_REPARO', 'Iniciando reparo direto (sem orçamento).')}>
                        <Wrench className="w-4 h-4 mr-2" /> Iniciar Reparo Direto
                    </Button>
                </div>
            );
        case 'ORCAMENTO': // Legacy handler
            return (
                <Button className="w-full bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300" onClick={() => handleStatusChange('AGUARDANDO_APROVACAO', 'Orçamento enviado ao cliente.')}>
                    <Send className="w-4 h-4 mr-2" /> Enviar para Aprovação
                </Button>
            );
        case 'AGUARDANDO_APROVACAO':
            return (
                <div className="space-y-2">
                    <Button className="w-full bg-green-500 text-black font-bold hover:bg-green-400" onClick={() => handleStatusChange('APROVADO', 'Orçamento aprovado pelo cliente.')}>
                        <ThumbsUp className="w-4 h-4 mr-2" /> Aprovar Orçamento
                    </Button>
                    <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => handleStatusChange('CANCELADO', 'Orçamento rejeitado pelo cliente.')}>
                        <XCircle className="w-4 h-4 mr-2" /> Rejeitar / Cancelar
                    </Button>
                </div>
            );
        case 'APROVADO':
            return (
                <Button className="w-full bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300" onClick={() => handleStatusChange('EM_REPARO', 'Iniciando reparo após aprovação.')}>
                    <Play className="w-4 h-4 mr-2" /> Iniciar Reparo
                </Button>
            );
        case 'EM_REPARO':
            return (
                <div className="space-y-2">
                    <Button className="w-full bg-green-500 text-black font-bold hover:bg-green-400" onClick={() => handleStatusChange('FINALIZADO', 'Serviço finalizado com sucesso.')}>
                        <CheckCircle className="w-4 h-4 mr-2" /> Finalizar Serviço
                    </Button>
                    <Button variant="outline" className="w-full border-orange-500 text-orange-500 hover:bg-orange-500/10" onClick={() => handleStatusChange('AGUARDANDO_PECA', 'Parado aguardando peças.')}>
                        <Pause className="w-4 h-4 mr-2" /> Aguardar Peça
                    </Button>
                </div>
            );
        case 'AGUARDANDO_PECA':
            return (
                <Button className="w-full bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300" onClick={() => handleStatusChange('EM_REPARO', 'Peça chegou. Retomando reparo.')}>
                    <Play className="w-4 h-4 mr-2" /> Retomar Reparo
                </Button>
            );
        case 'FINALIZADO':
            return (
                <Button className="w-full bg-green-600 text-white font-bold hover:bg-green-500" onClick={openDeliveryFlow}>
                    <Package className="w-4 h-4 mr-2" /> Iniciar Processo de Entrega
                </Button>
            );
        case 'CANCELADO':
            return (
                <Button className="w-full bg-red-600 text-white font-bold hover:bg-red-500" onClick={openDeliveryFlow}>
                    <Package className="w-4 h-4 mr-2" /> Iniciar Processo de Devolução
                </Button>
            );
        default:
            return <p className="text-sm text-gray-300/50 text-center">Nenhuma ação disponível para este status.</p>;
    }
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-300/70 gap-4">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p>Carregando detalhes da OS...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-center">
                <h3 className="text-xl font-bold text-gray-300 mb-2">Erro ao carregar OS</h3>
                <p className="text-gray-300/70 max-w-md mx-auto mb-6">{error}</p>
                <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => router.back()} className="border-cyan-400/20 text-gray-300 hover:bg-cyan-400/10">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button onClick={() => fetchOS()} className="bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300">
                        <RefreshCw className="w-4 h-4 mr-2" /> Tentar Novamente
                    </Button>
                </div>
            </div>
        </div>
    );
  }

  if (!os) {
    return <div className="p-8 text-center text-red-400">OS não encontrada</div>;
  }

  const canEditDetails = ['ADMIN', 'MANAGER', 'SELLER', 'admin', 'manager', 'owner'].includes(user?.role || '');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <CashStatusBadge />
      {showEditModal && (
        <OSEditModal 
            os={os} 
            onClose={() => setShowEditModal(false)} 
            onUpdate={fetchOS} 
        />
      )}

      {showDeliveryModal && (
        <OSDeliveryModal 
            osId={os.id} 
            osStatus={os.status}
            onClose={() => setShowDeliveryModal(false)} 
            onSuccess={fetchOS} 
        />
      )}

      <CashClosedDialog
        open={cashClosedDialogOpen}
        onOpenChange={setCashClosedDialogOpen}
        title="Caixa diário fechado para entrega da OS"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-gray-300 hover:bg-cyan-400/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-300 font-orbitron">OS #{os.id.slice(-6).toUpperCase()}</h1>
              <Badge className={`text-lg px-3 py-1 ${
                os.status === 'FINALIZADO' ? 'bg-green-500/20 text-green-400' :
                os.status === 'CANCELADO' ? 'bg-red-500/20 text-red-400' :
                'bg-cyan-400/20 text-gray-300'
              }`}>
                {STATUS_LABELS[os.status as keyof typeof STATUS_LABELS] || os.status}
              </Badge>
            </div>
            <p className="text-gray-300/70 mt-1">
              Aberta em {new Date(os.entryDate).toLocaleDateString('pt-BR')} às {new Date(os.entryDate).toLocaleTimeString('pt-BR')}
            </p>
            {os.technician && (
                <p className="text-gray-300 font-bold mt-1 text-sm flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Téc. Responsável: {os.technician.name}
                </p>
            )}
            {os.total > 0 && (
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-300/70">Valor Total:</span>
                    <span className="text-xl font-bold text-gray-300 font-orbitron">
                        {os.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {canEditDetails && (
            <Button 
                variant="outline" 
                className="border-cyan-400/50 text-gray-300 hover:bg-cyan-400/10"
                onClick={() => setShowEditModal(true)}
            >
              <Pencil className="w-4 h-4 mr-2" /> Editar Dados
            </Button>
          )}
          {isManager && os.status !== 'CANCELADO' && os.status !== 'ENTREGUE' && (
            <Button 
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-500/10"
                onClick={() => {
                    if (confirm('Tem certeza que deseja cancelar esta OS?')) {
                        handleStatusChange('CANCELADO', 'OS Cancelada manualmente.');
                    }
                }}
            >
              <XCircle className="w-4 h-4 mr-2" /> Cancelar OS
            </Button>
          )}
          <Button variant="outline" className="border-cyan-400/20 text-gray-300 hover:bg-cyan-400/10">
            <Printer className="w-4 h-4 mr-2" /> Imprimir
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <Card className="overflow-hidden border-cyan-400/20 bg-[#0f172a]">
        <div className="p-6">
          <div className="flex justify-between items-center relative">
            {/* Background Line */}
            <div className="absolute left-0 top-3 w-full h-1 bg-cyan-400/10 -z-0" />
            
            {/* Progress Line */}
            <div 
              className="absolute left-0 top-3 h-1 bg-cyan-400 transition-all duration-500 -z-0" 
              style={{ width: `${Math.max(0, Math.min(100, (currentStepIndex / (VISUAL_TIMELINE.length - 1)) * 100))}%` }}
            />

            {VISUAL_TIMELINE.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center relative z-10 gap-2 w-full max-w-[100px]">
                  <div className={`
                    w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-slate-950
                    ${isCompleted ? 'bg-cyan-400 border-cyan-400 text-slate-950' : 'border-cyan-400/20 text-gray-300/50'}
                    ${isCurrent ? 'ring-4 ring-cyan-400/20 scale-110' : ''}
                  `}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-3 h-3" />}
                  </div>
                  <span className={`text-[9px] uppercase font-bold text-center leading-tight ${isCompleted ? 'text-gray-300' : 'text-slate-500'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client & Equipment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#0f172a] border-cyan-400/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-gray-300">
                  <User className="w-4 h-4" /> Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-lg font-bold text-neon-blue">{os.customer.name}</p>
                <p className="text-sm text-gray-300/70">Doc: {os.customer.document}</p>
                <p className="text-sm text-gray-300/70">Tel: {os.customer.phone || 'N/A'}</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0f172a] border-cyan-400/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-gray-300">
                  <Smartphone className="w-4 h-4" /> Equipamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-lg font-bold text-gray-300">{os.device}</p>
                <p className="text-sm text-gray-300/70">S/N: {os.serial || 'N/A'}</p>
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded mt-2">
                  <p className="text-xs text-red-300 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Defeito:
                  </p>
                  <p className="text-xs text-red-200 mt-1">{os.defect}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget / Items Editor */}
          <OSBudgetEditor 
            osId={os.id} 
            status={os.status} 
            readOnly={['FINALIZADO', 'ENTREGUE', 'CANCELADO'].includes(os.status)}
            onUpdate={fetchOS}
          />

          {/* History / Chat */}
          <Card className="bg-[#0f172a] border-cyan-400/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-300">
                <FileText className="w-4 h-4" /> Histórico de Ações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative pl-4 border-l border-cyan-400/20">
                {os.history.map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-[#0f172a]" />
                    <div className="bg-slate-950/60 p-3 rounded-lg border border-cyan-400/10 group-hover:border-cyan-400/30 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-300 text-sm">
                            {STATUS_LABELS[item.status] || item.status}
                        </span>
                        <span className="text-xs text-gray-300/50">
                          {new Date(item.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {item.notes && <p className="text-sm text-gray-300/70 mt-1">{item.notes}</p>}
                    </div>
                  </div>
                ))}
                
                {os.history.length === 0 && (
                    <p className="text-gray-300/50 italic text-sm">Nenhum histórico registrado.</p>
                )}
              </div>

              {/* Add Note Action */}
              <div className="mt-6 pt-6 border-t border-cyan-400/20">
                <label className="text-sm font-bold text-gray-300/70 mb-2 block">Adicionar Nota / Atualização</label>
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Descreva o procedimento realizado ou motivo da alteração de status..." 
                    className="min-h-[60px] bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <Button 
                    className="h-auto self-end border-cyan-400/20 text-gray-300 hover:bg-cyan-400/10"
                    variant="outline"
                    onClick={handleSaveNote} 
                    disabled={saving || !note.trim()}
                    title="Salvar Nota"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          {/* Tech Actions */}
          {isTech && os.status !== 'ENTREGUE' && (
            <Card className="border-cyan-400/30 bg-cyan-400/5">
              <CardHeader>
                <CardTitle className="text-gray-300 flex items-center gap-2">
                  <Wrench className="w-4 h-4" /> Área Técnica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-300/70 uppercase">Status Atual</label>
                    <div className="flex items-center gap-2 p-2 bg-slate-950/60 rounded border border-cyan-400/20">
                        <Badge className="bg-cyan-400 text-slate-950">{STATUS_LABELS[os.status as keyof typeof STATUS_LABELS] || os.status}</Badge>
                    </div>
                </div>

                <div className="pt-2 border-t border-cyan-400/20">
                    <label className="text-xs font-bold text-gray-300/70 uppercase mb-2 block">Ações Disponíveis</label>
                    {renderActionButtons()}
                </div>
                
                {/* Fallback Manual Update */}
                <div className="pt-4 mt-4 border-t border-cyan-400/20">
                    <label className="text-[10px] text-gray-300/50 uppercase mb-1 block">Alteração Manual (Fallback)</label>
                    <Select 
                        value={status}
                        onValueChange={(val) => {
                            setStatus(val as OSStatus);
                            // Optional: Confirm change?
                        }}
                    >
                        <SelectTrigger className="h-8 text-xs bg-slate-950/60 border-cyan-400/10 text-slate-300">
                            <SelectValue placeholder="Forçar Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-cyan-400/20">
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key} className="text-slate-300 focus:bg-cyan-400/10 focus:text-gray-300">{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {status !== os.status && (
                        <Button 
                            size="sm" 
                            variant="secondary" 
                            className="w-full mt-2 h-7 text-xs bg-slate-800 text-gray-300 hover:bg-slate-700 border border-cyan-400/20"
                            onClick={() => handleStatusChange(status, `Alteração manual de status para ${STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}`)}
                        >
                            Salvar Mudança Manual
                        </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manager Actions */}
          {isManager && (
            <Card className="bg-[#0f172a] border-cyan-400/20">
              <CardHeader>
                <CardTitle className="text-gray-300">Gerenciamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-300/70 uppercase">Prioridade</label>
                    <Select 
                        value={os.priority} 
                        disabled // Disabled for now, would need another state/handler
                    >
                        <SelectTrigger className="bg-slate-950/60 border-cyan-400/20 text-slate-300">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LOW">Baixa</SelectItem>
                            <SelectItem value="NORMAL">Normal</SelectItem>
                            <SelectItem value="HIGH">Alta</SelectItem>
                            <SelectItem value="URGENT">Urgente</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
