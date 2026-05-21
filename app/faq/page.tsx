import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SchemaOrg } from "@/components/seo/SchemaOrg";
import { createFAQPageSchema } from "@/lib/schemas";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

const allFaqs = {
  "Sobre os Serviços": [
    { q: "O diagnóstico é realmente gratuito?", a: "Sim, realizamos o diagnóstico completo sem custo. Você autoriza o reparo após receber o orçamento." },
    { q: "Como solicitar um orçamento?", a: "Envie uma mensagem pelo WhatsApp (55) 99725-2786 descrevendo o problema do seu equipamento. Respondemos com o orçamento em até 24h." },
    { q: "Quanto tempo leva um reparo?", a: "A maioria dos reparos é concluída em 2 a 5 dias úteis. Reparos simples como limpeza são feitos em 24h. Casos complexos podem levar até 10 dias." },
    { q: "Vocês buscam o equipamento em casa?", a: "Atendemos presencialmente em nossa loja em Santa Maria. Para clientes de outras cidades, aceitamos envio via correio. Consulte-nos pelo WhatsApp." },
  ],
  "PS5": [
    { q: "Meu PS5 está superaquecendo, o que pode ser?", a: "Pode ser acúmulo de poeira, pasta térmica seca ou falha no cooler. Nossa limpeza preventiva resolve na maioria dos casos." },
    { q: "PS5 não dá vídeo — é a porta HDMI?", a: "Na maioria dos casos sim, mas pode ser trilha rompida ou chip de vídeo. Diagnosticamos gratuitamente." },
    { q: "Vocês fazem upgrade de SSD no PS5?", a: "Sim, instalamos SSD NVMe compatível, configuramos o sistema e testamos a velocidade de leitura." },
    { q: "O reparo do PS5 tem garantia?", a: "Sim, todos os reparos de PS5 têm garantia de 90 dias em peças e mão de obra." },
  ],
  "Xbox": [
    { q: "Vocês consertam todos os modelos de Xbox?", a: "Sim, Xbox Series X, Series S, Xbox One, One S e One X. Temos experiência com toda a linha." },
    { q: "O que fazer quando o Xbox não liga?", a: "Verifique primeiro o cabo de força e a tomada. Se o problema persistir, traga para diagnóstico gratuito em nossa loja." },
  ],
  "Nintendo Switch": [
    { q: "Troca de tela do Switch tem conserto?", a: "Sim, trocamos telas de Switch, Switch Lite e OLED. Consulte-nos pelo WhatsApp para mais informações sobre o serviço." },
    { q: "Drift no Joy-Con tem solução definitiva?", a: "Sim, a troca dos analógicos com calibragem profissional resolve o drift de forma definitiva." },
  ],
  "PC Gamer": [
    { q: "Vocês montam PC Gamer do zero?", a: "Sim, oferecemos consultoria para escolha das peças e montagem completa com testes de desempenho." },
    { q: "Vocês fazem upgrade de PC Gamer existente?", a: "Sim, realizamos upgrades de placa de vídeo, processador, memória e armazenamento. Consulte-nos para avaliar seu setup." },
  ],
  "Pagamento e Garantia": [
    { q: "Quais formas de pagamento?", a: "Aceitamos dinheiro, PIX, cartão de crédito e débito. O pagamento é feito na retirada do equipamento." },
    { q: "Qual a garantia dos reparos?", a: "Todos os reparos têm garantia de 90 dias em peças e mão de obra. Se o problema voltar, corrigimos dentro do prazo." },
    { q: "A garantia cobre danos físicos?", a: "A garantia cobre apenas defeitos relacionados ao serviço realizado. Danos por queda, líquido ou mau uso após a retirada não são cobertos." },
    { q: "Como acionar a garantia?", a: "Entre em contato pelo WhatsApp informando o número da OS. Reavaliamos o equipamento e, se for caso de garantia, corrigimos." },
  ],
};

const flatFaqs = Object.values(allFaqs).flat();

export const metadata: Metadata = {
  title: "Perguntas Frequentes — Reparo de Consoles em Santa Maria",
  description: "Tire todas as dúvidas sobre reparo de consoles, PC Gamer e celulares. Diagnóstico, prazos, garantia, preços e mais.",
  alternates: { canonical: `${siteUrl}/faq` },
  openGraph: {
    title: "Perguntas Frequentes — Reparo de Consoles em Santa Maria",
    description: "Tire todas as dúvidas sobre reparo de consoles, PC Gamer e celulares em Santa Maria, RS.",
    url: `${siteUrl}/faq`,
    siteName: "Virtual Games",
    locale: "pt_BR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "FAQ Virtual Games" }],
  },
};

export default function FaqPage() {
  const faqSchema = createFAQPageSchema(flatFaqs.map((f) => ({ question: f.q, answer: f.a })));

  return (
    <>
      <SchemaOrg schema={faqSchema} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "FAQ" }]} />

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mb-12">
            Tire suas dúvidas sobre nossos serviços de assistência técnica gamer em Santa Maria.
          </p>

          {Object.entries(allFaqs).map(([category, faqs]) => (
            <section key={category} className="mb-10">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">{category}</h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <details key={i} className="group bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl overflow-hidden">
                    <summary className="px-6 py-4 cursor-pointer text-white font-medium hover:text-neon-blue transition-colors list-none flex items-center justify-between">
                      <span>{faq.q}</span>
                      <span className="text-neon-blue text-lg group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <div className="text-center py-8 border-t border-white/5">
            <p className="text-gray-400 mb-4">Não encontrou sua resposta?</p>
            <a
              href="https://wa.me/55997252786?text=Olá!%20Tenho%20uma%20dúvida%20sobre%20os%20serviços."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" /></svg>
              FALAR NO WHATSAPP
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
