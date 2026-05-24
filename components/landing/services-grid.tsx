'use client';

import Link from 'next/link';
import { ArrowRight, Gamepad2, Monitor, Smartphone, Gamepad } from 'lucide-react';

const SERVICES = [
  {
    href: '/servicos/manutencao-ps5',
    title: 'Manutenção PS5',
    desc: 'HDMI, superaquecimento, disco, não liga. Diagnóstico grátis e garantia de 90 dias.',
    icon: Gamepad2,
    gradient: 'from-neon-blue/20 to-neon-purple/20',
  },
  {
    href: '/servicos/manutencao-xbox',
    title: 'Reparo Xbox',
    desc: 'Xbox Series X/S e One — HDMI, leitor, superaquecimento.',
    icon: Gamepad2,
    gradient: 'from-neon-purple/20 to-cta-gold/20',
  },
  {
    href: '/servicos/manutencao-nintendo-switch',
    title: 'Reparo Nintendo Switch',
    desc: 'Switch, Lite e OLED — tela, bateria, drift, não liga.',
    icon: Gamepad,
    gradient: 'from-cta-gold/20 to-neon-blue/20',
  },
  {
    href: '/servicos/montagem-pc-gamer',
    title: 'Montagem PC Gamer',
    desc: 'Consultoria, montagem e upgrade do seu computador gamer.',
    icon: Monitor,
    gradient: 'from-neon-blue/20 to-neon-purple/20',
  },
  {
    href: '/servicos/reparo-controle-drift',
    title: 'Reparo de Controle',
    desc: 'Drift em DualSense, Xbox e Joy-Con. Troca de analógicos com calibragem.',
    icon: Gamepad2,
    gradient: 'from-neon-purple/20 to-cta-gold/20',
  },
  {
    href: '/servicos/reparo-celular',
    title: 'Reparo de Celular',
    desc: 'Troca de tela, bateria e reparos em iPhone e Android.',
    icon: Smartphone,
    gradient: 'from-cta-gold/20 to-neon-blue/20',
  },
];

export function ServicesGrid() {
  return (
    <section id="servicos" className="py-16 sm:py-20 lg:py-24 bg-background border-b border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-neon-blue/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            NOSSOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">SERVIÇOS</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
            Diagnóstico gratuito, orçamento transparente e garantia de 90 dias em todos os reparos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 services-grid">
          {SERVICES.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group relative bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-2xl p-6 sm:p-8 hover:border-neon-blue/30 transition-all duration-500 hover:-translate-y-1 "
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500 pointer-events-none`} />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center mb-4 group-hover:bg-neon-blue/20 group-hover:border-neon-blue/40 transition-all duration-300">
                  <service.icon className="w-6 h-6 text-neon-blue" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-neon-blue transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {service.desc}
                </p>
                <span className="inline-flex items-center gap-1 text-neon-blue text-sm font-medium group-hover:gap-2 transition-all duration-300">
                  Saiba mais <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/servicos"
            className="inline-flex items-center gap-2 text-neon-blue hover:text-white font-medium transition-colors duration-300 text-sm border border-neon-blue/20 rounded-xl px-6 py-3 hover:bg-neon-blue/10"
          >
            Ver Todos os Serviços
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
