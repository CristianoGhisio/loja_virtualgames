import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SchemaOrg } from "@/components/seo/SchemaOrg";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

export const metadata: Metadata = {
  title: "Garantia de 90 Dias em Reparos | Virtual Games",
  description: "Todos os reparos da Virtual Games têm garantia de 90 dias em peças e mão de obra. Saiba o que é coberto e como acionar.",
  alternates: { canonical: `${siteUrl}/garantia` },
};

const garantiaSchema = {
  "@context": "https://schema.org",
  "@type": "WarrantyPromise",
  durationOfWarranty: { "@type": "QuantitativeValue", value: 90, unitCode: "DAY" },
  warrantyScope: "Todos os reparos realizados pela Virtual Games possuem garantia de 90 dias em peças e mão de obra.",
};

export default function GarantiaPage() {
  return (
    <>
      <SchemaOrg schema={garantiaSchema} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Garantia" }]} />

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-6">
            Garantia de 90 Dias — Virtual Games Santa Maria
          </h1>

          <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
            <p className="text-lg">
              Na Virtual Games, temos confiança absoluta na qualidade dos nossos reparos. Por isso, oferecemos <strong className="text-white">garantia de 90 dias</strong> em todos os serviços — muito acima da média do mercado de assistências técnicas.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10">O Que a Garantia Cobre</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li>Defeitos relacionados ao serviço realizado</li>
              <li>Falha de peças instaladas durante o reparo</li>
              <li>Problemas de mão de obra (solda, montagem, configuração)</li>
            </ul>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10">O Que NÃO É Coberto</h2>
            <ul className="space-y-3 list-disc list-inside">
              <li>Danos físicos causados após a retirada do equipamento (queda, impacto, líquido)</li>
              <li>Mau uso ou uso em condições inadequadas</li>
              <li>Intervenção de terceiros ou abertura do equipamento após o reparo</li>
              <li>Desgaste natural de componentes não relacionados ao reparo realizado</li>
              <li>Problemas de software não relacionados ao serviço</li>
            </ul>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-10">Como Acionar a Garantia</h2>
            <ol className="space-y-4 list-decimal list-inside">
              <li>Entre em contato pelo WhatsApp (55) 99725-2786 informando o número da sua OS</li>
              <li>Descreva o problema que está ocorrendo</li>
              <li>Traga o equipamento até nossa loja em Santa Maria</li>
              <li>Reavaliamos o equipamento sem custo</li>
              <li>Se constatado defeito coberto pela garantia, corrigimos sem cobrança adicional</li>
            </ol>

            <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-xl p-6 mt-10">
              <p className="text-white font-bold text-lg mb-2">Diferencial Virtual Games</p>
              <p>Enquanto a maioria das assistências técnicas oferece 30 dias de garantia, nós oferecemos <strong className="text-neon-blue">90 dias</strong>. Isso mostra o nível de confiança que temos no nosso trabalho e a qualidade das peças que utilizamos.</p>
            </div>
          </div>

          <div className="text-center mt-10 pt-8 border-t border-white/5">
            <a
              href="https://wa.me/55997252786?text=Olá!%20Preciso%20acionar%20a%20garantia.%20Número%20da%20OS:"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
            >
              ACIONAR GARANTIA VIA WHATSAPP
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
