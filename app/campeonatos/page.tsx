import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Trophy, Users, Gamepad2, MapPin, ArrowRight, Award, Star, Flag } from "lucide-react";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

export const metadata: Metadata = {
  title: "Campeonatos de Games em Santa Maria | Virtual Games",
  description: "Fique por dentro dos maiores campeonatos de games do Brasil e do mundo. Resultados, campeões e próximos torneios. Participe dos torneios da Virtual Games!",
  alternates: { canonical: `${siteUrl}/campeonatos` },
  openGraph: {
    title: "Campeonatos de Games em Santa Maria | Virtual Games",
    description: "Fique por dentro dos maiores campeonatos de games do Brasil e do mundo.",
    url: `${siteUrl}/campeonatos`,
    siteName: "Virtual Games",
    locale: "pt_BR",
  },
};

const CAMPEOES_BRASIL = [
  { torneio: "IEM Chengdu 2025 (CS2)", campeao: "FURIA", vice: "Vitality", data: "Novembro de 2025", premio: "US$ 100 mil", bandeira: "br", desc: "A FURIA aplicou um sonoro 3 a 0 na poderosa Vitality e conquistou o título mais importante de sua trajetória recente na China." },
  { torneio: "Thunderpick World Championship 2025 (CS2)", campeao: "FURIA", vice: "Na'Vi", data: "Outubro de 2025", premio: "US$ 150 mil", bandeira: "br", desc: "Reverse sweep histórico! A FURIA devolveu de 0 a 2 para 3 a 2 contra a Na'Vi em Malta, em uma das maiores viradas do ano." },
  { torneio: "FISSURE Playground 2 (CS2)", campeao: "FURIA", vice: "The MongolZ", data: "Setembro de 2025", premio: "US$ 80 mil", bandeira: "br", desc: "A FURIA recolocou o Brasil no caminho das conquistas após vencer final suada contra The MongolZ por 3 a 2." },
  { torneio: "BLAST Rivals Hong Kong 2025 (CS2)", campeao: "FURIA", vice: "Team Falcons", data: "Novembro de 2025", premio: "US$ 100 mil", bandeira: "br", desc: "Fechando o ano em alta, a FURIA superou a Team Falcons por 3 a 1 e conquistou seu quarto título internacional em 2025." },
  { torneio: "CS2 Asia Championship 2025", campeao: "Legacy", vice: "3DMAX", data: "Outubro de 2025", premio: "US$ 50 mil", bandeira: "br", desc: "A Legacy conquistou o primeiro título internacional da organização ao vencer a 3DMAX por 3 a 2 em Xangai." },
  { torneio: "Valorant Game Changers Championship 2025", campeao: "Team Liquid (BR)", vice: "Shopify Rebellion", data: "Novembro de 2025", premio: "US$ 180 mil", bandeira: "br", desc: "A Team Liquid venceu a Shopify Rebellion por 3 a 2 em Seul, conquistando o primeiro título mundial da organização no circuito inclusivo." },
  { torneio: "PUBG Mobile Global Championship 2025", campeao: "Alpha7 Esports", vice: "Alpha Gaming", data: "Dezembro de 2025", premio: "US$ 600 mil", bandeira: "br", desc: "A Alpha7 Esports sagrou-se campeã mundial de PUBG Mobile em Bangkok, com 142 pontos totais e dois Chicken Dinners." },
  { torneio: "Six Invitational 2025 (Rainbow Six)", campeao: "FaZe Clan", vice: "Team BDS", data: "Fevereiro de 2025", premio: "US$ 200 mil", bandeira: "br", desc: "A FaZe Clan conquistou o Six Invitational, principal campeonato de Rainbow Six, ao vencer a Team BDS por 3 a 1 na grande final." },
  { torneio: "CBCS Masters Xeque Mate (CS2)", campeao: "Sharks", vice: "Keyd Stars", data: "Novembro de 2025", premio: "R$ 100 mil", bandeira: "br", desc: "A Sharks levantou a taça no Rio de Janeiro com uma vitória dominante sobre a Keyd Stars por 3 a 0, levando o título do circuito brasileiro." },
];

