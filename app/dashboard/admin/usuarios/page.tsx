'use client';

import { useState, useEffect } from 'react';
import { Edit, UserPlus, Lock, Unlock, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NewUserModal } from '@/components/dashboard/admin/new-user-modal';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { toast } from 'sonner';

interface UserRole {
  name?: string | null;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  active: boolean;
  roleId: string;
  role?: UserRole | null;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (user: UserItem) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      });
      if (res.ok) fetchUsers();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro ao excluir usuário');
      }
      toast.success('Usuário excluído com sucesso');
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao excluir usuário');
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>Controle de acesso e perfis</CardDescription>
          </div>
          <Button variant="neon" onClick={() => { setEditingUser(null); setModalOpen(true); }}>
            <UserPlus className="w-4 h-4 mr-2" />
            NOVO USUÁRIO
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-white">{user.name}</TableCell>
                    <TableCell className="text-gray-400">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="neon">{user.role?.name || '-'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.active ? 'success' : 'destructive'}>
                        {user.active ? 'Ativo' : 'Bloqueado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => toggleStatus(user)}
                          className={user.active ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10' : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'}>
                          {user.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setEditingUser(user); setModalOpen(true); }}
                          className="text-neon-blue hover:text-neon-blue hover:bg-neon-blue/10">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setUserToDelete(user); setDeleteModalOpen(true); }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <NewUserModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingUser(null); }} onSave={fetchUsers}
        user={editingUser ? { id: editingUser.id, name: editingUser.name, email: editingUser.email, roleId: editingUser.roleId } : null} />

      <DeleteConfirmationModal isOpen={deleteModalOpen} onClose={() => { setDeleteModalOpen(false); setUserToDelete(null); }}
        onConfirm={handleDeleteUser} title="Excluir Usuário"
        description={`Tem certeza que deseja excluir o usuário ${userToDelete?.name}? Esta ação não poderá ser desfeita.`}
        loading={deleteLoading} />
    </>
  );
}
