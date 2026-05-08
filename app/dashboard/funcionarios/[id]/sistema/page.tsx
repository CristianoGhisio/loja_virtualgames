'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { KeyRound, ShieldAlert } from 'lucide-react';
import { AxiosError } from 'axios';

type SystemUser = {
  id: string;
  name: string;
  email: string;
};

type EmployeeSystemData = {
  userId: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export default function EmployeeSistemaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [userId, setUserId] = useState<string>('none');
  const [employee, setEmployee] = useState<EmployeeSystemData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, usersRes] = await Promise.all([
          api.get(`/employees/${id}`),
          api.get('/admin/users')
        ]);
        setEmployee(empRes.data);
        setUserId(empRes.data.userId || 'none');
        setUsers(usersRes.data || []);
      } catch (error) {
        console.error('Failed to load data', error);
        toast.error('Erro ao carregar dados do sistema');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/employees/${id}`, { userId: userId === 'none' ? null : userId });
      toast.success('Vínculo de sistema atualizado com sucesso!');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const msg = axiosError.response?.data?.message || 'Erro ao atualizar vínculo';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Carregando dados...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#0f172a] border-cyan-400/20 shadow-lg">
        <CardHeader className="border-b border-cyan-400/10 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" /> Acesso ao Sistema
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              Vincule este funcionário a um usuário do sistema para permitir o login e controle de comissões.
            </CardDescription>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="max-w-xl space-y-4">
            <div className="space-y-2">
              <Label>Usuário Vinculado</Label>
              <Select 
                value={userId}
                onValueChange={setUserId}
              >
                <SelectTrigger className="bg-slate-950/60 border-cyan-400/30 focus:ring-cyan-400/30 h-12">
                  <SelectValue placeholder="Nenhum usuário vinculado" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-cyan-400/20 text-slate-200">
                  <SelectItem value="none">Sem vínculo</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-slate-400 text-xs mt-2">
                A criação de um novo usuário deve ser feita pelo menu Admin ou no momento do cadastro inicial do funcionário.
              </p>
            </div>
            
            {!employee?.user && (
              <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-3 text-orange-300">
                <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-bold mb-1">Funcionário sem acesso ao sistema</p>
                  <p className="text-orange-300/80">
                    Este funcionário não possui um usuário vinculado. Ele não poderá fazer login no sistema e suas comissões poderão não ser calculadas automaticamente.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
