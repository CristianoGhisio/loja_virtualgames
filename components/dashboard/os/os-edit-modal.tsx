
'use client';

import { useState, useEffect } from 'react';
import { X, Save, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/native-select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
  categories?: Category[];
}

interface OSEditModalProps {
  os: {
    id: string;
    customerId: string;
    device: string;
    serial?: string | null;
    defect: string;
    priority: string;
    notes?: string | null;
    accessories?: string | null;
    condition?: string | null;
  };
  onClose: () => void;
  onUpdate: () => void;
}

export function OSEditModal({ os, onClose, onUpdate }: OSEditModalProps) {
  const [loading, setLoading] = useState(false);
  
  // Data Lists
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Form State
  const [clientId, setClientId] = useState(os.customerId);
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [device, setDevice] = useState(os.device); // Fallback / Manual input
  
  const [serial, setSerial] = useState(os.serial || '');
  const [defect, setDefect] = useState(os.defect);
  const [priority, setPriority] = useState(os.priority);
  const [accessories, setAccessories] = useState(os.accessories || '');
  const [condition, setCondition] = useState(os.condition || '');
  const [notes, setNotes] = useState(os.notes || '');

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, catsRes, brandsRes] = await Promise.all([
          api.get<Client[]>('/clients'),
          api.get<Category[]>('/categories'),
          api.get<Brand[]>('/brands')
        ]);
        setClients(clientsRes.data);
        setCategories(catsRes.data);
        setBrands(brandsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const filteredBrands = categoryId
    ? brands.filter(
        (b) =>
          b.categories?.some((c) => c.id === categoryId) ||
          (b.categories && b.categories.length === 0),
      )
    : brands;

  // Update device name when selectors change
  useEffect(() => {
    if (categoryId && brandId) {
        const category = categories.find(c => c.id === categoryId)?.name || '';
        const brand = brands.find(b => b.id === brandId)?.name || '';
        setDevice(`${category} ${brand}`.trim());
    }
  }, [categoryId, brandId, categories, brands]);

  const handleSave = async () => {
    if (!clientId || !device || !defect) {
        toast.error('Preencha os campos obrigatórios (Cliente, Equipamento, Defeito)');
        return;
    }

    setLoading(true);
    try {
        await api.put(`/os/${os.id}`, {
            customerId: clientId, // Allow changing client
            device, // Use the constructed or manually edited string
            serial,
            defect,
            priority,
            accessories,
            condition,
            notes
        });
        
        toast.success('Dados da OS atualizados com sucesso');
        onUpdate();
        onClose();
    } catch (error) {
        console.error('Erro ao atualizar OS:', error);
        toast.error('Erro ao atualizar dados da OS');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-cyan-400/20 rounded-lg w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-cyan-400/20">
            <h2 className="text-xl font-bold text-cyan-300 font-orbitron">Editar Ordem de Serviço</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-cyan-300/70 hover:text-cyan-300 hover:bg-cyan-400/10">
                <X className="w-5 h-5" />
            </Button>
        </div>

        {/* Content - Matches Nova OS Page Layout */}
        <div className="p-6 overflow-y-auto space-y-6">
            <Card className="bg-[#0f172a] border-cyan-400/20">
                <CardHeader>
                    <CardTitle className="text-cyan-300">Dados do Equipamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-cyan-300/70 font-bold uppercase">Cliente *</label>
                            <Select
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="w-full bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                            >
                                <option value="">Selecione...</option>
                                {clients.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-cyan-300/70 font-bold uppercase">Prioridade</label>
                            <Select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                            >
                                <option value="NORMAL">Normal</option>
                                <option value="URGENT">Urgente</option>
                                <option value="HIGH">Alta</option>
                                <option value="LOW">Baixa</option>
                            </Select>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-900/70 rounded-lg border border-cyan-400/20 space-y-4">
                        <p className="text-xs text-cyan-300 font-bold uppercase mb-2">Seleção Rápida (Reconstruir Nome)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-cyan-300/70">Categoria</label>
                                <div className="relative">
                                    <Select
                                        value={categoryId}
                                        onChange={(e) => {
                                            setCategoryId(e.target.value);
                                            setBrandId('');
                                        }}
                                        className="w-full bg-slate-950/60 border-cyan-400/20 text-slate-300 h-10 px-3 pr-8 text-sm focus:border-cyan-400"
                                    >
                                        <option value="">Selecione...</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </Select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-cyan-300/70 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-cyan-300/70">Marca</label>
                                <div className="relative">
                                    <Select
                                        value={brandId}
                                        onChange={(e) => setBrandId(e.target.value)}
                                        className="w-full bg-slate-950/60 border-cyan-400/20 text-slate-300 h-10 px-3 pr-8 text-sm disabled:opacity-50 focus:border-cyan-400"
                                        disabled={!categoryId}
                                    >
                                        <option value="">Selecione...</option>
                                        {filteredBrands.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </Select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-cyan-300/70 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-cyan-300/70 font-bold uppercase">Nome do Equipamento *</label>
                            <Input 
                                value={device} 
                                onChange={(e) => setDevice(e.target.value)} 
                                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                                placeholder="Nome completo do dispositivo"
                            />
                            <p className="text-[10px] text-cyan-300/50">Você pode editar manualmente ou usar a seleção acima.</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-cyan-300/70 font-bold uppercase">Nº de Série</label>
                            <Input 
                                value={serial} 
                                onChange={(e) => setSerial(e.target.value)} 
                                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                                placeholder="S/N"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-cyan-300/70 font-bold uppercase">Acessórios</label>
                            <Input 
                                value={accessories} 
                                onChange={(e) => setAccessories(e.target.value)} 
                                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                                placeholder="Ex: Capa, Carregador..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-cyan-300/70 font-bold uppercase">Estado de Conservação</label>
                            <Input 
                                value={condition} 
                                onChange={(e) => setCondition(e.target.value)} 
                                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                                placeholder="Ex: Tela riscada, amassados..."
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-cyan-300/70 font-bold uppercase">Defeito Relatado *</label>
                        <Textarea 
                            value={defect} 
                            onChange={(e) => setDefect(e.target.value)} 
                            className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400 min-h-[100px]"
                            placeholder="Descrição detalhada do problema..."
                        />
                    </div>

                    <div className="space-y-1 pt-4 border-t border-cyan-400/10">
                        <label className="text-xs text-cyan-300/70 font-bold uppercase">Observações Internas</label>
                        <Textarea 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400 min-h-[80px]"
                            placeholder="Anotações visíveis apenas para a equipe..."
                        />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-400/20 flex justify-end gap-2 bg-[#0f172a] rounded-b-lg">
            <Button variant="ghost" onClick={onClose} disabled={loading} className="text-cyan-300/70 hover:text-cyan-300 hover:bg-cyan-400/10">
                Cancelar
            </Button>
            <Button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300"
            >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
        </div>
      </div>
    </div>
  );
}
