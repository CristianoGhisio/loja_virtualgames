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

export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://virtualgames.com.br';

export const metadata = {
  title: 'Virtual Games | Loja Especializada em Videogames - Manutenção, Venda e Campeonatos',
  description: 'Assistência técnica especializada em consoles e PCs. Compra, venda e troca de equipamentos gamer. Campeonatos e eventos. Sua loja definitiva para o universo gamer.',
  keywords: ['loja de videogame', 'assistência técnica console', 'reparo PS5', 'manutenção Xbox', 'PC Gamer', 'campeonato eSports', 'loja gamer', 'acessórios gaming'],
  authors: [{ name: 'Virtual Games' }],
  creator: 'Virtual Games',
  publisher: 'Virtual Games',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'Virtual Games',
    title: 'Virtual Games | Loja Especializada em Videogames',
    description: 'Assistência técnica especializada em consoles e PCs. Compra, venda e troca de equipamentos gamer.',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Virtual Games - Loja Gamer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Virtual Games | Loja Especializada em Videogames',
    description: 'Assistência técnica especializada em consoles e PCs. Sua loja definitiva para o universo gamer.',
    images: [`${siteUrl}/og-image.jpg`],
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
    settings = await prisma.storeSettings.findFirst();
    if (!settings) {
      settings = await prisma.storeSettings.create({ data: {} });
    }
  } catch (error) {
    if (!isMissingTableError(error, 'StoreSettings') && !isDatabaseOfflineError(error)) {
      throw error;
    }
  }

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
    telephone: settings?.phone || '(55) 99725-2786',
    email: settings?.email || 'contato@virtualgames.com',
    address: settings?.address ? {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
    } : undefined,
    openingHoursSpecification: settings?.serviceHours ? [
      {
        '@type': 'OpeningHoursSpecification',
        description: settings.serviceHours,
      }
    ] : undefined,
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
            <Contact settings={settings} />
          </article>
        </div>

        <Footer settings={settings} />
      </main>
    </>
  );
}
