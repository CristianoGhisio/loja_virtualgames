import { cache } from 'react';
import { Hero } from '@/components/sections/hero';
import { Team } from '@/components/sections/team';
import { ServicesGrid } from '@/components/landing/services-grid';
import { Contact } from '@/components/sections/contact';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { ShieldCheck, Search, Clock, Wrench } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SectionSkeleton } from '@/components/ui/skeleton';

const Testimonials = dynamic(() => import('@/components/sections/testimonials').then(m => ({ default: m.Testimonials })), {
  loading: () => <SectionSkeleton />,
});

const Championships = dynamic(() => import('@/components/sections/championships').then(m => ({ default: m.Championships })), {
  loading: () => <SectionSkeleton />,
});

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://virtualgames.com.br';

export const metadata = {
  title: 'Assistência Técnica Gamer em Santa Maria | Virtual Games',
  description: 'Assistência técnica gamer em Santa Maria: PS5, Xbox, Switch, PC Gamer e celulares. Diagnóstico grátis, garantia de 90 dias. Orçamento via WhatsApp em 24h!',
  authors: [{ name: 'Virtual Games' }],
  creator: 'Virtual Games',
  publisher: 'Virtual Games',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'Virtual Games - Assistência Técnica Gamer',
    title: 'Assistência Técnica Gamer em Santa Maria | Virtual Games',
    description: 'Assistência técnica gamer em Santa Maria com diagnóstico grátis. PS5, Xbox, Nintendo Switch, PC Gamer. Garantia 90 dias. Solicite orçamento!',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Virtual Games - Assistência Técnica Gamer em Santa Maria, RS',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Assistência Técnica Gamer em Santa Maria | Virtual Games',
    description: 'Assistência técnica gamer em Santa Maria. Diagnóstico grátis, garantia 90 dias. Solicite orçamento!',
    images: [`${siteUrl}/og-image.png`],
    site: '@virtualgames',
    creator: '@virtualgames',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

function isMissingTableError(error: unknown, table: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false;
  }
  if (error.code !== 'P2021') {
    return false;
  }
  const tableName = error.meta?.table;
  return typeof tableName === 'string' && tableName.includes(table);
}

function isDatabaseOfflineError(error: unknown): boolean {
  return error instanceof Error && error.name === 'PrismaClientInitializationError';
}

const getStoreSettings = cache(async () => {
  let settings = await prisma.storeSettings.findFirst({ orderBy: { updatedAt: 'desc' } });
  if (!settings) {
    settings = await prisma.storeSettings.create({ data: {} });
  }
  return settings;
});

const getTeamMembers = cache(async () => {
  return await prisma.employee.findMany({
    where: { status: 'ATIVO' },
    select: { id: true, nomeCompleto: true, cargoFuncao: true, fotoUrl: true, descricaoPerfil: true },
    orderBy: { createdAt: 'asc' },
    take: 4,
  });
});

const getLatestPosts = cache(async () => {
  return await prisma.blogPost.findMany({
    where: { published: true },
    select: { title: true, slug: true, excerpt: true, categoria: true },
    orderBy: { publishedAt: 'desc' },
    take: 3,
  });
});

const TRUST_SIGNALS = [
  { icon: Search, label: 'Diagnóstico Gratuito', desc: 'Avaliação completa do seu equipamento sem compromisso' },
  { icon: ShieldCheck, label: 'Garantia de 90 Dias', desc: 'Todos os nossos reparos têm garantia em peças e mão de obra' },
  { icon: Clock, label: 'Orçamento em 24h', desc: 'Resposta rápida pelo WhatsApp com prazo do reparo' },
  { icon: Wrench, label: 'Especialistas Gamers', desc: 'Equipe técnica que entende e joga — feito por gamers para gamers' },
];

type TeamMember = {
  id: string;
  nomeCompleto: string;
  cargoFuncao: string;
  fotoUrl: string | null;
  descricaoPerfil: string | null;
};

type BlogPostPreview = {
  title: string;
  slug: string;
  excerpt: string | null;
  categoria: string;
};

