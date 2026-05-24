import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SchemaOrg } from "@/components/seo/SchemaOrg";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

export const metadata: Metadata = {
  title: "Sobre a Virtual Games — Especialistas em Consoles e PC Gamer em Santa Maria",
  description: "Conheça a Virtual Games, assistência técnica especializada em consoles, PC Gamer e celulares em Santa Maria, RS. História, equipe, missão e valores.",
  alternates: { canonical: `${siteUrl}/sobre` },
  robots: { index: true, follow: true },
};

const sobreSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#empresa`,
  name: "Virtual Games",
  url: siteUrl,
  foundingDate: "2020",
  description: "Assistência técnica especializada em consoles, PC Gamer e celulares em Santa Maria, RS.",
  founder: { "@type": "Person", name: "Emerson Gabriel de Mello Graeff" },
  numberOfEmployees: { "@type": "QuantitativeValue", value: 4 },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2",
    addressLocality: "Santa Maria",
    addressRegion: "RS",
    postalCode: "97010-002",
    addressCountry: "BR",
  },
  member: [
    { "@type": "Person", name: "Emerson Gabriel de Mello Graeff", jobTitle: "CEO e Fundador" },
    { "@type": "Person", name: "Kevin de Mello Graeff", jobTitle: "Técnico em Consoles" },
    { "@type": "Person", name: "Elias Rodrigues Fagundes", jobTitle: "Técnico em Consoles" },
    { "@type": "Person", name: "Gabriel Rae da Silva Castro", jobTitle: "Atendimento e Vendas" },
  ],
};

export default function SobrePage() {
  return (
    <>
      <SchemaOrg schema={sobreSchema} />
      <main id="main-content" className="min-h-screen text-foreground">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Sobre" }]} />

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-6">
            Sobre a Virtual Games — Especialistas em Consoles e PC Gamer em Santa Maria
          </h1>

          <div className="prose prose-invert max-w-none space-y-6">
            <p className="text-gray-300 text-lg leading-relaxed">
              A Virtual Games nasceu da paixão por games e da frustração de não encontrar assistência técnica especializada em consoles e PC Gamer em Santa Maria. Fundada por Emerson Gabriel de Mello Graeff, a empresa se consolidou como referência em reparo de PS5, Xbox, Nintendo Switch, montagem de PC Gamer e celulares na região central do Rio Grande do Sul.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10">Nossa História</h2>
            <p className="text-gray-300 leading-relaxed">
              Desde 2020, já realizamos mais de 2.000 reparos em consoles e computadores. O que começou como um serviço entre amigos gamers se transformou na assistência técnica mais especializada de Santa Maria. Nossa equipe é formada por gamers que entendem a urgência de ter seu equipamento de volta funcionando.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10">Missão, Visão e Valores</h2>
            <div className="grid sm:grid-cols-3 gap-6 mt-4">
              <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-6">
                <h3 className="text-neon-blue font-bold text-lg mb-2">Missão</h3>
                <p className="text-gray-400 text-sm">Oferecer assistência técnica especializada com transparência, qualidade e agilidade, devolvendo aos gamers a melhor experiência com seus equipamentos.</p>
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-6">
                <h3 className="text-neon-blue font-bold text-lg mb-2">Visão</h3>
                <p className="text-gray-400 text-sm">Ser a assistência técnica de referência no sul do Brasil para consoles, PC Gamer e dispositivos mobile.</p>
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-6">
                <h3 className="text-neon-blue font-bold text-lg mb-2">Valores</h3>
                <p className="text-gray-400 text-sm">Transparência no diagnóstico, qualidade nas peças, respeito ao cliente e paixão pelo universo gamer.</p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10">Nossa Equipe</h2>
            <p className="text-gray-300 leading-relaxed">Conheça os especialistas que cuidam do seu equipamento:</p>
            <div className="grid sm:grid-cols-2 gap-6 mt-4">
              {[
                { name: "Emerson Gabriel de Mello Graeff", role: "CEO e Fundador", bio: "Empreendedor e gamer desde a infância. Fundou a Virtual Games para unir paixão por tecnologia e atendimento de qualidade. Especialista em gestão e estratégia." },
                { name: "Kevin de Mello Graeff", role: "Técnico em Consoles", bio: "Especialista em reparo de PS5, Xbox Series e Nintendo Switch. Domina microsoldagem, diagnóstico de placa e reparo de HDMI." },
                { name: "Elias Rodrigues Fagundes", role: "Técnico em Consoles", bio: "Técnico especializado em consoles e montagem de PC Gamer. Experiência em diagnóstico de hardware e otimização de performance." },
                { name: "Gabriel Rae da Silva Castro", role: "Atendimento e Vendas", bio: "Responsável pelo atendimento ao cliente, orçamentos e suporte. Garante que cada cliente receba atenção personalizada e informação clara." },
              ].map((member) => (
                <div key={member.name} className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-6">
                  <h3 className="text-white font-bold text-lg">{member.name}</h3>
                  <p className="text-neon-blue text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10">Nossos Números</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {[
                { value: "+2.000", label: "reparos realizados" },
                { value: "5+", label: "anos de mercado" },
                { value: "90", label: "dias de garantia" },
                { value: "5.0", label: "nota no Google" },
              ].map((stat) => (
                <div key={stat.label} className="text-center bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-4">
                  <p className="text-neon-blue text-2xl font-bold">{stat.value}</p>
                  <p className="text-gray-400 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5">
            <Link href="/garantia" className="text-neon-blue hover:text-neon-blue-dark transition-colors text-sm font-medium underline underline-offset-4">
              Conheça nossa garantia de 90 dias →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
