'use client';

import { useAuth } from '@/contexts/auth-context';
import { 
  LogOut, Bell, LayoutDashboard, ShoppingCart, Wrench, Users, UserCog,
  DollarSign, BarChart3, Settings, ShieldAlert, FolderOpen, Menu, X, Headset, ReceiptText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'atendimento', permission: 'atendimento', label: 'Atendimento', icon: Headset, href: '/dashboard/atendimento' },
  { id: 'customers', permission: 'customers', label: 'Clientes', icon: Users, href: '/dashboard/clientes' },
  { id: 'employees', permission: 'employees', label: 'Funcionários', icon: UserCog, href: '/dashboard/funcionarios' },
  { id: 'controle', permission: 'registers', label: 'Controle', icon: FolderOpen, href: '/dashboard/controle/produtos' },
  { id: 'sales', permission: 'sales', label: 'Vendas', icon: ShoppingCart, href: '/dashboard/vendas' },
  { id: 'os', permission: 'os', label: 'OS', icon: Wrench, href: '/dashboard/os' },
  { id: 'cash-daily', permission: 'cash-daily', label: 'Caixa Diário', icon: ReceiptText, href: '/dashboard/caixa-diario' },
  { id: 'financial', permission: 'financial', label: 'Financeiro', icon: DollarSign, href: '/dashboard/financeiro' },
  { id: 'reports', permission: 'reports', label: 'Relatórios', icon: BarChart3, href: '/dashboard/relatorios' },
  { id: 'admin', permission: 'admin', label: 'Admin', icon: ShieldAlert, href: '/dashboard/admin' },
  { id: 'settings', permission: 'settings', label: 'Config', icon: Settings, href: '/dashboard/configuracoes' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.02, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.15 } },
};

export function Topbar() {
  const { user, logout, hasPermission } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const displayName = user?.name?.trim() || 'Usuário';
  const displayRole = user?.role?.trim() || 'OPERADOR';
  const avatarUrl = user?.avatar?.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0a0a0f&color=00d4ff&size=128`;
  const isSvgAvatar = avatarUrl.includes('ui-avatars.com');

  const filteredItems = MENU_ITEMS.filter(item => hasPermission(item.permission ?? item.id));

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsMobileMenuOpen(false);
  }, []);

  return (
    <header
      className="sticky top-0 z-[var(--z-navbar)] bg-background-secondary/90 backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
      onKeyDown={handleKeyDown}
    >
      <div className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg shadow-[0_0_10px_rgba(0,212,255,0.2)]">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-orbitron text-base sm:text-lg font-bold tracking-wider text-white leading-none">
                VIRTUAL<span className="text-neon-blue">GAMES</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider leading-none mt-0.5">
                ERP System v2.4
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cta-orange rounded-full animate-pulse" />
          </button>

          <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4 border-l border-[rgba(255,255,255,0.06)]">
            <div className="hidden sm:block text-right">
              <p className="text-xs sm:text-sm font-bold text-white leading-tight">{displayName}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wider leading-tight">{displayRole}</p>
            </div>

            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden ring-2 ring-[rgba(255,255,255,0.06)]">
              <Image
                src={avatarUrl}
                alt="Avatar do usuário"
                fill
                sizes="36px"
                unoptimized={isSvgAvatar}
                className="object-cover"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg h-8 w-8 sm:h-9 sm:w-9 p-0"
              aria-label="Sair"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </div>

      <nav className="hidden lg:flex h-10 sm:h-11 border-t border-[rgba(255,255,255,0.04)] items-center justify-center px-4 overflow-x-auto no-scrollbar bg-background-secondary/50">
        <div className="flex items-center gap-0.5 max-w-7xl w-full">
          {filteredItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap text-xs
                  ${isActive
                    ? 'bg-neon-blue/10 text-neon-blue font-bold shadow-[0_0_8px_rgba(0,212,255,0.1)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-neon-blue' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="lg:hidden fixed top-14 left-0 right-0 bottom-0 bg-background/98 backdrop-blur-2xl border-t border-[rgba(255,255,255,0.06)] p-4 sm:p-6 flex flex-col gap-1 overflow-y-auto z-50"
          >
            {filteredItems.map(item => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <motion.div key={item.id} variants={itemVariants}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm
                      ${isActive
                        ? 'bg-neon-blue/10 text-white border border-neon-blue/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-neon-blue' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}

            <motion.div variants={itemVariants} className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-2 ring-[rgba(255,255,255,0.06)]">
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    fill
                    sizes="32px"
                    unoptimized={isSvgAvatar}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{displayName}</p>
                  <p className="text-xs text-gray-400">{displayRole}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