export default async function Home() {
  let settings: Awaited<ReturnType<typeof getStoreSettings>> | null = null;
  let teamMembers: TeamMember[] = [];
  let latestPosts: BlogPostPreview[] = [];

  await Promise.all([
    (async () => {
      try {
        settings = await getStoreSettings();
      } catch (error) {
        if (!isMissingTableError(error, 'StoreSettings') && !isDatabaseOfflineError(error)) throw error;
      }
    })(),
    (async () => {
      try {
        teamMembers = await getTeamMembers();
      } catch (error) {
        if (!isMissingTableError(error, 'Employee') && !isDatabaseOfflineError(error)) throw error;
      }
    })(),
    (async () => {
      try {
        latestPosts = await getLatestPosts();
      } catch {
        // Blog may not be seeded yet
      }
    })(),
  ]);

  const storeInfo = settings ?? {
    nameFantasia: 'Virtual Games',
    cnpj: '00.000.000/0001-00',
    address: 'Rua Venâncio Aires, 1434, Torre Divindade. Sala 106 D-2, Centro, Santa Maria, RS - CEP 97010-002',
    phone: '(55) 99725-2786',
    email: 'contato@virtualgames.com',
    serviceHours: 'Segunda a Sexta: 09:00 às 18:30 | Sábado: 09:00 às 13:00',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Quanto tempo leva para consertar um PS5 em Santa Maria?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'O conserto de PS5 na Virtual Games em Santa Maria leva em média de 2 a 5 dias úteis, dependendo do tipo de defeito e disponibilidade de peças. O diagnóstico é gratuito.',
        },
      },
      {
        '@type': 'Question',
        name: 'A Virtual Games oferece garantia nos serviços?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim, todos os serviços realizados na Virtual Games possuem garantia de 90 dias para peças e mão de obra.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como acompanhar o status do meu equipamento na Virtual Games?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Você pode acompanhar o status do seu equipamento em tempo real pelo número da OS (Ordem de Serviço) diretamente no site da Virtual Games, no campo de busca disponível na seção de serviços.',
        },
      },
      {
        '@type': 'Question',
        name: 'O diagnóstico do console é gratuito?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim, a Virtual Games realiza o diagnóstico de consoles, PC Gamer e celulares de forma totalmente gratuita. Você só paga se autorizar o serviço de reparo.',
        },
      },
      {
        '@type': 'Question',
        name: 'A Virtual Games conserta controle com drift de PS5 ou Xbox?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim, realizamos reparo de drift em controles de PS5 (DualSense) e Xbox. O serviço inclui substituição dos analógicos e calibragem. Entre em contato via WhatsApp para solicitar orçamento.',
        },
      },
      {
        '@type': 'Question',
        name: 'Onde fica a Virtual Games em Santa Maria?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A Virtual Games está localizada na Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2, em Santa Maria/RS. Funcionamos de segunda a sexta das 09h às 18h30 e aos sábados das 09h às 13h.',
        },
      },
    ],
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Virtual Games',
    alternateName: 'VG Games',
    url: siteUrl,
    logo: `${siteUrl}/og-image.png`,
    telephone: storeInfo.phone,
    email: storeInfo.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2',
      addressLocality: 'Santa Maria',
      addressRegion: 'RS',
      postalCode: '97010-002',
      addressCountry: 'BR',
    },
    areaServed: {
      '@type': 'City',
      name: 'Santa Maria',
      containedInPlace: { '@type': 'State', name: 'Rio Grande do Sul' },
    },
    knowsAbout: [
      'Manutenção de consoles',
      'Reparo de PS5',
      'Reparo de Xbox',
      'Reparo de Nintendo Switch',
      'Montagem de PC Gamer',
      'Assistência técnica mobile',
      'Reparo de controle com drift',
    ],
    sameAs: ['https://www.instagram.com/virtual.gamess/', 'https://www.youtube.com/@Virtual.gamessm'],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: siteUrl },
    ],
  };

  const aggregateRatingSchema = {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '87',
    bestRating: '5',
    worstRating: '1',
  };

  const reviewSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Carlos S.' },
      reviewBody: 'Meu PS5 parou de dar vídeo. Levei em várias assistências e não resolveram. A equipe da Virtual Games resolveu o problema na placa em 2 dias. Atendimento sensacional!',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5', worstRating: '1' },
      itemReviewed: { '@type': 'LocalBusiness', '@id': `${siteUrl}/#empresa`, name: 'Virtual Games' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Ana S.' },
      reviewBody: 'Fiz a limpeza preventiva e troca de pasta térmica do meu PC com eles. A temperatura baixou 15 graus e o desempenho melhorou muito. Profissionais de verdade.',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5', worstRating: '1' },
      itemReviewed: { '@type': 'LocalBusiness', '@id': `${siteUrl}/#empresa`, name: 'Virtual Games' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Review',
      author: { '@type': 'Person', name: 'Pedro Oliveira' },
      reviewBody: 'Meus controles estavam com drift severo. A troca dos analógicos foi feita com peças de alta qualidade e ficaram como novos. Recomendo demais!',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5', worstRating: '1' },
      itemReviewed: { '@type': 'LocalBusiness', '@id': `${siteUrl}/#empresa`, name: 'Virtual Games' },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ ...aggregateRatingSchema, itemReviewed: { '@type': 'LocalBusiness', '@id': `${siteUrl}/#empresa`, name: 'Virtual Games' } }) }}
      />
      {reviewSchemas.map((reviewSchema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />
      ))}
      <main id="main-content" className="min-h-screen text-foreground overflow-x-hidden">
        <div>
          <Hero />

          <section className="py-14 sm:py-18 bg-background border-b border-white/5">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <h2 className="sr-only">Por Que a Virtual Games?</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {TRUST_SIGNALS.map((signal) => (
                  <div key={signal.label} className="text-center group">
                    <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center mb-4 group-hover:bg-neon-blue/20 group-hover:border-neon-blue/40 transition-all duration-300">
                      <signal.icon className="w-7 h-7 sm:w-8 sm:h-8 text-neon-blue" />
                    </div>
                    <p className="text-white font-bold text-sm sm:text-base mb-1">{signal.label}</p>
                    <p className="text-gray-400 text-xs leading-relaxed">{signal.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-10 text-center grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-white/5 rounded-lg py-3 px-4">
                  <p className="text-neon-blue text-2xl font-bold">+2.000</p>
                  <p className="text-gray-400 text-xs">reparos realizados</p>
                </div>
                <div className="bg-white/5 rounded-lg py-3 px-4">
                  <p className="text-cta-gold text-2xl font-bold">5.0</p>
                  <p className="text-gray-400 text-xs">nota no Google</p>
                </div>
              </div>
            </div>
          </section>

          <article aria-label="Serviços oferecidos">
            <ServicesGrid />
          </article>

          <section className="py-16 sm:py-20 lg:py-24 bg-background-secondary/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.03),transparent_70%)] pointer-events-none" />
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  COMO FUNCIONA O <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">REPARO</span>
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
                  Processo simples e transparente para recuperar seu equipamento.
                </p>
              </div>
              <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto">
                {[
                  { step: 1, title: 'Traga o Equipamento', desc: 'Venha até nossa loja em Santa Maria ou entre em contato pelo WhatsApp para envio.' },
                  { step: 2, title: 'Diagnóstico Grátis', desc: 'Analisamos seu console, PC ou celular e identificamos o problema sem custo.' },
                  { step: 3, title: 'Aprovação do Orçamento', desc: 'Você recebe o valor e prazo. O reparo só começa após sua aprovação.' },
                  { step: 4, title: 'Reparo com Garantia', desc: 'Executamos o serviço com peças de qualidade. Você retira com garantia de 90 dias.' },
                ].map((st) => (
                  <li key={st.step} className="relative group">
                    <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-6 text-center hover:border-neon-blue/30 transition-all duration-300 h-full">
                      <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neon-blue/10 text-neon-blue font-bold text-lg mb-4 group-hover:bg-neon-blue/20 transition-colors">
                        {st.step}
                      </span>
                      <h3 className="text-white font-bold text-lg mb-2">{st.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{st.desc}</p>
                    </div>
                    {st.step < 4 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-neon-blue/30" aria-hidden="true" />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <article aria-label="Depoimentos de clientes">
            <Testimonials />
          </article>

          <article aria-label="Nossa equipe">
            <Team teamMembers={teamMembers} />
            {teamMembers.length > 0 && (
              <div className="text-center -mt-8 pb-12">
                <Link href="/sobre" className="inline-flex items-center gap-2 text-neon-blue hover:text-white font-medium transition-colors duration-300 text-sm border border-neon-blue/20 rounded-xl px-5 py-2.5 hover:bg-neon-blue/10">
                  Conheça toda a equipe
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            )}
          </article>

          <section className="py-16 sm:py-20 lg:py-24 bg-background relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-neon-blue/3 rounded-full blur-[120px] pointer-events-none" />
            <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  PERGUNTAS <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">FREQUENTES</span>
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
                  Tire suas dúvidas sobre nossos serviços de assistência técnica em Santa Maria.
                </p>
              </div>
              <div className="max-w-3xl mx-auto space-y-4">
                {[
                  { q: 'O diagnóstico é realmente gratuito?', a: 'Sim, realizamos o diagnóstico completo sem custo. Você aprova o orçamento antes de qualquer reparo.' },
                  { q: 'Qual é o prazo de reparo de um PS5?', a: 'A maioria dos reparos é concluída em 2 a 5 dias úteis. Casos mais complexos podem levar até 10 dias.' },
                  { q: 'A Virtual Games tem garantia?', a: 'Sim, todos os reparos têm garantia de 90 dias em peças e mão de obra.' },
                  { q: 'Vocês atendem qual região?', a: 'Estamos em Santa Maria, RS. Atendemos presencialmente e via envio postal para toda a região central do RS.' },
                  { q: 'Como solicitar um orçamento?', a: 'Basta enviar uma mensagem pelo WhatsApp (55) 99725-2786. Respondemos em até 24h.' },
                ].map((faq, i) => (
                  <details key={i} className="group bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl overflow-hidden">
                    <summary className="px-6 py-4 cursor-pointer text-white font-medium hover:text-neon-blue transition-colors list-none flex items-center justify-between">
                      <span>{faq.q}</span>
                      <span className="text-neon-blue text-lg group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                    </summary>
                    <p className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </details>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link href="/faq" className="text-neon-blue hover:text-neon-blue-dark transition-colors text-sm font-medium underline underline-offset-4">
                  Ver todas as perguntas frequentes
                </Link>
              </div>
            </div>
          </section>

          <article aria-label="Curiosidades sobre eSports">
            <Championships />
          </article>

          {latestPosts.length > 0 && (
            <section className="py-16 sm:py-20 lg:py-24 bg-background-secondary/50 border-t border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,212,255,0.03),transparent_60%)] pointer-events-none" />
              <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
                <div className="text-center mb-12 sm:mb-16">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                    ÚLTIMAS DO <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">BLOG GAMER</span>
                  </h2>
                  <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
                    Dicas, guias e novidades do universo gamer direto da Virtual Games.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
                  {latestPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-6 hover:border-neon-blue/30 transition-all duration-300 hover:-translate-y-1"
                    >
                      <span className="text-neon-blue text-xs font-medium uppercase tracking-wider mb-3 block">
                        {post.categoria}
                      </span>
                      <h3 className="text-white font-bold text-lg mb-3 group-hover:text-neon-blue transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Link href="/blog" className="text-neon-blue hover:text-neon-blue-dark transition-colors text-sm font-medium underline underline-offset-4">
                    Ver todos os artigos
                  </Link>
                </div>
              </div>
            </section>
          )}

          <article aria-label="Contato">
            <Contact settings={storeInfo} />
          </article>
        </div>
      </main>
    </>
  );
}
