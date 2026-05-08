'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, User, Briefcase, KeyRound, Upload, Loader2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

type SystemUser = {
  id: string;
  name: string;
  email: string;
};

type UserRole = {
  id: string;
  name: string;
  description: string | null;
};

type EmployeeCreatePayload = {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  celularWhatsapp: string;
  emailPessoal: string;
  dataAdmissao: string;
  cargoFuncao: string;
  tipoContrato: string;
  salarioBase: number;
  percentualComissao: number;
  chavePix: string;
  status: string;
  userId: string | null;
  userPassword: string;
  userRoleId: string;
  fotoUrl: string;
  descricaoPerfil: string;
  createUser?: boolean;
};

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

export default function NovoFuncionarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [createUser, setCreateUser] = useState(false);
  const [activeTab, setActiveTab] = useState<'pessoal' | 'funcional' | 'acesso'>('pessoal');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadedPhotoPath, setUploadedPhotoPath] = useState('');

  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    dataNascimento: '',
    celularWhatsapp: '',
    emailPessoal: '',
    dataAdmissao: '',
    cargoFuncao: '',
    tipoContrato: 'CLT',
    salarioBase: '',
    percentualComissao: '',
    chavePix: '',
    status: 'ATIVO',
    userId: 'none',
    userPassword: '',
    userRoleId: '',
    fotoUrl: '',
    descricaoPerfil: '',
  });

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/roles')
        ]);
        setUsers(usersRes.data || []);
        setRoles(rolesRes.data || []);
        
        if (rolesRes.data && rolesRes.data.length > 0) {
          setFormData(prev => ({ ...prev, userRoleId: rolesRes.data[0].id }));
        }
      } catch (error) {
        console.error('Erro ao carregar dados', error);
      }
    };
    fetchUsersAndRoles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: EmployeeCreatePayload = {
        ...formData,
        salarioBase: Number(formData.salarioBase),
        percentualComissao: formData.percentualComissao ? Number(formData.percentualComissao) : 0,
        userId: formData.userId === 'none' ? null : formData.userId,
      };

      if (createUser) {
        payload.createUser = true;
        payload.userPassword = formData.userPassword;
        payload.userRoleId = formData.userRoleId;
      }

      const res = await api.post('/employees', payload);
      toast.success('Funcionário cadastrado com sucesso!');
      router.push(`/dashboard/funcionarios/${res.data.id}/visao-geral`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      const msg = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Erro ao salvar funcionário';
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-10 duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/funcionarios')} className="text-gray-300 hover:bg-cyan-400/10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-300 font-orbitron">Novo Funcionário</h1>
          <p className="text-gray-400">Preencha os dados abaixo para cadastrar um novo colaborador na equipe.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-cyan-400/20 pb-1">
        {[
          { id: 'pessoal', label: 'Dados Pessoais', icon: User },
          { id: 'funcional', label: 'Dados Funcionais', icon: Briefcase },
          { id: 'acesso', label: 'Acesso ao Sistema', icon: KeyRound },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'pessoal' | 'funcional' | 'acesso')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all duration-200 text-sm font-medium
                ${isActive
                  ? 'bg-neon-blue/10 text-neon-blue border-b-2 border-neon-blue'
                  : 'text-gray-400 hover:text-neon-blue hover:bg-neon-blue/10'}
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className={`${activeTab === 'pessoal' ? 'block' : 'hidden'} bg-[#0f172a] border-cyan-400/20 shadow-lg`}>
          <CardHeader className="border-b border-cyan-400/10 pb-4">
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label>Nome Completo *</Label>
                <Input 
                  name="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={handleChange}
                  placeholder="Nome do funcionário" 
                  required
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
                  required
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
                  required
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
                  required
                  className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>E-mail Pessoal {createUser && '*'}</Label>
                <Input 
                  name="emailPessoal"
                  type="email"
                  value={formData.emailPessoal}
                  onChange={handleChange}
                  required={createUser}
                  placeholder="email@exemplo.com" 
                  className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30" 
                />
              </div>

              <div className="space-y-2 md:col-span-2 pt-4 border-t border-cyan-400/10">
                <h4 className="text-sm font-medium text-neon-blue mb-4">Perfil Público (Opcional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Foto de Perfil</Label>
                    <div className="space-y-3">
                      <Input
                        id="employee-photo-input"
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
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" className="border-cyan-400/30 text-gray-300 hover:bg-cyan-400/10" onClick={() => document.getElementById('employee-photo-input')?.click()}>
                              <Upload className="w-4 h-4 mr-2" />
                              Trocar Foto
                            </Button>
                            <Button type="button" variant="outline" className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10" onClick={handleRemovePhoto}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remover
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
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

        <Card className={`${activeTab === 'funcional' ? 'block' : 'hidden'} bg-[#0f172a] border-cyan-400/20 shadow-lg`}>
          <CardHeader className="border-b border-cyan-400/10 pb-4">
            <CardTitle className="text-lg text-gray-300">Dados Funcionais</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Cargo / Função *</Label>
                <Input 
                  name="cargoFuncao"
                  value={formData.cargoFuncao}
                  onChange={handleChange}
                  placeholder="Ex: Vendedor, Gerente" 
                  required
                  className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30" 
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Contrato *</Label>
                <Select 
                  value={formData.tipoContrato}
                  onValueChange={(value) => handleSelectChange('tipoContrato', value)}
                >
                  <SelectTrigger className="bg-slate-950/60 border-cyan-400/30 focus:ring-cyan-400/30">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-cyan-400/20 text-slate-200">
                    <SelectItem value="CLT">CLT</SelectItem>
                    <SelectItem value="PJ">PJ</SelectItem>
                    <SelectItem value="AUTONOMO">Autônomo</SelectItem>
                    <SelectItem value="ESTAGIARIO">Estagiário</SelectItem>
                    <SelectItem value="SOCIO">Sócio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data de Admissão *</Label>
                <Input 
                  name="dataAdmissao"
                  type="date"
                  value={formData.dataAdmissao}
                  onChange={handleChange}
                  required
                  className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30" 
                />
              </div>

              <div className="space-y-2">
                <Label>Salário Base (R$) *</Label>
                <Input 
                  name="salarioBase"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.salarioBase}
                  onChange={handleChange}
                  required
                  className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30" 
                />
              </div>

              <div className="space-y-2">
                <Label>Comissão (%)</Label>
                <Input 
                  name="percentualComissao"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.percentualComissao}
                  onChange={handleChange}
                  className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30" 
                />
              </div>

              <div className="space-y-2">
                <Label>Chave PIX</Label>
                <Input 
                  name="chavePix"
                  value={formData.chavePix}
                  onChange={handleChange}
                  placeholder="CPF, Celular, E-mail ou Aleatória" 
                  className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${activeTab === 'acesso' ? 'block' : 'hidden'} bg-[#0f172a] border-cyan-400/20 shadow-lg`}>
          <CardHeader className="border-b border-cyan-400/10 pb-4">
            <CardTitle className="text-lg text-gray-300">Acesso ao Sistema</CardTitle>
            <CardDescription className="text-slate-400">
              Vincule a um usuário existente ou crie um novo acesso para este funcionário.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2 max-w-xl">
                <Label>Vincular a um Usuário do Sistema (Opcional)</Label>
                <Select 
                  value={createUser ? 'create_new' : formData.userId}
                  onValueChange={(value) => {
                    if (value === 'create_new') {
                      setCreateUser(true);
                      handleSelectChange('userId', 'none');
                    } else {
                      setCreateUser(false);
                      handleSelectChange('userId', value);
                    }
                  }}
                >
                  <SelectTrigger className="bg-slate-950/60 border-cyan-400/30 focus:ring-cyan-400/30 h-12">
                    <SelectValue placeholder="Nenhum usuário vinculado" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-cyan-400/20 text-slate-200">
                    <SelectItem value="none">Sem vínculo</SelectItem>
                    <SelectItem value="create_new" className="text-cyan-400 font-medium">✨ Criar novo usuário para este funcionário</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-slate-400 text-xs mt-1">
                  Necessário apenas para funcionários que utilizam o sistema e recebem comissões.
                </p>
              </div>
              
              {createUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-cyan-900/10 p-5 rounded-lg border border-cyan-400/20 shadow-inner max-w-2xl">
                  <div className="col-span-1 md:col-span-2 mb-2">
                    <h4 className="text-gray-300 font-medium flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Dados do Novo Usuário
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">O e-mail e nome informados na aba &quot;Dados Pessoais&quot; serão utilizados no cadastro.</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Senha do Sistema *</Label>
                    <Input 
                      name="userPassword"
                      type="password"
                      value={formData.userPassword}
                      onChange={handleChange}
                      required={createUser}
                      placeholder="Senha temporária"
                      className="bg-slate-900 border-cyan-400/40 focus-visible:ring-cyan-400/50" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Perfil de Acesso *</Label>
                    <Select 
                      value={formData.userRoleId}
                      onValueChange={(value) => handleSelectChange('userRoleId', value)}
                      required={createUser}
                    >
                      <SelectTrigger className="bg-slate-900 border-cyan-400/40 focus:ring-cyan-400/50">
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-cyan-400/20 text-slate-200">
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name} {role.description ? `- ${role.description}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4 border-t border-cyan-400/20 pb-10">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/dashboard/funcionarios')} 
            className="border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors w-32"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading} 
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold transition-colors w-48"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Funcionário'}
          </Button>
        </div>
      </form>
    </div>
  );
}
