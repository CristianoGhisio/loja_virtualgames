'use client';

/* eslint-disable security/detect-object-injection */

import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  categoryId: string;
  active: boolean;
  category: Category;
}

interface SubcategoriesManagerProps {
  initialSubcategories: Subcategory[];
  categories: Category[];
}

export function SubcategoriesManager({ initialSubcategories, categories }: SubcategoriesManagerProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Subcategory | null>(null);

  const [formData, setFormData] = useState({ name: '', description: '', categoryId: '', active: true });
  const [loading, setLoading] = useState(false);

  const filteredItems = subcategories.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (subcategory?: Subcategory) => {
    if (subcategory) {
      setEditingItem(subcategory);
      setFormData({
        name: subcategory.name,
        description: subcategory.description || '',
        categoryId: subcategory.categoryId,
        active: subcategory.active
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', description: '', categoryId: '', active: true });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Selecione uma categoria');
      return;
    }
    setLoading(true);

    try {
      const url = editingItem
        ? `/api/subcategories/${editingItem.id}`
        : '/api/subcategories';

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save subcategory');
      }

      const savedItem = await response.json();

      // We need to attach the category object for display since API might not return it fully populated depending on implementation
      // But typically we should reload or update manually. Let's update manually.
      const category = categories.find(c => c.id === savedItem.categoryId);
      const itemWithCategory = { ...savedItem, category: category || { id: savedItem.categoryId, name: 'Unknown' } };

      if (editingItem) {
        setSubcategories(subcategories.map(s => s.id === savedItem.id ? itemWithCategory : s));
        toast.success('Subcategoria atualizada com sucesso!');
      } else {
        setSubcategories([...subcategories, itemWithCategory]);
        toast.success('Subcategoria criada com sucesso!');
      }
      setModalOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar subcategoria';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta subcategoria?')) return;

    try {
      const response = await fetch(`/api/subcategories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete subcategory');
      }

      setSubcategories(subcategories.filter(s => s.id !== id));
      toast.success('Subcategoria excluída com sucesso!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir subcategoria';
      toast.error(message);
    }
  };

  // Group subcategories by categoryId
  const groupedSubcategories = filteredItems.reduce((acc, subcategory) => {
    const categoryName = subcategory.category?.name || 'Sem Categoria';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(subcategory);
    return acc;
  }, {} as Record<string, Subcategory[]>);

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedSubcategories).sort();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar subcategorias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-black/20 border-white/10 text-white"
          />
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-neon-blue hover:bg-neon-blue/80 text-black font-bold">
          <Plus className="mr-2 h-4 w-4" /> Nova Subcategoria
        </Button>
      </div>

      <div className="rounded-md border border-white/10 bg-black/20 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-gray-400 w-[40%]">Nome (Subcategoria)</TableHead>
              <TableHead className="text-gray-400">Slug</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-right text-gray-400">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCategories.map((categoryName) => (
              <React.Fragment key={categoryName}>
                {/* Group Header Row */}
                <TableRow className="bg-white/5 border-white/10 hover:bg-white/10">
                  <TableCell colSpan={4} className="font-bold text-neon-blue py-3">
                    {categoryName}
                  </TableCell>
                </TableRow>
                
                {/* Subcategory Rows */}
                {groupedSubcategories[categoryName].map((item) => (
                  <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium text-white pl-8 border-l-2 border-transparent hover:border-neon-blue/50 transition-colors">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-gray-400 text-xs font-mono">{item.slug}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.active ? "default" : "destructive"}
                        className={item.active ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : ""}
                      >
                        {item.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)} className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
            
            {sortedCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                  Nenhuma subcategoria encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Subcategoria' : 'Nova Subcategoria'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Edite os detalhes da subcategoria.' : 'Preencha os campos para criar uma nova subcategoria.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria Pai</Label>
              <select
                id="category"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
                required
              >
                <option value="" className="bg-zinc-900">Selecione uma categoria...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-zinc-900">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-black/20 border-white/10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-black/20 border-white/10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded border-gray-300 text-neon-blue focus:ring-neon-blue"
              />
              <Label htmlFor="active">Ativa</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading} className="bg-neon-blue text-black hover:bg-neon-blue/80">
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