const CAMPEOES_MUNDIAIS = [
  { torneio: "Esports World Cup 2025 (CS2)", campeao: "The MongolZ", data: "Agosto de 2025", premio: "US$ 400 mil", desc: "O maior evento de esports do mundo, com US$ 70 milhões em premiação total. The MongolZ surpreendeu o mundo ao vencer a Aurora Gaming na final." },
  { torneio: "Esports World Cup 2025 (League of Legends)", campeao: "Gen.G", data: "Julho de 2025", premio: "US$ 500 mil", desc: "A Gen.G conquistou mais um título internacional, mostrando a força do cenário coreano de League of Legends." },
  { torneio: "Esports World Cup 2025 (DOTA 2)", campeao: "Team Spirit", data: "Julho de 2025", premio: "US$ 1 milhão", desc: "A Team Spirit venceu a Team Falcons por 3 a 0 sem perder um mapa sequer nos playoffs." },
  { torneio: "Esports World Cup 2025 (Valorant)", campeao: "Team Heretics", data: "Julho de 2025", premio: "US$ 500 mil", desc: "Reverse sweep histórica: Team Heretics devolveu de 0 a 2 para 3 a 2 contra a Fnatic na grande final." },
  { torneio: "Esports World Cup 2025 (Free Fire)", campeao: "EVOS Divine", data: "Julho de 2025", premio: "US$ 300 mil", desc: "A indonésia EVOS Divine venceu em 10 partidas emocionantes, superando RRQ Kazu na final." },
  { torneio: "Esports World Cup 2025 (EA Sports FC 25)", campeao: "Team Liquid (ManuBachoore)", data: "Agosto de 2025", premio: "US$ 300 mil", desc: "ManuBachoore levou o título de EA FC 25 para a Team Liquid em uma final emocionante contra a Team Vitality." },
  { torneio: "Esports World Cup 2025 (Chess)", campeao: "Team Liquid (Magnus Carlsen)", data: "Agosto de 2025", premio: "US$ 300 mil", desc: "O lendário Magnus Carlsen conquistou o primeiro título de xadrez da história da Esports World Cup." },
  { torneio: "Esports World Cup 2025 (Tekken 8)", campeao: "DN Freecs (ULSAN)", data: "Agosto de 2025", premio: "US$ 300 mil", desc: "ULSAN, da DN Freecs, venceu o torneio de Tekken 8 em uma final acirrada contra LOWHIGH." },
  { torneio: "League of Legends Worlds 2025", campeao: "T1 (Coreia do Sul)", data: "Outubro de 2025", premio: "US$ 500 mil", desc: "A T1 conquistou mais um título mundial de League of Legends, consolidando seu legado como a maior organização da história do LoL." },
  { torneio: "The International 2025 (DOTA 2)", campeao: "Team Falcons", data: "Setembro de 2025", premio: "US$ 1,5 milhão", desc: "A Team Falcons venceu o maior torneio de DOTA 2 do mundo, levando a premiação máxima." },
];

const PROXIMOS_TORNEIOS_VG = [
  { game: "EA Sports FC 26", data: "Em breve", desc: "Torneio presencial na loja. Modo mata-mata. Inscrições gratuitas. Premiação em produtos e vale-compras.", icon: "⚽" },
  { game: "Street Fighter 6", data: "Em breve", desc: "Torneio de luta no formato dupla eliminação. Traga seu controle ou use os da loja. Premiação: troféu + produtos gamers.", icon: "🥊" },
  { game: "Free Fire", data: "Em breve", desc: "Torneio online. Squads ou solo. Aberto a todos os ranks. Premiação em diamantes e produtos gamers.", icon: "🔥" },
];

