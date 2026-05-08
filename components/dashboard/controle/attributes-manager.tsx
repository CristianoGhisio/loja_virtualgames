'use client';

import { useState } from 'react';
import { Search, Plus, Edit, Trash2, List, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/native-select';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Reorder, useDragControls } from 'framer-motion';

interface AttributeOption {
    id?: string;
    value: string;
    label: string;
    order: number;
}

interface Attribute {
  id: string;
  name: string;
  slug: string;
  type: 'TEXT' | 'NUMBER' | 'LIST' | 'BOOLEAN';
  entitySource: 'NONE' | 'MANUFACTURER' | 'SUPPLIER' | 'CATEGORY';
  marketplaceRequired: boolean;
  order: number;
  options?: AttributeOption[];
}

interface AttributesManagerProps {
  initialAttributes: Attribute[];
}

export function AttributesManager({ initialAttributes }: AttributesManagerProps) {
  const [attributes, setAttributes] = useState<Attribute[]>(initialAttributes);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Attribute | null>(null);
  
  const [formData, setFormData] = useState<{
      name: string;
      slug: string;
      type: string;
      entitySource: string;
      marketplaceRequired: boolean;
      options: { value: string; label: string; order: number }[];
  }>({ 
    name: '', 
    slug: '', 
    type: 'TEXT',
    entitySource: 'NONE',
    marketplaceRequired: false,
    options: []
  });
  
  const [loading, setLoading] = useState(false);
  const [newOption, setNewOption] = useState('');

  const filteredItems = attributes.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleReorder = async (newOrder: Attribute[]) => {
    // Only update if search is empty to avoid messing up indices
    if (search) return;
    
    setAttributes(newOrder);
    
    // Calculate new order indices
    const updates = newOrder.map((item, index) => ({
      id: item.id,
      order: index
    }));

    try {
      await api.put('/attributes/reorder', { items: updates });
    } catch (error) {
      console.error('Failed to save order', error);
      toast.error('Erro ao salvar nova ordem');
    }
  };

  const handleOpenModal = (item?: Attribute) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        slug: item.slug,
        type: item.type,
        entitySource: item.entitySource || 'NONE',
        marketplaceRequired: item.marketplaceRequired,
        options: item.options ? [...item.options] : []
      });
    } else {
      setEditingItem(null);
      setFormData({ 
          name: '', 
          slug: '', 
          type: 'TEXT', 
          entitySource: 'NONE',
          marketplaceRequired: false,
          options: []
      });
    }
    setModalOpen(true);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (val: string) => {
    setFormData(prev => ({
        ...prev,
        name: val,
        slug: !editingItem ? generateSlug(val) : prev.slug
    }));
  };

  const handleAddOption = () => {
      if (!newOption.trim()) return;
      setFormData(prev => ({
          ...prev,
          options: [...prev.options, { value: newOption, label: newOption, order: prev.options.length }]
      }));
      setNewOption('');
  };

  const handleRemoveOption = (index: number) => {
      setFormData(prev => ({
          ...prev,
          options: prev.options.filter((_, i) => i !== index)
      }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);

    try {
      const url = editingItem 
        ? `/attributes/${editingItem.id}` 
        : '/attributes';
      
      const method = editingItem ? 'PUT' : 'POST';

      const response = await api({
        method,
        url,
        data: formData
      });

      const savedItem = response.data?.data || response.data;

      if (editingItem) {
        setAttributes(attributes.map(a => a.id === savedItem.id ? savedItem : a));
        toast.success('Atributo atualizado com sucesso!');
      } else {
        setAttributes([...attributes, savedItem]);
        toast.success('Atributo criado com sucesso!');
      }
      setModalOpen(false);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (error as any).response?.data?.error || 'Erro ao salvar atributo';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este atributo?')) return;

    try {
      await api.delete(`/attributes/${id}`);
      setAttributes(attributes.filter(a => a.id !== id));
      toast.success('Atributo excluído com sucesso!');
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (error as any).response?.data?.error || 'Erro ao excluir atributo';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-cyan-300" />
          <Input
            placeholder="Buscar atributos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-slate-950/60 border-cyan-400/30 text-slate-200"
          />
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-bold">
          <Plus className="mr-2 h-4 w-4" /> Novo Atributo
        </Button>
      </div>

      <div className="overflow-auto rounded-lg border border-cyan-400/20 bg-slate-950/40">
        <Table className="w-full min-w-[900px] border-separate border-spacing-y-2">
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="text-left text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Nome</TableHead>
              <TableHead className="text-left text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Slug</TableHead>
              <TableHead className="text-left text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Tipo</TableHead>
              <TableHead className="text-left text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Origem</TableHead>
              <TableHead className="text-left text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Obrigatório Marketplace</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Ações</TableHead>
            </TableRow>
          </TableHeader>
          {/* If search is active, we cannot reorder, so we render normal rows */}
          {search ? (
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="bg-slate-900/70 border-none hover:bg-slate-800/70 transition-colors">
                  <TableCell className="px-3 py-3 border-b-0"><GripVertical className="w-4 h-4 text-slate-500" /></TableCell>
                  <TableCell className="px-3 py-3 font-medium text-slate-100 border-b-0">{item.name}</TableCell>
                  <TableCell className="px-3 py-3 text-slate-400 font-mono text-xs border-b-0">{item.slug}</TableCell>
                  <TableCell className="px-3 py-3 border-b-0">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-3 border-b-0">
                      {item.entitySource && item.entitySource !== 'NONE' ? (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
                              {item.entitySource}
                          </Badge>
                      ) : (
                          <span className="text-slate-500">-</span>
                      )}
                  </TableCell>
                  <TableCell className="px-3 py-3 border-b-0">
                    <Badge 
                      variant={item.marketplaceRequired ? "default" : "secondary"}
                      className={item.marketplaceRequired ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-white/5 text-slate-400 border border-white/10"}
                    >
                      {item.marketplaceRequired ? 'Sim' : 'Não'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right border-b-0">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)} className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            // Framer Motion Reorder Group
            <Reorder.Group as="tbody" axis="y" values={attributes} onReorder={handleReorder} className="[&_tr]:border-none [&_tr]:hover:bg-slate-800/70">
              {attributes.map((item) => (
                <DraggableRow key={item.id} item={item} onEdit={() => handleOpenModal(item)} onDelete={() => handleDelete(item.id)} />
              ))}
            </Reorder.Group>
          )}
          {filteredItems.length === 0 && (
              <TableBody>
                <TableRow>
                    <TableCell colSpan={7} className="px-3 py-8 text-center text-slate-400 border-b-0">
                    Nenhum atributo encontrado
                    </TableCell>
                </TableRow>
              </TableBody>
            )}
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0f172a] border-cyan-400/20 text-slate-100 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-cyan-300">
                <List className="w-5 h-5 text-cyan-300" />
                {editingItem ? 'Editar Atributo' : 'Novo Atributo'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
                {editingItem ? 'Edite as informações do atributo abaixo.' : 'Preencha as informações para criar um novo atributo.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Nome</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
                    required
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="slug" className="text-slate-300">Slug</Label>
                <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                    className="bg-slate-950/60 border-cyan-400/30 font-mono text-slate-200"
                    required
                />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type" className="text-slate-300">Tipo de Dado</Label>
                    <div className="relative">
                        <Select
                            className="w-full h-10 rounded-md border border-cyan-400/30 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 appearance-none focus:outline-none focus:ring-1 focus:ring-cyan-400"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="TEXT">Texto</option>
                            <option value="NUMBER">Número</option>
                            <option value="LIST">Lista de Opções</option>
                            <option value="BOOLEAN">Sim/Não</option>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="entitySource" className="text-slate-300">Origem de Dados</Label>
                    <div className="relative">
                        <Select
                            className="w-full h-10 rounded-md border border-cyan-400/30 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 appearance-none focus:outline-none focus:ring-1 focus:ring-cyan-400"
                            value={formData.entitySource}
                            onChange={(e) => setFormData({ ...formData, entitySource: e.target.value })}
                        >
                            <option value="NONE">Nenhuma (Manual)</option>
                            <option value="MANUFACTURER">Fabricantes</option>
                            <option value="SUPPLIER">Fornecedores</option>
                            <option value="CATEGORY">Categorias</option>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Options Management for LIST type */}
            {formData.type === 'LIST' && formData.entitySource === 'NONE' && (
                <div className="space-y-2 border border-cyan-400/20 p-3 rounded-md bg-slate-950/40">
                    <Label className="text-xs uppercase text-slate-400 font-bold">Opções da Lista</Label>
                    <div className="flex gap-2">
                        <Input 
                            value={newOption} 
                            onChange={(e) => setNewOption(e.target.value)} 
                            placeholder="Nova opção..." 
                            className="h-8 text-sm bg-slate-950/60 border-cyan-400/30 text-slate-200"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                        />
                        <Button type="button" size="sm" onClick={handleAddOption} variant="secondary" className="bg-slate-800 text-slate-200 hover:bg-slate-700">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="max-h-[150px] overflow-y-auto space-y-1 mt-2">
                        {formData.options.length === 0 && <p className="text-xs text-slate-500 italic">Nenhuma opção adicionada.</p>}
                        {formData.options.map((opt, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white/5 px-2 py-1 rounded text-sm group text-slate-200">
                                <span>{opt.label}</span>
                                <Button 
                                    type="button" 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-300"
                                    onClick={() => handleRemoveOption(idx)}
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {formData.type === 'LIST' && formData.entitySource !== 'NONE' && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                    <p className="text-xs text-blue-300">
                        As opções deste atributo serão preenchidas automaticamente com base na entidade selecionada ({formData.entitySource}).
                    </p>
                </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="marketplaceRequired"
                checked={formData.marketplaceRequired}
                onChange={(e) => setFormData({ ...formData, marketplaceRequired: e.target.checked })}
                className="rounded border-cyan-400/30 bg-slate-950/60 text-cyan-400 focus:ring-cyan-400"
              />
              <Label htmlFor="marketplaceRequired" className="text-slate-300">Obrigatório no Marketplace</Label>
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

function DraggableRow({ item, onEdit, onDelete }: { item: Attribute; onEdit: () => void; onDelete: () => void }) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      as="tr"
      className="bg-slate-900/70 transition-colors border-none"
      dragListener={false}
      dragControls={controls}
    >
      <TableCell className="px-3 py-3 border-b-0">
        <div 
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 rounded"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripVertical className="w-4 h-4 text-slate-500" />
        </div>
      </TableCell>
      <TableCell className="px-3 py-3 font-medium text-slate-100 border-b-0">{item.name}</TableCell>
      <TableCell className="px-3 py-3 text-slate-400 font-mono text-xs border-b-0">{item.slug}</TableCell>
      <TableCell className="px-3 py-3 border-b-0">
        <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/30">
          {item.type}
        </Badge>
      </TableCell>
      <TableCell className="px-3 py-3 border-b-0">
          {item.entitySource && item.entitySource !== 'NONE' ? (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
                  {item.entitySource}
              </Badge>
          ) : (
              <span className="text-slate-500">-</span>
          )}
      </TableCell>
      <TableCell className="px-3 py-3 border-b-0">
        <Badge 
          variant={item.marketplaceRequired ? "default" : "secondary"}
          className={item.marketplaceRequired ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-white/5 text-slate-400 border border-white/10"}
        >
          {item.marketplaceRequired ? 'Sim' : 'Não'}
        </Badge>
      </TableCell>
      <TableCell className="px-3 py-3 text-right border-b-0">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </Reorder.Item>
  );
}
