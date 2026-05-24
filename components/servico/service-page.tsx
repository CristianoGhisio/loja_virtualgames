import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SchemaOrg } from "@/components/seo/SchemaOrg";
import { createServiceSchema, createFAQPageSchema, aggregateRatingSchema, localBusinessSchema, createHowToSchema, createReviewSchema } from "@/lib/schemas";

interface ServicePageConfig {
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  introParagraphs: string[];
  servicesList: { name: string; desc: string }[];
  processSteps: { title: string; desc: string }[];
  whyChooseItems: string[];
  faqs: { question: string; answer: string }[];
  testimonials: { name: string; role: string; text: string }[];
  whatsappPreText: string;
  relatedLinks: { href: string; label: string }[];
  serviceName: string;
  serviceDescription: string;
  serviceType?: string;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

export function createServiceMetadata(config: ServicePageConfig): Metadata {
  return {
    title: config.metaTitle,
    description: config.metaDescription,
    alternates: { canonical: `${siteUrl}/servicos/${config.slug}` },
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url: `${siteUrl}/servicos/${config.slug}`,
      siteName: "Virtual Games",
      locale: "pt_BR",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: config.h1 }],
    },
    twitter: {
      card: "summary_large_image",
      title: config.metaTitle,
      description: config.metaDescription,
      images: ["/og-image.png"],
      site: "@virtualgames",
      creator: "@virtualgames",
    },
    robots: { index: true, follow: true },
  };
}

export function ServicePage({ config }: { config: ServicePageConfig }) {
  const serviceSchema = createServiceSchema({
    name: config.serviceName,
    description: config.serviceDescription,
    serviceType: config.serviceType,
    subServices: config.servicesList.map((s) => ({ name: s.name, description: s.desc })),
  });

  const faqSchema = createFAQPageSchema(
    config.faqs.map((f) => ({ question: f.question, answer: f.answer })),
  );

  const howToSchema = createHowToSchema(
    config.processSteps.map((step) => ({ title: step.title, description: step.desc })),
  );

  const reviewSchemas = config.testimonials.length > 0
    ? createReviewSchema(config.testimonials)
    : [];

  const breadcrumbItems = [
    { name: "Início", href: "/" },
    { name: "Serviços", href: "/servicos" },
    { name: config.serviceName },
  ];

  return (
    <>
      <SchemaOrg schema={localBusinessSchema} />
      <SchemaOrg schema={serviceSchema} />
      <SchemaOrg schema={faqSchema} />
      <SchemaOrg schema={howToSchema} />
      <SchemaOrg schema={aggregateRatingSchema} />
      {reviewSchemas.map((schema, i) => (
        <SchemaOrg key={i} schema={schema} />
      ))}
      <main id="main-content" className="min-h-screen text-foreground">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={breadcrumbItems} />

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-6">
            {config.h1}
          </h1>

          <div className="prose prose-invert max-w-none mb-12">
            {config.introParagraphs.map((p, i) => (
              <p key={i} className="text-gray-300 text-base sm:text-lg leading-relaxed mb-4">
                {p}
              </p>
            ))}
          </div>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">O Que Fazemos</h2>
            <ul className="space-y-4">
              {config.servicesList.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="text-neon-blue mt-1 shrink-0">▸</span>
                  <div>
                    <strong className="text-white text-lg">{s.name}</strong>
                    <p className="text-gray-400 text-sm mt-1">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12 bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Como Funciona o Reparo</h2>
            <ol className="space-y-6">
              {config.processSteps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-blue/10 text-neon-blue font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <strong className="text-white">{s.title}</strong>
                    <p className="text-gray-400 text-sm mt-1">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Garantia de 90 Dias</h2>
            <p className="text-gray-300 leading-relaxed">
              Todos os serviços da Virtual Games possuem garantia de 90 dias para peças e mão de obra.
              Nossa garantia cobre defeitos relacionados ao serviço realizado. Danos físicos após a retirada,
              mau uso e intervenção de terceiros não são cobertos. Caso identifique qualquer problema, entre
              em contato pelo WhatsApp e retorne o equipamento — reavaliamos sem custos adicionais.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Por Que Escolher a Virtual Games?</h2>
            <ul className="space-y-3">
              {config.whyChooseItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="text-neon-blue mt-1 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Perguntas Frequentes</h2>
            <div className="space-y-3">
              {config.faqs.map((faq, i) => (
                <details key={i} className="group bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl overflow-hidden">
                  <summary className="px-6 py-4 cursor-pointer text-white font-medium hover:text-neon-blue transition-colors list-none flex items-center justify-between">
                      <span>{faq.question}</span>
                      <span className="text-neon-blue text-lg group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                    </summary>
                  <p className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {config.testimonials.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">O Que Dizem Nossos Clientes</h2>
              <div className="grid gap-4">
                {config.testimonials.map((t, i) => (
                  <div key={i} className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-5">
                    <p className="text-gray-300 italic mb-3">&ldquo;{t.text}&rdquo;</p>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="text-center py-8">
            <a
              href={`https://wa.me/55997252786?text=${encodeURIComponent(config.whatsappPreText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
              </svg>
              SOLICITAR ORÇAMENTO VIA WHATSAPP
            </a>
          </div>

          <div className="border-t border-white/5 pt-8 mt-8">
            <p className="text-gray-400 text-sm mb-4">Veja também:</p>
            <div className="flex flex-wrap gap-3">
              {config.relatedLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="text-sm text-neon-blue hover:text-neon-blue-dark transition-colors bg-neon-blue/5 hover:bg-neon-blue/10 px-4 py-2 rounded-lg"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/servicos" className="text-sm text-gray-400 hover:text-neon-blue transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg">
                Todos os Serviços
              </Link>
              <Link href="/faq" className="text-sm text-gray-400 hover:text-neon-blue transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg">
                FAQ
              </Link>
              <Link href="/garantia" className="text-sm text-gray-400 hover:text-neon-blue transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg">
                Garantia
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
