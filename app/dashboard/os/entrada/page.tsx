'use client';

import { OSList } from '@/components/dashboard/os/os-list';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FilaEntradaPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 mb-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar OS..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
      </div>
      <OSList statusFilter="Fila de Entrada" />
    </div>
  );
}
