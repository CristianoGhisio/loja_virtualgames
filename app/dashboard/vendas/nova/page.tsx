'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type Customer = { id: string; name: string; active: boolean };
type Product = { id: string; commercialName: string; price: number; stock: number; active: boolean };
interface CartItem extends Product { quantity: number }

function fmt(value: number) { return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function NovaVendaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [clients, setClients] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [clientsRes, productsRes] = await Promise.all([api.get('/clients'), api.get('/products', { params: { limit: 200 } })]);
        setClients(clientsRes.data as Customer[]);
        const productsData = productsRes.data?.data?.data as Product[] | undefined;
        setProducts(Array.isArray(productsData) ? productsData.filter((p) => p.active !== false) : []);
      } catch { toast.error('Erro ao carregar dados'); } finally { setLoadingData(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (prefillApplied || loadingData) return;
    const clientId = searchParams.get('clientId');
    if (clientId && clients.length > 0) {
      const found = clients.find((c) => c.id === clientId);
      if (found) { setSelectedClient(clientId); setPrefillApplied(true); }
    }
  }, [searchParams, clients, loadingData, prefillApplied]);

  // Fetch credit balance when client changes
  useEffect(() => {
    if (!selectedClient) { setCreditBalance(0); return; }
    api.get(`/clients/${selectedClient}/credit`)
      .then((res) => setCreditBalance(Number(res.data?.data?.balance ?? 0)))
      .catch(() => setCreditBalance(0));
  }, [selectedClient]);

  const customerName = useMemo(() => clients.find((c) => c.id === selectedClient)?.name ?? '', [clients, selectedClient]);
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);

  const addToCart = () => {
    if (!selectedProduct || quantity < 1) return;
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;
    if (product.stock < quantity) { toast.error('Estoque insuficiente'); return; }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      return [...prev, { ...product, quantity }];
    });
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeFromCart = (id: string) => { setCart((prev) => prev.filter((item) => item.id !== id)); };

  const handleSubmit = async () => {
    if (!selectedClient || cart.length === 0 || !paymentMethod) { toast.error('Preencha cliente, itens e pagamento'); return; }
    if (paymentMethod === 'CREDITO_LOJA' && creditBalance <= 0) { toast.error('Cliente não possui crédito disponível'); return; }
    const creditToUse = paymentMethod === 'CREDITO_LOJA' ? Math.min(creditBalance, subtotal) : 0;
    if (paymentMethod === 'CREDITO_LOJA' && creditToUse < subtotal) {
      toast.warning(`Crédito cobre ${fmt(creditToUse)}. Os ${fmt(subtotal - creditToUse)} restantes devem ser pagos por outro método. Para pagamento parcial, use o PDV.`);
      return;
    }
    setLoading(true);
    try {
      await api.post('/sales', {
        customerId: selectedClient, items: cart.map((item) => ({ productId: item.id, quantity: item.quantity, unitPrice: item.price })),
        paymentMethod, status: 'COMPLETED',
        creditUsed: creditToUse > 0 ? creditToUse : undefined,
      });
      toast.success('Venda finalizada');
      router.push('/dashboard/vendas/em-andamento');
    } catch { toast.error('Erro ao finalizar venda'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron">Nova Venda</h1>
          <p className="text-sm text-gray-400">Registre uma venda manualmente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Selecionar Produtos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}
                  className="flex-1 h-10 rounded-md border border-[rgba(255,255,255,0.1)] bg-black/20 px-3 text-sm text-white focus:border-neon-blue">
                  <option value="">Selecione um produto</option>
                  {products.map((p) => <option key={p.id} value={p.id} disabled={p.stock <= 0}>{p.commercialName} - {fmt(p.price)} ({p.stock} und)</option>)}
                </select>
                <Input type="number" min={1} className="w-20" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                <Button variant="neon" size="icon" onClick={addToCart}><Plus className="w-4 h-4" /></Button>
              </div>

              {cart.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Produto</TableHead><TableHead>Qtd</TableHead><TableHead>Preço</TableHead><TableHead>Total</TableHead><TableHead></TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-white font-medium">{item.commercialName}</TableCell>
                        <TableCell className="text-gray-400">{item.quantity}</TableCell>
                        <TableCell className="text-gray-400">{fmt(item.price)}</TableCell>
                        <TableCell className="font-bold text-neon-blue">{fmt(item.price * item.quantity)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-red-400" onClick={() => removeFromCart(item.id)}><Trash2 className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {cart.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Carrinho vazio. Adicione produtos.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Observações</CardTitle></CardHeader>
            <CardContent>
              <Textarea placeholder="Observações da venda (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider ml-1">Cliente</label>
                <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full h-10 rounded-md border border-[rgba(255,255,255,0.1)] bg-black/20 px-3 text-sm text-white focus:border-neon-blue mt-1">
                  <option value="">Selecione...</option>
                  {clients.filter((c) => c.active).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {customerName && <p className="text-sm text-gray-400">Cliente: <span className="text-white font-bold">{customerName}</span></p>}
              {creditBalance > 0 && (
                <p className="text-sm text-yellow-400 flex items-center gap-1">
                  <Coins className="w-3 h-3" /> Crédito disponível: {fmt(creditBalance)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Pagamento</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider ml-1">Forma de Pagamento</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 rounded-md border border-[rgba(255,255,255,0.1)] bg-black/20 px-3 text-sm text-white focus:border-neon-blue mt-1">
                  <option value="">Selecione...</option>
                  <option value="PIX">PIX</option>
                  <option value="CREDITO">Crédito</option>
                  <option value="DEBITO">Débito</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="CREDITO_LOJA">Crédito em Loja</option>
                </select>
              </div>
              <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-2">
                <div className="flex justify-between text-gray-400"><span>Itens</span><span>{cart.length}</span></div>
                <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex justify-between items-center">
                  <span className="text-lg font-bold text-white">Total</span>
                  <span className="text-2xl font-bold text-neon-blue font-orbitron">{fmt(subtotal)}</span>
                </div>
              </div>
              <Button variant="neon" className="w-full" onClick={handleSubmit} disabled={loading || !selectedClient || cart.length === 0 || !paymentMethod}>
                {loading ? 'Finalizando...' : 'Finalizar Venda'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
