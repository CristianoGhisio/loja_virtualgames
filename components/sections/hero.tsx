import { Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative h-dvh min-h-[600px] sm:min-h-[700px] flex items-center justify-center overflow-hidden">
      <h1 className="sr-only">
        Assistência Técnica Gamer em Santa Maria | Virtual Games — Manutenção de PS5, Xbox, Nintendo Switch, PC Gamer e Celulares. Consertos, reparos e acessórios.
      </h1>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.08),transparent_70%)]" />

      <div className="relative z-20 h-full flex items-center pt-16 sm:pt-20">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
          <div className="max-w-5xl">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 rounded-full border border-neon-blue/30 bg-neon-blue/10 text-neon-blue font-bold tracking-widest text-xs sm:text-sm uppercase backdrop-blur-md">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              O centro gamer de Santa Maria
            </span>

            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-4 sm:mb-6 leading-[1.1]">
              <span className="sm:hidden">
                TUDO NUM SÓ LUGAR
              </span>
              <span className="hidden sm:inline">
                TUDO QUE O GAMER{' '}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-[#00f5ff] to-neon-purple drop-shadow-[0_0_20px_rgba(0,212,255,0.3)]">
                  PRECISA, NUM SÓ LUGAR
                </span>
              </span>
            </div>

            <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed">
              Consoles novos e usados, reparo especializado, acessórios, dicas, torneios. A Virtual Games é mais que assistência técnica — é o ponto de encontro de quem vive o game em Santa Maria, RS.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
