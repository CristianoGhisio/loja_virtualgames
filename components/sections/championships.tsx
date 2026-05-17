'use client';

import { Trophy, Medal, Swords, Target } from 'lucide-react';

const CURIOSITIES = [
  {
    id: 1,
    title: 'O Primeiro Torneio de eSports',
    description: 'Acredita-se que o primeiro torneio de eSports aconteceu em 1972, na Universidade de Stanford, com o jogo Spacewar. O grande prêmio? Uma assinatura de um ano da revista Rolling Stone!',
    icon: Trophy,
  },
  {
    id: 2,
    title: 'Audiência Gigante',
    description: 'Hoje, os maiores torneios de eSports atraem mais espectadores simultâneos do que grandes eventos esportivos tradicionais, como a final da NBA ou o Super Bowl.',
    icon: Target,
  },
  {
    id: 3,
    title: 'Preparação de Atleta',
    description: 'Jogadores profissionais treinam até 14 horas por dia. Além do jogo em si, eles têm acompanhamento com nutricionistas, psicólogos e preparadores físicos para manter o alto nível.',
    icon: Swords,
  },
];

export function Championships() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background border-b border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-neon-blue/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center p-2.5 sm:p-3 bg-neon-blue/10 rounded-full mb-4">
            <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-neon-blue" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            O MUNDO DOS <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">eSPORTS</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
            Os torneios de videogames deixaram de ser apenas brincadeira e se tornaram eventos gigantescos. Confira algumas curiosidades desse universo incrível.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="relative h-[300px] sm:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,212,255,0.1)] group">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/30 via-neon-purple/20 to-background flex items-center justify-center">
              <Trophy className="w-20 h-20 sm:w-28 sm:h-28 text-neon-blue/40" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
              <span className="text-white/80 text-sm font-bold bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                Arena Virtual Games
              </span>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {CURIOSITIES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex gap-4 sm:gap-5 group">
                  <div className="shrink-0 mt-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[rgba(255,255,255,0.03)] border border-white/10 flex items-center justify-center shadow-lg group-hover:border-neon-blue/30 group-hover:bg-neon-blue/5 transition-all duration-300">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-neon-blue" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 sm:mb-2">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
