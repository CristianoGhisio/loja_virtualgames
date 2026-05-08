'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Plus, Search, Truck, Phone, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { AccessDenied } from '@/components/ui/access-denied';
import { formatPhone } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  active: boolean;
}

export default function FornecedoresPage() {
  const { hasPermission } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states for creation only
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Erro ao carregar fornecedores');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setName('');
    setContact('');
    setPhone('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setName('');
    setContact('');
    setPhone('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    setPhone(value);
  };

  const handleSave = async () => {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      
      const res = await api.post('/suppliers', {
        name,
        contact,
        phone: cleanPhone,
        active: true
      });
      
      toast.success('Fornecedor criado com sucesso!');
      fetchSuppliers();
      handleCloseModal();
      
      // Redirect to the new supplier detail page
      router.push(`/dashboard/fornecedores/${res.data.id}/visao-geral`);
      
    } catch (error) {
      console.error('Error saving supplier:', error);
      toast.error('Erro ao salvar fornecedor');
    }
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
        await api.delete(`/suppliers/${itemToDelete}`);
        toast.success('Fornecedor excluído com sucesso!');
        await fetchSuppliers();
        setDeleteModalOpen(false);
    } catch (error) {
        console.error('Error deleting supplier', error);
        toast.error('Erro ao excluir fornecedor');
    } finally {
        setDeleteLoading(false);
        setItemToDelete(null);
    }
  };

  if (!hasPermission('stock')) return <AccessDenied />;

  const filteredItems = suppliers.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.contact && item.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar fornecedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Button variant="neon" onClick={handleOpenModal}>
          <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
        </Button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-400 flex justify-center items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando fornecedores...
        </div>
      ) : (
        <div className="overflow-auto rounded-lg">
            <Table className="w-full min-w-[900px] border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Fornecedor</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Contato</TableHead>
                <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Telefone</TableHead>
                  <TableHead className="text-left text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Status</TableHead>
                  <TableHead className="text-right text-xs uppercase tracking-wide text-gray-400 px-3 py-3">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer bg-slate-900/70 border-none hover:bg-slate-800/70 transition-colors"
                  onClick={() => router.push(`/dashboard/fornecedores/${item.id}/visao-geral`)}
                >
                  <TableCell className="font-medium text-slate-100 flex items-center gap-3 px-3 py-3 border-b-0">
                    <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-cyan-400/10">
                      <Truck className="w-4 h-4 text-cyan-400" />
                    </div>
                    {item.name}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-slate-200 border-b-0">{item.contact || '-'}</TableCell>
                  <TableCell className="px-3 py-3 text-slate-200 border-b-0">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-cyan-400" />
                      {formatPhone(item.phone) || '-'}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3 border-b-0">
                    <Badge
                      variant="outline"
                      className={item.active ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400' : 'border-rose-500/30 bg-rose-500/15 text-rose-400'}
                    >
                      {item.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-3 py-3 border-b-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      onClick={(e) => confirmDelete(e, item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="px-3 py-8 text-center text-slate-400 border-b-0">
                    Nenhum fornecedor encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Novo Fornecedor"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>Cancelar</Button>
            <Button className="bg-cyan-400 text-slate-900 hover:bg-cyan-300" onClick={handleSave}>
              Criar Fornecedor
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Nome da Empresa</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Distribuidora Games BR" 
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email de Contato</label>
              <Input 
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                type="email" 
                placeholder="contato@empresa.com" 
                className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Telefone</label>
              <Input 
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                maxLength={15} 
                className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
              />
            </div>
          </div>
        </div>
      </Modal>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Fornecedor"
        description="Tem certeza que deseja excluir este fornecedor? Esta ação não poderá ser desfeita."
        loading={deleteLoading}
      />
    </div>
  );
}
