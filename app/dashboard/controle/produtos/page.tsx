'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Search, Plus, Edit, Power, Loader2, FileUp, Copy, Trash2 } from 'lucide-react';
import { ProductForm, Product, ProductFormData } from '@/components/dashboard/controle/product-form';
import { CsvImportModal } from '@/components/dashboard/controle/csv-import-modal';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      const responseData = response.data;

      let items: Product[] = [];

      if (responseData.data && Array.isArray(responseData.data.data)) {
        items = responseData.data.data;
      } else if (Array.isArray(responseData.data)) {
        items = responseData.data;
      } else if (Array.isArray(responseData)) {
        items = responseData;
      }

      setProducts(items);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: ProductFormData) => {
    try {
      if (editingItem?.id) {
        await api.put(`/products/${editingItem.id}`, data);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/products', data);
        toast.success('Produto criado com sucesso!');
      }
      fetchProducts();
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving product:', error);
      const err = error as { response?: { data?: { error?: string } } };
      const message = err.response?.data?.error;
      toast.error(message || 'Erro ao salvar produto');
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${itemToDelete}`);
      toast.success('Produto excluído com sucesso!');
      fetchProducts();
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir produto');
    } finally {
      setDeleteLoading(false);
      setItemToDelete(null);
    }
  };

  const handleToggleActive = async (item: Product) => {
    try {
      await api.put(`/products/${item.id}`, {
        ...item,
        commercialName: item.commercialName || item.name,
        active: !item.active,
      });
      toast.success(item.active ? 'Produto inativado com sucesso!' : 'Produto ativado com sucesso!');
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Erro ao alterar status do produto');
    }
  };

  const handleClone = (item: Product) => {
    const clonedItem: Product = {
      ...item,
      id: '',
      commercialName: '',
      barcode: '',
      baseSku: ''
    };

    setEditingItem(clonedItem);
    setIsModalOpen(true);
  };

  const filteredItems = products.filter(item => {
    const categoryName = typeof item.category === 'string' ? item.category : item.category?.name;
    const itemName = item.name || item.commercialName;
    return itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (categoryName && categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.barcode && item.barcode.includes(searchTerm));
  });

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
              className="w-full md:w-auto"
            >
              <FileUp className="w-4 h-4 mr-2" /> Importar CSV
            </Button>
            <Button
              onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
              variant="neon"
            >
              <Plus className="w-4 h-4 mr-2" /> Novo Produto
            </Button>
          </div>
        </div>

        <div className="overflow-auto rounded-lg border border-[rgba(255,255,255,0.06)]">
          <Table className="w-full min-w-[900px] border-separate border-spacing-y-2">
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Nome</TableHead>
                <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Tipo</TableHead>
                <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Categoria</TableHead>
                <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Preço de Custo</TableHead>
                <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Preço Venda</TableHead>
                <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Condição</TableHead>
                <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Status</TableHead>
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
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="px-3 py-8 text-center text-slate-400 border-b-0">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="bg-slate-900/70 border-none hover:bg-slate-800/70 transition-colors">
                  <TableCell className="px-3 py-3 font-medium text-slate-100 border-b-0">
                    <div>{item.name || item.commercialName}</div>
                    <div className="text-xs text-slate-400">{item.barcode}</div>
                  </TableCell>
                  <TableCell className="px-3 py-3 border-b-0">
                    <Badge variant="outline" className={item.type === 'PART' || item.type === 'part' ? 'text-purple-400 border-purple-400/30' : 'text-blue-400 border-blue-400/30'}>
                      {item.type === 'PART' || item.type === 'part' ? 'Peça' : 'Produto'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-slate-200 border-b-0">
                    {typeof item.category === 'string' ? item.category : item.category?.name}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-slate-400 border-b-0">
                    {Number(item.costPrice || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-cyan-400 border-b-0">
                    {Number(item.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell className="px-3 py-3 border-b-0">
                    <Badge variant="outline" className={item.condition === 'Novo' ? 'text-emerald-400 border-emerald-400/30' : 'text-amber-400 border-amber-400/30'}>
                      {item.condition || 'Novo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-3 border-b-0">
                    <Badge variant="outline" className={item.active ? 'text-emerald-400 border-emerald-400/30' : 'text-rose-400 border-rose-400/30'}>
                      {item.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right border-b-0">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        title="Clonar Produto"
                        onClick={() => handleClone(item)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neon-blue hover:text-neon-blue hover:bg-neon-blue/10"
                        title="Editar Produto"
                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${item.active ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10' : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'}`}
                        title={item.active ? 'Inativar Produto' : 'Ativar Produto'}
                        onClick={() => handleToggleActive(item)}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        title="Excluir Produto definitivamente"
                        onClick={() => confirmDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem?.id ? "Editar Produto" : "Novo Produto"}
        maxWidth="max-w-5xl"
      >
        <ProductForm
          initialData={editingItem?.id ? editingItem : (editingItem ? editingItem : null)} // If editingItem has no ID, it's a clone/new
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Produto Definitivamente"
        description="Tem certeza que deseja excluir definitivamente este produto? Esta ação não poderá ser desfeita."
        loading={deleteLoading}
      />

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
