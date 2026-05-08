'use client';

import { useRef, useEffect, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

type SaleReceiptItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type SaleReceiptData = {
  id: string;
  date: string | Date;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  total: number;
  customer: {
    name: string;
    document: string;
    phone?: string | null;
  };
  items: SaleReceiptItem[];
};

type StoreSettings = {
  nameFantasia: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  serviceHours: string;
};

export function SaleReceipt({
  sale,
  onClose,
}: {
  sale: SaleReceiptData;
  onClose?: () => void;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    const toastId = toast.loading('Gerando PDF...');
    try {
      const originalElement = receiptRef.current;
      const clone = originalElement.cloneNode(true) as HTMLElement;

      const allElements = clone.querySelectorAll('*');
      allElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.backgroundColor = '#ffffff';
          el.style.color = '#000000';
          el.style.borderColor = '#000000';
        }
      });

      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '800px';
      clone.style.padding = '40px 60px';
      clone.style.backgroundColor = '#ffffff';
      clone.style.fontFamily = 'Arial, sans-serif';
      clone.style.letterSpacing = 'normal';

      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const margin = 10;
      const imgProps = pdf.getImageProperties(imgData);
      const availableWidth = pdfWidth - (margin * 2);
      const imgHeight = (imgProps.height * availableWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, imgHeight);
      pdf.save(`Venda_${sale.id.slice(-6).toUpperCase()}.pdf`);

      toast.dismiss(toastId);
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss(toastId);
      toast.error('Erro ao gerar PDF');
    }
  };

  return (
    <div className="relative w-full max-w-[800px] mx-auto z-[60]">
      <div className="sticky top-0 z-[70] bg-zinc-900 text-white p-4 rounded-t-lg shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4 mb-0 print:hidden border-b border-zinc-800">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Printer className="w-5 h-5 text-neon-blue" />
          Recibo de Venda
        </h2>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button onClick={handlePrint} className="bg-neon-blue text-black font-bold hover:bg-neon-blue/90">
            <Printer className="w-4 h-4 mr-2" /> Imprimir
          </Button>
          <Button onClick={handleDownloadPDF} variant="secondary" className="bg-white/10 text-white hover:bg-white/20">
            <Download className="w-4 h-4 mr-2" /> Baixar PDF
          </Button>
          {onClose ? (
            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10">
              Fechar
            </Button>
          ) : null}
        </div>
      </div>

      <div className="bg-white text-black p-8 rounded-b-lg shadow-2xl overflow-hidden print:shadow-none print:p-0">
        <div ref={receiptRef} className="bg-white">
          <div className="space-y-6 font-mono text-sm">
            <div className="text-center border-b-2 border-black pb-6">
              <h1 className="text-3xl font-bold uppercase tracking-wider mb-2" style={{ lineHeight: '1.2' }}>{storeSettings?.nameFantasia || 'Virtual Games'}</h1>
              <p className="font-bold text-sm mb-3">Comprovante de Venda</p>
              <div className="text-[11px] space-y-1 text-gray-600">
                <p>CNPJ: {storeSettings?.cnpj || '00.000.000/0001-00'}</p>
                <p>{storeSettings?.address?.replace(/ - CEP.*/, '') || 'Endereço não configurado'}</p>
                <p>Tel: {storeSettings?.phone || '(55) 9999-9999'}</p>
              </div>
            </div>

            <div className="flex justify-between items-end border-b border-black py-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Venda</p>
                <p className="text-4xl font-black tracking-normal" style={{ fontFamily: 'Arial, sans-serif' }}>#{sale.id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Data</p>
                <p className="font-bold text-lg">{new Date(sale.date).toLocaleString('pt-BR')}</p>
              </div>
            </div>

            <div className="border-b border-gray-300 py-4">
              <h3 className="font-bold uppercase text-[11px] mb-4 bg-black text-white px-2 py-1 inline-block tracking-wide">Dados do Cliente</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Nome</span>
                  <span className="font-bold text-sm block leading-tight">{sale.customer.name || 'Não informado'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">CPF/CNPJ</span>
                  <span className="font-mono text-sm">{sale.customer.document || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Telefone / WhatsApp</span>
                  <span className="font-mono text-sm">{sale.customer.phone || 'Não informado'}</span>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-300 py-4">
              <h3 className="font-bold uppercase text-[11px] mb-4 bg-black text-white px-2 py-1 inline-block tracking-wide">Itens da Venda</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left py-2">Produto</th>
                    <th className="text-right py-2">Qtd</th>
                    <th className="text-right py-2">Unitário</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-2">{item.name}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">
                        {Number(item.unitPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-2 text-right">
                        {Number(item.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-b border-gray-300 py-4">
              <h3 className="font-bold uppercase text-[11px] mb-4 bg-black text-white px-2 py-1 inline-block tracking-wide">Resumo Financeiro</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{Number(sale.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Desconto</span>
                  <span>- {Number(sale.discount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Forma de pagamento</span>
                  <span className="uppercase">{sale.paymentMethod}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-black pt-2">
                  <span>Total</span>
                  <span>{Number(sale.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">Obrigado pela preferência!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
