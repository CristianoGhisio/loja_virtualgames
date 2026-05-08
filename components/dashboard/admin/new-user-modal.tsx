'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/native-select';
import { Modal } from '@/components/ui/modal';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  user?: {
    id: string;
    name: string;
    email: string;
    roleId: string;
  } | null;
}

interface RoleItem {
  id: string;
  name: string;
  description?: string | null;
}

export function NewUserModal({ isOpen, onClose, onSave, user }: NewUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(user);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      setRoles(data);
      if (user?.roleId) {
        setRoleId(user.roleId);
        return;
      }
      if (data.length > 0) setRoleId(data[0].id);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  }, [user?.roleId]);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [fetchRoles, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setRoleId(user.roleId || '');
      setPassword('');
      return;
    }
    setName('');
    setEmail('');
    setPassword('');
  }, [isOpen, user]);

  const handleSubmit = async () => {
    if (!name || !email || !roleId || (!isEditing && !password)) return;
    
    setLoading(true);
    try {
      const endpoint = isEditing && user ? `/api/admin/users/${user.id}` : '/api/admin/users';
      const method = isEditing ? 'PATCH' : 'POST';
      const payload: {
        name: string;
        email: string;
        roleId: string;
        password?: string;
      } = { name, email, roleId };

      if (!isEditing) {
        payload.password = password;
      }
      if (isEditing && password.trim()) {
        payload.password = password.trim();
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        onSave();
        onClose();
        setName('');
        setEmail('');
        setPassword('');
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Erro ao conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Usuário' : 'Novo Usuário'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="border-cyan-400/20 text-cyan-300 hover:bg-cyan-400/10">Cancelar</Button>
          <Button 
            className="bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (isEditing ? 'Salvando...' : 'Criando...') : (isEditing ? 'Salvar Alterações' : 'Criar Usuário')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input 
          label="Nome Completo" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
        />
        <Input 
          label="Email" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
        />
        <Input 
          label={isEditing ? 'Nova Senha (Opcional)' : 'Senha Temporária'} 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
        />
        <Select 
          label="Perfil de Acesso"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="bg-slate-950/60 border-cyan-400/20 text-slate-300 focus:border-cyan-400"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name} - {r.description}</option>
          ))}
        </Select>
      </div>
    </Modal>
  );
}
