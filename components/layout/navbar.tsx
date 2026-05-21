'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Gamepad2, Menu, X, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const SERVICES_LINKS = [
  { href: '/servicos/manutencao-ps5', label: 'Manutenção PS5' },
  { href: '/servicos/manutencao-xbox', label: 'Reparo Xbox' },
  { href: '/servicos/manutencao-nintendo-switch', label: 'Reparo Switch' },
  { href: '/servicos/montagem-pc-gamer', label: 'Montagem PC Gamer' },
  { href: '/servicos/reparo-controle-drift', label: 'Reparo de Controle' },
  { href: '/servicos/reparo-celular', label: 'Reparo Celular' },
  { href: '/servicos/limpeza-preventiva', label: 'Limpeza Preventiva' },
  { href: '/servicos/reparo-hdmi-ps5', label: 'Reparo HDMI PS5' },
  { href: '/servicos/upgrade-ssd-ps5', label: 'Upgrade SSD PS5' },
];

const TOP_LINKS = [
  { href: '/sobre', label: 'Sobre' },
  { href: '/campeonatos', label: 'Campeonatos' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contato', label: 'Contato' },
];

const ALL_NAV_LINKS = [
  { href: '/sobre', label: 'Sobre' },
  { href: '/servicos', label: 'Serviços', hasDropdown: true },
  { href: '/campeonatos', label: 'Campeonatos' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contato', label: 'Contato' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const mobileMenu = mobileMenuRef.current;
    if (!mobileMenu) return;

    const focusableElements = mobileMenu.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstFocusable?.focus();

    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[var(--z-navbar)] transition-all duration-500 ${
        isScrolled
          ? 'bg-[rgba(10,10,15,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)] shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl h-16 sm:h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.4 }}
            className="p-1.5 sm:p-2 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl shadow-neon-blue-sm"
          >
            <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </motion.div>
          <span className="font-orbitron text-lg sm:text-xl lg:text-2xl font-bold tracking-wider text-white">
            VIRTUAL<span className="text-neon-blue">GAMES</span>
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden md:flex items-center gap-1">
          {ALL_NAV_LINKS.map((link) =>
            link.hasDropdown ? (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => setIsServicesOpen(true)}
                onMouseLeave={() => setIsServicesOpen(false)}
              >
                <Link
                  href={link.href}
                  aria-haspopup="true"
                  aria-expanded={isServicesOpen}
                  className="relative flex items-center gap-1 px-4 py-2 text-sm lg:text-base text-gray-400 hover:text-neon-blue transition-colors duration-300 font-medium group"
                >
                  {link.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-neon-blue transition-all duration-300 group-hover:w-3/4 rounded-full" />
                </Link>
                {isServicesOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-[rgba(10,10,15,0.97)] backdrop-blur-xl border border-white/10 rounded-xl shadow-lg py-2 z-50">
                    {SERVICES_LINKS.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        className="block px-4 py-2.5 text-sm text-gray-400 hover:text-neon-blue hover:bg-white/5 transition-colors"
                      >
                        {s.label}
                      </Link>
                    ))}
                    <div className="border-t border-white/5 mt-1 pt-1">
                      <Link
                        href="/servicos"
                        className="block px-4 py-2.5 text-sm text-neon-blue hover:text-neon-blue-dark transition-colors font-medium"
                      >
                        Ver Todos os Serviços →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm lg:text-base text-gray-400 hover:text-neon-blue transition-colors duration-300 font-medium group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-neon-blue transition-all duration-300 group-hover:w-3/4 rounded-full" />
              </Link>
            )
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/acompanhar-reparo">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300 text-sm"
            >
              <Search className="w-4 h-4 mr-1.5" />
              Acompanhar Reparo
            </Button>
          </Link>
          <a
            href="https://wa.me/55997252786?text=Olá!%20Gostaria%20de%20um%20orçamento."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-4 py-2 rounded-xl text-sm transition-all duration-300 hover:scale-105 shadow-whatsapp hover:shadow-whatsapp-hover"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
            </svg>
            Solicitar Orçamento
          </a>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden relative w-10 h-10 flex items-center justify-center text-white"
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <motion.div
            animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            data-mobile-menu
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden fixed top-16 left-0 right-0 bottom-0 bg-[rgba(10,10,15,0.97)] backdrop-blur-2xl border-t border-[rgba(255,255,255,0.06)] p-6 flex flex-col gap-2 overflow-y-auto"
          >
            {TOP_LINKS.map((link) => (
              <motion.div key={link.href} variants={itemVariants}>
                <Link
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-4 text-lg text-gray-300 hover:text-neon-blue hover:bg-white/5 rounded-xl transition-all duration-300 font-medium"
                >
                  {link.label}
                  <ChevronDown className="w-4 h-4 text-gray-600 rotate-[-90deg]" />
                </Link>
              </motion.div>
            ))}

            <motion.div variants={itemVariants}>
              <Link
                href="/servicos"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-4 text-lg text-neon-blue hover:text-neon-blue-dark hover:bg-white/5 rounded-xl transition-all duration-300 font-medium border border-neon-blue/20"
              >
                Serviços
                <ChevronDown className="w-4 h-4 text-neon-blue rotate-[-90deg]" />
              </Link>
            </motion.div>
            <div className="pl-4 space-y-1 border-l border-neon-blue/20 ml-4">
              {SERVICES_LINKS.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-400 hover:text-neon-blue hover:bg-white/5 rounded-lg transition-all duration-300"
                >
                  {s.label}
                </Link>
              ))}
            </div>

            <motion.div variants={itemVariants} className="mt-auto pt-6 border-t border-white/10 space-y-3">
              <Link href="/acompanhar-reparo" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium py-6 text-base border border-white/10">
                  <Search className="w-5 h-5 mr-2" />
                  Acompanhar Reparo
                </Button>
              </Link>
              <a
                href="https://wa.me/55997252786?text=Olá!%20Gostaria%20de%20um%20orçamento."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl text-base transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                </svg>
                Solicitar Orçamento
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
