'use client';

/* eslint-disable security/detect-object-injection */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Check, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CsvRow {
  name: string;
  price: string;
  costPrice: string;
  category: string;
  manufacturer: string;
  barcode: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

interface ManufacturerItem {
  id: string;
  name: string;
}

interface ApiErrorPayload {
  error?: string;
}

export function CsvImportModal({ isOpen, onClose, onSuccess }: CsvImportModalProps) {
  const [data, setData] = useState<CsvRow[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n');
      
      const parsedData: CsvRow[] = rows.slice(1).filter(row => row.trim()).map(row => {
        const cols = row.split(',');
        return {
          name: cols[0]?.trim() || '',
          price: cols[1]?.trim() || '0',
          costPrice: cols[2]?.trim() || '0',
          category: cols[3]?.trim() || '',
          manufacturer: cols[4]?.trim() || '',
          barcode: cols[5]?.trim() || '',
          status: 'pending'
        };
      });
      setData(parsedData);
    };
    reader.readAsText(file);
  };

  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object') {
      const axiosErr = err as AxiosError<ApiErrorPayload>;
      const apiMessage = axiosErr.response?.data?.error;
      if (apiMessage) return apiMessage;
      if ('message' in axiosErr && typeof axiosErr.message === 'string') return axiosErr.message;
    }
    return 'Erro ao importar';
  };

  const processImport = async () => {
    setImporting(true);
    const newData = [...data];
    let successCount = 0;

    // First, fetch categories/manufacturers to map names to IDs
    // For MVP simplification, we assume the API handles name-based lookup or we create them on fly.
    // Our updated APIs handle creation if needed or we'd need logic here.
    // The current Product POST expects IDs. This is complex.
    // Strategy: We will try to map names to IDs. If not found, we fail or create.
    // To make it robust: fetch categories and manufacturers first.
    
    try {
        const [catsRes, manufacturersRes] = await Promise.all([
            api.get<CategoryItem[]>('/categories'),
            api.get<ManufacturerItem[]>('/manufacturers')
        ]);

        const categories: CategoryItem[] = catsRes.data;
        const manufacturers: ManufacturerItem[] = manufacturersRes.data;

        for (let i = 0; i < newData.length; i++) {
            const row = newData[i];
            try {
                // Resolve IDs
                let categoryId = categories.find((c) => c.name.toLowerCase() === row.category.toLowerCase())?.id;
                // If not found, maybe create? For now, error if category missing.
                if (!categoryId && row.category) {
                    // Try create category
                     const newCat = await api.post('/categories', { name: row.category });
                     const createdCategory = newCat.data as CategoryItem;
                     categoryId = createdCategory.id;
                     categories.push(createdCategory);
                }

                if (!categoryId) throw new Error('Categoria obrigatória');

                let manufacturerId = manufacturers.find((m) => m.name.toLowerCase() === row.manufacturer.toLowerCase())?.id;
                if (!manufacturerId && row.manufacturer) {
                     const newManufacturer = await api.post('/manufacturers', { name: row.manufacturer, active: true });
                     const createdManufacturer = newManufacturer.data as ManufacturerItem;
                     manufacturerId = createdManufacturer.id;
                     manufacturers.push(createdManufacturer);
                }

                await api.post('/products', {
                    commercialName: row.name,
                    price: parseFloat(row.price),
                    costPrice: parseFloat(row.costPrice),
                    categoryId,
                    manufacturerId,
                    barcode: row.barcode || undefined,
                    minStock: 0,
                    margin: 0,
                    commission: 0,
                    unit: 'UN',
                    condition: 'Novo',
                    controlSerialNumber: false,
                    allowUsed: true,
                    attributes: [],
                    variations: [],
                    stock: 0 // Initial stock 0 for import
                });

                newData[i].status = 'success';
                successCount++;
            } catch (err: unknown) {
                newData[i].status = 'error';
                newData[i].message = getErrorMessage(err);
            }
            setData([...newData]); // Update UI progress
        }
    } catch (error: unknown) {
        console.error('Import setup error', error);
    }

    setImporting(false);
    if (successCount === newData.length) {
        alert('Importação concluída com sucesso!');
        onSuccess();
        onClose();
    } else {
        alert(`Importação parcial: ${successCount}/${newData.length} itens importados.`);
        onSuccess(); // Refresh list anyway
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Produtos (CSV)">
      <div className="space-y-4">
        {!data.length ? (
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">Clique para selecionar arquivo CSV</p>
                <p className="text-xs text-gray-600 mt-2">Formato: Nome, Preço, Custo, Categoria, Fabricante, CódigoBarras</p>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept=".csv" 
                    className="hidden" 
                />
            </div>
        ) : (
            <div className="space-y-4">
                <div className="max-h-[300px] overflow-auto border border-white/10 rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell>
                                        {row.status === 'pending' && <span className="text-gray-400">Pendente</span>}
                                        {row.status === 'success' && <span className="text-neon-green flex items-center gap-1"><Check className="w-3 h-3"/> OK</span>}
                                        {row.status === 'error' && <span className="text-red-400 flex items-center gap-1" title={row.message}><AlertCircle className="w-3 h-3"/> Erro</span>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setData([])} disabled={importing}>Limpar</Button>
                    <Button onClick={processImport} disabled={importing} className="bg-neon-blue text-black font-bold">
                        {importing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {importing ? 'Processando...' : 'Iniciar Importação'}
                    </Button>
                </div>
            </div>
        )}
      </div>
    </Modal>
  );
}
