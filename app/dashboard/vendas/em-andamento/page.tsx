'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Banknote,
  Coins,
  CreditCard,
  DollarSign,
  Minus,
  Package,
  Plus,
  QrCode,
  Search,
  Trash2,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PaymentMethod, PDVCustomer, usePDV } from '../pdv-context';
import { SaleReceipt } from '@/components/dashboard/vendas/sale-receipt';
import { CashClosedDialog } from '@/components/ui/cash-closed-dialog';
import { CashStatusBadge } from '@/components/ui/cash-status-badge';
import { getDailyCashStorageStatus } from '@/lib/daily-cash-client';

type ProductResult = {
  id: string;
  commercialName: string;
  barcode?: string | null;
  price: number;
  stock: number;
  active: boolean;
};

type ClientResult = {
  id: string;
  name: string;
  document: string;
  phone?: string | null;
};

type ReceiptSaleData = {
  id: string;
  date: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  total: number;
  customer: {
    name: string;
    document: string;
    phone?: string | null;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
};

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
  icon: typeof QrCode;
}> = [
  { id: 'pix', label: 'PIX', icon: QrCode },
  { id: 'credito', label: 'Crédito', icon: CreditCard },
  { id: 'debito', label: 'Débito', icon: Wallet },
  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
  { id: 'credito_loja', label: 'Crédito Loja', icon: Coins },
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

const detectSearchType = (value: string) => {
  const cleanValue = value.trim();
  if (/^\d{8,14}$/.test(cleanValue)) {
    return 'EAN';
  }
  if (/^\d+$/.test(cleanValue)) {
    return 'ID_NUMERICO';
  }
  return 'TEXTO';
};

const normalizeDigits = (value: string) => value.replace(/\D/g, '');

const triggerPostCheckoutFlow = async (saleId: string, total: number) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { saleId, total, stockUpdated: true, financialUpdated: true };
};

