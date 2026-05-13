'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

const SLIDES = [
  {
    id: 'manutencao',
    tag: 'Especialistas em Manutenção em Santa Maria',
    title1: 'RECUPERE O SEU',
    title2: 'EQUIPAMENTO',
    description: 'Assistência técnica especializada em PS5, Xbox, Switch e PC Gamer em Santa Maria, RS. Profissionalismo, rapidez e garantia total no seu reparo.',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2670&auto=format&fit=crop',
    buttons: [
      { text: 'SOLICITAR ORÇAMENTO', action: () => document.getElementById('servicos')?.scrollIntoView({ behavior: 'smooth' }), primary: true, icon: ChevronRight },
      { text: 'CONHEÇA A EQUIPE', action: () => document.getElementById('equipe')?.scrollIntoView({ behavior: 'smooth' }), primary: false }
    ]
  },
  {
    id: 'vendas',
    tag: 'Manutenção de Consoles em Santa Maria',
    title1: 'O SEU PRÓXIMO',
    title2: 'UPGRADE',
    description: 'Compra, venda e troca de consoles e PC Gamer. Encontre as melhores ofertas em Santa Maria e faça um excelente negócio.',
    image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?q=80&w=2670&auto=format&fit=crop',
    buttons: [
      { text: 'FALAR COM VENDAS', action: () => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' }), primary: true, icon: ChevronRight }
    ]
  },
  {
    id: 'colecionaveis',
    tag: 'Assistência Técnica em Santa Maria',
    title1: 'EXPANDA SUA',
    title2: 'COLEÇÃO',
    description: 'Action figures, edições limitadas e itens exclusivos para apaixonados por cultura geek e gamer em Santa Maria.',
    image: 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?q=80&w=2670&auto=format&fit=crop',
    buttons: [
      { text: 'VER COLECIONÁVEIS', action: () => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' }), primary: true, icon: ChevronRight }
    ]
  },
  {
    id: 'campeonatos',
    tag: 'PC Gamer em Santa Maria',
    title1: 'PARTICIPE DOS',
    title2: 'CAMPEONATOS',
    description: 'Mostre suas habilidades nos nossos torneios locais. Prêmios incríveis e muita diversão com a comunidade gamer de Santa Maria.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop',
    buttons: [
      { text: 'SABER MAIS', action: () => document.getElementById('campeonatos')?.scrollIntoView({ behavior: 'smooth' }), primary: true, icon: ChevronRight }
    ]
  }
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export function Hero() {
  const [[currentIndex, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const paginate = useCallback((newDirection: number) => {
    setPage(([prev]) => {
      const next = (prev + newDirection + SLIDES.length) % SLIDES.length;
      return [next, newDirection];
    });
  }, []);

  const goToSlide = useCallback((index: number) => {
    setPage(([prev]) => [index, index > prev ? 1 : -1]);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const id = setInterval(() => paginate(1), 5000);
    intervalRef.current = id;
    return () => clearInterval(id);
  }, [isHovered, paginate]);

  const currentSlide = SLIDES[currentIndex];

  return (
    <section
      className="relative h-dvh min-h-[600px] sm:min-h-[700px] flex items-center justify-center overflow-hidden bg-background"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-background/40 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20 z-10" />
            <div
              className="absolute inset-0 bg-cover bg-center opacity-50 sm:opacity-60 scale-105"
              style={{ backgroundImage: `url('${currentSlide.image})` }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.08),transparent_70%)] z-10" />
          </div>

          <div className="relative z-20 h-full flex items-center">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-3xl"
              >
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 rounded-full border border-neon-blue/30 bg-neon-blue/10 text-neon-blue font-bold tracking-widest text-xs sm:text-sm uppercase backdrop-blur-md"
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  {currentSlide.tag}
                </motion.span>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-4 sm:mb-6 leading-[1.1]">
                  {currentSlide.title1}{' '}
                  <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-[#00f5ff] to-neon-purple drop-shadow-[0_0_20px_rgba(0,212,255,0.3)]">
                    {currentSlide.title2}
                  </span>
                </h1>

                <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-xl mb-8 sm:mb-10 leading-relaxed">
                  {currentSlide.description}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  {currentSlide.buttons.map((btn, idx) => {
                    const Icon = btn.icon;
                    return (
                      <Button
                        key={idx}
                        variant={btn.primary ? 'primary' : 'outline'}
                        size={idx === 0 ? 'lg' : 'md'}
                        className={`w-full sm:w-auto ${
                          btn.primary
                            ? 'bg-neon-blue hover:bg-neon-blue-dark text-black font-bold shadow-[0_0_25px_rgba(0,212,255,0.3)] hover:shadow-[0_0_40px_rgba(0,212,255,0.5)] transition-all duration-300'
                            : 'border-neon-blue/40 text-neon-blue hover:bg-neon-blue/10 hover:border-neon-blue'
                        }`}
                        onClick={btn.action}
                      >
                        {btn.text} {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />}
                      </Button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute z-30 bottom-4 sm:bottom-8 left-0 right-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <button
          onClick={() => paginate(-1)}
          className="p-2 sm:p-3 rounded-full bg-black/50 border border-white/10 hover:bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-neon-blue/50"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 absolute left-1/2 -translate-x-1/2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`rounded-full transition-all duration-500 ${
                idx === currentIndex
                  ? 'bg-neon-blue w-6 sm:w-8 h-2 sm:h-2.5 shadow-[0_0_12px_rgba(0,212,255,0.8)]'
                  : 'bg-white/20 w-2 sm:w-2.5 h-2 sm:h-2.5 hover:bg-white/40'
              }`}
              aria-label={`Ir para slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => paginate(1)}
          className="p-2 sm:p-3 rounded-full bg-black/50 border border-white/10 hover:bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-neon-blue/50"
          aria-label="Próximo slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </section>
  );
}
