'use client';

import { PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function OSReportPage() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-neon-purple" /> Eficiência Técnica
          </CardTitle>
          <CardDescription>OSs concluídas vs em aberto por técnico</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center bg-black/20 rounded-md m-6 border border-white/5 border-dashed">
          <p className="text-gray-400 text-sm">[Gráfico de Pizza: Distribuição por Técnico]</p>
        </CardContent>
      </Card>
    </div>
  );
}
