import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SchemaOrg } from "@/components/seo/SchemaOrg";
import { localBusinessSchema } from "@/lib/schemas";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

export const metadata: Metadata = {
  title: "Assistência Técnica Gamer em Santa Maria, RS | Virtual Games",
  description: "Virtual Games: assistência técnica especializada em PS5, Xbox, Nintendo Switch e PC Gamer em Santa Maria. Diagnóstico grátis e garantia de 90 dias.",
  alternates: { canonical: `${siteUrl}/assistencia-tecnica-santa-maria` },
};

const bairros = [
  "Centro", "Nossa Senhora de Fátima", "Nossa Senhora de Lourdes", "Nossa Senhora das Dores",
  "Nossa Senhora do Rosário", "Camobi", "Tancredo Neves", "Urlândia", "Patronato",
  "Nonoai", "Tomazetti", "Cerrito", "São José", "Itararé",
];

export default function AssistenciaTecnicaSMPage() {
  return (
    <>
      <SchemaOrg schema={localBusinessSchema} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Assistência Técnica em Santa Maria" }]} />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-6">
            Assistência Técnica Gamer em Santa Maria, RS — Virtual Games
          </h1>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
            <p className="text-lg">
              A <strong className="text-white">Virtual Games</strong> é a assistência técnica especializada em consoles, PC Gamer e celulares em <strong className="text-white">Santa Maria, RS</strong>. Localizada no coração da cidade, atende clientes de todos os bairros e da região central do Rio Grande do Sul.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10">Onde Estamos</h2>
            <p>
              Nossa loja fica na <strong>Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2, Centro, Santa Maria, RS — CEP 97010-002</strong>. Estamos a poucos minutos da UFSM, do Calçadão e de pontos de referência do centro da cidade.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10">Bairros Atendidos em Santa Maria</h2>
            <p>Atendemos presencialmente toda Santa Maria. Moradores dos seguintes bairros e regiões podem trazer seus equipamentos diretamente à nossa loja:</p>
            <div className="flex flex-wrap gap-2">
              {bairros.map((b) => (
                <span key={b} className="bg-[rgba(255,255,255,0.03)] border border-white/5 px-3 py-1.5 rounded-lg text-sm text-gray-400">{b}</span>
              ))}
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10">Nossos Serviços em Santa Maria</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { slug: "manutencao-ps5", title: "Manutenção de PS5" },
                { slug: "manutencao-xbox", title: "Reparo de Xbox" },
                { slug: "manutencao-nintendo-switch", title: "Reparo Nintendo Switch" },
                { slug: "montagem-pc-gamer", title: "Montagem PC Gamer" },
                { slug: "reparo-controle-drift", title: "Reparo de Controle" },
                { slug: "reparo-celular", title: "Reparo de Celular" },
              ].map((s) => (
                <Link key={s.slug} href={`/servicos/${s.slug}`} className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl px-5 py-4 hover:border-neon-blue/30 transition-all duration-300">
                  <span className="text-neon-blue text-sm">{s.title}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center mt-10 pt-8 border-t border-white/5">
            <a
              href="https://wa.me/55997252786?text=Olá!%20Gostaria%20de%20um%20orçamento."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
            >
              SOLICITAR ORÇAMENTO
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
