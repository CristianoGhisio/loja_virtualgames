'use client';

/* eslint-disable security/detect-object-injection */

import { useState, useEffect, useCallback, Fragment } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Minus, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Permission {
  id: string;
  action: string;
  resource: string;
  description?: string | null;
}

interface RolePermission {
  permissionId: string;
}

interface RoleItem {
  id: string;
  name: string;
  permissions: RolePermission[];
}

interface PermissionsData {
  roles: RoleItem[];
  permissions: Permission[];
}

interface PermissionUpdate {
  roleId: string;
  permissionId: string;
  active: boolean;
}

const MODULE_DEFINITIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'cash-daily', label: 'Caixa Diário' },
  { key: 'atendimento', label: 'Atendimento' },
  { key: 'customers', label: 'Clientes' },
  { key: 'clients', label: 'Clientes (Antigo)' },
  { key: 'employees', label: 'Funcionários' },
  { key: 'users', label: 'Usuários' },
  { key: 'products', label: 'Produtos' },
  { key: 'registers', label: 'Controle' },
  { key: 'stock', label: 'Estoque' },
  { key: 'sales', label: 'Vendas' },
  { key: 'os', label: 'OS' },
  { key: 'financial', label: 'Financeiro' },
  { key: 'finance', label: 'Financeiro (Antigo)' },
  { key: 'reports', label: 'Relatórios' },
  { key: 'admin', label: 'Admin' },
  { key: 'settings', label: 'Configurações' },
];

const MODULE_LABELS = MODULE_DEFINITIONS.reduce<Record<string, string>>((acc, module) => {
  acc[module.key] = module.label;
  return acc;
}, {});

const ACTION_ORDER: Record<string, number> = { create: 1, read: 2, update: 3, delete: 4, manage: 5 };
const ACTION_LABELS: Record<string, string> = { create: 'Criar', read: 'Ler', update: 'Editar', delete: 'Excluir', manage: 'Gerenciar' };

function getModuleKey(resource: string): string {
  const normalized = resource.toLowerCase();
  if (normalized === 'cash-daily' || normalized === 'caixa-diario') return 'cash-daily';
  if (normalized === 'customers' || normalized === 'clients') return 'clients';
  if (normalized === 'registers' || normalized === 'products' || normalized === 'stock') return 'products';
  if (normalized === 'financial' || normalized === 'finance') return 'finance';
  if (normalized === 'users' || normalized === 'roles' || normalized === 'permissions' || normalized === 'logs') return 'admin';
  if (normalized === 'config' || normalized === 'settings') return 'settings';
  return normalized;
}

