'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MOCK_PRODUCTS } from '@/lib/mocks/data';

export function ProductTable({ products }: { products: typeof MOCK_PRODUCTS }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Preço Venda</TableHead>
          <TableHead>Quantidade</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-400">
              Nenhum item encontrado.
            </TableCell>
          </TableRow>
        ) : (
          products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium text-white">{product.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-white/5">{product.category}</Badge>
              </TableCell>
              <TableCell>R$ {product.price.toFixed(2)}</TableCell>
              <TableCell>
                <span className={`font-bold ${product.stock < 10 ? 'text-red-400' : 'text-green-400'}`}>
                  {product.stock} un
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={product.stock > 5 ? 'success' : 'warning'}>
                  {product.stock > 5 ? 'Em Estoque' : 'Baixo Estoque'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">Editar</Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
