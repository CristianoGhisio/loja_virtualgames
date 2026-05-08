'use client';

import { Quote, Star } from 'lucide-react';
import Image from 'next/image';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Carlos "Kratos" Silva',
    role: 'Cliente de Reparo (PS5)',
    content: 'Meu PS5 parou de dar vídeo. Levei em várias assistências e não resolveram. A equipe da Virtual Games resolveu o problema na placa em 2 dias. Atendimento sensacional!',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Ana "Jinx" Souza',
    role: 'Cliente de Manutenção (PC Gamer)',
    content: 'Fiz a limpeza preventiva e troca de pasta térmica do meu PC com eles. A temperatura baixou 15 graus e o desempenho melhorou muito. Profissionais de verdade.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Pedro Oliveira',
    role: 'Cliente de Reparo (Controle)',
    content: 'Meus controles estavam com drift severo. A troca dos analógicos foi feita com peças de alta qualidade e ficaram como novos. Recomendo demais!',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background-secondary/50 border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,212,255,0.04),transparent_60%)] pointer-events-none" />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            CLIENTES <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">SATISFEITOS</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
            Veja o que dizem os clientes que confiaram seus equipamentos à nossa equipe técnica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group relative bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] p-6 sm:p-8 rounded-2xl hover:border-neon-blue/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,212,255,0.06)] hover:-translate-y-1"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-white/[0.03] group-hover:text-neon-blue/5 transition-colors duration-500" />

              <div className="flex items-center gap-4 mb-5">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2 ring-neon-blue/30 group-hover:ring-neon-blue/60 transition-all duration-500">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm sm:text-base">{testimonial.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-neon-blue fill-neon-blue/80" />
                ))}
              </div>

              <p className="text-gray-300 italic leading-relaxed text-sm sm:text-base">
                &ldquo;{testimonial.content}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
