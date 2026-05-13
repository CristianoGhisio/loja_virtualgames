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
  title: 'Virtual Games | Manutenção de Consoles e PC Gamer em Santa Maria, RS',
  description: 'Assistência técnica especializada em PS5, Xbox, Switch, PC Gamer e celulares em Santa Maria, RS. Reparo com garantia e atendimento rápido. Fale agora pelo WhatsApp!',
  keywords: [
    'manutenção PS5 Santa Maria',
    'reparo Xbox Santa Maria',
    'assistência técnica videogame Santa Maria',
    'manutenção de consoles Santa Maria',
    'PC gamer Santa Maria',
    'troca de tela iPhone Santa Maria',
    'assistência técnica celular Santa Maria',
    'montagem PC gamer Santa Maria',
    'assistência técnica PS5',
    'reparo Nintendo Switch',
    'manutenção PS4',
    'assistência técnica Xbox',
    'loja de videogame Santa Maria',
    'PC Gamer RS',
    'assistência técnica celulares'
  ],
  authors: [{ name: 'Virtual Games' }],
  creator: 'Virtual Games',
  publisher: 'Virtual Games',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'Virtual Games - Santa Maria, RS',
    title: 'Virtual Games | Manutenção de Consoles e PC Gamer em Santa Maria, RS',
    description: 'Assistência técnica especializada em PS5, Xbox, Switch, PC Gamer e celulares em Santa Maria, RS. Reparo com garantia e atendimento rápido.',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Virtual Games - Assistência Técnica em Consoles e PC Gamer em Santa Maria, RS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Virtual Games | Manutenção de Consoles e PC Gamer em Santa Maria, RS',
    description: 'Assistência técnica especializada em PS5, Xbox, Switch, PC Gamer e celulares em Santa Maria, RS. Fale agora pelo WhatsApp!',
    images: [`${siteUrl}/og-image.jpg`],
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
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Virtual Games',
    url: siteUrl,
    description: 'Loja especializada em videogames, assistência técnica, venda e campeonatos de eSports.',
    telephone: storeInfo.phone,
    email: storeInfo.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: storeInfo.address,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        description: storeInfo.serviceHours,
      }
    ],
    sameAs: [
      'https://instagram.com/virtualgames',
      'https://facebook.com/virtualgames',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
