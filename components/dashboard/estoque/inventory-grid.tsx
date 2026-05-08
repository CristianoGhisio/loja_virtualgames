'use client';

import { useState, useEffect } from 'react';
import { Search, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/native-select';
import { MovementModal } from './movement-modal';
import { api } from '@/lib/api';

interface InventoryItem {
  id: string;
  name: string;
  price: number;
  costPrice?: number;
  stock: number;
  category: string | { name: string };
  brand?: string | { name: string };
  barcode?: string;
  condition?: string;
  minStock?: number;
}

export function InventoryGrid() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // all, low, normal
  
  // Modal State
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<'entrada' | 'saida'>('entrada');
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
        setLoading(true);
        const response = await api.get('/products?limit=100');
        const responseData = response.data;
        
        let fetchedItems: InventoryItem[] = [];
        if (responseData.data && Array.isArray(responseData.data.data)) {
            fetchedItems = responseData.data.data;
        } else if (Array.isArray(responseData.data)) {
            fetchedItems = responseData.data;
        }
        
        setItems(fetchedItems);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        setItems([]);
    } finally {
        setLoading(false);
    }
  };

  // Derived Data
  const filteredProducts = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.barcode && item.barcode.includes(searchTerm));
    
    const categoryName = typeof item.category === 'string' ? item.category : item.category?.name;
    const matchesCategory = categoryFilter === 'all' || categoryName === categoryFilter;
    
    let matchesStock = true;
    const minStock = item.minStock || 5;
    if (stockFilter === 'low') matchesStock = item.stock < minStock;
    if (stockFilter === 'normal') matchesStock = item.stock >= minStock;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Extract unique categories for filter
  const categories: string[] = Array.from(
    new Set(
      items.map((i) =>
        typeof i.category === 'string' ? i.category : i.category?.name,
      ),
    ),
  )
    .filter((name): name is string => Boolean(name));

  const handleOpenMovement = (type: 'entrada' | 'saida', productId?: string) => {
    setModalDefaultType(type);
    setSelectedProductId(productId);
    setIsMovementModalOpen(true);
  };

  const handleMovementSuccess = () => {
    fetchInventory();
  };

  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="w-full md:w-[420px] space-y-1">
            <label className="text-xs text-slate-400 uppercase tracking-wide">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-300" />
              <Input 
                placeholder="Nome ou código..." 
                className="h-10 pl-9 bg-slate-950/60 border-cyan-400/30 text-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-52 space-y-1">
            <label className="text-xs text-slate-400 uppercase tracking-wide">Categoria</label>
            <div className="relative">
                <Select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-cyan-400/30 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 focus:border-cyan-400 outline-none appearance-none"
                >
                <option value="all">Todas</option>
                {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
                </Select>
            </div>
          </div>

          <div className="w-full md:w-52 space-y-1">
            <label className="text-xs text-slate-400 uppercase tracking-wide">Status Estoque</label>
            <div className="relative">
                <Select 
                value={stockFilter} 
                onChange={(e) => setStockFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-cyan-400/30 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 focus:border-cyan-400 outline-none appearance-none"
                >
                <option value="all">Todos</option>
                <option value="normal">Normal</option>
                <option value="low">Baixo (Crítico)</option>
                </Select>
            </div>
          </div>
      </div>

      {/* Data Grid */}
      <div className="overflow-auto rounded-lg border border-cyan-400/20 bg-slate-950/40">
        <Table className="w-full min-w-[900px] border-separate border-spacing-y-2">
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-left text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Produto</TableHead>
              <TableHead className="text-left text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Categoria</TableHead>
              <TableHead className="text-left text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Preço</TableHead>
              <TableHead className="text-left text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Estoque</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow>
                    <TableCell colSpan={5} className="px-3 py-8 text-center text-slate-400 border-b-0">Carregando...</TableCell>
                </TableRow>
            ) : filteredProducts.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="px-3 py-8 text-center text-slate-400 border-b-0">Nenhum produto encontrado</TableCell>
                </TableRow>
            ) : (
            filteredProducts.map((item) => (
              <TableRow key={item.id} className="bg-slate-900/70 border-none hover:bg-slate-800/70 transition-colors">
                <TableCell className="px-3 py-3 border-b-0">
                  <div className="font-medium text-slate-100">{item.name}</div>
                  <div className="text-xs text-slate-400">SKU: {item.barcode || 'N/A'}</div>
                </TableCell>
                <TableCell className="px-3 py-3 border-b-0">
                  <Badge variant="outline" className="border-cyan-400/30 text-cyan-300">
                    {typeof item.category === 'string' ? item.category : item.category?.name}
                  </Badge>
                </TableCell>
                <TableCell className="px-3 py-3 text-emerald-400 font-mono border-b-0">
                  {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="px-3 py-3 border-b-0">
                  <Badge 
                    className={`${
                      item.stock < (item.minStock || 5) 
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' 
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {item.stock} unid.
                  </Badge>
                </TableCell>
                <TableCell className="px-3 py-3 text-right border-b-0">
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10"
                      onClick={() => handleOpenMovement('entrada', item.id)}
                    >
                      <ArrowUp className="w-3 h-3 mr-1" /> Entrada
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-rose-400 border-rose-500/40 hover:bg-rose-500/10"
                      onClick={() => handleOpenMovement('saida', item.id)}
                    >
                      <ArrowDown className="w-3 h-3 mr-1" /> Saída
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </div>

      <MovementModal 
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        onSuccess={handleMovementSuccess}
        defaultType={modalDefaultType}
        preSelectedProductId={selectedProductId}
      />
    </div>
  );
}
