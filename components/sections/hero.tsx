'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Flash {
  id: number;
  x: number;
  y: number;
  size: number;
}

const QUADRANTS = [
  { xMin: 5, xMax: 30, yMin: 2, yMax: 25 },
  { xMin: 5, xMax: 30, yMin: 25, yMax: 50 },
  { xMin: 70, xMax: 95, yMin: 2, yMax: 25 },
  { xMin: 70, xMax: 95, yMin: 25, yMax: 50 },
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateFlash(id: number): Flash {
  const quadrant = QUADRANTS[Math.floor(Math.random() * QUADRANTS.length)];
  return {
    id,
    x: randomBetween(quadrant.xMin, quadrant.xMax),
    y: randomBetween(quadrant.yMin, quadrant.yMax),
    size: randomBetween(8, 20),
  };
}

let nextId = 0;

export function Hero() {
  const [flashes, setFlashes] = useState<Flash[]>([]);

  const scheduleFlash = useCallback(() => {
    const delay = randomBetween(800, 3500);
    return setTimeout(() => {
      const newFlash = generateFlash(nextId++);
      setFlashes((prev) => [...prev.slice(-3), newFlash]);
      scheduleFlash();
    }, delay);
  }, []);

  useEffect(() => {
    const timer = scheduleFlash();
    return () => clearTimeout(timer);
  }, [scheduleFlash]);

  return (
    <section className="relative h-dvh min-h-[600px] sm:min-h-[700px] flex items-center justify-center overflow-hidden">
      <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-orbitron text-white text-center px-4 max-w-5xl leading-tight z-10">
        Assistência Técnica Gamer{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
          em Santa Maria
        </span>
      </h1>
      <h2 className="sr-only">
        Virtual Games — Manutenção de PS5, Xbox, Nintendo Switch, PC Gamer e Celulares. Consertos, reparos e acessórios.
      </h2>

      <div
        className="absolute inset-0 -z-10"
        style={{ backgroundImage: 'url(/hero-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.08),transparent_70%)]" />

      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {flashes.map((flash) => (
            <motion.div
              key={flash.id}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: [0, 0.9, 0.6, 0], scale: [0.3, 1.8, 1.2, 0.5] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute rounded-full bg-white"
              style={{
                left: `${flash.x}%`,
                top: `${flash.y}%`,
                width: `${flash.size}px`,
                height: `${flash.size}px`,
                boxShadow: `0 0 ${flash.size * 3}px ${flash.size * 1.5}px rgba(255,255,255,0.5), 0 0 ${flash.size * 6}px ${flash.size * 3}px rgba(255,255,255,0.2)`,
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-20 h-full flex flex-col pt-16 sm:pt-20">
        <div className="flex-1">
        </div>

        <div className="pb-8 sm:pb-10 flex justify-center">
          <button
            onClick={() => {
              window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
            }}
            aria-label="Rolar para ver mais conteúdo"
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-neon-blue transition-colors duration-300 group"
          >
            <span className="text-xs font-medium tracking-widest uppercase">Role para baixo</span>
            <ChevronDown className="w-5 h-5 animate-bounce group-hover:text-neon-blue transition-colors duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
}
