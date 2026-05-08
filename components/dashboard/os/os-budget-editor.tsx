
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Trash2, Search, Box, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';

interface OSItem {
  id: string;
  type: 'PART' | 'SERVICE';
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

type SearchType = 'EAN' | 'ID_NUMERICO' | 'TEXTO';

interface SearchResultItem {
  id: string;
  name: string;
  price: number;
  kind: 'PART' | 'SERVICE';
  stock?: number;
  barcode?: string;
  internalCode?: string;
}

const detectSearchType = (value: string): SearchType => {
  const cleanValue = value.trim();
  if (/^\d{8,14}$/.test(cleanValue)) {
    return 'EAN';
  }
  if (/^\d+$/.test(cleanValue)) {
    return 'ID_NUMERICO';
  }
  return 'TEXTO';
};

const normalizeDigits = (value: string) => value.replace(/\D/g, '');

interface OSBudgetEditorProps {
  osId: string;
  status: string;
  readOnly?: boolean;
  onUpdate?: () => void;
}

export function OSBudgetEditor({ osId, status, readOnly = false, onUpdate }: OSBudgetEditorProps) {
  const [items, setItems] = useState<OSItem[]>([]);
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addType, setAddType] = useState<'PART' | 'SERVICE'>('PART');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [addingItems, setAddingItems] = useState(false);
  const searchType = useMemo(() => detectSearchType(searchQuery), [searchQuery]);

