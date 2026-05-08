'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';

interface RoleItem {
  id: string;
  name: string;
  description?: string | null;
  _count: {
    users: number;
  };
}

export default function PerfisPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async () => {
    if (!name.trim()) {
      toast.error('Informe o nome do perfil');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Erro ao criar perfil');
        return;
      }

      toast.success('Perfil criado com sucesso');
      setName('');
      setDescription('');
      setIsModalOpen(false);
      fetchRoles();
    } catch (error) {
      console.error('Failed to create role:', error);
      toast.error('Erro ao criar perfil');
    } finally {
      setCreating(false);
    }
  };

  const deleteRole = async (role: RoleItem) => {
    if (!confirm(`Confirmar remoção do perfil ${role.name}?`)) return;

    try {
      const res = await fetch(`/api/admin/roles?id=${role.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'Erro ao remover perfil');
        return;
      }

      toast.success('Perfil removido com sucesso');
      fetchRoles();
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error('Erro ao remover perfil');
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Perfis de Acesso</CardTitle>
            <CardDescription>Definição de hierarquia e permissões.</CardDescription>
          </div>
          <Button variant="neon" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Perfil
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Usuários</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-bold text-white">{role.name}</TableCell>
                    <TableCell className="text-gray-400">{role.description || '-'}</TableCell>
                    <TableCell className="text-right text-gray-300">{role._count.users}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => deleteRole(role)}
                        disabled={role._count.users > 0}
                        title={role._count.users > 0 ? 'Perfil com usuários vinculados' : 'Remover perfil'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Perfil"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="neon" onClick={createRole} disabled={creating}>
              {creating ? 'Criando...' : 'Criar Perfil'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nome do Perfil"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: SUPERVISOR"
          />
          <Input
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Resumo do acesso desse perfil"
          />
        </div>
      </Modal>
    </>
  );
}
