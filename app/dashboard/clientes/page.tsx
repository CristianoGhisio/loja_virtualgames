'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Plus, Search, Filter, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { AccessDenied } from '@/components/ui/access-denied';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string | null;
  email: string | null;
  document: string | null;
  phone?: string | null;
}

export default function ClientesPage() {
  const { hasPermission } = useAuth();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const canAccessCustomers = hasPermission('customers');
  const canDeleteClient = hasPermission('customers', 'delete');

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await api.get<Client[]>('/clients');
        setClients(response.data);
      } catch (error) {
        console.error('Erro ao carregar clientes', error);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return [...clients]
      .filter((client) => {
        const name = (client.name || '').toLowerCase();
        const email = (client.email || '').toLowerCase();
        const document = (client.document || '').toLowerCase();
        return name.includes(normalizedSearch) || email.includes(normalizedSearch) || document.includes(normalizedSearch);
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' }));
  }, [clients, searchTerm]);

  if (!canAccessCustomers) return <AccessDenied />;

  const openDeleteModal = (event: MouseEvent<HTMLButtonElement>, client: Client) => {
    event.stopPropagation();
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/clients/${clientToDelete.id}`);
      setClients((prev) => prev.filter((client) => client.id !== clientToDelete.id));
      toast.success('Cliente excluído com sucesso!');
      setDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao excluir cliente';
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neon-blue/10 rounded-xl border border-neon-blue/20">
            <User className="w-5 h-5 text-neon-blue" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron">Base de Clientes</h1>
            <p className="text-xs sm:text-sm text-gray-400">Gerencie o cadastro de clientes e histórico.</p>
          </div>
        </div>
        <Button variant="neon" onClick={() => router.push('/dashboard/clientes/novo')}>
          <Plus className="w-4 h-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <CardTitle>Clientes Cadastrados</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar nome, email ou CPF..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-gray-400">Carregando clientes...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Documento</TableHead>
                  {canDeleteClient && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canDeleteClient ? 5 : 4} className="text-center text-gray-500 py-8">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/dashboard/clientes/${client.id}/visao-geral`)}
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <User className="w-4 h-4 text-neon-blue" />
                          </div>
                          {client.name || '-'}
                        </div>
                      </TableCell>
                      <TableCell>{client.phone || '-'}</TableCell>
                      <TableCell className="text-gray-400">{client.email || '-'}</TableCell>
                      <TableCell className="text-gray-400">{client.document || '-'}</TableCell>
                      {canDeleteClient && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={(event) => openDeleteModal(event, client)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setClientToDelete(null); }}
        onConfirm={handleDeleteClient}
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir ${clientToDelete?.name || 'este cliente'}? Esta ação não poderá ser desfeita.`}
        loading={deleteLoading}
      />
    </div>
  );
}
