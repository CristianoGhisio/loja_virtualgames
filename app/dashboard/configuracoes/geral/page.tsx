'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function GeralPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nameFantasia: '',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
    serviceHours: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/store');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setFormData({
              nameFantasia: data.nameFantasia || '',
              cnpj: data.cnpj || '',
              address: data.address || '',
              phone: data.phone || '',
              email: data.email || '',
              serviceHours: data.serviceHours || ''
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch store settings', error);
        toast.error('Erro ao carregar as configurações da loja.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to save settings');
      
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-neon-blue/70">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card>
        <CardHeader>
          <CardTitle>Dados da Loja</CardTitle>
          <CardDescription>Informações exibidas na landing page, recibos e notas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Nome Fantasia" 
              name="nameFantasia"
              value={formData.nameFantasia} 
              onChange={handleChange}
              className="bg-black/20 border-[rgba(255,255,255,0.1)] text-white" 
            />
            <Input 
              label="CNPJ" 
              name="cnpj"
              value={formData.cnpj} 
              onChange={handleChange}
              className="bg-black/20 border-[rgba(255,255,255,0.1)] text-white" 
            />
          </div>
          <Input 
            label="Endereço" 
            name="address"
            value={formData.address} 
            onChange={handleChange}
            className="bg-black/20 border-[rgba(255,255,255,0.1)] text-white" 
          />
          <Input 
            label="Horário de Atendimento" 
            name="serviceHours"
            value={formData.serviceHours} 
            onChange={handleChange}
            placeholder="Ex: Segunda a Sexta: 09:00 às 18:30"
            className="bg-black/20 border-[rgba(255,255,255,0.1)] text-white" 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Telefone / WhatsApp" 
              name="phone"
              value={formData.phone} 
              onChange={handleChange}
              className="bg-black/20 border-[rgba(255,255,255,0.1)] text-white" 
            />
            <Input 
              label="Email de Contato" 
              name="email"
              value={formData.email} 
              onChange={handleChange}
              className="bg-black/20 border-[rgba(255,255,255,0.1)] text-white" 
            />
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            variant="neon"
          >
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
