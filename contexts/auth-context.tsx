'use client';

import { createContext, useContext, useMemo, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { parsePermission } from '@/lib/permissions';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (module: string, action?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = useMemo<User | null>(() => {
    if (status !== 'authenticated' || !session?.user) return null;
    return {
      id: session.user.id || '',
      name: session.user.name || '',
      email: session.user.email || '',
      role: (session.user as { role?: string }).role || 'SELLER',
      permissions: (session.user as { permissions?: string[] }).permissions || [],
      avatar: session.user.image || undefined,
    };
  }, [session, status]);

  const login = async (email: string, password: string) => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    router.push('/dashboard');
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const hasPermission = useCallback((module: string, action?: string) => {
    if (!user) return false;

    const parsedInput = parsePermission(module);
    const requiredResource = parsedInput.resource;
    const requiredAction = action?.toLowerCase() || parsedInput.action;

    return user.permissions.some((permission) => {
      const parsedPermission = parsePermission(permission);
      if (parsedPermission.resource !== requiredResource) {
        return false;
      }

      if (!requiredAction) {
        return true;
      }

      if (!parsedPermission.action) {
        return true;
      }

      return parsedPermission.action === requiredAction || parsedPermission.action === 'manage';
    });
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading: status === 'loading', 
      login, 
      logout, 
      hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