export default function CampeonatosPage() {
  return (
    <main id="main-content" className="min-h-screen text-foreground">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-12 sm:py-16 lg:py-20">
        <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Campeonatos" }]} />

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-neon-blue/10 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-neon-blue" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Campeonatos de Games em <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Santa Maria</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
            A Virtual Games acompanha o cenário competitivo de perto. Confira os resultados dos maiores torneios do Brasil e do mundo e participe dos nossos torneios locais.
          </p>
        </div>

        <div className="grid sm:grid-cols-4 gap-4 mb-12">
          <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-5 text-center">
            <Award className="w-8 h-8 text-neon-blue mx-auto mb-3" />
            <p className="text-white font-bold text-2xl">9</p>
            <p className="text-gray-400 text-sm">títulos brasileiros em 2025</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-5 text-center">
            <Trophy className="w-8 h-8 text-neon-blue mx-auto mb-3" />
            <p className="text-white font-bold text-2xl">+25</p>
            <p className="text-gray-400 text-sm">torneios mundiais</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-5 text-center">
            <Flag className="w-8 h-8 text-neon-blue mx-auto mb-3" />
            <p className="text-white font-bold text-2xl">FURIA</p>
            <p className="text-gray-400 text-sm">4 títulos em 2025</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-5 text-center">
            <Users className="w-8 h-8 text-neon-blue mx-auto mb-3" />
            <p className="text-white font-bold text-2xl">+50</p>
            <p className="text-gray-400 text-sm">jogadores por torneio VG</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Star className="w-6 h-6 text-neon-blue" />
            Brasil no Topo: Títulos Brasileiros em 2025
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            O Brasil viveu um ano histórico nos esports em 2025, com <strong className="text-white">nove títulos internacionais</strong> conquistados em jogos de tiro (FPS), além de vitórias em PUBG Mobile, Valorant e Rainbow Six. A FURIA foi o grande destaque com quatro títulos de CS2.
          </p>

          <div className="space-y-3">
            {CAMPEOES_BRASIL.map((event) => (
              <div key={event.torneio} className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-5 hover:border-neon-blue/20 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0 mt-1" title="Brasil">🇧🇷</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                      <h3 className="text-white font-bold text-base">{event.torneio}</h3>
                      <span className="text-neon-blue text-xs font-medium whitespace-nowrap">{event.data}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <span className="text-gray-300">Campeão: <strong className="text-white">{event.campeao}</strong></span>
                      <span className="text-gray-400">Vice: {event.vice}</span>
                      <span className="text-gray-400">{event.premio}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{event.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Award className="w-6 h-6 text-neon-blue" />
            Grandes Torneios Mundiais 2025
          </h2>
          <p className="text-gray-400 mb-6 text-sm">
            O cenário competitivo global foi marcado pela Esports World Cup 2025, realizada em Riad, na Arábia Saudita, que distribuiu US$ 70 milhões em premiações em mais de 20 modalidades. Confira os principais resultados:
          </p>

          <div className="space-y-3">
            {CAMPEOES_MUNDIAIS.map((event) => (
              <div key={event.torneio} className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-5 hover:border-neon-blue/20 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0 mt-1">🌍</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                      <h3 className="text-white font-bold text-base">{event.torneio}</h3>
                      <span className="text-neon-blue text-xs font-medium whitespace-nowrap">{event.data}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <span className="text-gray-300">Campeão: <strong className="text-white">{event.campeao}</strong></span>
                      <span className="text-gray-400">{event.premio}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{event.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-neon-blue/5 to-neon-purple/5 border border-neon-blue/20 rounded-2xl p-8 sm:p-10 mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <Gamepad2 className="w-7 h-7 text-neon-blue" />
              Torneios na Virtual Games
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Quer jogar com a galera? A Virtual Games promove torneios presenciais e online para a comunidade gamer de Santa Maria. Fique ligado nas próximas edições!
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {PROXIMOS_TORNEIOS_VG.map((event) => (
              <div key={event.game} className="bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-xl p-5 text-center hover:border-neon-blue/30 transition-all duration-300">
                <span className="text-4xl block mb-3">{event.icon}</span>
                <h3 className="text-white font-bold text-lg mb-1">{event.game}</h3>
                <p className="text-neon-blue text-sm font-medium mb-2">{event.data}</p>
                <p className="text-gray-400 text-sm">{event.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://wa.me/55997252786?text=Olá!%20Quero%20saber%20mais%20sobre%20os%20campeonatos%20da%20Virtual%20Games!"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" /></svg>
              QUERO PARTICIPAR
            </a>
          </div>
        </div>

        <div className="text-center border-t border-white/5 pt-8">
          <p className="text-gray-400 text-sm mb-4">Acompanhe a Virtual Games para ficar por dentro dos próximos torneios e eventos.</p>
          <Link
            href="/contato"
            className="inline-flex items-center justify-center gap-2 text-neon-blue hover:text-white font-medium transition-colors duration-300 py-3 px-6 rounded-xl border border-neon-blue/20 hover:bg-neon-blue/10"
          >
            <MapPin className="w-4 h-4" />
            Como Chegar na Loja
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
