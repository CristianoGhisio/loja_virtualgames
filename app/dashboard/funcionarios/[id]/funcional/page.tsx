'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Briefcase } from 'lucide-react';
import { AxiosError } from 'axios';

export default function EmployeeFuncionalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    cargoFuncao: '',
    tipoContrato: 'CLT',
    dataAdmissao: '',
    status: 'ATIVO',
    salarioBase: '',
    percentualComissao: '',
    chavePix: '',
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        const employee = res.data;
        setFormData({
          cargoFuncao: employee.cargoFuncao || '',
          tipoContrato: employee.tipoContrato || 'CLT',
          dataAdmissao: employee.dataAdmissao ? new Date(employee.dataAdmissao).toISOString().split('T')[0] : '',
          status: employee.status || 'ATIVO',
          salarioBase: employee.salarioBase ? String(employee.salarioBase) : '',
          percentualComissao: employee.percentualComissao ? String(employee.percentualComissao) : '',
          chavePix: employee.chavePix || '',
        });
      } catch (error) {
        console.error('Failed to load employee', error);
        toast.error('Erro ao carregar dados funcionais');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        salarioBase: Number(formData.salarioBase),
        percentualComissao: formData.percentualComissao ? Number(formData.percentualComissao) : 0,
      };
      await api.put(`/employees/${id}`, payload);
      toast.success('Dados funcionais atualizados com sucesso!');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const msg = axiosError.response?.data?.message || 'Erro ao atualizar dados funcionais';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Carregando dados...</div>;
  }

  return (
    <Card className="bg-[#0f172a] border-cyan-400/20 shadow-lg">
      <CardHeader className="border-b border-cyan-400/10 pb-4 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" /> Dados Funcionais
        </CardTitle>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold transition-colors"
        >
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Cargo / Função *</Label>
            <Input 
              name="cargoFuncao"
              value={formData.cargoFuncao}
              onChange={handleChange}
              placeholder="Ex: Vendedor, Gerente" 
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
              className="bg-slate-950/60 border-cyan-400/30 focus-visible:ring-cyan-400/30" 
            />
          </div>

          <div className="space-y-2">
            <Label>Status *</Label>
            <Select 
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger className="bg-slate-950/60 border-cyan-400/30 focus:ring-cyan-400/30">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-cyan-400/20 text-slate-200">
                <SelectItem value="ATIVO">Ativo</SelectItem>
                <SelectItem value="INATIVO">Inativo</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="space-y-2 md:col-span-2">
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
  );
}