  const fetchItems = useCallback(async () => {
    try {
      const response = await api.get(`/os/${osId}`);
      const osData = response.data.data || response.data;
      if (osData.items) {
        setItems(osData.items);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }, [osId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const detected = detectSearchType(trimmed);

      if (addType === 'PART') {
        type ProductApiResult = {
          id: string;
          commercialName?: string;
          name?: string;
          barcode?: string | null;
          price?: number | string;
          stock?: number | string;
          active?: boolean;
        };

        const readProductsFromResponse = (response: { data?: unknown }): ProductApiResult[] => {
          const payload = response.data as {
            data?: { data?: ProductApiResult[] } | ProductApiResult[];
          } | undefined;
          if (Array.isArray(payload?.data)) return payload.data;
          if (Array.isArray(payload?.data?.data)) return payload.data.data;
          return [];
        };

        const response = await api.get('/products', {
          params: { q: trimmed, limit: 12 },
        });

        const baseProducts = readProductsFromResponse(response);
        let combinedProducts = [...baseProducts];

        if (detected === 'EAN' && baseProducts.length === 0) {
          const digits = normalizeDigits(trimmed);
          const fallbackTerms = Array.from(
            new Set([digits.slice(-6), digits.slice(0, 6)].filter((term) => term.length >= 4))
          );
          for (const term of fallbackTerms) {
            const fallbackResponse = await api.get('/products', {
              params: { q: term, limit: 12 },
            });
            combinedProducts = [...combinedProducts, ...readProductsFromResponse(fallbackResponse)];
          }
        }

        const normalizedProducts = Array.from(
          new Map(
            combinedProducts
              .filter((product) => product.active !== false)
              .map((product) => [product.id, product])
          ).values()
        );

        const normalizedResults: SearchResultItem[] = normalizedProducts.map((product) => ({
          id: product.id,
          name: product.commercialName || product.name || 'Item sem nome',
          price: Number(product.price ?? 0),
          stock: Number(product.stock ?? 0),
          barcode: product.barcode || undefined,
          kind: 'PART',
        }));

        setSearchResults(normalizedResults);

        const exactByBarcode = normalizedResults.find(
          (product) => normalizeDigits(String(product.barcode ?? '')) === normalizeDigits(trimmed)
        );
        const exactById = normalizedResults.find((product) => product.id === trimmed);
        const exactByName = normalizedResults.find((product) => product.name.toLowerCase() === trimmed.toLowerCase());

        const autoSelectPart = (item: SearchResultItem) => {
          if (Number(item.stock ?? 0) <= 0) {
            toast.error('Produto sem estoque disponível');
            return;
          }
          setSelectedItems((current) => {
            const next = new Set(current);
            next.add(item.id);
            return next;
          });
        };

        if (detected === 'EAN' && exactByBarcode) {
          autoSelectPart(exactByBarcode);
          return;
        }

        if (detected === 'ID_NUMERICO' && exactById) {
          autoSelectPart(exactById);
          return;
        }

        if (detected === 'TEXTO' && normalizedResults.length === 1) {
          autoSelectPart(normalizedResults[0]);
        } else if (detected === 'TEXTO' && exactByName) {
          autoSelectPart(exactByName);
        }
        return;
      }

      type ServiceApiResult = {
        id: string;
        name: string;
        internalCode?: string;
        priceBase?: number | string;
        price?: number | string;
        active?: boolean;
      };

      const response = await api.get('/services', {
        params: { q: trimmed, active: true },
      });

      const payload = response.data as { data?: ServiceApiResult[] } | ServiceApiResult[] | undefined;
      const rawServices = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

      const normalizedServices = Array.from(
        new Map(
          rawServices
            .filter((service) => service.active !== false)
            .map((service) => [service.id, service])
        ).values()
      );

      const normalizedResults: SearchResultItem[] = normalizedServices.map((service) => ({
        id: service.id,
        name: service.name,
        price: Number(service.priceBase ?? service.price ?? 0),
        internalCode: service.internalCode,
        kind: 'SERVICE',
      }));

      setSearchResults(normalizedResults);

      const exactById = normalizedResults.find((service) => service.id === trimmed);
      const exactByCode = normalizedResults.find(
        (service) => (service.internalCode || '').toLowerCase() === trimmed.toLowerCase()
      );
      const exactByName = normalizedResults.find((service) => service.name.toLowerCase() === trimmed.toLowerCase());

      const autoSelectService = (item: SearchResultItem) => {
        setSelectedItems((current) => {
          const next = new Set(current);
          next.add(item.id);
          return next;
        });
      };

      if ((detected === 'ID_NUMERICO' || detected === 'EAN') && exactById) {
        autoSelectService(exactById);
        return;
      }

      if (exactByCode) {
        autoSelectService(exactByCode);
        return;
      }

      if (detected === 'TEXTO' && normalizedResults.length === 1) {
        autoSelectService(normalizedResults[0]);
      } else if (detected === 'TEXTO' && exactByName) {
        autoSelectService(exactByName);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [addType]);

  useEffect(() => {
    if (!isAddOpen) {
      setSearchResults([]);
      setSearchQuery('');
      setSelectedItems(new Set());
      return;
    }
    setSearchResults([]);
    setSearchQuery('');
    setSelectedItems(new Set());
  }, [isAddOpen]);

  useEffect(() => {
    if (!isAddOpen) return;
    setSearchResults([]);
    setSearchQuery('');
    setSelectedItems(new Set());
  }, [addType, isAddOpen]);

  useEffect(() => {
    if (!isAddOpen) return;
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      void handleSearch(searchQuery);
    }, 250);

    return () => clearTimeout(timeout);
  }, [handleSearch, isAddOpen, searchQuery]);

  const toggleSelection = (itemId: string) => {
      const newSelected = new Set(selectedItems);
      if (newSelected.has(itemId)) {
          newSelected.delete(itemId);
      } else {
          newSelected.add(itemId);
      }
      setSelectedItems(newSelected);
  };

  const handleAddSelectedItems = async () => {
    if (selectedItems.size === 0) return;
    setAddingItems(true);

    try {
      const itemsToAdd = searchResults.filter(item => selectedItems.has(item.id));
      
      // Execute all adds in parallel
      await Promise.all(itemsToAdd.map(item => 
          api.post(`/os/${osId}/items`, {
            type: addType,
            productId: addType === 'PART' ? item.id : undefined,
            serviceId: addType === 'SERVICE' ? item.id : undefined,
            quantity: 1,
            unitPrice: Number(item.price),
          })
      ));
      
      toast.success(`${itemsToAdd.length} item(s) adicionado(s)`);
      setIsAddOpen(false);
      fetchItems();
      if (onUpdate) onUpdate();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Erro ao adicionar itens');
    } finally {
        setAddingItems(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Remover este item?')) return;
    try {
        await api.delete(`/os/${osId}/items/${itemId}`);
        toast.success('Item removido');
        fetchItems();
        if (onUpdate) onUpdate();
    } catch {
        toast.error('Erro ao remover item');
    }
  };

  const totalParts = items.filter(i => i.type === 'PART').reduce((acc, i) => acc + Number(i.total), 0);
  const totalServices = items.filter(i => i.type === 'SERVICE').reduce((acc, i) => acc + Number(i.total), 0);
  const total = totalParts + totalServices;

  const canEdit = !readOnly && ['DIAGNOSTICO', 'ORCAMENTO'].includes(status);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
          Orçamento Detalhado
        </h3>
        {canEdit && (
            <div className="flex gap-2">
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10" onClick={() => setAddType('SERVICE')}>
                            <Wrench className="w-4 h-4 mr-2" /> Adicionar Serviço
                        </Button>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10" onClick={() => setAddType('PART')}>
                            <Box className="w-4 h-4 mr-2" /> Adicionar Peça
                        </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="bg-[#0f172a] border-cyan-400/20 text-slate-300 sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle className="text-cyan-300">Adicionar {addType === 'PART' ? 'Peças/Produtos' : 'Serviços'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-300/70" />
                                <Input 
                                    placeholder={addType === 'PART' ? 'Bipe EAN, ID ou nome da peça/produto' : 'Digite ID, código interno ou nome do serviço'} 
                                    className="pl-9 pr-24 bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                <Button
                                    type="button"
                                    className="absolute right-1.5 top-1.5 h-8 px-4 bg-cyan-400 text-slate-900 hover:bg-cyan-300"
                                    disabled={!searchQuery.trim() || searching}
                                    onClick={() => handleSearch(searchQuery)}
                                >
                                    {searching ? 'Buscando' : 'Buscar'}
                                </Button>
                            </div>
                            <div className="text-[11px] text-slate-400">
                                Tipo detectado: <span className="text-cyan-300 font-semibold">{searchType}</span>
                            </div>
                            
                            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2">
                                {searching && <p className="text-sm text-cyan-300/70 text-center py-4">Buscando...</p>}
                                
                                {!searching && searchResults.length === 0 && (
                                    <p className="text-sm text-cyan-300/70 text-center py-4">Nenhum resultado encontrado.</p>
                                )}
                                
                                {searchResults.map((result) => {
                                    const isSelected = selectedItems.has(result.id);
                                    return (
                                        <div 
                                            key={result.id} 
                                            className={`
                                                flex justify-between items-center p-3 rounded cursor-pointer border transition-all
                                                ${isSelected 
                                                    ? 'bg-cyan-400/10 border-cyan-400/50' 
                                                    : 'bg-slate-950/60 border-cyan-400/20 hover:bg-cyan-400/10'}
                                            `}
                                            onClick={() => toggleSelection(result.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Checkbox 
                                                    checked={isSelected}
                                                    onCheckedChange={() => toggleSelection(result.id)}
                                                    className="border-cyan-400/50 text-cyan-400"
                                                />
                                                <div>
                                                    <p className={`font-bold text-sm ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                                                        {result.name}
                                                    </p>
                                                    <div className="flex gap-2 text-xs text-cyan-300/70">
                                                        <span>R$ {Number(result.price).toFixed(2)}</span>
                                                        {typeof result.stock === 'number' && (
                                                            <span className={result.stock > 0 ? 'text-green-400' : 'text-red-400'}>
                                                                Estoque: {result.stock}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <DialogFooter>
                             <Button variant="outline" className="border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                             <Button 
                                className="bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300"
                                disabled={selectedItems.size === 0 || addingItems}
                                onClick={handleAddSelectedItems}
                             >
                                {addingItems ? 'Adicionando...' : `Adicionar (${selectedItems.size})`}
                             </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        )}
      </div>

      <div className="border border-cyan-400/20 rounded-lg overflow-hidden bg-slate-950/60">
        <Table>
            <TableHeader>
                <TableRow className="border-cyan-400/20 hover:bg-transparent">
                    <TableHead className="w-[100px] text-cyan-300/70">Tipo</TableHead>
                    <TableHead className="text-cyan-300/70">Descrição</TableHead>
                    <TableHead className="text-right text-cyan-300/70">Qtd</TableHead>
                    <TableHead className="text-right text-cyan-300/70">Unitário</TableHead>
                    <TableHead className="text-right text-cyan-300/70">Total</TableHead>
                    {canEdit && <TableHead className="w-[50px]"></TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center text-cyan-300/70 h-24">
                            Nenhum item adicionado ao orçamento.
                        </TableCell>
                    </TableRow>
                ) : (
                    items.map((item) => (
                        <TableRow key={item.id} className="border-cyan-400/10 hover:bg-cyan-400/5">
                            <TableCell>
                                <Badge variant="outline" className={item.type === 'PART' ? 'border-blue-500/50 text-blue-400' : 'border-purple-500/50 text-purple-400'}>
                                    {item.type === 'PART' ? 'Peça' : 'Serviço'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">{item.name}</TableCell>
                            <TableCell className="text-right text-slate-300">{item.quantity}</TableCell>
                            <TableCell className="text-right text-slate-300">R$ {Number(item.unitPrice).toFixed(2)}</TableCell>
                            <TableCell className="text-right font-bold text-cyan-300">R$ {Number(item.total).toFixed(2)}</TableCell>
                            {canEdit && (
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleRemoveItem(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            )}
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-8 pt-4 border-t border-cyan-400/20">
        <div className="text-right">
            <p className="text-sm text-cyan-300/70">Total Serviços</p>
            <p className="text-lg font-bold text-slate-300">R$ {totalServices.toFixed(2)}</p>
        </div>
        <div className="text-right">
            <p className="text-sm text-cyan-300/70">Total Peças</p>
            <p className="text-lg font-bold text-slate-300">R$ {totalParts.toFixed(2)}</p>
        </div>
        <div className="text-right pl-8 border-l border-cyan-400/20">
            <p className="text-sm text-cyan-300 font-bold uppercase">Valor Total</p>
            <p className="text-2xl font-bold text-cyan-300">R$ {total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
