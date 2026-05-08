'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { Mail, Phone, Edit, Truck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatPhone } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Supplier {
  id: string;
  name: string;
  email: string | null;
  document: string | null;
  contact: string | null;
  phone: string | null;
  active: boolean;
  createdAt: string;
}

export default function SupplierGeneralPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Edit Form State
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    document: ''
  });

  const loadSupplier = useCallback(async () => {
    try {
      const response = await api.get<Supplier>(`/suppliers/${id}`);
      setSupplier(response.data);
      setFormData({
        name: response.data.name,
        contact: response.data.contact || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        document: response.data.document || ''
      });
    } catch (error) {
      console.error('Erro ao carregar fornecedor', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSupplier();
  }, [loadSupplier]);

  const handleSave = async () => {
    try {
      await api.put(`/suppliers/${id}`, {
        ...formData,
        phone: formData.phone.replace(/\D/g, '')
      });
      toast.success('Fornecedor atualizado com sucesso!');
      setIsEditModalOpen(false);
      loadSupplier();
    } catch (error) {
      console.error('Erro ao atualizar fornecedor', error);
      toast.error('Erro ao atualizar fornecedor');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d)(\d{4})$/, "$1-$2");
    setFormData({ ...formData, phone: value });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-400">
          Carregando dados do fornecedor...
        </CardContent>
      </Card>
    );
  }

  if (!supplier) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-400">
          Fornecedor não encontrado.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center border-b border-[rgba(255,255,255,0.06)] pb-4">
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-neon-blue" />
            Informações Cadastrais
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="text-neon-blue hover:bg-neon-blue/10"
          >
            <Edit className="w-4 h-4 mr-2" /> Editar
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-gray-400">Razão Social / Nome</label>
              <p className="text-lg text-white font-medium">{supplier.name}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-gray-400">CNPJ / Documento</label>
              <div className="flex items-center gap-2 text-gray-300">
                <FileText className="w-4 h-4 text-gray-400" /> {supplier.document || 'Não informado'}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-gray-400">Contato Principal</label>
              <p className="text-lg text-white font-medium">{supplier.contact || 'Não informado'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-gray-400">Email</label>
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="w-4 h-4 text-gray-400" /> {supplier.email || 'Não informado'}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-gray-400">Telefone</label>
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-gray-400" /> {formatPhone(supplier.phone) || 'Não informado'}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-gray-400">Status</label>
              <div className={`text-sm font-bold ${supplier.active ? 'text-green-400' : 'text-red-400'}`}>
                {supplier.active ? 'ATIVO' : 'INATIVO'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Fornecedor"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-cyan-400/20 text-gray-300 hover:bg-cyan-400/10">Cancelar</Button>
            <Button className="bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300" onClick={handleSave}>
              Salvar Alterações
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Nome / Razão Social</label>
            <Input 
              value={formData.name || ''} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">CNPJ / Documento</label>
              <Input 
                value={formData.document || ''} 
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Contato Principal</label>
              <Input 
                value={formData.contact || ''} 
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Email</label>
              <Input 
                type="email"
                value={formData.email || ''} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Telefone</label>
              <Input 
                value={formData.phone || ''} 
                onChange={handlePhoneChange}
                maxLength={15}
                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
