'use client';

import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/native-select';
import { Modal } from '@/components/ui/modal';
import { api } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  stock: number;
}

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: 'entrada' | 'saida';
  preSelectedProductId?: string;
}

export function MovementModal({ isOpen, onClose, onSuccess, defaultType = 'entrada', preSelectedProductId }: MovementModalProps) {
  const [type, setType] = useState<'entrada' | 'saida'>(defaultType);
  const [productId, setProductId] = useState(preSelectedProductId || '');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [obs, setObs] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen) {
        setProductId(preSelectedProductId || '');
        setQuantity(1);
        setReason('');
        setObs('');
        setType(defaultType);
        fetchProducts();
    }
  }, [isOpen, preSelectedProductId, defaultType]);

  const fetchProducts = async () => {
    try {
        const response = await api.get('/products?limit=100');
        const responseData = response.data;
        
        let fetchedItems: Product[] = [];
        if (responseData.data && Array.isArray(responseData.data.data)) {
            fetchedItems = responseData.data.data;
        } else if (Array.isArray(responseData.data)) {
            fetchedItems = responseData.data;
        }
        
        setProducts(fetchedItems);
    } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
    }
  };

  const handleSave = async () => {
    if (!productId || quantity <= 0 || !reason) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }

    setLoading(true);
    try {
        // Map UI reasons to API types
        let apiType = '';
        if (type === 'entrada') {
            if (reason === 'compra') apiType = 'IN_PURCHASE';
            else if (reason === 'devolucao') apiType = 'IN_RETURN';
            else apiType = 'IN_ADJUSTMENT';
        } else {
            if (reason === 'venda') apiType = 'OUT_SALE';
            else if (reason === 'perda') apiType = 'OUT_LOSS';
            else if (reason === 'uso_interno') apiType = 'OUT_ADJUSTMENT'; // Or create a specific one
            else apiType = 'OUT_ADJUSTMENT';
        }

        await api.post('/stock/movement', {
            productId,
            quantity,
            type: apiType,
            reason: obs ? `${reason} - ${obs}` : reason
        });
        
        onSuccess();
        onClose();
    } catch (error) {
        console.error('Error saving movement:', error);
        alert('Erro ao registrar movimentação');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'entrada' ? 'Registrar Entrada' : 'Registrar Saída'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading} className="border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10">Cancelar</Button>
          <Button 
            className={type === 'entrada' ? 'bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300' : 'bg-rose-500 text-white font-bold hover:bg-rose-400'}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Salvando...' : `Confirmar ${type === 'entrada' ? 'Entrada' : 'Saída'}`}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Toggle Tipo */}
        <div className="flex gap-2 p-1 bg-slate-950/60 rounded-lg border border-cyan-400/10">
          <button
            onClick={() => setType('entrada')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
              type === 'entrada' 
                ? 'bg-cyan-400/20 text-cyan-300 font-bold shadow-sm border border-cyan-400/30' 
                : 'text-cyan-300/50 hover:text-cyan-300'
            }`}
          >
            <ArrowUp className="w-4 h-4" /> Entrada
          </button>
          <button
            onClick={() => setType('saida')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
              type === 'saida' 
                ? 'bg-rose-500/20 text-rose-400 font-bold shadow-sm border border-rose-500/30' 
                : 'text-cyan-300/50 hover:text-cyan-300'
            }`}
          >
            <ArrowDown className="w-4 h-4" /> Saída
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-cyan-300/70">Produto</label>
          <div className="relative">
             <Select 
                className="flex h-10 w-full rounded-md border border-cyan-400/20 bg-slate-950/60 px-3 py-2 text-sm text-slate-300 focus:border-cyan-400 outline-none appearance-none disabled:opacity-50"
                value={productId} 
                onChange={(e) => setProductId(e.target.value)}
                disabled={!!preSelectedProductId}
             >
                <option value="">Selecione o produto...</option>
                {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Estoque: {p.stock})</option>
                ))}
             </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-300/70">Quantidade</label>
            <Input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))} 
              className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-300/70">Motivo/Origem</label>
            <div className="relative">
                <Select 
                    className="flex h-10 w-full rounded-md border border-cyan-400/20 bg-slate-950/60 px-3 py-2 text-sm text-slate-300 focus:border-cyan-400 outline-none appearance-none"
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)}
                >
                    <option value="">Selecione...</option>
                    {type === 'entrada' ? (
                        <>
                        <option value="compra">Compra</option>
                        <option value="devolucao">Devolução</option>
                        <option value="ajuste">Ajuste de Estoque</option>
                        </>
                    ) : (
                        <>
                        <option value="venda">Venda Manual</option>
                        <option value="perda">Perda/Quebra</option>
                        <option value="uso_interno">Uso Interno</option>
                        <option value="ajuste">Ajuste de Estoque</option>
                        </>
                    )}
                </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-cyan-300/70">Observações</label>
          <Input 
            placeholder="Detalhes adicionais..." 
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
          />
        </div>
      </div>
    </Modal>
  );
}
