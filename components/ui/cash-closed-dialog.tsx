'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CashClosedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export function CashClosedDialog({
  open,
  onOpenChange,
  title = 'Caixa diário fechado',
}: CashClosedDialogProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0f172a] border-cyan-400/20 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-cyan-300">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-300">
          Para continuar, abra o caixa diário. Operações com recebimento ficam bloqueadas com o caixa fechado.
        </p>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          <Button
            type="button"
            className="bg-cyan-400 text-slate-900 hover:bg-cyan-300 font-bold"
            onClick={() => {
              onOpenChange(false);
              router.push('/dashboard/caixa-diario');
            }}
          >
            Ir para Caixa Diário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
