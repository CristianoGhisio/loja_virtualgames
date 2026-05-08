'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

export default function ClientOSPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [osList, setOsList] = useState<{ id: string; device: string; defect: string; entryDate: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/clients/${id}/os`)
      .then(res => setOsList(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando OS...</div>;

  return (
    <Card>
      <CardHeader className="border-b border-[rgba(255,255,255,0.06)] pb-4">
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-neon-blue" /> Ordens de Serviço
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead>Defeito</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {osList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">Nenhuma OS registrada.</TableCell>
              </TableRow>
            ) : (
              osList.map((os) => (
                <TableRow key={os.id}>
                  <TableCell className="font-mono text-neon-blue/60 text-xs">{os.id.slice(-6).toUpperCase()}</TableCell>
                  <TableCell className="font-medium text-white">{os.device}</TableCell>
                  <TableCell className="max-w-xs truncate text-gray-400">{os.defect}</TableCell>
                  <TableCell className="text-gray-400">{new Date(os.entryDate).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell><Badge variant="neon">{os.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/os/${os.id}`)}>Ver OS</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