export default function PermissoesPage() {
  const [data, setData] = useState<PermissionsData>({ roles: [], permissions: [] });
  const [initialData, setInitialData] = useState<PermissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/permissions');
      const json = await res.json();
      const parsed = json as PermissionsData;
      setData(parsed);
      setInitialData(JSON.parse(JSON.stringify(parsed)));
      setHasChanges(false);
      if (expandedModules.length === 0) {
        const modules = Array.from(new Set(parsed.permissions.map((p) => getModuleKey(p.resource))));
        setExpandedModules(modules);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      toast.error('Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  }, [expandedModules.length]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!initialData) { setSaving(false); return; }
      const updates: PermissionUpdate[] = [];
      data.roles.forEach((role) => {
        const initialRole = initialData.roles.find((r) => r.id === role.id);
        if (!initialRole) return;
        role.permissions.forEach((p) => {
          if (!initialRole.permissions.some((ip) => ip.permissionId === p.permissionId)) {
            updates.push({ roleId: role.id, permissionId: p.permissionId, active: true });
          }
        });
        initialRole.permissions.forEach((ip) => {
          if (!role.permissions.some((p) => p.permissionId === ip.permissionId)) {
            updates.push({ roleId: role.id, permissionId: ip.permissionId, active: false });
          }
        });
      });
      if (updates.length === 0) { setSaving(false); setHasChanges(false); return; }
      await Promise.all(updates.map(update =>
        fetch('/api/admin/permissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        })
      ));
      toast.success('Permissões atualizadas com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Failed to save permissions:', error);
      toast.error('Erro ao salvar permissões');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initialData) { setData(JSON.parse(JSON.stringify(initialData))); setHasChanges(false); toast.info('Alterações descartadas'); }
  };

  const togglePermission = (roleId: string, permissionId: string, currentStatus: boolean) => {
    setData((prev) => {
      const newData = { ...prev, roles: prev.roles.map((r) => {
        if (r.id !== roleId) return r;
        let newPerms = [...r.permissions];
        if (currentStatus) newPerms = newPerms.filter((p) => p.permissionId !== permissionId);
        else newPerms.push({ permissionId });
        return { ...r, permissions: newPerms };
      })};
      setHasChanges(true);
      return newData;
    });
  };

  const toggleModulePermissions = (roleId: string, modulePermissions: Permission[], shouldEnable: boolean) => {
    setData((prev) => {
      const newData = { ...prev, roles: prev.roles.map((r) => {
        if (r.id !== roleId) return r;
        let newPerms = [...r.permissions];
        modulePermissions.forEach(perm => {
          const hasPerm = newPerms.some((p) => p.permissionId === perm.id);
          if (shouldEnable && !hasPerm) newPerms.push({ permissionId: perm.id });
          else if (!shouldEnable && hasPerm) newPerms = newPerms.filter((p) => p.permissionId !== perm.id);
        });
        return { ...r, permissions: newPerms };
      })};
      setHasChanges(true);
      return newData;
    });
  };

  const toggleModule = (module: string) => {
    setExpandedModules(prev => prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]);
  };

  const groupedPermissions = data.permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    const moduleKey = getModuleKey(perm.resource);
    if (!acc[moduleKey]) acc[moduleKey] = [];
    acc[moduleKey].push(perm);
    return acc;
  }, {});

  const orderedModuleKeys = [
    ...MODULE_DEFINITIONS.map((module) => module.key).filter((key) => groupedPermissions[key]?.length),
    ...Object.keys(groupedPermissions).filter((key) => !MODULE_LABELS[key]),
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center sticky top-0 z-10 border-b border-[rgba(255,255,255,0.06)] pb-4 mb-4">
        <div>
          <CardTitle>Matriz de Permissões</CardTitle>
          <CardDescription>Configure o acesso de cada perfil aos recursos do sistema.</CardDescription>
        </div>
        {hasChanges && (
          <div className="flex gap-2 animate-in fade-in slide-in-from-right-5">
            <Button variant="outline" onClick={handleReset} disabled={saving}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20">
              <RotateCcw className="w-4 h-4 mr-2" /> Descartar
            </Button>
            <Button variant="neon" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="py-4 px-4 font-bold text-gray-400 w-1/3">Módulo / Ação</th>
                {data.roles.map((role) => (
                  <th key={role.id} className="py-4 px-4 font-bold text-white text-center">{role.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orderedModuleKeys.map((moduleKey) => {
                const perms = [...groupedPermissions[moduleKey]].sort((a, b) => {
                  const orderA = ACTION_ORDER[a.action] ?? 999;
                  const orderB = ACTION_ORDER[b.action] ?? 999;
                  if (orderA !== orderB) return orderA - orderB;
                  return a.action.localeCompare(b.action);
                });
                const isExpanded = expandedModules.includes(moduleKey);
                return (
                  <Fragment key={moduleKey}>
                    <tr className="bg-white/[0.02] border-b border-[rgba(255,255,255,0.06)]">
                      <td className="py-3 px-4">
                        <button onClick={() => toggleModule(moduleKey)}
                          className="flex items-center gap-2 font-bold text-neon-blue uppercase tracking-wider hover:text-neon-blue/80 transition-colors">
                          {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          {MODULE_LABELS[moduleKey] || moduleKey}
                        </button>
                      </td>
                      {data.roles.map((role) => {
                        const rolePerms = role.permissions.map((p) => p.permissionId);
                        const modulePermIds = perms.map((p) => p.id);
                        const allEnabled = modulePermIds.every((id: string) => rolePerms.includes(id));
                        const someEnabled = modulePermIds.some((id: string) => rolePerms.includes(id));
                        return (
                          <td key={role.id} className="py-3 px-4 text-center">
                            <Checkbox checked={allEnabled}
                              onCheckedChange={() => toggleModulePermissions(role.id, perms, !allEnabled)}
                              className={`mx-auto ${someEnabled && !allEnabled ? 'opacity-50' : ''}`} />
                          </td>
                        );
                      })}
                    </tr>
                    {isExpanded && perms.map((perm) => (
                      <tr key={perm.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-neon-blue/5 transition-colors">
                        <td className="py-3 px-4 pl-10 border-l-2 border-transparent hover:border-neon-blue/30">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-300 uppercase text-xs">{ACTION_LABELS[perm.action] || perm.action}</span>
                            <span className="text-gray-400 text-[10px]">{perm.description || `Ação ${perm.action} em ${perm.resource}`}</span>
                          </div>
                        </td>
                        {data.roles.map((role) => {
                          const hasPerm = role.permissions.some((rp) => rp.permissionId === perm.id);
                          return (
                            <td key={role.id} className="py-3 px-4 text-center">
                              <Checkbox checked={hasPerm}
                                onCheckedChange={() => togglePermission(role.id, perm.id, hasPerm)}
                                className="mx-auto" />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
