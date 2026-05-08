'use client';

/* eslint-disable security/detect-object-injection */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Printer, Search, Loader2, CheckSquare, Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { api } from '@/lib/api';

type ProductItem = {
  id: string;
  commercialName?: string;
  name?: string;
  barcode?: string | null;
  active?: boolean;
};

type SelectedMap = Record<string, { quantity: number }>;

function BarcodeSvg({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        displayValue: false,
        margin: 0,
        height: 42,
        width: 1.35,
        background: 'transparent',
      });
    } catch {
    }
  }, [value]);

  return <svg ref={svgRef} className="w-full h-12" />;
}

export default function ImpressaoProdutosPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SelectedMap>({});
  const [printing, setPrinting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      const responseData = response.data;

      let items: ProductItem[] = [];
      if (responseData.data && Array.isArray(responseData.data.data)) {
        items = responseData.data.data as ProductItem[];
      } else if (Array.isArray(responseData.data)) {
        items = responseData.data as ProductItem[];
      } else if (Array.isArray(responseData)) {
        items = responseData as ProductItem[];
      }

      setProducts(items);
    } catch {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const filtered = useMemo(() => {
    const normalized = searchTerm.toLowerCase();
    return products.filter((item) => {
      const productName = (item.name || item.commercialName || '').toLowerCase();
      const barcode = String(item.barcode || '');
      return productName.includes(normalized) || barcode.includes(searchTerm);
    });
  }, [products, searchTerm]);

  const toggleProduct = useCallback((productId: string, checked: boolean) => {
    setSelected((prev) => {
      const next: SelectedMap = { ...prev };
      if (!checked) {
        delete next[productId];
        return next;
      }
      next[productId] = { quantity: next[productId]?.quantity || 1 };
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    const normalizedQty = Number.isFinite(quantity) ? Math.max(1, Math.trunc(quantity)) : 1;
    setSelected((prev) => ({
      ...prev,
      [productId]: { quantity: normalizedQty },
    }));
  }, []);

  const selectAllFiltered = useCallback(() => {
    setSelected((prev) => {
      const next: SelectedMap = { ...prev };
      filtered.forEach((item) => {
        const barcode = String(item.barcode || '').trim();
        if (!barcode) return;
        next[item.id] = { quantity: next[item.id]?.quantity || 1 };
      });
      return next;
    });
  }, [filtered]);

  const clearSelection = useCallback(() => {
    setSelected({});
  }, []);

  const selectedLabels = useMemo(() => {
    const output: Array<{ id: string; name: string; barcode: string }> = [];
    Object.entries(selected).forEach(([productId, config]) => {
      const product = products.find((item) => item.id === productId);
      if (!product) return;
      const barcode = String(product.barcode || '').trim();
      if (!barcode) return;
      const name = (product.name || product.commercialName || '').trim() || 'Produto';
      for (let count = 0; count < config.quantity; count += 1) {
        output.push({
          id: `${productId}-${count}`,
          name,
          barcode,
        });
      }
    });
    return output;
  }, [products, selected]);

  const handlePrint = useCallback(() => {
    if (selectedLabels.length === 0) {
      toast.error('Selecione produtos com código de barras para imprimir');
      return;
    }
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 80);
  }, [selectedLabels.length]);

  return (
    <div className="space-y-6">
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Impressão de Etiquetas</CardTitle>
          <CardDescription>
            Selecione vários produtos, defina quantidade de etiquetas e gere impressão de uma vez.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Buscar por nome ou código"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="text-neon-blue hover:bg-neon-blue/10 border-neon-blue/30"
                onClick={selectAllFiltered}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Selecionar filtrados
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-gray-500/40 text-gray-300 hover:bg-gray-700/20"
                onClick={clearSelection}
              >
                <Square className="w-4 h-4 mr-2" />
                Limpar seleção
              </Button>
              <Button
                type="button"
                onClick={handlePrint}
                disabled={printing || selectedLabels.length === 0}
                variant="neon"
              >
                {printing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Printer className="w-4 h-4 mr-2" />}
                Gerar Impressão
              </Button>
            </div>
          </div>

          <div className="rounded-md border border-[rgba(255,255,255,0.06)] px-3 py-2 text-sm text-gray-300">
            Etiquetas selecionadas: <span className="text-neon-blue font-semibold">{selectedLabels.length}</span>
          </div>

          <div className="overflow-auto rounded-lg border border-[rgba(255,255,255,0.06)]">
            <Table className="w-full min-w-[780px] border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-gray-400 text-xs uppercase tracking-wide px-3 py-3">Selecionar</TableHead>
                  <TableHead className="text-gray-400 text-xs uppercase tracking-wide px-3 py-3">Produto</TableHead>
                  <TableHead className="text-gray-400 text-xs uppercase tracking-wide px-3 py-3">Código de barras</TableHead>
                  <TableHead className="text-gray-400 text-xs uppercase tracking-wide px-3 py-3">Qtd etiquetas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-400 border-b-0">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-400 border-b-0">
                      Nenhum produto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => {
                    const barcode = String(item.barcode || '').trim();
                    const canSelect = barcode.length > 0;
                    const checked = Boolean(selected[item.id]);
                    return (
                      <TableRow key={item.id} className="bg-slate-900/70 border-none hover:bg-slate-800/70">
                        <TableCell className="px-3 py-3 border-b-0">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-cyan-400"
                            checked={checked}
                            disabled={!canSelect}
                            onChange={(event) => toggleProduct(item.id, event.target.checked)}
                          />
                        </TableCell>
                        <TableCell className="px-3 py-3 text-slate-100 border-b-0">
                          {(item.name || item.commercialName || '').trim() || 'Produto sem nome'}
                        </TableCell>
                        <TableCell className="px-3 py-3 text-slate-300 border-b-0">
                          {canSelect ? barcode : 'Sem código de barras'}
                        </TableCell>
                        <TableCell className="px-3 py-3 border-b-0">
                          <input
                            type="number"
                            min={1}
                            step={1}
                            value={selected[item.id]?.quantity || 1}
                            disabled={!checked}
                            onChange={(event) => setQuantity(item.id, Number(event.target.value))}
                            className="w-24 rounded-md border border-cyan-400/30 bg-slate-950/60 px-2 py-1 text-slate-100 disabled:opacity-40"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="barcode-print-sheet grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {selectedLabels.map((label) => (
          <div key={label.id} className="barcode-label-card rounded-md border border-slate-500/30 bg-white text-black px-2 py-1.5 break-inside-avoid">
            <div className="text-[10px] leading-3 text-center font-semibold truncate">{label.name}</div>
            <div className="mt-1">
              <BarcodeSvg value={label.barcode} />
            </div>
            <div className="text-[10px] leading-3 text-center tracking-wide">{label.barcode}</div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 8mm;
          }
          body {
            background: #fff !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .barcode-print-sheet {
            display: grid !important;
            grid-template-columns: repeat(3, 50mm) !important;
            gap: 3mm !important;
            justify-content: flex-start !important;
          }
          .barcode-label-card {
            width: 50mm !important;
            min-height: 30mm !important;
            border: 0.5px solid #111 !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            padding: 2mm !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
