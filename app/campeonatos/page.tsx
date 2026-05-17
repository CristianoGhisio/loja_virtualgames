import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

export const metadata: Metadata = {
  title: "Campeonatos de Games em Santa Maria | Virtual Games",
  description: "Participe dos campeonatos de games da Virtual Games em Santa Maria. Torneios de PS5, Xbox e PC Gamer. Inscrições abertas!",
  alternates: { canonical: `${siteUrl}/campeonatos` },
};

export default function CampeonatosPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12 sm:py-16 lg:py-20">
        <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Campeonatos" }]} />
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-4">
          Campeonatos de Games em Santa Maria — Virtual Games
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          Mostre suas habilidades nos torneios da comunidade gamer de Santa Maria. Premiações, diversão e muito gameplay.
        </p>

        <div className="space-y-6">
          {[
            { game: "EA Sports FC 25", date: "Em breve — datas a confirmar", prize: "Premiação em produtos e vale-compras", desc: "Torneio presencial de FIFA/EA FC. Modo mata-mata, partidas de 6 minutos.", icon: "⚽" },
            { game: "Street Fighter 6", date: "Em breve — datas a confirmar", prize: "Troféu + premiação surpresa", desc: "Torneio de luta no formato dupla eliminação. Traga seu controle!", icon: "🥊" },
            { game: "Free Fire", date: "Em breve — datas a confirmar", prize: "Diamantes + produtos gamers", desc: "Torneio online de Free Fire. Squads ou solo. Aberto a todos os ranks.", icon: "🔥" },
          ].map((event) => (
            <div key={event.game} className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-6 hover:border-neon-blue/20 transition-all duration-300">
              <div className="flex items-start gap-4 flex-wrap">
                <span className="text-3xl">{event.icon}</span>
                <div className="flex-1">
                  <h2 className="text-white font-bold text-xl mb-2">{event.game}</h2>
                  <p className="text-gray-400 text-sm mb-1">{event.date}</p>
                  <p className="text-neon-blue text-sm font-medium mb-2">{event.prize}</p>
                  <p className="text-gray-400 text-sm">{event.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 pt-8 border-t border-white/5">
          <p className="text-gray-400 mb-4">Quer participar do próximo campeonato?</p>
          <a
            href="https://wa.me/55997252786?text=Olá!%20Quero%20me%20inscrever%20no%20campeonato!"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" /></svg>
            QUERO PARTICIPAR
          </a>
        </div>
      </div>
    </main>
  );
}
