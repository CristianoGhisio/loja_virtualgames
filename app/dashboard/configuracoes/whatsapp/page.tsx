'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, LogOut, RefreshCw, Link2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type WhatsappState = 'stopped' | 'initializing' | 'qr' | 'ready' | 'disconnected' | 'error';

type WhatsappStatus = {
  processRunning: boolean;
  state: WhatsappState;
  isReady: boolean;
  restarting: boolean;
  lastQr: string;
  lastQrAscii: string;
  lastError: string;
  lastDisconnectReason: string;
};

const INITIAL_STATUS: WhatsappStatus = {
  processRunning: false,
  state: 'stopped',
  isReady: false,
  restarting: false,
  lastQr: '',
  lastQrAscii: '',
  lastError: '',
  lastDisconnectReason: '',
};

function statusLabel(state: WhatsappState) {
  if (state === 'ready') return 'Conectado';
  if (state === 'qr') return 'Aguardando leitura do QR';
  if (state === 'initializing') return 'Inicializando';
  if (state === 'disconnected') return 'Desconectado';
  if (state === 'error') return 'Erro';
  return 'Parado';
}

function statusClass(state: WhatsappState) {
  if (state === 'ready') return 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10';
  if (state === 'qr') return 'text-yellow-200 border-yellow-300/40 bg-yellow-500/10';
  if (state === 'initializing') return 'text-neon-blue border-neon-blue/40 bg-neon-blue/10';
  if (state === 'error') return 'text-rose-200 border-rose-400/40 bg-rose-500/10';
  return 'text-gray-300 border-gray-400/30 bg-gray-500/10';
}

export default function ConfiguracoesWhatsappPage() {
  const [status, setStatus] = useState<WhatsappStatus>(INITIAL_STATUS);
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/settings/whatsapp', { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Falha ao consultar status do WhatsApp');
      }

      setStatus(payload as WhatsappStatus);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao consultar status do WhatsApp';
      setStatus(INITIAL_STATUS);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const executeAction = useCallback(
    async (action: 'connect' | 'reconnect' | 'disconnect', message: string) => {
      setSubmittingAction(true);
      try {
        const response = await fetch('/api/settings/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || 'Falha ao executar ação do WhatsApp');
        }

        setStatus(payload as WhatsappStatus);
        toast.success(message);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Falha ao executar ação do WhatsApp';
        toast.error(errorMessage);
      } finally {
        setSubmittingAction(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadStatus();
    const interval = setInterval(() => {
      void loadStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadStatus]);

  const showQr = useMemo(() => status.state === 'qr' && (status.lastQr.trim().length > 0 || status.lastQrAscii.trim().length > 0), [status]);
  const qrImageUrl = useMemo(() => {
    if (!status.lastQr) return '';
    return `https://quickchart.io/qr?text=${encodeURIComponent(status.lastQr)}&size=320`;
  }, [status.lastQr]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="text-neon-blue">Conexão WhatsApp</CardTitle>
          <CardDescription>
            Controle de conexão sem uso do terminal. Use Conectar para gerar novo QR, Reiniciar para reconectar e Desconectar para trocar de número.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center gap-3 text-neon-blue">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando status...
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-xs border ${statusClass(status.state)}`}>
                  {statusLabel(status.state)}
                </div>
                <div className="text-sm text-gray-300">
                  Processo ativo: {status.processRunning ? 'Sim' : 'Não'}
                </div>
                <div className="text-sm text-gray-300">
                  Sessão pronta: {status.isReady ? 'Sim' : 'Não'}
                </div>
              </div>

              {status.lastError ? (
                <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
                  {status.lastError}
                </div>
              ) : null}

              {status.lastDisconnectReason ? (
                <div className="rounded-lg border border-gray-400/30 bg-gray-500/10 p-3 text-sm text-gray-300">
                  {status.lastDisconnectReason}
                </div>
              ) : null}

              {showQr ? (
                <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-black/20 p-4 overflow-auto">
                  <h3 className="text-neon-blue text-sm font-semibold mb-3">QR Code para conexão</h3>
                  {qrImageUrl ? (
                    <div
                      role="img"
                      aria-label="QR Code WhatsApp"
                      className="w-56 h-56 md:w-72 md:h-72 bg-white rounded-md p-2 bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url("${qrImageUrl}")` }}
                    />
                  ) : null}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-400/30 bg-slate-500/10 p-3 text-sm text-slate-300">
                  O QR aparece aqui quando a sessão estiver aguardando autenticação.
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => executeAction('connect', 'Fluxo de conexão iniciado')}
                  disabled={submittingAction}
                  className="bg-cyan-400 text-slate-900 hover:bg-cyan-300 font-bold"
                >
                  {submittingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  Conectar
                </Button>
                <Button
                  onClick={() => executeAction('reconnect', 'Reconexão solicitada')}
                  disabled={submittingAction}
                  variant="outline"
                  className="border-cyan-300/60 text-cyan-200 hover:bg-cyan-500/10"
                >
                  {submittingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Reiniciar
                </Button>
                <Button
                  onClick={() => executeAction('disconnect', 'Sessão desconectada')}
                  disabled={submittingAction}
                  variant="outline"
                  className="border-rose-400/60 text-rose-200 hover:bg-rose-500/10"
                >
                  {submittingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  Desconectar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
