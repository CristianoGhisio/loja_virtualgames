
import React, { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface OSReceiptProps {
  os: {
    id: string;
    entryDate: string | Date;
    device: string;
    serial?: string | null;
    defect: string;
    accessories?: string | null;
    condition?: string | null;
    notes?: string | null;
    report?: string | null;
    total?: number | string;
    totalServices?: number | string;
    items?: Array<{
      id?: string;
      type: 'PART' | 'SERVICE';
      name: string;
      quantity: number;
      unitPrice: number | string;
      total: number | string;
    }>;
    receivable?: {
      value: number | string;
      status: string;
      paymentMethod?: string | null;
      paidAt?: string | Date | null;
    } | null;
    paymentMethod?: string | null;
    paidAtEntry?: number;
    remainingAtEntry?: number;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | string;
    technician?: {
      name?: string | null;
    } | null;
    servicesSnapshot?: Array<{
      serviceId?: string;
      name: string;
      internalCode?: string;
      quantity: number;
      unitPrice: number;
    }>;
    photos?: Array<{
      url: string;
      filePath?: string;
    }>;
    customer: {
      name: string;
      document: string;
      phone?: string | null;
    };
  };
  onClose?: () => void;
}

type StoreSettings = {
  nameFantasia: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  serviceHours: string;
};

export const OSReceipt = ({ os, onClose }: OSReceiptProps) => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings/store');
        if (res.ok) {
          const data = await res.json();
          setStoreSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch store settings', error);
      }
    };
    fetchSettings();
  }, []);

  const parsedReport = (() => {
    if (!os.report) {
      return null;
    }
    try {
      return JSON.parse(os.report) as { photos?: string[] };
    } catch {
      return null;
    }
  })();

  const photosFromReport = (parsedReport?.photos || []).map((url) => ({ url }));
  const photos = (os.photos && os.photos.length > 0 ? os.photos : photosFromReport).slice(0, 3);
  const rawNotes = os.notes || '';
  const extractedCondition =
    os.condition ||
    rawNotes
      .split('\n')
      .find((line) => line.startsWith('Estado:'))
      ?.replace('Estado:', '')
      .trim() ||
    '';
  const extractedAccessories =
    os.accessories ||
    rawNotes
      .split('\n')
      .find((line) => line.startsWith('Acessórios:'))
      ?.replace('Acessórios:', '')
      .trim() ||
    '';
  const extractedGeneralNotes = rawNotes
    .split('\n')
    .filter((line) => !line.startsWith('Estado:') && !line.startsWith('Acessórios:'))
    .join('\n')
    .trim();
  const serviceItems =
    os.servicesSnapshot && os.servicesSnapshot.length > 0
      ? os.servicesSnapshot.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          total: Number(item.unitPrice) * item.quantity,
        }))
      : (os.items || [])
          .filter((item) => item.type === 'SERVICE')
          .map((item) => ({
            name: item.name,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            total: Number(item.total),
          }));
  const servicesSubtotal =
    os.totalServices !== undefined ? Number(os.totalServices) : serviceItems.reduce((acc, item) => acc + item.total, 0);
  const paidValue =
    os.paidAtEntry !== undefined
      ? Number(os.paidAtEntry)
      : os.receivable && os.receivable.status === 'PAID'
        ? Number(os.receivable.value)
        : 0;
  const remainingValue =
    os.remainingAtEntry !== undefined
      ? Number(os.remainingAtEntry)
      : Math.max((os.total !== undefined ? Number(os.total) : servicesSubtotal) - paidValue, 0);
  const paymentMethod = os.paymentMethod || os.receivable?.paymentMethod || 'Não informado';
  const priorityLabelMap: Record<string, string> = {
    LOW: 'Baixa',
    NORMAL: 'Normal',
    HIGH: 'Alta',
    URGENT: 'Urgente',
  };
  const priorityLabel = os.priority ? (priorityLabelMap[os.priority] || os.priority) : 'Normal';
  const osNumber = os.id.slice(-6).toUpperCase();
  const storeName = storeSettings?.nameFantasia || 'Virtual Games';
  const storeCnpj = storeSettings?.cnpj || '00.000.000/0001-00';
  const storeAddress = storeSettings?.address || 'Endereço não configurado';
  const storePhone = storeSettings?.phone || '(55) 9999-9999';
  const storeHours = storeSettings?.serviceHours || '';
  const technicianName = os.technician?.name?.trim() || 'Não atribuído';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative w-full max-w-[800px] mx-auto z-[60]">
      {/* Controls Toolbar - Visible only on screen */}
      <div className="sticky top-0 z-[70] bg-zinc-900 text-white p-4 rounded-t-lg shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-0 print:hidden border-b border-zinc-800">
        <h2 className="text-lg font-bold flex items-center gap-2">
            <Printer className="w-5 h-5 text-neon-blue" />
            Comprovante de Entrada
        </h2>
        <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={handlePrint} className="bg-neon-blue text-black font-bold hover:bg-neon-blue/90">
                <Printer className="w-4 h-4 mr-2" /> Imprimir
            </Button>
            {onClose && (
                <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10">
                    Fechar
                </Button>
            )}
        </div>
      </div>

      <div className="bg-white text-black p-2 rounded-b-lg shadow-2xl overflow-hidden print:shadow-none print:p-0">
        <div className="bg-white">
            <div className="space-y-1.5 text-[12px]" style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.2 }}>
                <div className="text-center border-b border-black pb-1.5 pt-1">
                    <h1 className="text-[18px] font-black uppercase tracking-wide leading-none">{storeName || 'VIRTUAL GAMES'}</h1>
                    <p className="font-bold text-[11px] mt-0.5">ORDEM DE SERVIÇO | COMPROVANTE DE ENTRADA</p>
                    <div className="text-[10px] space-y-0.5 text-gray-700 mt-0.5">
                        <p>CNPJ: {storeCnpj}</p>
                        <p>{storeAddress} | Tel: {storePhone}</p>
                        {storeHours ? <p>Atendimento: {storeHours}</p> : null}
                    </div>
                </div>

                <div className="border-b border-black py-1">
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Nº da OS</p>
                            <p className="text-[12px] font-bold">#{osNumber}</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Abertura da OS</p>
                            <p className="font-bold text-[12px]">{new Date(os.entryDate).toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Técnico</p>
                            <p className="font-bold text-[12px]">{technicianName}</p>
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-300 py-1">
                    <h3 className="font-bold uppercase text-[10px] mb-1.5 bg-black text-white px-2 py-0.5 inline-block tracking-wide">Dados do Cliente</h3>
                    <div className="grid grid-cols-3 gap-x-3 gap-y-2 text-[11px]">
                        <div className="min-w-0">
                            <p><span className="font-bold">Nome:</span> <span className="break-words">{os.customer.name}</span></p>
                        </div>
                        <div>
                            <p><span className="font-bold">CPF/CNPJ:</span> {os.customer.document}</p>
                        </div>
                        <div>
                            <p><span className="font-bold">Telefone/WhatsApp:</span> {os.customer.phone || 'Não informado'}</p>
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-300 py-1">
                    <h3 className="font-bold uppercase text-[10px] mb-1.5 bg-black text-white px-2 py-0.5 inline-block tracking-wide">Dados do Equipamento</h3>
                    <div className="space-y-1">
                        <div className="grid grid-cols-3 gap-y-1 gap-x-3">
                            <div>
                                <span className="block text-[9px] text-gray-500 uppercase font-bold mb-0.5">Equipamento</span>
                                <span className="font-bold text-[12px] block">{os.device}</span>
                            </div>
                            <div>
                                <span className="block text-[9px] text-gray-500 uppercase font-bold mb-0.5">Nº de Série</span>
                                <span className="text-[12px]">{os.serial || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block text-[9px] text-gray-500 uppercase font-bold mb-0.5">Prioridade</span>
                                <span className="text-[12px]">{priorityLabel}</span>
                            </div>
                        </div>

                        <div>
                            <span className="block text-[9px] text-gray-500 uppercase font-bold mb-0.5">Defeito Relatado</span>
                            <p className="text-[12px]">{os.defect || 'Sem defeito informado'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="block text-[9px] text-gray-500 uppercase font-bold mb-0.5">Acessórios Deixados</span>
                                <p className="text-[12px]">{extractedAccessories || 'Nenhum informado'}</p>
                            </div>
                            <div>
                                <span className="block text-[9px] text-gray-500 uppercase font-bold mb-0.5">Estado de Conservação</span>
                                <p className="text-[12px]">{extractedCondition || 'Não informado'}</p>
                            </div>
                        </div>

                        <div>
                            <span className="block text-[9px] text-gray-500 uppercase font-bold mb-0.5">Observações Gerais</span>
                            <p className="text-[12px] whitespace-pre-wrap">{extractedGeneralNotes || 'Sem observações adicionais'}</p>
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-300 py-1.5">
                    <h3 className="font-bold uppercase text-[10px] mb-2 bg-black text-white px-2 py-1 inline-block tracking-wide">Serviços Contratados</h3>
                    <div className="border border-gray-300 rounded overflow-hidden">
                        <div className="grid grid-cols-[1fr_60px_90px_90px] gap-2 bg-gray-100 px-2 py-1.5 text-[9px] uppercase font-bold text-gray-600">
                            <span>Descrição</span>
                            <span className="text-center">Qtd</span>
                            <span className="text-right">Valor Unit.</span>
                            <span className="text-right">Valor Total</span>
                        </div>
                        {serviceItems.length === 0 ? (
                          <div className="px-2 py-2 text-[11px] text-gray-500">Nenhum serviço lançado na entrada.</div>
                        ) : (
                          serviceItems.map((item, index) => (
                            <div key={`${item.name}-${index}`} className="grid grid-cols-[1fr_60px_90px_90px] gap-2 px-2 py-1.5 border-t border-gray-200 text-[11px]">
                              <span className="truncate">{item.name}</span>
                              <span className="text-center">{item.quantity}</span>
                              <span className="text-right">
                                {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                              <span className="text-right font-bold">
                                {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                            </div>
                          ))
                        )}
                    </div>
                </div>

                <div className="border-b border-gray-300 py-1.5">
                    <h3 className="font-bold uppercase text-[10px] mb-2 bg-black text-white px-2 py-1 inline-block tracking-wide">Produtos Adquiridos</h3>
                    <div className="border border-gray-300 rounded overflow-hidden">
                        <div className="grid grid-cols-[1fr_50px_90px_90px] gap-2 bg-gray-100 px-2 py-1.5 text-[9px] uppercase font-bold text-gray-600">
                            <span>Descrição</span>
                            <span className="text-center">Qtd</span>
                            <span className="text-right">Valor Unit.</span>
                            <span className="text-right">Valor Total</span>
                        </div>
                        <div className="grid grid-cols-[1fr_50px_90px_90px] gap-2 px-2 py-2 text-[11px]">
                            <span>-</span>
                            <span className="text-center">-</span>
                            <span className="text-right">-</span>
                            <span className="text-right">-</span>
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-300 py-1">
                    <h3 className="font-bold uppercase text-[10px] mb-2 bg-black text-white px-2 py-1 inline-block tracking-wide">Resumo Financeiro da Entrada</h3>
                    <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                        <div className="border border-gray-300 rounded p-2">
                            <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Valor Serviços</p>
                            <p className="font-bold">
                              {servicesSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                        <div className="border border-gray-300 rounded p-2">
                            <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Forma de Pagamento</p>
                            <p className="font-bold">{paymentMethod}</p>
                        </div>
                        <div className="border border-gray-300 rounded p-2">
                            <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Pago na Abertura</p>
                            <p className="font-bold text-green-700">
                              {paidValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                        <div className="border border-gray-300 rounded p-2">
                            <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Saldo após Abertura</p>
                            <p className="font-bold">
                              {remainingValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-300 py-1">
                    <h3 className="font-bold uppercase text-[10px] mb-2 bg-black text-white px-2 py-1 inline-block tracking-wide">Laudo Técnico</h3>
                    <div>
                        <span className="block text-[9px] text-gray-500 uppercase font-bold mb-0.5">Descrição</span>
                        <p className="text-[12px] whitespace-pre-wrap">{extractedGeneralNotes || 'Sem laudo registrado na abertura.'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1 text-[12px]">
                        <p><span className="font-bold">Data:</span> {new Date(os.entryDate).toLocaleDateString('pt-BR')}</p>
                        <p><span className="font-bold">Técnico:</span> {technicianName}</p>
                    </div>
                </div>

                {photos.length > 0 && (
                  <div className="border-b border-gray-300 py-1">
                    <h3 className="font-bold uppercase text-[10px] mb-1 bg-black text-white px-2 py-0.5 inline-block tracking-wide">Registro Fotográfico</h3>
                    <div className="grid grid-cols-1 gap-1.5">
                      {photos.slice(0, 1).map((photo, index) => (
                        <div key={`${photo.url}-${index}`} className="border border-gray-300 rounded overflow-hidden flex items-center justify-center bg-white">
                          <Image
                            src={photo.url}
                            alt={`Foto ${index + 1}`}
                            width={320}
                            height={180}
                            className="w-full max-h-12 object-contain"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-b border-black py-1.5">
                    <div className="text-[10px] text-justify text-gray-700 space-y-1 leading-4">
                        <p>Declaro estar ciente que, após a comunicação de conclusão do serviço, o produto deverá ser retirado em até 3 (três) meses, sob pena de ser comercializado para terceiros para sanar os gastos decorrentes do serviço prestado.</p>
                        <p>Declaro que os serviços descritos neste relatório foram prestados e aceitos por mim nesta data.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-2 pb-0.5">
                    <div className="text-center">
                        <div className="border-t border-black pt-1.5">
                            <p className="font-bold text-[9px] uppercase tracking-wide">{storeName || 'VIRTUAL GAMES'}</p>
                            <p className="text-[9px] text-gray-500 uppercase">Assinatura da Loja / Técnico</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black pt-1.5">
                            <p className="font-bold text-[9px] uppercase tracking-wide truncate px-2">{os.customer.name}</p>
                            <p className="text-[9px] text-gray-500 uppercase">Assinatura do Cliente</p>
                        </div>
                    </div>
                </div>

                <div className="border-b border-black py-1.5">
                    <div className="text-[10px] text-justify text-gray-700 leading-4 space-y-1">
                        <p>Declaro que retirei o equipamento nesta data, após conferência do atendimento, e que o recebimento ocorreu em perfeitas condições, ciente do status final desta ordem de serviço.</p>
                        <p>Data da retirada: ____/____/______</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-2 pb-0.5">
                    <div className="text-center">
                        <div className="border-t border-black pt-1.5">
                            <p className="font-bold text-[9px] uppercase tracking-wide">{storeName || 'VIRTUAL GAMES'}</p>
                            <p className="text-[9px] text-gray-500 uppercase">Assinatura da Loja</p>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black pt-1.5">
                            <p className="font-bold text-[9px] uppercase tracking-wide truncate px-2">{os.customer.name}</p>
                            <p className="text-[9px] text-gray-500 uppercase">Assinatura do Cliente (Retirada)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          @page { margin: 6mm; }
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};
