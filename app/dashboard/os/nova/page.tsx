'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Banknote,
  CreditCard,
  ImageUp,
  Minus,
  Plus,
  QrCode,
  Search,
  Trash2,
  User,
  Wallet,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { api } from '@/lib/api';
import { OSReceipt } from '@/components/dashboard/os/os-receipt';
import { toast } from 'sonner';
import { CashClosedDialog } from '@/components/ui/cash-closed-dialog';
import { CashStatusBadge } from '@/components/ui/cash-status-badge';
import { getDailyCashStorageStatus } from '@/lib/daily-cash-client';

interface Client {
  id: string;
  name: string;
  document: string;
  phone?: string | null;
}

interface CreatedOSData {
  id: string;
  entryDate: string;
  device: string;
  serial: string;
  defect: string;
  accessories: string;
  condition: string;
  notes: string;
  customer: {
    name: string;
    document: string;
    phone?: string | null;
  };
  servicesSnapshot?: Array<{
    serviceId?: string;
    name: string;
    internalCode?: string;
    quantity: number;
    unitPrice: number;
  }>;
  paymentMethod?: string | null;
  paidAtEntry?: number;
  remainingAtEntry?: number;
  photos?: Array<{
    url: string;
    filePath?: string;
  }>;
}

interface ServiceResult {
  id: string;
  name: string;
  internalCode: string;
  priceBase: number;
  active: boolean;
}

interface SelectedService {
  serviceId: string;
  name: string;
  internalCode: string;
  unitPrice: number;
  quantity: number;
}

interface UploadedOSPhoto {
  url: string;
  filePath: string;
}

type PaymentMethod = 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO';

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
  icon: typeof QrCode;
}> = [
  { id: 'PIX', label: 'PIX', icon: QrCode },
  { id: 'CREDITO', label: 'Crédito', icon: CreditCard },
  { id: 'DEBITO', label: 'Débito', icon: Wallet },
  { id: 'DINHEIRO', label: 'Dinheiro', icon: Banknote },
];

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const maskCPF = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2');

const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

const maskClientSearch = (value: string) => {
  if (/[a-zA-Z]/.test(value)) {
    return value;
  }
  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  if (value.includes('.') || value.includes('-')) {
    return maskCPF(value);
  }
  return maskPhone(value);
};

