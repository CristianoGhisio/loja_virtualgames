'use client';

import { Wrench, ShieldCheck, Headphones, Search } from 'lucide-react';

const BENEFITS = [
  {
    icon: Wrench,
    title: 'Técnicos Especializados em Santa Maria',
    description: 'Equipe técnica com anos de experiência em manutenção de consoles e PC Gamer em Santa Maria, RS.',
    color: 'text-neon-blue',
  },
  {
    icon: ShieldCheck,
    title: 'Garantia de Serviço',
    description: 'Todos os reparos em consoles e celulares contam com garantia de funcionamento e peças originais.',
    color: 'text-neon-purple',
  },
  {
    icon: Headphones,
    title: 'Atendimento Dedicado em Santa Maria',
    description: 'Suporte transparente em nossa loja, com explicações claras sobre o reparo do seu equipamento.',
    color: 'text-cta-gold',
  },
  {
    icon: Search,
    title: 'Acompanhamento Online da OS',
    description: 'Consulte o status do seu serviço de assistência técnica a qualquer momento pelo nosso site.',
    color: 'text-cta-orange',
  },
];

export function Benefits() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {BENEFITS.map((benefit, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl bg-card-bg border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors ${benefit.color}`}>
                <benefit.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
