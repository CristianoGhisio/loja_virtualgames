'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Globe } from 'lucide-react';

export default function MarketplacesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-neon-blue" />
          Integração com Marketplaces
        </CardTitle>
        <CardDescription>
          Gerencie as conexões com Mercado Livre, Shopee e outros canais de venda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-8 text-center text-gray-400 border border-dashed border-white/10 rounded-lg">
          Em desenvolvimento...
        </div>
      </CardContent>
    </Card>
  );
}
