'use client';

import { useEffect, useMemo, useState, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Plus, Search, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { AccessDenied } from '@/components/ui/access-denied';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface Employee {
  id: string;
  nomeCompleto: string;
  cpf: string;
  celularWhatsapp: string;
  cargoFuncao: string;
  status: string;
  userId?: string | null;
  user?: {
    name: string;
    email: string;
  } | null;
  dataNascimento?: string;
  emailPessoal?: string;
  dataAdmissao?: string;
  tipoContrato?: string;
  salarioBase?: number;
  percentualComissao?: number;
  chavePix?: string;
}

export default function FuncionariosPage() {
  const { hasPermission } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Use admin permission or a specific 'employees' permission if created
  const canAccessEmployees = hasPermission('admin');

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get<Employee[]>('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Erro ao carregar funcionários', error);
      toast.error('Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canAccessEmployees) {
      loadEmployees();
    }
  }, [canAccessEmployees]);

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...employees]
      .filter((employee) => {
        const name = (employee.nomeCompleto || '').toLowerCase();
        const cpf = (employee.cpf || '').toLowerCase();
        const role = (employee.cargoFuncao || '').toLowerCase();

        return (
          name.includes(normalizedSearch) ||
          cpf.includes(normalizedSearch) ||
          role.includes(normalizedSearch)
        );
      })
      .sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto, 'pt-BR', { sensitivity: 'base' }));
  }, [employees, searchTerm]);

  if (!canAccessEmployees) return <AccessDenied />;

  const handleOpenNew = () => {
    router.push('/dashboard/funcionarios/novo');
  };

  const handleRowClick = (employee: Employee) => {
    router.push(`/dashboard/funcionarios/${employee.id}/visao-geral`);
  };

  const openDeleteModal = (event: MouseEvent<HTMLButtonElement>, employee: Employee) => {
    event.stopPropagation();
    setEmployeeToDelete(employee);
    setDeleteModalOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/employees/${employeeToDelete.id}`);
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeToDelete.id));
      toast.success('Funcionário excluído com sucesso!');
      setDeleteModalOpen(false);
      setEmployeeToDelete(null);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message || 'Erro ao excluir funcionário';
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron">Quadro de Funcionários</h1>
          <p className="text-sm text-gray-400">Gerencie a equipe e vínculos de sistema.</p>
        </div>
        <Button variant="neon" onClick={handleOpenNew}>
          <Plus className="w-4 h-4 mr-2" /> Novo Funcionário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Funcionários Cadastrados</CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Buscar..." className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-gray-400">
              Carregando funcionários...
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Celular</TableHead>
                <TableHead>Usuário Sistema</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      Nenhum funcionário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow 
                      key={employee.id} 
                      className="bg-slate-900/70 border-none hover:bg-slate-800/70 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(employee)}
                    >
                      <TableCell className="font-medium text-slate-100 flex items-center gap-3 px-3 py-3 border-b-0">
                        <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center border border-cyan-400/10">
                          <User className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p>{employee.nomeCompleto}</p>
                          <p className="text-xs text-slate-400">{employee.cpf}</p>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-3 text-slate-200 border-b-0">{employee.cargoFuncao}</TableCell>
                      <TableCell className="px-3 py-3 text-slate-200 border-b-0">{employee.celularWhatsapp}</TableCell>
                      <TableCell className="px-3 py-3 text-slate-200 border-b-0">
                        {employee.user ? (
                          <span className="text-cyan-400 text-sm bg-cyan-400/10 px-2 py-1 rounded-md">
                            {employee.user.name}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-sm">Sem vínculo</span>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-3 text-slate-200 border-b-0">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${employee.status === 'ATIVO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {employee.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-3 border-b-0 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          title="Excluir Funcionário"
                          onClick={(event) => openDeleteModal(event, employee)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
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
        onClose={() => {
          setDeleteModalOpen(false);
          setEmployeeToDelete(null);
        }}
        onConfirm={handleDeleteEmployee}
        title="Excluir Funcionário"
        description={`Tem certeza que deseja excluir ${employeeToDelete?.nomeCompleto || 'este funcionário'}? Esta ação não poderá ser desfeita.`}
        loading={deleteLoading}
      />
    </div>
  );
}
