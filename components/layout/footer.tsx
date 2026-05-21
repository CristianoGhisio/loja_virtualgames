'use client';

import Link from 'next/link';
import { Gamepad2, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

type StoreContactSettings = {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

export function Footer({ settings }: { settings?: StoreContactSettings | null }) {
  return (
    <footer className="bg-[#0d0d14] border-t border-white/5 pt-16 sm:pt-20 pb-8 sm:pb-10">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12 sm:mb-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl shadow-[0_0_15px_rgba(0,212,255,0.2)]">
                <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="font-orbitron text-xl sm:text-2xl font-bold tracking-wider text-white">
                VIRTUAL<span className="text-neon-blue">GAMES</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Assistência Técnica Gamer em Santa Maria, RS. Especialistas em PS5, Xbox, Nintendo Switch e PC Gamer.
            </p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/virtual.gamess/?hl=pt" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-neon-purple hover:text-white transition-all duration-300 hover:scale-110" aria-label="Instagram">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="https://www.youtube.com/@Virtual.gamessm" target="_blank" rel="noopener noreferrer" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-300 hover:scale-110" aria-label="Youtube">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-orbitron font-bold text-white mb-5 sm:mb-6 text-sm sm:text-base">Navegação</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li><Link href="/" className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm">Início</Link></li>
              <li><Link href="/sobre" className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm">Sobre</Link></li>
              <li><Link href="/servicos" className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm">Serviços</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm">Blog</Link></li>
              <li><Link href="/contato" className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm">Contato</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-orbitron font-bold text-white mb-5 sm:mb-6 text-sm sm:text-base">Serviços</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li><Link href="/servicos/manutencao-ps5" className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm">Manutenção PS5</Link></li>
              <li><Link href="/servicos/manutencao-xbox" className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm">Reparo Xbox</Link></li>
              <li><Link href="/servicos/montagem-pc-gamer" className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm">Montagem PC Gamer</Link></li>
              <li><Link href="/acompanhar-reparo" className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm">Acompanhar Reparo</Link></li>
              <li><Link href="/garantia" className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm">Garantia</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-orbitron font-bold text-white mb-5 sm:mb-6 text-sm sm:text-base">Jurídico</h4>
            <ul className="space-y-3 sm:space-y-4">
              <li><Link href="/termos" className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm">Termos de Serviço</Link></li>
              <li><Link href="/privacidade" className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm">Privacidade</Link></li>
            </ul>
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-neon-blue shrink-0 mt-0.5" />
                <span className="text-xs whitespace-pre-line">{settings?.address?.split(' - CEP').join('\nCEP') || 'Rua Venâncio Aires, 1434\nTorre Divindade, Sala 106 D-2\nSanta Maria, RS — CEP 97010-002'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-neon-blue shrink-0" />
                <span className="text-xs">{settings?.phone || '(55) 99725-2786'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-neon-blue shrink-0" />
                <span className="text-xs">{settings?.email || 'contato@virtualgames.com'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
          <p>&copy; {new Date().getFullYear()} Virtual Games. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
