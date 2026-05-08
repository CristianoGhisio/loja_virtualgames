'use client';

import { FormEvent, useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/native-select';
import { api } from '@/lib/api';

export default function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // Basic Info
  const [type, setType] = useState('PF');
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Address
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const maskDocument = (value: string, type: string) => {
    const v = value.replace(/\D/g, '');
    if (type === 'PF') {
      return v
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    } else {
      return v
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
  };

  const maskPhone = (v: string) => {
    v = v.replace(/\D/g, '');
    if (v.length > 10) {
      return v
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    } else {
      return v
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
    }
  };

  const maskCEP = (v: string) => {
    return v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');
  };

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await api.get(`/clients/${id}`);
        const data = res.data;
        setName(data.name);
        setEmail(data.email);
        setDocument(data.document);
        setType(data.type || 'PF');
        setPhone(data.phone || '');
        setCep(data.cep || '');
        setStreet(data.street || '');
        setNumber(data.number || '');
        setComplement(data.complement || '');
        setNeighborhood(data.neighborhood || '');
        setCity(data.city || '');
        setState(data.state || '');
      } catch (error) {
        console.error('Failed to fetch client', error);
      } finally {
        setFetching(false);
      }
    };
    fetchClient();
  }, [id]);

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocument(maskDocument(e.target.value, type));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(maskPhone(e.target.value));
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCep(maskCEP(e.target.value));
  };

  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setStreet(data.logradouro);
          setNeighborhood(data.bairro);
          setCity(data.localidade);
          setState(data.uf);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP', error);
      }
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value);
    setDocument('');
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!name || !email || !document) {
      return;
    }

    setLoading(true);
    try {
      await api.put(`/clients/${id}`, {
        name,
        email,
        document,
        type,
        phone,
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
      });
      router.push(`/dashboard/clientes/${id}/visao-geral`);
    } catch (error) {
      console.error('Erro ao atualizar cliente', error);
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-gray-400">Carregando...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron">Editar Cliente</h1>
          <p className="text-sm text-gray-400">Atualize os dados cadastrais do cliente.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="md:col-span-3">
                <Input
                  label="Nome Completo / Razão Social"
                  placeholder={type === 'PF' ? "Ex: João da Silva" : "Ex: Empresa Ltda"}
                  value={name || ''}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div>
                <Select
                  label="Tipo de Pessoa"
                  value={type}
                  onChange={handleTypeChange}
                >
                  <option value="PF">Pessoa Física</option>
                  <option value="PJ">Pessoa Jurídica</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={type === 'PF' ? 'CPF' : 'CNPJ'}
                placeholder={type === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                value={document || ''}
                onChange={handleDocumentChange}
                required
              />
              <Input
                label="Telefone / WhatsApp"
                placeholder="(00) 00000-0000"
                value={phone || ''}
                onChange={handlePhoneChange}
              />
              <Input
                label="E-mail"
                type="email"
                placeholder="cliente@email.com"
                value={email || ''}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <h3 className="text-lg font-bold text-white mb-4">Endereço</h3>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-1">
                  <Input
                    label="CEP"
                    placeholder="00000-000"
                    value={cep || ''}
                    onChange={handleCepChange}
                    onBlur={handleCepBlur}
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    label="Logradouro"
                    placeholder="Rua, Avenida, etc"
                    value={street || ''}
                    onChange={(event) => setStreet(event.target.value)}
                    className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                    disabled={!!street} 
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    label="Número"
                    placeholder="123"
                    value={number || ''}
                    onChange={(event) => setNumber(event.target.value)}
                    className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                  />
                </div>
                <div className="md:col-span-1">
                  <Input
                    label="Complemento"
                    placeholder="Apto 101"
                    value={complement || ''}
                    onChange={(event) => setComplement(event.target.value)}
                    className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Bairro"
                  value={neighborhood || ''}
                  onChange={(event) => setNeighborhood(event.target.value)}
                  className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                />
                <Input
                  label="Cidade"
                  value={city || ''}
                  onChange={(event) => setCity(event.target.value)}
                  className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                />
                <div className="md:col-span-1">
                  <Input
                    label="Estado (UF)"
                    value={state || ''}
                    onChange={(event) => setState(event.target.value)}
                    className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-2 border-t border-cyan-400/20">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button
                className="bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
