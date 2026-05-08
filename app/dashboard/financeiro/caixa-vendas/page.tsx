
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export default function CaixaVendasPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-neon-blue" /> Caixa de Vendas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <DollarSign className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">Módulo de Vendas ainda não implementado.</p>
            <p className="text-sm">Os dados aparecerão aqui quando as vendas forem realizadas.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
