import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

const services = [
  { slug: "manutencao-ps5", title: "Manutenção de PS5", desc: "Reparo especializado em PlayStation 5 — HDMI, superaquecimento, disco, não liga", icon: "🎮" },
  { slug: "manutencao-xbox", title: "Reparo de Xbox", desc: "Xbox Series X/S e Xbox One — HDMI, leitor, superaquecimento", icon: "🎯" },
  { slug: "manutencao-nintendo-switch", title: "Reparo Nintendo Switch", desc: "Switch, Lite e OLED — tela, bateria, drift, não liga", icon: "🕹️" },
  { slug: "montagem-pc-gamer", title: "Montagem PC Gamer", desc: "Consultoria, montagem e upgrade de computador gamer", icon: "💻" },
  { slug: "reparo-controle-drift", title: "Reparo de Controle (Drift)", desc: "Conserto de drift em DualSense, Xbox e Joy-Con", icon: "🎛️" },
  { slug: "reparo-celular", title: "Reparo de Celular", desc: "Troca de tela, bateria e reparos em iPhone e Android", icon: "📱" },
  { slug: "limpeza-preventiva", title: "Limpeza Preventiva", desc: "Limpeza interna, troca de pasta térmica para consoles e PC", icon: "🧹" },
  { slug: "reparo-hdmi-ps5", title: "Reparo HDMI PS5", desc: "Troca da porta HDMI do PS5 com solda de precisão", icon: "🔌" },
  { slug: "upgrade-ssd-ps5", title: "Upgrade SSD PS5", desc: "Instalação e configuração de SSD NVMe no PlayStation 5", icon: "💾" },
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

export const metadata: Metadata = {
  title: "Serviços de Assistência Técnica Gamer em Santa Maria",
  description: "Conheça todos os serviços da Virtual Games em Santa Maria: manutenção de PS5, Xbox, Switch, montagem PC Gamer, reparo de controle, celular e mais.",
  alternates: { canonical: `${siteUrl}/servicos` },
  openGraph: {
    title: "Serviços de Assistência Técnica Gamer em Santa Maria",
    description: "Conheça todos os serviços da Virtual Games em Santa Maria: manutenção de consoles, PC Gamer e celulares.",
    url: `${siteUrl}/servicos`,
    siteName: "Virtual Games",
    locale: "pt_BR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Serviços Virtual Games" }],
  },
};

export default function ServicosPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-12 sm:py-16 lg:py-20">
        <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Serviços" }]} />

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-4">
          Nossos Serviços de <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Assistência Técnica Gamer</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mb-12">
          Serviços especializados em consoles, PC Gamer e celulares em Santa Maria, RS. Diagnóstico gratuito e garantia de 90 dias em todos os reparos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/servicos/${service.slug}`}
              className="group bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-6 hover:border-neon-blue/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,212,255,0.06)]"
            >
              <span className="text-3xl mb-4 block">{service.icon}</span>
              <h2 className="text-white font-bold text-lg mb-2 group-hover:text-neon-blue transition-colors">
                {service.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">{service.desc}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12 pt-8 border-t border-white/5">
          <p className="text-gray-400 text-sm mb-4">Não encontrou o que precisa?</p>
          <a
            href="https://wa.me/55997252786?text=Olá!%20Gostaria%20de%20um%20orçamento."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
            </svg>
            FALAR NO WHATSAPP
          </a>
        </div>
      </div>
    </main>
  );
}
