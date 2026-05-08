'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface TeamMember {
  id: string;
  nomeCompleto: string;
  cargoFuncao: string;
  descricaoPerfil: string | null;
  fotoUrl: string | null;
}

export function Team({ teamMembers }: { teamMembers?: TeamMember[] }) {
  const members = teamMembers && teamMembers.length > 0 ? teamMembers : [];

  if (members.length === 0) {
    return null;
  }

  return (
    <section id="equipe" className="py-16 sm:py-20 lg:py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="text-center mb-12 sm:mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-orbitron font-bold">
            NOSSA <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">EQUIPE</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
            Conheça os especialistas que cuidam do seu equipamento com a máxima dedicação e profissionalismo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {members.map((member) => (
            <Card key={member.id} className="bg-[rgba(255,255,255,0.02)] border border-white/5 hover:border-neon-blue/30 transition-all duration-500 group hover:shadow-[0_0_30px_rgba(0,212,255,0.05)] hover:-translate-y-1">
              <CardContent className="p-5 sm:p-6 text-center relative z-10">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-5">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                  <div className="absolute inset-0.5 rounded-full bg-background" />
                  <Image
                    src={member.fotoUrl || `https://ui-avatars.com/api/?name=${member.nomeCompleto}&background=0a0a0f&color=00d4ff&size=128`}
                    alt={member.nomeCompleto}
                    fill
                    className="object-cover rounded-full relative z-10 ring-2 ring-white/10 group-hover:ring-neon-blue/50 transition-all duration-500"
                    sizes="128px"
                  />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-neon-blue transition-colors duration-300">{member.nomeCompleto}</h3>
                  <p className="text-neon-blue text-xs sm:text-sm font-medium mb-2 sm:mb-3 uppercase tracking-wider">{member.cargoFuncao}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{member.descricaoPerfil}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