export default function NovaOSPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceCardId = searchParams.get('sourceCardId') || '';
  const [loading, setLoading] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<Client[]>([]);
  const [searchingClients, setSearchingClients] = useState(false);
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');
  const [quickClientPhone, setQuickClientPhone] = useState('');
  const [savingQuickClient, setSavingQuickClient] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedOSPhoto[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const [priority, setPriority] = useState('NORMAL');
  const [deviceDescription, setDeviceDescription] = useState('');
  const [serial, setSerial] = useState('');
  const [accessories, setAccessories] = useState('');
  const [defect, setDefect] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceResults, setServiceResults] = useState<ServiceResult[]>([]);
  const [searchingServices, setSearchingServices] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [prepaid, setPrepaid] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>('PIX');
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [cashClosedDialogOpen, setCashClosedDialogOpen] = useState(false);

  const [createdOS, setCreatedOS] = useState<CreatedOSData | null>(null);

  const resetFormAfterCreate = () => {
    setSelectedCustomer(null);
    setClientSearch('');
    setClientResults([]);
    setSearchingClients(false);
    setQuickClientOpen(false);
    setQuickClientName('');
    setQuickClientPhone('');
    setSavingQuickClient(false);
    setUploadedPhotos([]);
    setUploadingPhotos(false);
    setPriority('NORMAL');
    setDeviceDescription('');
    setSerial('');
    setAccessories('');
    setDefect('');
    setServiceSearch('');
    setServiceResults([]);
    setSearchingServices(false);
    setSelectedServices([]);
    setPrepaid(true);
    setPaymentMethod('PIX');
    setCondition('');
    setNotes('');
  };

  const servicesSubtotal = selectedServices.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );
  const amountPaidNow = prepaid ? servicesSubtotal : 0;
  const remainingAfterOpen = Math.max(servicesSubtotal - amountPaidNow, 0);
  const ensureCashOpen = useCallback(async () => {
    try {
      const localStatus = getDailyCashStorageStatus();
      if (localStatus === 'FECHADO') {
        setCashClosedDialogOpen(true);
        return false;
      }
      const response = await api.get('/financial/daily-entries/status');
      const isOpen = Boolean(response.data?.data?.isOpen ?? response.data?.isOpen);
      if (isOpen) {
        return true;
      }
      setCashClosedDialogOpen(true);
      return false;
    } catch {
      setCashClosedDialogOpen(true);
      return false;
    }
  }, []);

  useEffect(() => {
    const applyPrefill = async () => {
      if (prefillApplied) return;

      const customerId = searchParams.get('customerId') || '';
      const serviceIds = (searchParams.get('serviceIds') || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      const prefillNote = searchParams.get('note') || '';

      if (customerId) {
        try {
          const customerResponse = await api.get(`/clients/${customerId}`);
          const customerData = customerResponse.data?.data || customerResponse.data;
          if (customerData?.id) {
            setSelectedCustomer(customerData as Client);
            setClientSearch((customerData as Client).name);
          }
        } catch {}
      }

      if (serviceIds.length > 0) {
        try {
          const servicesResponse = await api.get('/services', { params: { active: true } });
          const servicesData = Array.isArray(servicesResponse.data?.data)
            ? (servicesResponse.data.data as ServiceResult[])
            : Array.isArray(servicesResponse.data)
              ? (servicesResponse.data as ServiceResult[])
              : [];

          const selected = servicesData
            .filter((service) => serviceIds.includes(service.id))
            .map<SelectedService>((service) => ({
              serviceId: service.id,
              name: service.name,
              internalCode: service.internalCode,
              unitPrice: Number(service.priceBase),
              quantity: 1,
            }));

          if (selected.length > 0) {
            setSelectedServices(selected);
          }
        } catch {}
      }

      if (prefillNote) {
        setNotes(prefillNote);
      }

      setPrefillApplied(true);
    };

    void applyPrefill();
  }, [prefillApplied, searchParams]);

  useEffect(() => {
    const query = clientSearch.trim();
    if (!query || selectedCustomer) {
      setClientResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchingClients(true);
      try {
        const response = await api.get('/clients', { params: { q: query } });
        const clients = Array.isArray(response.data) ? (response.data as Client[]) : [];
        setClientResults(clients.slice(0, 6));
      } catch {
        setClientResults([]);
      } finally {
        setSearchingClients(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [clientSearch, selectedCustomer]);

  useEffect(() => {
    const query = serviceSearch.trim();
    if (!query) {
      setServiceResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchingServices(true);
      try {
        const response = await api.get('/services', {
          params: { q: query, active: true },
        });
        const services = Array.isArray(response.data?.data)
          ? (response.data.data as ServiceResult[])
          : Array.isArray(response.data)
            ? (response.data as ServiceResult[])
            : [];
        setServiceResults(services.slice(0, 6));
      } catch {
        setServiceResults([]);
      } finally {
        setSearchingServices(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [serviceSearch]);

  const handleSelectCustomer = (client: Client) => {
    setSelectedCustomer(client);
    setClientSearch(client.name);
    setClientResults([]);
  };

  const handleUploadPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    const remainingSlots = 3 - uploadedPhotos.length;
    if (remainingSlots <= 0) {
      toast.error('Limite de 3 imagens atingido');
      event.target.value = '';
      return;
    }

    const acceptedFiles = files.slice(0, remainingSlots);
    const formData = new FormData();
    acceptedFiles.forEach((file) => formData.append('files', file));

    setUploadingPhotos(true);
    try {
      const response = await api.post('/os/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = Array.isArray(response.data?.data?.files)
        ? (response.data.data.files as UploadedOSPhoto[])
        : Array.isArray(response.data?.files)
          ? (response.data.files as UploadedOSPhoto[])
          : [];
      setUploadedPhotos((current) => [...current, ...uploaded].slice(0, 3));
    } catch {
      toast.error('Erro ao carregar imagens');
    } finally {
      setUploadingPhotos(false);
      event.target.value = '';
    }
  };

  const handleRemoveUploadedPhoto = async (index: number) => {
    // eslint-disable-next-line security/detect-object-injection
    const target = uploadedPhotos[index];
    if (!target) {
      return;
    }

    try {
      await api.delete('/os/photos', { data: { filePath: target.filePath } });
    } catch {
      toast.error('Erro ao excluir imagem');
      return;
    }

    setUploadedPhotos((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setClientSearch('');
    setClientResults([]);
  };

  const handleCreateQuickClient = async () => {
    if (!quickClientName.trim() || quickClientPhone.replace(/\D/g, '').length < 10) {
      toast.error('Preencha nome e telefone válidos');
      return;
    }

    setSavingQuickClient(true);
    try {
      const response = await api.post('/clients', {
        name: quickClientName.trim(),
        phone: maskPhone(quickClientPhone),
        type: 'PF',
      });
      const created = response.data as Client;
      handleSelectCustomer(created);
      setQuickClientOpen(false);
      setQuickClientName('');
      setQuickClientPhone('');
      toast.success('Cliente criado e vinculado');
    } catch {
      toast.error('Erro ao cadastrar cliente');
    } finally {
      setSavingQuickClient(false);
    }
  };

  const handleAddService = (service: ServiceResult) => {
    setSelectedServices((current) => {
      const existing = current.find((item) => item.serviceId === service.id);
      if (existing) {
        return current.map((item) =>
          item.serviceId === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...current,
        {
          serviceId: service.id,
          name: service.name,
          internalCode: service.internalCode,
          unitPrice: Number(service.priceBase),
          quantity: 1,
        },
      ];
    });
    setServiceSearch('');
    setServiceResults([]);
  };

  const incrementService = (serviceId: string) => {
    setSelectedServices((current) =>
      current.map((item) =>
        item.serviceId === serviceId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementService = (serviceId: string) => {
    setSelectedServices((current) =>
      current
        .map((item) =>
          item.serviceId === serviceId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeService = (serviceId: string) => {
    setSelectedServices((current) =>
      current.filter((item) => item.serviceId !== serviceId)
    );
  };

  const handleSave = async () => {
    const cashOpen = await ensureCashOpen();
    if (!cashOpen) {
      return;
    }
    if (!selectedCustomer || !deviceDescription.trim()) {
        toast.error('Preencha os campos obrigatórios (Cliente e Equipamento)');
        return;
    }

    if (!defect.trim() && selectedServices.length === 0) {
        toast.error('Informe defeito ou adicione ao menos um serviço');
        return;
    }

    if (prepaid && selectedServices.length > 0 && !paymentMethod) {
        toast.error('Selecione um método de pagamento antecipado');
        return;
    }

    setLoading(true);
    try {
        const response = await api.post('/os', {
            customerId: selectedCustomer.id,
            device: deviceDescription.trim(),
            serial,
            defect: defect.trim() || undefined,
            notes,
            photos: uploadedPhotos.map((photo) => photo.url),
            services: selectedServices.map((service) => ({
              serviceId: service.serviceId,
              quantity: service.quantity,
              unitPrice: service.unitPrice,
            })),
            prepaid,
            paymentMethod: prepaid ? paymentMethod || undefined : undefined,
            priority,
            accessories,
            condition,
            sourceCardId: sourceCardId || undefined,
            sourceFlowKind: sourceCardId ? 'SERVICE' : undefined,
        });

        // Set created OS data for receipt
        const createdOS = response.data.data || response.data;
        
        setCreatedOS({
            ...createdOS,
            customer: {
                name: selectedCustomer.name,
                document: selectedCustomer.document,
                phone: selectedCustomer.phone || '',
            },
            accessories, 
            condition,
            serial,
            servicesSnapshot: selectedServices.map((service) => ({
              serviceId: service.serviceId,
              name: service.name,
              internalCode: service.internalCode,
              quantity: service.quantity,
              unitPrice: service.unitPrice,
            })),
            paymentMethod: prepaid ? paymentMethod : null,
            paidAtEntry: amountPaidNow,
            remainingAtEntry: remainingAfterOpen,
            photos: uploadedPhotos,
        });
        resetFormAfterCreate();
        
    } catch (error) {
        const message = (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error
          || (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message
          || '';
        if (String(message).toLowerCase().includes('caixa diário fechado')) {
          setCashClosedDialogOpen(true);
        }
        console.error('Error creating OS:', error);
        alert('Erro ao criar Ordem de Serviço');
    } finally {
        setLoading(false);
    }
  };

  const handleCloseReceipt = () => {
    setCreatedOS(null);
    resetFormAfterCreate();
    router.replace('/dashboard/os/nova');
  };

  if (createdOS) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <OSReceipt os={createdOS} onClose={handleCloseReceipt} />
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
      <CashStatusBadge />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#0f172a] border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-gray-300">Dados do Equipamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300/70">Cliente *</label>
                  {selectedCustomer ? (
                    <div className="rounded-lg border border-cyan-400/20 bg-slate-950/60 px-3 py-2 h-12 flex items-center justify-between gap-2">
                      <div className="truncate">
                        <p className="text-sm text-gray-300 truncate">{selectedCustomer.name}</p>
                        <p className="text-xs text-gray-300/70 truncate">{selectedCustomer.document}</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8 hover:bg-cyan-400/10" onClick={handleClearCustomer}>
                        <X className="w-4 h-4 text-gray-300/70" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300/70" />
                        <Input
                          placeholder="Nome, telefone ou CPF"
                          value={clientSearch}
                          onChange={(event) => setClientSearch(maskClientSearch(event.target.value))}
                          className="pl-9 h-12 bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                        />
                      </div>
                      {clientResults.length > 0 && (
                        <div className="rounded-lg border border-cyan-400/20 bg-slate-900/70 overflow-hidden">
                          {clientResults.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => handleSelectCustomer(client)}
                              className="w-full text-left px-3 py-2 hover:bg-cyan-400/10 transition border-b border-cyan-400/10 last:border-b-0"
                            >
                              <p className="text-sm text-gray-300">{client.name}</p>
                              <p className="text-xs text-gray-300/70">{client.phone || client.document}</p>
                            </button>
                          ))}
                        </div>
                      )}
                      {!searchingClients && clientSearch.trim().length >= 3 && clientResults.length === 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full border border-cyan-400/50 text-gray-300 hover:bg-cyan-400/10"
                          onClick={() => {
                            setQuickClientName(clientSearch.replace(/\d/g, '').trim());
                            setQuickClientPhone(maskPhone(clientSearch));
                            setQuickClientOpen(true);
                          }}
                        >
                          + Novo Cliente
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-300/70">Prioridade</label>
                  <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="URGENT">Urgente</option>
                  </Select>
                </div>
              </div>

              <Input
                label="Equipamento deixado pelo cliente *"
                placeholder="Ex: Playstation 5 Slim branco 1TB com 1 controle"
                value={deviceDescription}
                onChange={(e) => setDeviceDescription(e.target.value)}
                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                    label="Número de Série" 
                    placeholder="S/N do aparelho" 
                    value={serial}
                    onChange={(e) => setSerial(e.target.value)}
                    className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                />
                <Input 
                    label="Acessórios Deixados" 
                    placeholder="Ex: Cabo fonte, 1 controle..." 
                    value={accessories}
                    onChange={(e) => setAccessories(e.target.value)}
                    className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                />
              </div>

              <Textarea 
                label="Defeito Informado" 
                placeholder="Descreva o problema relatado pelo cliente..." 
                className="h-32 bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                value={defect}
                onChange={(e) => setDefect(e.target.value)}
              />

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-300/70 uppercase">
                  Serviços diretos (sem orçamento)
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300/70" />
                  <Input
                    placeholder="Buscar serviço por nome ou código"
                    value={serviceSearch}
                    onChange={(event) => setServiceSearch(event.target.value)}
                    className="pl-9 h-11 bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
                  />
                </div>

                {serviceResults.length > 0 && (
                  <div className="rounded-lg border border-cyan-400/20 bg-slate-900/70 overflow-hidden">
                    {serviceResults.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleAddService(service)}
                        className="w-full text-left px-3 py-2 hover:bg-cyan-400/10 transition border-b border-cyan-400/10 last:border-b-0"
                      >
                        <div className="flex justify-between gap-3">
                          <div>
                            <p className="text-sm text-gray-300">{service.name}</p>
                            <p className="text-xs text-gray-300/70">{service.internalCode}</p>
                          </div>
                          <p className="text-sm font-bold text-neon-blue">
                            {formatCurrency(Number(service.priceBase))}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {!searchingServices && serviceSearch.trim().length >= 3 && serviceResults.length === 0 && (
                  <div className="rounded-lg border border-cyan-400/20 bg-slate-950/60 p-3 text-sm text-gray-300/70">
                    Nenhum serviço encontrado para este filtro.
                  </div>
                )}

                <div className="rounded-lg border border-cyan-400/20 overflow-hidden">
                  {selectedServices.length === 0 ? (
                    <div className="p-5 text-center text-sm text-gray-300/70">
                      Adicione serviços para atendimento sem orçamento.
                    </div>
                  ) : (
                    <div className="divide-y divide-cyan-400/10">
                      {selectedServices.map((service) => (
                        <div
                          key={service.serviceId}
                          className="px-3 py-2 flex items-center justify-between gap-3 bg-slate-950/60"
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-gray-300 truncate">{service.name}</p>
                            <p className="text-xs text-gray-300/70">{service.internalCode}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-300 hover:bg-cyan-400/10"
                              onClick={() => decrementService(service.serviceId)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-6 text-center text-slate-300">{service.quantity}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-300 hover:bg-cyan-400/10"
                              onClick={() => incrementService(service.serviceId)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <span className="w-24 text-right text-sm font-semibold text-gray-300">
                              {formatCurrency(service.unitPrice * service.quantity)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-red-500/10"
                              onClick={() => removeService(service.serviceId)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <Textarea 
                label="Estado de Conservação" 
                placeholder="Riscos, amassados, lacres rompidos..." 
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
              />
              
              <Textarea 
                label="Observações Gerais" 
                placeholder="Outras informações relevantes..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
              />

              <div className="space-y-2">
                <label className="text-xs text-gray-300/70 uppercase font-bold">Fotos do equipamento (até 3)</label>
                <div className="flex gap-2">
                  <input
                    id="os-photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleUploadPhotos}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-cyan-400/50 text-gray-300 hover:bg-cyan-400/10"
                    onClick={() => document.getElementById('os-photo-upload')?.click()}
                    disabled={uploadingPhotos || uploadedPhotos.length >= 3}
                  >
                    <ImageUp className="w-4 h-4 mr-2" />
                    {uploadingPhotos ? 'Carregando...' : 'Carregar imagens'}
                  </Button>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={`${photo.filePath}-${index}`} className="relative rounded-lg overflow-hidden border border-cyan-400/20">
                        <Image
                          src={photo.url}
                          alt={`Foto ${index + 1}`}
                          width={320}
                          height={180}
                          className="w-full h-28 object-cover"
                          unoptimized
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveUploadedPhoto(index)}
                          className="absolute top-1 right-1 bg-[#0f172a]/70 text-gray-300 rounded-full p-1 hover:bg-[#0f172a]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-lg border-cyan-400/20 shadow-lg bg-[#0f172a]">
            <CardHeader>
              <CardTitle className="text-gray-300">Fechamento de Serviços</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300/70">
                  <span>Subtotal de Serviços</span>
                  <span className="text-slate-300">{formatCurrency(servicesSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-cyan-400/20">
                  <span className="text-sm text-gray-300/70">Total da abertura</span>
                  <span className="text-2xl font-extrabold text-neon-blue">
                    {formatCurrency(servicesSubtotal)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-cyan-400/20 bg-slate-950/60 px-3 py-2">
                  <span className="text-sm text-gray-300/70">Pagamento antecipado</span>
                  <input
                    type="checkbox"
                    checked={prepaid}
                    onChange={(event) => setPrepaid(event.target.checked)}
                    className="rounded border-cyan-400/20 text-cyan-400 focus:ring-cyan-400 bg-slate-900"
                  />
                </div>
              </div>

              {prepaid && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-300/70 uppercase tracking-wider">Método de pagamento</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((method) => (
                      <Button
                        key={method.id}
                        type="button"
                        variant="ghost"
                        className={`h-10 justify-start border ${
                          paymentMethod === method.id
                            ? 'border-cyan-400 text-gray-300 bg-cyan-400/10'
                            : 'border-cyan-400/20 text-gray-300/70 hover:text-gray-300 hover:bg-cyan-400/10'
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <method.icon className="w-4 h-4 mr-2" />
                        {method.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-cyan-400/20 bg-slate-950/60 p-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-300/70">
                  <span>Pago na abertura</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(amountPaidNow)}</span>
                </div>
                <div className="flex justify-between text-gray-300/70">
                  <span>Restante após abertura</span>
                  <span className="font-semibold text-slate-300">{formatCurrency(remainingAfterOpen)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f172a] border-cyan-400/20">
            <CardHeader>
              <CardTitle className="text-gray-300">Atribuição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-cyan-400/10 border border-cyan-400/20 rounded p-4 text-sm text-gray-300">
                <p>A OS será criada na <strong>Fila de Entrada</strong>.</p>
                <p className="mt-1 text-xs opacity-70">A atribuição será feita automaticamente ao técnico que assumir o serviço.</p>
              </div>

              <div className="space-y-2 opacity-50 pointer-events-none">
                <label className="text-xs font-bold text-gray-300/70 uppercase">Status Inicial</label>
                <Select disabled className="bg-slate-950/60 border-cyan-400/20 text-slate-300">
                  <option>Fila de Entrada</option>
                </Select>
              </div>

              <Button 
                className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-6 mt-4"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'CRIANDO...' : 'CRIAR ORDEM DE SERVIÇO'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={quickClientOpen}
        onClose={() => setQuickClientOpen(false)}
        title="Novo Cliente"
      >
        <div className="space-y-4">
          <Input
            label="Nome Completo"
            value={quickClientName}
            onChange={(event) => setQuickClientName(event.target.value)}
            className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
          />
          <Input
            label="WhatsApp / Telefone"
            value={quickClientPhone}
            onChange={(event) => setQuickClientPhone(maskPhone(event.target.value))}
            className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setQuickClientOpen(false)} className="text-gray-300/70 hover:text-gray-300 hover:bg-cyan-400/10">
              Cancelar
            </Button>
            <Button
              onClick={handleCreateQuickClient}
              disabled={savingQuickClient}
              className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold"
            >
              {savingQuickClient ? 'Salvando...' : 'Salvar e Vincular'}
            </Button>
          </div>
        </div>
      </Modal>

      <CashClosedDialog
        open={cashClosedDialogOpen}
        onOpenChange={setCashClosedDialogOpen}
        title="Caixa diário fechado para abrir nova OS"
      />
    </div>
  );
}
