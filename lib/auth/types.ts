export type UserRole = 'owner' | 'manager' | 'sales' | 'tech';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  active?: boolean;
}

export interface SessionUser {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  permissions?: string[];
  image?: string | null;
}

export const MOCK_USERS: Record<UserRole, User> = {
  owner: {
    id: '1',
    name: 'Roberto Admin',
    email: 'dono@virtualgames.com',
    role: 'owner',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop'
  },
  manager: {
    id: '2',
    name: 'Ana Gerente',
    email: 'gerente@virtualgames.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop'
  },
  sales: {
    id: '3',
    name: 'Carlos Vendedor',
    email: 'vendas@virtualgames.com',
    role: 'sales',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop'
  },
  tech: {
    id: '4',
    name: 'Pedro Técnico',
    email: 'tech@virtualgames.com',
    role: 'tech',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop'
  }
};

export const PERMISSIONS = {
  owner: ['dashboard', 'sales', 'purchases', 'os', 'stock', 'customers', 'financial', 'reports', 'registers', 'admin', 'settings'],
  manager: ['dashboard', 'sales', 'purchases', 'os', 'stock', 'customers', 'financial', 'reports', 'registers', 'settings'],
  sales: ['dashboard', 'sales', 'os', 'stock_view', 'customers'],
  tech: ['dashboard', 'os', 'stock_parts', 'customers_view']
};
