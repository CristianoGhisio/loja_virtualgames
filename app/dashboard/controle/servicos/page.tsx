'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, Edit, Trash2, Wrench, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/native-select';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Service {
  id: string;
  name: string;
  internalCode: string;
  descriptionShort?: string;
  priceBase: number;
  priceType: string;
  estimatedTimeMin?: number;
  commissionType?: string;
  commissionValue?: number;
  warrantyMonths?: number;
  
  active: boolean;
}

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [formData, setFormData] = useState({
    name: '',
    internalCode: '',
    descriptionShort: '',
    priceBase: 0,
    priceType: 'FIXED',
    estimatedTimeMin: '',
    commissionType: '',
    commissionValue: '',
    warrantyMonths: '',
    
    active: true,
  });

  const loadData = useCallback(async (searchValue?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      const effectiveSearch = searchValue !== undefined ? searchValue : search;
      if (effectiveSearch) params.set('q', effectiveSearch);

      const servicesRes = await api.get(`/services?${params.toString()}`);
      const responseData = servicesRes.data;

      if (responseData.data && Array.isArray(responseData.data.data)) {
        setServices(responseData.data.data);
        const meta = responseData.data.meta;
        if (meta) {
          setTotal(meta.total);
          setTotalPages(meta.pages);
        }
      } else if (responseData.data && Array.isArray(responseData.data)) {
        setServices(responseData.data);
      } else if (Array.isArray(responseData.data)) {
        setServices(responseData.data);
      } else {
        setServices(responseData.data || responseData || []);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      loadData();
    }, 400);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search, page, limit, loadData]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingItem(service);
      setFormData({
        name: service.name,
        internalCode: service.internalCode || '',
        descriptionShort: service.descriptionShort || '',
        priceBase: Number(service.priceBase) || 0,
        priceType: service.priceType || 'FIXED',
        estimatedTimeMin: service.estimatedTimeMin?.toString() || '',
        commissionType: service.commissionValue && Number(service.commissionValue) > 0 ? (service.commissionType || 'PERCENT') : '',
        commissionValue: service.commissionValue && Number(service.commissionValue) > 0 ? service.commissionValue?.toString() || '' : '',
        warrantyMonths: service.warrantyMonths !== undefined && service.warrantyMonths !== null ? String(service.warrantyMonths) : '',
        
        active: service.active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '', internalCode: '', descriptionShort: '',
        priceBase: 0, priceType: 'FIXED',
        estimatedTimeMin: '', commissionType: '', commissionValue: '', warrantyMonths: '',
        active: true,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const normalizedCommissionType = formData.commissionType === 'FIXED' ? 'FIXED' : 'PERCENT';
      const normalizedCommissionValue = formData.commissionType ? (Number(formData.commissionValue) || 0) : 0;
      const payload = {
        name: formData.name.trim(),
        internalCode: formData.internalCode.trim(),
        descriptionShort: formData.descriptionShort.trim(),
        priceBase: Number(formData.priceBase) || 0,
        priceType: formData.priceType,
        estimatedTimeMin: formData.estimatedTimeMin ? Number(formData.estimatedTimeMin) : null,
        warrantyMonths: formData.warrantyMonths ? Number(formData.warrantyMonths) : 0,
        commissionType: normalizedCommissionType,
        commissionValue: normalizedCommissionValue,
        active: formData.active,
      };

      if (editingItem) {
        if (!payload.internalCode) {
          payload.internalCode = editingItem.internalCode;
        }
        const res = await fetch(`/api/services/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        if (!payload.internalCode) {
          delete (payload as { internalCode?: string }).internalCode;
        }
        const res = await api.post('/services', payload);
        if (res.status >= 400) throw new Error('Erro ao criar serviço');
        toast.success('Serviço criado com sucesso!');
      }
      setModalOpen(false);
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar serviço';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este serviço?')) return;
    try {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
      toast.success('Serviço desativado com sucesso!');
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao desativar serviço';
      toast.error(message);
    }
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar serviços..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Button onClick={() => handleOpenModal()} variant="neon">
          <Plus className="mr-2 h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg border border-[rgba(255,255,255,0.06)]">
        <Table className="w-full min-w-[1000px] border-separate border-spacing-y-2">
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Nome</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Preço</TableHead>
              <TableHead className="text-center text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Tempo de Realização</TableHead>
              <TableHead className="text-center text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Garantia</TableHead>
              <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Tipo de Comissão</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Comissão</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Valor Comissão (R$)</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="px-3 py-8 text-center border-b-0">
                  <div className="flex justify-center items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
                  </div>
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-3 py-8 text-center text-slate-400 border-b-0">
                  Nenhum serviço encontrado
                </TableCell>
              </TableRow>
            ) : services.map((s) => (
              <TableRow key={s.id} className="bg-slate-900/70 border-none hover:bg-slate-800/70 transition-colors">
                <TableCell className="px-3 py-3 border-b-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-100">{s.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{s.internalCode || '-'}</span>
                  </div>
                </TableCell>
                <TableCell className="px-3 py-3 text-right text-emerald-400 font-bold border-b-0">{formatCurrency(Number(s.priceBase))}</TableCell>
                <TableCell className="px-3 py-3 text-center border-b-0">
                  <Badge className="bg-slate-800/50 text-slate-300 border border-slate-700/50">
                    {s.estimatedTimeMin ? `${s.estimatedTimeMin} min` : '-'}
                  </Badge>
                </TableCell>
                <TableCell className="px-3 py-3 text-center text-slate-300 border-b-0">
                  {Number(s.warrantyMonths ?? 0)} mês(es)
                </TableCell>
                <TableCell className="px-3 py-3 border-b-0">
                  <Badge variant="neon">{s.commissionType === 'PERCENT' ? 'Percentual' : s.commissionType === 'FIXED' ? 'Fixo' : 'Sem comissão'}</Badge>
                </TableCell>
                <TableCell className="px-3 py-3 text-right text-slate-300 border-b-0">
                  {s.commissionValue && Number(s.commissionValue) > 0 ? (
                    s.commissionType === 'PERCENT' ? `${s.commissionValue}%` : formatCurrency(Number(s.commissionValue))
                  ) : '-'}
                </TableCell>
                <TableCell className="px-3 py-3 text-right text-cyan-400 font-medium border-b-0">
                  {s.commissionValue && Number(s.commissionValue) > 0 ? (
                    s.commissionType === 'PERCENT' 
                      ? formatCurrency((Number(s.priceBase) * Number(s.commissionValue)) / 100)
                      : formatCurrency(Number(s.commissionValue))
                  ) : '-'}
                </TableCell>
                <TableCell className="px-3 py-3 text-right border-b-0">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(s)} className="h-8 w-8 text-neon-blue hover:text-neon-blue hover:bg-neon-blue/10">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!loading && totalPages > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0f172a] border-cyan-400/20 text-slate-100 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-neon-blue">
              <Wrench className="h-5 w-5 text-neon-blue" />
              {editingItem ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-slate-300">Nome *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
                  placeholder="Nome do serviço"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Código Interno</Label>
                <Input
                  value={formData.internalCode}
                  onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                  className="bg-slate-950/60 border-cyan-400/30 text-slate-200 font-mono"
                  placeholder="Auto"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Descrição Curta</Label>
              <Input
                value={formData.descriptionShort}
                onChange={(e) => setFormData({ ...formData, descriptionShort: e.target.value })}
                className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
                placeholder="Breve descrição do serviço"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Preço Base *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.priceBase}
                    onChange={(e) => setFormData({ ...formData, priceBase: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-950/60 border-cyan-400/30 text-slate-200 pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Tipo de Preço</Label>
                <div className="relative">
                  <Select
                    className="w-full h-10 rounded-md border border-cyan-400/30 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 appearance-none focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    value={formData.priceType}
                    onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                  >
                    <option value="FIXED">Fixo</option>
                    <option value="HOURLY">Por hora</option>
                    <option value="VARIABLE">Variável</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1 text-slate-300"><Clock className="h-3 w-3" /> Duração (min)</Label>
                <Input
                  type="number"
                  value={formData.estimatedTimeMin}
                  onChange={(e) => setFormData({ ...formData, estimatedTimeMin: e.target.value })}
                  className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
                  placeholder="Ex: 60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Tipo Comissão</Label>
                <div className="relative">
                  <Select
                    className="w-full h-10 rounded-md border border-cyan-400/30 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 appearance-none focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    value={formData.commissionType}
                    onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                  >
                    <option value="">Sem comissão</option>
                    <option value="PERCENT">Percentual</option>
                    <option value="FIXED">Valor fixo</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Valor Comissão</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.commissionValue}
                  onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })}
                  className="bg-slate-950/60 border-cyan-400/30 text-slate-200 disabled:opacity-50"
                  placeholder={formData.commissionType === 'PERCENT' ? '%' : 'R$'}
                  disabled={!formData.commissionType}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2 md:w-1/3">
                <Label className="text-slate-300">Garantia (meses)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.warrantyMonths}
                  onChange={(e) => setFormData({ ...formData, warrantyMonths: e.target.value })}
                  className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
                  placeholder="Ex: 3"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-cyan-400/20">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-cyan-400/30 bg-slate-950/60 text-cyan-400 focus:ring-cyan-400"
              />
              <Label htmlFor="active" className="text-slate-300">Ativo</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="bg-cyan-400 text-slate-900 hover:bg-cyan-300 font-bold">
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
