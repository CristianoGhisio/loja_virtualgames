'use client';

import { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Manufacturer {
  id: string;
  name: string;
  website?: string | null;
  active: boolean;
  products?: { id: string }[];
}

interface ManufacturersManagerProps {
  initialManufacturers: Manufacturer[];
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function ManufacturersManager({ initialManufacturers }: ManufacturersManagerProps) {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(initialManufacturers);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Manufacturer | null>(null);

  const [formData, setFormData] = useState({ name: '', website: '', active: true });
  const [loading, setLoading] = useState(false);

  const filteredItems = manufacturers.filter(m =>
    (m.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (item?: Manufacturer) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        website: item.website || '',
        active: item.active
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', website: '', active: true });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingItem
        ? `/api/manufacturers/${editingItem.id}`
        : '/api/manufacturers';

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save manufacturer');
      }

      const savedItem = unwrapData<Manufacturer>(await response.json());

      if (editingItem) {
        setManufacturers(manufacturers.map(m => m.id === savedItem.id ? savedItem : m));
        toast.success('Fabricante atualizado com sucesso!');
      } else {
        setManufacturers([...manufacturers, savedItem]);
        toast.success('Fabricante criado com sucesso!');
      }
      setModalOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar fabricante';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fabricante?')) return;

    try {
      const response = await fetch(`/api/manufacturers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete manufacturer');
      }

      setManufacturers(manufacturers.filter(m => m.id !== id));
      toast.success('Fabricante excluído com sucesso!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir fabricante';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-cyan-300" />
          <Input
            placeholder="Buscar fabricantes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-slate-950/60 border-cyan-400/30 text-slate-200"
          />
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-cyan-400 hover:bg-cyan-300 text-slate-900 font-bold">
          <Plus className="mr-2 h-4 w-4" /> Novo Fabricante
        </Button>
      </div>

      <div className="overflow-auto rounded-lg border border-cyan-400/20 bg-slate-950/40">
        <Table className="w-full min-w-[900px] border-separate border-spacing-y-2">
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="text-left text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Nome</TableHead>
              <TableHead className="text-left text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Website</TableHead>
              <TableHead className="text-left text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Produtos</TableHead>
              <TableHead className="text-left text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Status</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-cyan-300 px-3 py-3">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id} className="bg-slate-900/70 border-none hover:bg-slate-800/70 transition-colors">
                <TableCell className="px-3 py-3 font-medium text-slate-100 border-b-0">{item.name}</TableCell>
                <TableCell className="px-3 py-3 text-slate-400 border-b-0">
                  {item.website ? (
                    <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-xs">
                      {item.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  ) : '-'}
                </TableCell>
                <TableCell className="px-3 py-3 text-slate-400 border-b-0">
                  <Badge variant="outline" className="border-cyan-400/30 text-cyan-300">
                    {item.products?.length || 0}
                  </Badge>
                </TableCell>
                <TableCell className="px-3 py-3 border-b-0">
                  <Badge
                    variant={item.active ? "default" : "destructive"}
                    className={item.active ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/15 text-rose-400 border border-rose-500/30"}
                  >
                    {item.active ? 'Ativa' : 'Inativa'}
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
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="px-3 py-8 text-center text-slate-400 border-b-0">
                  Nenhum fabricante encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-[#0f172a] border-cyan-400/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-cyan-300">{editingItem ? 'Editar Fabricante' : 'Novo Fabricante'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingItem ? 'Edite os detalhes do fabricante.' : 'Preencha os campos para criar um novo fabricante.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-slate-300">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
                placeholder="https://www.example.com"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-cyan-400/30 bg-slate-950/60 text-cyan-400 focus:ring-cyan-400"
              />
              <Label htmlFor="active" className="text-slate-300">Ativa</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="bg-cyan-400 text-slate-900 hover:bg-cyan-300">
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
