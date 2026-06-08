/**
 * Módulo compartilhado de parsing e normalização de permissões.
 * Evita duplicação entre api-auth.ts (server) e auth-context.tsx (client).
 */

export function normalizePermissionResource(resource: string): string {
  const normalized = resource.toLowerCase();
  if (normalized === 'clients' || normalized === 'customers') return 'customers';
  if (normalized === 'products' || normalized === 'registers' || normalized === 'stock') return 'registers';
  if (normalized === 'finance' || normalized === 'financial') return 'financial';
  if (normalized === 'users' || normalized === 'roles' || normalized === 'permissions' || normalized === 'logs') return 'admin';
  if (normalized === 'config' || normalized === 'settings') return 'settings';
  return normalized;
}

const parsePermissionCache = new Map<string, { action: string | null; resource: string }>();

export function parsePermission(permission: string): { action: string | null; resource: string } {
  const cached = parsePermissionCache.get(permission);
  if (cached) return cached;

  const [rawAction, ...rest] = permission.toLowerCase().split(':');
  const result = rest.length === 0
    ? { action: null, resource: normalizePermissionResource(rawAction) }
    : { action: rawAction, resource: normalizePermissionResource(rest.join(':')) };

  parsePermissionCache.set(permission, result);
  return result;
}
