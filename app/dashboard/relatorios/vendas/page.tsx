'use client';

import { BarChart3, Download, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MOCK_SALES } from '@/lib/mocks/data';

export default function VendasReportPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 print:hidden">
        <Button variant="outline" className="border-cyan-400/30 text-gray-300 hover:bg-cyan-400/10" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" /> Imprimir
        </Button>
        <Button className="bg-cyan-400 text-slate-900 hover:bg-cyan-300 font-bold">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <Card className="bg-[#0f172a] border-cyan-400/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-300">
            <BarChart3 className="w-5 h-5 text-neon-blue" /> Volume de Vendas
          </CardTitle>
          <CardDescription className="text-slate-400">Comparativo diário no período selecionado</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center bg-slate-950/40 rounded-md mx-6 mb-6 border border-dashed border-cyan-400/20">
          <p className="text-slate-500 text-sm">[Gráfico de Barras: Vendas x Dia]</p>
        </CardContent>
      </Card>

      <Card className="bg-[#0f172a] border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-gray-300">Detalhamento de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-cyan-400/20 bg-slate-950/40">
            <Table>
              <TableHeader>
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Data</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Cliente</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Itens</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Total</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_SALES.map((sale) => (
                  <TableRow key={sale.id} className="bg-slate-900/70 border-none hover:bg-slate-800/70 transition-colors">
                    <TableCell className="px-3 py-3 text-slate-200 border-b-0">{new Date(sale.date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="px-3 py-3 font-medium text-slate-100 border-b-0">{sale.client}</TableCell>
                    <TableCell className="px-3 py-3 text-slate-200 border-b-0">{sale.items}</TableCell>
                    <TableCell className="px-3 py-3 text-emerald-400 font-bold border-b-0">
                      {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </TableCell>
                    <TableCell className="px-3 py-3 border-b-0">
                      <Badge variant={sale.status === 'Finalizada' ? 'success' : 'secondary'} className={sale.status === 'Finalizada' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'}>
                        {sale.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
