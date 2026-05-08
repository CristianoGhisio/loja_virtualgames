'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { User, Loader2, Trash2 } from 'lucide-react';
import { AxiosError } from 'axios';

type EmployeePhotoUploadResponse = {
  success: boolean;
  data?: {
    url: string;
    filePath: string;
  };
};

const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export default function EmployeePessoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadedPhotoPath, setUploadedPhotoPath] = useState('');

  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    dataNascimento: '',
    celularWhatsapp: '',
    emailPessoal: '',
    fotoUrl: '',
    descricaoPerfil: '',
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        const employee = res.data;
        setFormData({
          nomeCompleto: employee.nomeCompleto || '',
          cpf: employee.cpf || '',
          dataNascimento: employee.dataNascimento ? new Date(employee.dataNascimento).toISOString().split('T')[0] : '',
          celularWhatsapp: employee.celularWhatsapp || '',
          emailPessoal: employee.emailPessoal || '',
          fotoUrl: employee.fotoUrl || '',
          descricaoPerfil: employee.descricaoPerfil || '',
        });
        if (typeof employee.fotoUrl === 'string' && employee.fotoUrl.startsWith('/uploads/employees/')) {
          setUploadedPhotoPath(employee.fotoUrl.slice(1));
        } else {
          setUploadedPhotoPath('');
        }
      } catch (error) {
        console.error('Failed to load employee', error);
        toast.error('Erro ao carregar dados do funcionário');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/employees/${id}`, formData);
      toast.success('Dados pessoais atualizados com sucesso!');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const msg = axiosError.response?.data?.message || 'Erro ao atualizar dados pessoais';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formPayload = new FormData();
    formPayload.append('file', file);

    setUploadingPhoto(true);
    try {
      const response = await api.post<EmployeePhotoUploadResponse>('/employees/photo', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const photoData = response.data?.data;
      if (!photoData?.url || !photoData.filePath) {
        throw new Error('Resposta inválida ao enviar foto');
      }

      if (uploadedPhotoPath) {
        try {
          await api.delete('/employees/photo', { data: { filePath: uploadedPhotoPath } });
        } catch {}
      }

      setUploadedPhotoPath(photoData.filePath);
      setFormData((prev) => ({ ...prev, fotoUrl: photoData.url }));
      toast.success('Foto enviada com sucesso');
    } catch {
      toast.error('Erro ao enviar foto');
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (uploadedPhotoPath) {
      try {
        await api.delete('/employees/photo', { data: { filePath: uploadedPhotoPath } });
      } catch {
        toast.error('Erro ao remover foto');
        return;
      }
    }

    setUploadedPhotoPath('');
    setFormData((prev) => ({ ...prev, fotoUrl: '' }));
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Carregando dados...</div>;
  }

  return (
    <Card>
      <CardHeader className="border-b border-[rgba(255,255,255,0.06)] pb-4 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" /> Dados Pessoais
        </CardTitle>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          variant="neon"
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label>Nome Completo *</Label>
            <Input 
              name="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={handleChange}
              placeholder="Nome do funcionário" 
              className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30" 
            />
          </div>

          <div className="space-y-2">
            <Label>CPF *</Label>
            <Input 
              name="cpf"
              value={formData.cpf}
              onChange={(e) => setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
              placeholder="000.000.000-00" 
              maxLength={14}
              className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30"
            />
          </div>

          <div className="space-y-2">
            <Label>Data de Nascimento *</Label>
            <Input 
              name="dataNascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={handleChange}
              className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30" 
            />
          </div>

          <div className="space-y-2">
            <Label>Celular / WhatsApp *</Label>
            <Input 
              name="celularWhatsapp"
              value={formData.celularWhatsapp}
              onChange={(e) => setFormData(prev => ({ ...prev, celularWhatsapp: formatPhone(e.target.value) }))}
              placeholder="(00) 00000-0000" 
              maxLength={15}
              className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>E-mail Pessoal</Label>
            <Input 
              name="emailPessoal"
              type="email"
              value={formData.emailPessoal}
              onChange={handleChange}
              placeholder="email@exemplo.com" 
              className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30" 
            />
          </div>

          <div className="space-y-2 md:col-span-2 pt-4 border-t border-cyan-400/10">
            <h4 className="text-sm font-medium text-gray-300 mb-4">Perfil Público (Opcional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Foto de Perfil</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadPhoto}
                  disabled={uploadingPhoto}
                  className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30 file:bg-cyan-500 file:text-slate-900 file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3"
                />
                {uploadingPhoto ? (
                  <div className="flex items-center gap-2 text-neon-blue text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando imagem...
                  </div>
                ) : null}
                {formData.fotoUrl ? (
                  <div className="space-y-3">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-cyan-400/30">
                      <Image src={formData.fotoUrl} alt="Prévia da foto de perfil" fill className="object-cover" />
                    </div>
                    <Button type="button" variant="outline" className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10" onClick={handleRemovePhoto}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                ) : null}
                <p className="text-xs text-slate-400">Esta foto será exibida na tela de login e na landing page da loja.</p>
              </div>
              <div className="space-y-2">
                <Label>Descrição da Atividade</Label>
                <Textarea 
                  name="descricaoPerfil"
                  value={formData.descricaoPerfil}
                  onChange={handleChange}
                  placeholder="Ex: Especialista em manutenção de consoles de última geração..." 
                  className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30 min-h-[80px]" 
                />
                <p className="text-xs text-slate-400">Pequeno texto sobre o funcionário para exibir na landing page.</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
