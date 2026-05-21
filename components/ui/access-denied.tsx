import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <ShieldAlert className="w-12 h-12 text-red-500" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white font-orbitron tracking-wider">ACESSO NEGADO</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Você não tem permissão para acessar este módulo. Entre em contato com o administrador do sistema se acreditar que isto é um erro.
        </p>
      </div>

      <Link href="/dashboard">
        <Button variant="outline" className="border-white/10 hover:bg-white/5">
          Voltar ao Dashboard
        </Button>
      </Link>
    </div>
  );
}
