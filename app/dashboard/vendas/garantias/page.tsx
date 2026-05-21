'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

type Warranty = {
  id: string;
  sourceType: 'SALE_PRODUCT' | 'OS_SERVICE' | 'OS_PART';
  sourceId: string;
  sourceCode: string;
  customerId: string | null;
  customerName: string;
  itemName: string;
  itemCategory: 'Produto' | 'Serviço' | 'Peça';
  warrantyMonths: number;
  purchaseDate: string;
  expiry: string;
  status: 'Ativa' | 'Expirada';
};

export default function GarantiasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [warranties, setWarranties] = useState<Warranty[]>([]);

  useEffect(() => {
    const fetchWarranties = async () => {
      try {
        const response = await api.get('/sales/warranties');
        const data = response.data?.data;
        setWarranties(Array.isArray(data) ? data : []);
      } catch {
        setWarranties([]);
      }
    };

    fetchWarranties();
  }, []);

  const filteredWarranties = useMemo(
    () =>
      warranties.filter((warranty) =>
        warranty.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.sourceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.id.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [warranties, searchTerm]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 mb-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Buscar..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Controle de Garantias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarranties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-400">Nenhuma garantia encontrada.</TableCell>
                  </TableRow>
                ) : (
                  filteredWarranties.map((warranty) => (
                    <TableRow key={warranty.id}>
                      <TableCell>
                        <Link href={`/dashboard/clientes/${warranty.customerId}/garantias`} className="font-medium text-white hover:text-neon-blue transition-colors">
                          {warranty.customerName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-gray-400 text-xs">{warranty.itemName}</TableCell>
                      <TableCell>
                        <Badge variant="neon">{warranty.itemCategory}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-400 text-xs">{new Date(warranty.expiry).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={warranty.status === 'Ativa' ? 'success' : 'default'}>
                          {warranty.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
