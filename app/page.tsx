import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/sections/hero';
import { Team } from '@/components/sections/team';
import { ServicesSection } from '@/components/landing/services-section';
import { Testimonials } from '@/components/sections/testimonials';
import { Championships } from '@/components/sections/championships';
import { Contact } from '@/components/sections/contact';
import { Footer } from '@/components/layout/footer';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://virtualgames.com.br';

export const metadata = {
  title: 'Manutenção de Consoles PS5 Xbox em Santa Maria | Virtual Games',
  description: 'Assistência técnica gamer em Santa Maria: PS5, Xbox, Switch, PC Gamer e celulares. Diagnóstico grátis, garantia de 90 dias. Orçamento via WhatsApp em 24h!',
  // keywords removidas — Google não indexa meta keywords desde 2009
// Manter lista abaixo apenas como referência de foco de conteúdo:
// manutenção PS5 Santa Maria, reparo Xbox Santa Maria, conserto Switch Santa Maria,
// assistência técnica gamer Santa Maria, montagem PC gamer Santa Maria,
// troca de tela celular Santa Maria, controle PS5 com drift Santa Maria
  authors: [{ name: 'Virtual Games' }],
  creator: 'Virtual Games',
  publisher: 'Virtual Games',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'Virtual Games - Assistência Técnica Gamer',
    title: 'Manutenção PS5 Xbox Switch PC Gamer Santa Maria | Virtual Games',
    description: 'Assistência técnica gamer em Santa Maria com diagnóstico grátis. PS5, Xbox, Nintendo Switch, PC Gamer. Garantia 90 dias. Solicite orçamento via WhatsApp!',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Virtual Games - Assistência Técnica em Consoles e PC Gamer em Santa Maria, RS',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manutenção PS5 Xbox Switch PC Gamer Santa Maria | Virtual Games',
    description: 'Assistência técnica gamer em Santa Maria com diagnóstico grátis. Garantia 90 dias. Solicite orçamento pelo WhatsApp!',
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

export default async function Home() {
  let settings = null;
  try {
    settings = await prisma.storeSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    if (!settings) {
      settings = await prisma.storeSettings.create({ data: {} });
    }
  } catch (error) {
    if (!isMissingTableError(error, 'StoreSettings') && !isDatabaseOfflineError(error)) {
      throw error;
    }
  }

  const storeInfo = settings ?? {
    nameFantasia: 'Virtual Games',
    cnpj: '00.000.000/0001-00',
    address: 'Rua Venâncio Aires, 1434, Torre Divindade. Sala 106 D-2, Centro, Santa Maria, RS - CEP 97010-002',
    phone: '(55) 99725-2786',
    email: 'contato@virtualgames.com',
    serviceHours: 'Segunda a Sexta: 09:00 às 18:30 | Sábado: 09:00 às 13:00',
  };

  let teamMembers: Array<{
    id: string;
    nomeCompleto: string;
    cargoFuncao: string;
    fotoUrl: string | null;
    descricaoPerfil: string | null;
  }> = [];
  try {
    teamMembers = await prisma.employee.findMany({
      where: {
        status: 'ATIVO',
      },
      select: {
        id: true,
        nomeCompleto: true,
        cargoFuncao: true,
        fotoUrl: true,
        descricaoPerfil: true
      },
      orderBy: { createdAt: 'asc' },
      take: 4
    });
  } catch (error) {
    if (!isMissingTableError(error, 'Employee') && !isDatabaseOfflineError(error)) {
      throw error;
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Virtual Games",
    "image": `${siteUrl}/og-image.png`,
    "url": siteUrl,
    "telephone": storeInfo.phone,
    "email": storeInfo.email,
    "priceRange": "$$",
    "description": "Assistência técnica especializada em consoles, PC Gamer e celulares em Santa Maria/RS. Diagnóstico gratuito e garantia de 90 dias em todos os serviços.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2",
      "addressLocality": "Santa Maria",
      "addressRegion": "RS",
      "postalCode": "97010-002",
      "addressCountry": "BR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-29.6881",
      "longitude": "-53.8091"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:30"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday"],
        "opens": "09:00",
        "closes": "13:00"
      }
    ],
    "areaServed": {
      "@type": "City",
      "name": "Santa Maria"
    },
    "sameAs": [
      "https://instagram.com/virtualgames",
      "https://facebook.com/virtualgames"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Serviços de Assistência Técnica Gamer",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Manutenção de Consoles",
            "description": "Reparo especializado em PS5, Xbox Series X/S, Nintendo Switch e demais consoles"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Montagem e Upgrade de PC Gamer",
            "description": "Montagem personalizada e upgrades de PCs para jogos em Santa Maria/RS"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Reparo de Celular",
            "description": "Troca de tela, bateria e reparo em iPhone e Android"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Reparo de Controles",
            "description": "Conserto de drift, analógicos e botões em controles de PS5, Xbox e Switch"
          }
        }
      ]
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Quanto tempo leva para consertar um PS5 em Santa Maria?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "O conserto de PS5 na Virtual Games em Santa Maria leva em média de 2 a 5 dias úteis, dependendo do tipo de defeito e disponibilidade de peças. O diagnóstico é gratuito."
        }
      },
      {
        "@type": "Question",
        "name": "A Virtual Games oferece garantia nos serviços?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim, todos os serviços realizados na Virtual Games possuem garantia de 90 dias para peças e mão de obra."
        }
      },
      {
        "@type": "Question",
        "name": "Como acompanhar o status do meu equipamento na Virtual Games?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Você pode acompanhar o status do seu equipamento em tempo real pelo número da OS (Ordem de Serviço) diretamente no site da Virtual Games, no campo de busca disponível na seção de serviços."
        }
      },
      {
        "@type": "Question",
        "name": "O diagnóstico do console é gratuito?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim, a Virtual Games realiza o diagnóstico de consoles, PC Gamer e celulares de forma totalmente gratuita. Você só paga se autorizar o serviço de reparo."
        }
      },
      {
        "@type": "Question",
        "name": "A Virtual Games conserta controle com drift de PS5 ou Xbox?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim, realizamos reparo de drift em controles de PS5 (DualSense) e Xbox. O serviço inclui substituição dos analógicos e calibragem. Entre em contato via WhatsApp para solicitar orçamento."
        }
      },
      {
        "@type": "Question",
        "name": "Onde fica a Virtual Games em Santa Maria?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A Virtual Games está localizada na Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2, em Santa Maria/RS. Funcionamos de segunda a sexta das 09h às 18h30 e aos sábados das 09h às 13h."
        }
      }
    ]
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Virtual Games",
    "alternateName": "VG Games",
    "url": siteUrl,
    "logo": `${siteUrl}/og-image.png`,
    "telephone": storeInfo.phone,
    "email": storeInfo.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2",
      "addressLocality": "Santa Maria",
      "addressRegion": "RS",
      "postalCode": "97010-002",
      "addressCountry": "BR"
    },
    "areaServed": {
      "@type": "City",
      "name": "Santa Maria",
      "containedInPlace": {
        "@type": "State",
        "name": "Rio Grande do Sul"
      }
    },
    "knowsAbout": [
      "Manutenção de consoles",
      "Reparo de PS5",
      "Reparo de Xbox",
      "Reparo de Nintendo Switch",
      "Montagem de PC Gamer",
      "Assistência técnica mobile",
      "Reparo de controle com drift"
    ],
    "sameAs": [
      "https://instagram.com/virtualgames",
      "https://facebook.com/virtualgames"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <a href="#main-content" className="skip-to-content">
          Pular para conteúdo principal
        </a>

        <Navbar />

        <div id="main-content">
          <Hero />

          <article aria-label="Depoimentos de clientes">
            <Testimonials />
          </article>

          <article aria-label="Serviços oferecidos">
            <ServicesSection />
          </article>

          <article aria-label="Curiosidades sobre eSports">
            <Championships />
          </article>

          <article aria-label="Nossa equipe">
            <Team teamMembers={teamMembers} />
          </article>

          <article aria-label="Contato">
            <Contact settings={storeInfo} />
          </article>
        </div>

        <Footer settings={storeInfo} />
      </main>
    </>
  );
}
