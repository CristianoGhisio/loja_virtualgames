'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListTree } from 'lucide-react';

export default function MapeamentoPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListTree className="w-5 h-5 text-neon-blue" />
          Mapeamento de Categorias
        </CardTitle>
        <CardDescription>
          Vincule suas categorias internas com as categorias oficiais dos marketplaces.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-8 text-center text-gray-500 border border-dashed border-white/10 rounded-lg">
          Em desenvolvimento...
        </div>
      </CardContent>
    </Card>
  );
}
