
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, QrCode, ArrowRight, Package, CreditCard, Wallet, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { CashClosedDialog } from '@/components/ui/cash-closed-dialog';

interface OSDeliveryModalProps {
  osId: string;
  osStatus: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function OSDeliveryModal({ osId, osStatus, onClose, onSuccess }: OSDeliveryModalProps) {
  const isCancelledDelivery = osStatus === 'CANCELADO';
  const [step, setStep] = useState<'VERIFY' | 'PAYMENT'>('VERIFY');
  const [loading, setLoading] = useState(false);
  const [financials, setFinancials] = useState<{ total: number; paid: number; remaining: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO'>('PIX');
  const [cashClosedDialogOpen, setCashClosedDialogOpen] = useState(false);

  useEffect(() => {
    if (step === 'PAYMENT' && !isCancelledDelivery) {
        const fetchFinancials = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/os/${osId}/financials`);
                setFinancials(res.data.data || res.data);
            } catch (error) {
                console.error(error);
                toast.error('Erro ao carregar dados financeiros');
            } finally {
                setLoading(false);
            }
        };
        fetchFinancials();
    }
  }, [step, osId, isCancelledDelivery]);

  const handleConfirmDelivery = async () => {
    setLoading(true);
    try {
        await api.post(`/os/${osId}/deliver`, {
          paymentMethod: !isCancelledDelivery && financials && financials.remaining > 0 ? paymentMethod : undefined,
        });
        toast.success(isCancelledDelivery ? 'Devolução concluída com sucesso!' : 'OS Entregue com sucesso!');
        onSuccess();
        onClose();
    } catch (error) {
        const message = (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error
          || (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message
          || '';
        if (String(message).toLowerCase().includes('caixa diário fechado')) {
          setCashClosedDialogOpen(true);
        }
        console.error(error);
        toast.error(message || 'Erro ao registrar entrega');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f172a] border-cyan-400/20 text-slate-300 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-orbitron flex items-center gap-2 text-cyan-300">
            <Package className="w-5 h-5 text-cyan-300" /> {isCancelledDelivery ? 'Processo de Devolução' : 'Processo de Entrega'}
          </DialogTitle>
          <DialogDescription className="text-cyan-300/70">
            {isCancelledDelivery
              ? 'Siga as etapas para finalizar a devolução do equipamento ao cliente.'
              : 'Siga as etapas para finalizar a entrega do equipamento.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Verification */}
        {step === 'VERIFY' && (
            <div className="space-y-6 py-4">
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <h3 className="font-bold text-yellow-500 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Verificação Presencial
                    </h3>
                    <p className="text-sm text-yellow-200/70">
                        {isCancelledDelivery
                          ? 'Solicite ao cliente que confira o equipamento e confirme a devolução nas mesmas condições de entrada.'
                          : 'Solicite ao cliente que teste o equipamento e verifique se o serviço foi realizado conforme esperado.'}
                    </p>
                </div>
                
                <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={onClose} className="text-cyan-300/70 hover:text-cyan-300 hover:bg-cyan-400/10">Cancelar</Button>
                    <Button 
                        onClick={() => setStep('PAYMENT')} 
                        className="bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300"
                    >
                        {isCancelledDelivery ? 'Equipamento Conferido' : 'Equipamento OK'} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        )}

        {step === 'PAYMENT' && (
            <div className="space-y-6 py-4">
                {isCancelledDelivery ? (
                    <>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                            <p className="text-red-400 font-bold">OS Cancelada</p>
                            <p className="text-xs text-red-300/80 mt-2">
                                Esta devolução será concluída sem cobrança financeira.
                            </p>
                        </div>
                        <div className="flex gap-2 justify-end pt-4 border-t border-cyan-400/20">
                            <Button variant="ghost" onClick={() => setStep('VERIFY')} className="text-cyan-300/70 hover:text-cyan-300 hover:bg-cyan-400/10">Voltar</Button>
                            <Button
                                onClick={handleConfirmDelivery}
                                disabled={loading}
                                className="bg-red-600 text-white font-bold hover:bg-red-500"
                            >
                                Confirmar Devolução
                            </Button>
                        </div>
                    </>
                ) : loading && !financials ? (
                    <div className="flex justify-center p-8">
                        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : financials ? (
                    <>
                        <div className="grid grid-cols-3 gap-2 text-center mb-4">
                            <div className="bg-slate-950/60 border border-cyan-400/10 p-2 rounded">
                                <p className="text-xs text-cyan-300/70 uppercase">Total</p>
                                <p className="font-bold text-slate-300">{financials.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </div>
                            <div className="bg-slate-950/60 border border-cyan-400/10 p-2 rounded">
                                <p className="text-xs text-cyan-300/70 uppercase">Pago</p>
                                <p className="font-bold text-green-400">{financials.paid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </div>
                            <div className="bg-slate-950/60 border border-cyan-400/30 p-2 rounded">
                                <p className="text-xs text-cyan-300/70 uppercase">A Pagar</p>
                                <p className="font-bold text-cyan-300">{financials.remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </div>
                        </div>

                        {financials.remaining > 0 ? (
                            <div className="space-y-4">
                                <div className="bg-slate-300 p-4 rounded-lg w-fit mx-auto shadow-lg relative group">
                                    <div className="w-40 h-40 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 gap-1 p-2">
                                            {[...Array(36)].map((_, i) => (
                                                <div key={i} className={`bg-slate-950 ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`} />
                                            ))}
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <QrCode className="w-24 h-24 text-cyan-300 mix-blend-difference" />
                                        </div>
                                    </div>
                                    <p className="text-slate-900 text-center text-xs font-bold mt-2">Pagamento na Entrega</p>
                                </div>
                                <p className="text-center text-xs text-cyan-300/70">
                                    Receba o pagamento de <strong>{financials.remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> via PIX, Dinheiro ou Cartão.
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className={`border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10 ${paymentMethod === 'PIX' ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300' : ''}`}
                                    onClick={() => setPaymentMethod('PIX')}
                                  >
                                    <QrCode className="w-4 h-4 mr-2" /> PIX
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className={`border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10 ${paymentMethod === 'CREDITO' ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300' : ''}`}
                                    onClick={() => setPaymentMethod('CREDITO')}
                                  >
                                    <CreditCard className="w-4 h-4 mr-2" /> Crédito
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className={`border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10 ${paymentMethod === 'DEBITO' ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300' : ''}`}
                                    onClick={() => setPaymentMethod('DEBITO')}
                                  >
                                    <Wallet className="w-4 h-4 mr-2" /> Débito
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className={`border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10 ${paymentMethod === 'DINHEIRO' ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300' : ''}`}
                                    onClick={() => setPaymentMethod('DINHEIRO')}
                                  >
                                    <Banknote className="w-4 h-4 mr-2" /> Dinheiro
                                  </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <p className="text-green-400 font-bold">Totalmente Quitado</p>
                                <p className="text-xs text-green-300/70">Nenhum valor pendente.</p>
                            </div>
                        )}

                        <div className="flex gap-2 justify-end pt-4 border-t border-cyan-400/20">
                            <Button variant="ghost" onClick={() => setStep('VERIFY')} className="text-cyan-300/70 hover:text-cyan-300 hover:bg-cyan-400/10">Voltar</Button>
                            <Button 
                                onClick={handleConfirmDelivery} 
                                disabled={loading}
                                className="bg-green-600 text-slate-950 font-bold hover:bg-green-500"
                            >
                                {financials.remaining > 0 ? 'Pagamento Recebido & Entregar' : 'Confirmar Entrega'}
                            </Button>
                        </div>
                    </>
                ) : null}
            </div>
        )}
      </DialogContent>
      <CashClosedDialog
        open={cashClosedDialogOpen}
        onOpenChange={setCashClosedDialogOpen}
        title={isCancelledDelivery ? 'Caixa diário fechado para concluir devolução' : 'Caixa diário fechado para concluir entrega'}
      />
    </Dialog>
  );
}