export default function PDVFrenteCaixaPage() {
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const prefillStartedRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchingProduct, setSearchingProduct] = useState(false);
  const [results, setResults] = useState<ProductResult[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [finishingSale, setFinishingSale] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<ClientResult[]>([]);
  const [searchingClients, setSearchingClients] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');
  const [quickClientPhone, setQuickClientPhone] = useState('');
  const [savingQuickClient, setSavingQuickClient] = useState(false);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [cashClosedDialogOpen, setCashClosedDialogOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditUsedState, setCreditUsedState] = useState(0);
  const {
    cartItems,
    discount,
    paymentMethod,
    customerDocument,
    customerName,
    selectedCustomer,
    receivedAmount,
    subtotal,
    total,
    addProduct,
    incrementItem,
    decrementItem,
    removeItem,
    setDiscount,
    setPaymentMethod,
    setCustomerDocument,
    setCustomerName,
    setSelectedCustomer,
    setReceivedAmount,
    clearSale,
  } = usePDV();
  const addProductRef = useRef(addProduct);
  const setSelectedCustomerRef = useRef(setSelectedCustomer);
  const clearSaleRef = useRef(clearSale);

  useEffect(() => {
    addProductRef.current = addProduct;
    setSelectedCustomerRef.current = setSelectedCustomer;
    clearSaleRef.current = clearSale;
  }, [addProduct, setSelectedCustomer, clearSale]);

  const troco = useMemo(() => Math.max(receivedAmount - total, 0), [receivedAmount, total]);
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

  const searchType = useMemo(() => detectSearchType(searchTerm), [searchTerm]);

  const receiptPreview = useMemo<ReceiptSaleData>(() => ({
    id: `pre-${Date.now()}`,
    date: new Date().toISOString(),
    paymentMethod: paymentMethod || '',
    subtotal,
    discount,
    total,
    customer: {
      name: customerName.trim(),
      document: customerDocument.trim(),
      phone: selectedCustomer?.phone || null,
    },
    items: cartItems.map((item, index) => ({
      id: `${item.productId}-${index}`,
      name: item.commercialName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.unitPrice * item.quantity,
    })),
  }), [cartItems, customerDocument, customerName, discount, paymentMethod, selectedCustomer?.phone, subtotal, total]);

  const searchProducts = useCallback(async (value: string) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }

    setSearchingProduct(true);
    try {
      const trimmed = value.trim();
      const detected = detectSearchType(trimmed);

      const readProductsFromResponse = (response: { data?: unknown }) => {
        const payload = response.data as {
          data?: { data?: ProductResult[] } | ProductResult[];
        } | undefined;
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.data?.data)) return payload.data.data;
        return [];
      };

      const response = await api.get('/products', {
        params: {
          q: trimmed,
          limit: 12,
        },
      });

      const baseProducts = readProductsFromResponse(response);
      let combinedProducts = [...baseProducts];

      if (detected === 'EAN' && baseProducts.length === 0) {
        const digits = normalizeDigits(trimmed);
        const fallbackTerms = Array.from(new Set([digits.slice(-6), digits.slice(0, 6)].filter((term) => term.length >= 4)));
        for (const term of fallbackTerms) {
          const fallbackResponse = await api.get('/products', {
            params: {
              q: term,
              limit: 12,
            },
          });
          combinedProducts = [...combinedProducts, ...readProductsFromResponse(fallbackResponse)];
        }
      }

      const normalized = Array.from(
        new Map(
          combinedProducts
            .filter((product) => product.active !== false)
            .map((product) => [product.id, product])
        ).values()
      );
      setResults(normalized);

      const exactByBarcode = normalized.find(
        (product) => normalizeDigits(String(product.barcode ?? '')) === normalizeDigits(trimmed)
      );
      const exactById = normalized.find((product) => product.id === trimmed);
      const exactByName = normalized.find(
        (product) => product.commercialName.toLowerCase() === trimmed.toLowerCase()
      );

      const tryAddProduct = (product: ProductResult) => {
        if (Number(product.stock) <= 0) {
          toast.error('Produto sem estoque disponível');
          return false;
        }
        addProduct(product);
        setSearchTerm('');
        setResults([]);
        return true;
      };

      if (detected === 'EAN' && exactByBarcode) {
        tryAddProduct(exactByBarcode);
        return;
      }

      if (detected === 'ID_NUMERICO' && exactById) {
        tryAddProduct(exactById);
        return;
      }

      if (detected === 'TEXTO' && normalized.length === 1) {
        tryAddProduct(normalized[0]);
      } else if (detected === 'TEXTO' && exactByName) {
        tryAddProduct(exactByName);
      }
    } catch {
      toast.error('Falha ao buscar produtos');
    } finally {
      setSearchingProduct(false);
    }
  }, [addProduct]);

  const handleSelectResult = (product: ProductResult) => {
    if (Number(product.stock) <= 0) {
      toast.error('Produto sem estoque disponível');
      return;
    }
    addProduct(product);
    setSearchTerm('');
    setResults([]);
    searchRef.current?.focus();
  };

  const handleOpenCheckout = useCallback(() => {
    if (cartItems.length === 0) {
      toast.error('Adicione itens no carrinho antes de finalizar');
      return;
    }
    if (!paymentMethod) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }
    if (!selectedCustomer || !customerName.trim()) {
      toast.error('Selecione um cliente e confirme o nome para gerar o recibo');
      return;
    }
    if (paymentMethod === 'dinheiro' && receivedAmount < total) {
      setReceivedAmount(total);
    }
    // Handle credit payment
    if (paymentMethod === 'credito_loja') {
      if (creditBalance <= 0) {
        toast.error('Cliente não possui crédito disponível');
        return;
      }
      const creditToUse = Math.min(creditBalance, total);
      setCreditUsedState(creditToUse);
    } else {
      setCreditUsedState(0);
    }
    setCheckoutOpen(true);
  }, [cartItems.length, customerName, paymentMethod, receivedAmount, selectedCustomer, setReceivedAmount, total, creditBalance]);

  const handleSelectCustomer = (customer: PDVCustomer) => {
    setSelectedCustomer(customer);
    setClientSearch(customer.name);
    setClientResults([]);
    // Fetch credit balance
    api.get(`/clients/${customer.id}/credit`)
      .then((res) => setCreditBalance(Number(res.data?.data?.balance ?? 0)))
      .catch(() => setCreditBalance(0));
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setClientSearch('');
    setClientResults([]);
    setCreditBalance(0);
    setCreditUsedState(0);
  };

  const handleCreateQuickCustomer = async () => {
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

      const created = response.data as ClientResult;
      handleSelectCustomer({
        id: created.id,
        name: created.name,
        document: created.document,
        phone: created.phone,
      });
      setQuickClientName('');
      setQuickClientPhone('');
      setQuickClientOpen(false);
      toast.success('Cliente criado e vinculado');
    } catch {
      toast.error('Erro ao cadastrar cliente');
    } finally {
      setSavingQuickClient(false);
    }
  };

  const handleFinishSale = async () => {
    const cashOpen = await ensureCashOpen();
    if (!cashOpen) {
      return;
    }
    if (cartItems.length === 0 || !paymentMethod) {
      return;
    }
    if (!selectedCustomer || !customerName.trim()) {
      toast.error('Selecione um cliente e informe o nome para finalizar');
      return;
    }
    if (paymentMethod === 'dinheiro' && receivedAmount < total) {
      toast.error('Valor recebido menor que o total da venda');
      return;
    }

    const sourceCardId = searchParams.get('sourceCardId') || null;

    setFinishingSale(true);
    try {
      const response = await api.post('/sales', {
        customerId: selectedCustomer?.id ?? null,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        paymentMethod,
        discount,
        status: 'COMPLETED',
        sourceCardId,
        sourceFlowKind: sourceCardId ? 'PRODUCT' : undefined,
        creditUsed: creditUsedState > 0 ? creditUsedState : undefined,
      });

      const saleId = response.data?.data?.id as string | undefined;
      if (saleId) {
        await triggerPostCheckoutFlow(saleId, total);
      }

      toast.success('Venda finalizada com sucesso');
      clearSale();
      setCheckoutOpen(false);
      setResults([]);
      setSearchTerm('');
      setClientSearch('');
      searchRef.current?.focus();
    } catch (error) {
      const message = (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error
        || (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.message
        || '';
      if (String(message).toLowerCase().includes('caixa diário fechado')) {
        setCashClosedDialogOpen(true);
      }
      toast.error('Erro ao finalizar venda');
    } finally {
      setFinishingSale(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!customerName.trim()) {
      toast.error('Informe o nome do cliente para gerar o recibo');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Adicione itens antes de gerar o recibo');
      return;
    }
    setReceiptOpen(true);
  };

  const handleSendReceiptWhatsapp = async () => {
    if (!customerName.trim()) {
      toast.error('Informe o nome do cliente para enviar o recibo');
      return;
    }
    if (!selectedCustomer?.phone) {
      toast.error('Cliente sem telefone cadastrado');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Adicione itens antes de enviar o recibo');
      return;
    }

    try {
      await api.post('/sales/receipt-whatsapp-preview', {
        customerName: customerName.trim(),
        customerPhone: selectedCustomer.phone,
        customerDocument: customerDocument.trim(),
        paymentMethod: paymentMethod || '',
        subtotal,
        discount,
        total,
        items: cartItems.map((item) => ({
          name: item.commercialName,
          quantity: item.quantity,
          total: item.unitPrice * item.quantity,
        })),
      });
      toast.success('Recibo enviado por WhatsApp');
    } catch {
      toast.error('Erro ao enviar recibo por WhatsApp');
    }
  };

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const applyPrefill = async () => {
      if (prefillApplied || prefillStartedRef.current) return;
      prefillStartedRef.current = true;

      const sourceCardId = searchParams.get('sourceCardId') || '';
      const customerId = searchParams.get('customerId') || '';
      const productIds = Array.from(new Set((searchParams.get('productIds') || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)));

      if (!sourceCardId || productIds.length === 0) {
        setPrefillApplied(true);
        return;
      }

      clearSaleRef.current();

      if (customerId) {
        try {
          const customerResponse = await api.get(`/clients/${customerId}`);
          const customerData = customerResponse.data?.data || customerResponse.data;
          if (customerData?.id) {
            setSelectedCustomerRef.current({
              id: customerData.id,
              name: customerData.name,
              document: customerData.document,
              phone: customerData.phone,
            });
          }
        } catch {}
      }

      try {
        const productsResponse = await api.get('/products', {
          params: { limit: 200, ids: productIds.join(',') },
        });
        const products = productsResponse.data?.data?.data as ProductResult[] | undefined;
        const normalized = Array.isArray(products) ? products : [];
        for (const productId of productIds) {
          const product = normalized.find((item) => item.id === productId);
          if (!product) continue;
          addProductRef.current(product);
        }
      } catch {}

      setPrefillApplied(true);
    };

    void applyPrefill();
  }, [prefillApplied, searchParams]);

  useEffect(() => {
    const handleHotkeys = (event: KeyboardEvent) => {
      if (event.key === 'F2') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'F12') {
        event.preventDefault();
        handleOpenCheckout();
      }
    };

    window.addEventListener('keydown', handleHotkeys);
    return () => window.removeEventListener('keydown', handleHotkeys);
  }, [handleOpenCheckout]);

  useEffect(() => {
    const query = searchTerm.trim();
    if (!query) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      await searchProducts(query);
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchProducts, searchTerm]);

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
        const clients = Array.isArray(response.data) ? (response.data as ClientResult[]) : [];
        setClientResults(clients.slice(0, 6));
      } catch {
        setClientResults([]);
      } finally {
        setSearchingClients(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [clientSearch, selectedCustomer]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-10 gap-6 text-slate-100">
      <CashStatusBadge />
      <div className="xl:col-span-7 space-y-4">
        <div className="rounded-lg border border-cyan-400/20 bg-slate-950/40 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <Input
              ref={searchRef}
              autoFocus
              placeholder="Bipe EAN, ID ou nome do jogo/console"
              className="pl-10 h-14 text-base bg-slate-950/60 border-cyan-400/30 text-slate-200"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <Button
              type="button"
              className="absolute right-1.5 top-1.5 h-11 px-5 bg-cyan-400 text-slate-900 hover:bg-cyan-300"
              disabled={!searchTerm.trim() || searchingProduct}
              onClick={() => searchProducts(searchTerm)}
            >
              {searchingProduct ? 'Buscando' : 'Buscar'}
            </Button>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Tipo detectado: <span className="text-gray-300 font-semibold">{searchType}</span>
          </div>
        </div>

        {results.length > 0 && (
          <Card className="bg-[#0f172a] border-cyan-400/20 rounded-lg">
            <CardContent className="p-3 space-y-2">
              {results.slice(0, 5).map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelectResult(product)}
                  disabled={Number(product.stock) <= 0}
                  className="w-full text-left rounded-lg border border-cyan-400/10 hover:border-cyan-400/40 disabled:opacity-50 disabled:cursor-not-allowed bg-slate-950/40 px-3 py-2 transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{product.commercialName}</p>
                      <p className="text-xs text-slate-400">{product.barcode || product.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neon-blue font-bold">{formatCurrency(Number(product.price))}</p>
                      <p className={`text-xs ${Number(product.stock) <= 0 ? 'text-rose-300' : 'text-slate-400'}`}>
                        Estoque: {product.stock}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="bg-[#0f172a] border-cyan-400/20 rounded-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-auto bg-slate-950/40">
              <Table className="w-full min-w-[600px] border-separate border-spacing-y-2 p-2">
                <TableHeader>
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Imagem</TableHead>
                    <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Descrição</TableHead>
                    <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Quantidade</TableHead>
                    <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Unitário</TableHead>
                    <TableHead className="text-left text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Subtotal</TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wide text-gray-300 px-3 py-3">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 border-b-0">
                        <div className="flex flex-col items-center gap-3 text-center text-slate-400">
                          <Package className="w-10 h-10 text-slate-500" />
                          <p>Bipe um produto ou digite o nome para iniciar a venda</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    cartItems.map((item) => (
                      <TableRow key={item.productId} className="bg-slate-900/70 border-none hover:bg-slate-800/70 transition-colors">
                        <TableCell className="px-3 py-3 border-b-0">
                          <div className="h-10 w-10 rounded-lg bg-slate-800/50 border border-cyan-400/10 flex items-center justify-center">
                            <Package className="w-4 h-4 text-cyan-400" />
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3 border-b-0">
                          <p className="text-sm font-medium text-slate-100">{item.commercialName}</p>
                          <p className="text-xs text-slate-400">{item.barcode || item.productId}</p>
                        </TableCell>
                        <TableCell className="px-3 py-3 border-b-0">
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-cyan-400 hover:text-gray-300 hover:bg-cyan-400/10"
                              onClick={() => decrementItem(item.productId)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center text-slate-200">{item.quantity}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-cyan-400 hover:text-neon-blue hover:bg-cyan-400/10"
                              onClick={() => incrementItem(item.productId)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-sm text-slate-300 border-b-0">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="px-3 py-3 font-semibold text-emerald-400 border-b-0">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </TableCell>
                        <TableCell className="px-3 py-3 text-right border-b-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="xl:col-span-3">
        <Card className="sticky top-24 rounded-lg border-cyan-400/20 bg-[#0f172a] shadow-lg">
          <CardContent className="p-5 space-y-5">
            <div className="space-y-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Cliente</p>

              {selectedCustomer ? (
                <div className="rounded-lg border border-cyan-400/30 bg-slate-950/60 px-3 py-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{selectedCustomer.name}</p>
                    <p className="text-xs text-slate-400">{selectedCustomer.document}</p>
                    {creditBalance > 0 && (
                      <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        Crédito: {formatCurrency(creditBalance)}
                      </p>
                    )}
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10" onClick={handleClearCustomer}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <Input
                      placeholder="Nome, telefone ou CPF"
                      value={clientSearch}
                      onChange={(event) => setClientSearch(maskClientSearch(event.target.value))}
                      className="pl-9 h-10 bg-slate-950/60 border-cyan-400/30 text-slate-200"
                    />
                  </div>
                  {clientResults.length > 0 && (
                    <div className="rounded-lg border border-cyan-400/20 bg-slate-950/60 overflow-hidden">
                      {clientResults.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => handleSelectCustomer(client)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-800/50 transition border-b border-cyan-400/10 last:border-b-0"
                        >
                          <p className="text-sm text-slate-200">{client.name}</p>
                          <p className="text-xs text-slate-400">{client.phone || client.document}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {!searchingClients && clientSearch.trim().length >= 3 && clientResults.length === 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full border border-cyan-400/30 text-gray-300 hover:bg-cyan-400/10"
                      onClick={() => {
                        setQuickClientName(clientSearch.replace(/\d/g, '').trim());
                        setQuickClientPhone(maskPhone(clientSearch));
                        setQuickClientOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Novo Cliente
                    </Button>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-300">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Desconto</label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={discount}
                  onChange={(event) => setDiscount(Number(event.target.value))}
                  className="h-10 bg-slate-950/60 border-cyan-400/30 text-slate-200"
                />
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-cyan-400/20">
                <span className="text-sm text-slate-300 font-bold">TOTAL GERAL</span>
                <span className="text-3xl font-extrabold text-gray-300">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Método de pagamento</p>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <Button
                    key={method.id}
                    type="button"
                    variant="ghost"
                    className={`h-11 justify-start border ${
                      paymentMethod === method.id
                        ? 'border-cyan-400 text-neon-blue bg-cyan-400/10'
                        : 'border-cyan-400/20 text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <method.icon className="w-4 h-4 mr-2" />
                    {method.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              type="button"
              className="w-full h-12 bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-bold rounded-lg"
              disabled={cartItems.length === 0 || !paymentMethod}
              onClick={handleOpenCheckout}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              FINALIZAR VENDA
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-lg bg-[#0f172a] border-cyan-400/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Finalização de venda</DialogTitle>
            <DialogDescription className="text-slate-400">Confirme recebimento e finalize o caixa.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-cyan-400/20 p-3 bg-slate-950/40">
                <p className="text-xs text-slate-400 uppercase">Total</p>
                <p className="text-xl font-bold text-gray-300">{formatCurrency(total)}</p>
              </div>
              <div className="rounded-lg border border-cyan-400/20 p-3 bg-slate-950/40">
                <p className="text-xs text-slate-400 uppercase">Forma</p>
                <p className="text-sm font-semibold text-slate-200">
                  {PAYMENT_METHODS.find((method) => method.id === paymentMethod)?.label || '-'}
                </p>
              </div>
            </div>

            {paymentMethod === 'credito_loja' && creditUsedState > 0 && (
              <div className="rounded-lg border border-yellow-400/30 p-3 bg-slate-950/40 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-400">Crédito utilizado</span>
                  <span className="text-yellow-400 font-bold">{formatCurrency(creditUsedState)}</span>
                </div>
                {creditUsedState < total && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Restante a pagar</span>
                    <span className="text-slate-200 font-bold">{formatCurrency(total - creditUsedState)}</span>
                  </div>
                )}
              </div>
            )}

            <Input
              label="Valor recebido"
              type="number"
              step="0.01"
              min={0}
              value={receivedAmount || ''}
              onChange={(event) => setReceivedAmount(Number(event.target.value))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />

            {paymentMethod === 'dinheiro' && (
              <div className="rounded-lg border border-cyan-400/20 p-3 bg-slate-950/40 flex justify-between">
                <span className="text-slate-300 uppercase text-sm font-bold">Troco</span>
                <span className="font-bold text-emerald-400">{formatCurrency(troco)}</span>
              </div>
            )}

            <Input
              label="CPF na Nota (opcional)"
              value={customerDocument || ''}
              onChange={(event) => setCustomerDocument(maskCPF(event.target.value))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Input
              label="Nome do Cliente *"
              value={customerName || ''}
              onChange={(event) => setCustomerName(event.target.value)}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />

            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" className="h-10 border-slate-700 text-slate-300 hover:bg-slate-800" onClick={handlePrintReceipt}>
                Imprimir recibo
              </Button>
              <Button type="button" variant="outline" className="h-10 border-slate-700 text-slate-300 hover:bg-slate-800" onClick={handleSendReceiptWhatsapp}>
                Enviar por WhatsApp
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setCheckoutOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-bold"
              onClick={handleFinishSale}
              disabled={finishingSale || cartItems.length === 0 || !paymentMethod || !customerName.trim() || !selectedCustomer}
            >
              {finishingSale ? 'Finalizando...' : 'Confirmar venda'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-5xl p-0 border-cyan-400/20 bg-transparent">
          <DialogHeader className="sr-only">
            <DialogTitle>Recibo de venda</DialogTitle>
          </DialogHeader>
          <SaleReceipt
            sale={receiptPreview}
            onClose={() => setReceiptOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={quickClientOpen} onOpenChange={setQuickClientOpen}>
        <DialogContent className="max-w-md bg-[#0f172a] border-cyan-400/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Novo Cliente</DialogTitle>
            <DialogDescription className="text-slate-400">Cadastro rápido para vincular ao PDV.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              label="Nome Completo"
              value={quickClientName}
              onChange={(event) => setQuickClientName(event.target.value)}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
            <Input
              label="WhatsApp / Telefone"
              value={quickClientPhone}
              onChange={(event) => setQuickClientPhone(maskPhone(event.target.value))}
              className="bg-slate-950/60 border-cyan-400/30 text-slate-200"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setQuickClientOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-cyan-400 text-slate-900 hover:bg-cyan-300"
              onClick={handleCreateQuickCustomer}
              disabled={savingQuickClient}
            >
              {savingQuickClient ? 'Salvando...' : 'Salvar e Vincular'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CashClosedDialog
        open={cashClosedDialogOpen}
        onOpenChange={setCashClosedDialogOpen}
        title="Caixa diário fechado para finalizar venda"
      />
    </div>
  );
}
