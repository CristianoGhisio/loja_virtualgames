import type { Metadata } from "next";
import { Orbitron, Exo_2 } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/auth-context";
import { SchemaOrg } from "@/components/seo/SchemaOrg";
import { localBusinessSchema } from "@/lib/schemas";
import Script from "next/script";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Assistência Técnica Gamer em Santa Maria | Virtual Games",
    template: "%s | Virtual Games",
  },
  description:
    "Assistência técnica especializada em PS5, Xbox, Nintendo Switch e PC Gamer em Santa Maria, RS. Diagnóstico grátis, garantia 90 dias. Orçamento via WhatsApp em 24h!",
  authors: [{ name: "Virtual Games", url: siteUrl }],
  creator: "Virtual Games",
  publisher: "Virtual Games",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Virtual Games",
    title: "Assistência Técnica Gamer em Santa Maria | Virtual Games",
    description:
      "Assistência técnica especializada em PS5, Xbox, Nintendo Switch e PC Gamer em Santa Maria, RS. Diagnóstico grátis, garantia 90 dias.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Virtual Games — Assistência Técnica Gamer em Santa Maria, RS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@virtualgames",
    creator: "@virtualgames",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body
        suppressHydrationWarning
        className={`${orbitron.variable} ${exo2.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <AuthProvider>
            <a href="#main-content" className="skip-to-content">
              Pular para conteúdo principal
            </a>
            <SchemaOrg schema={localBusinessSchema} />
            {children}
            <Toaster richColors position="top-right" theme="dark" />
            <WhatsAppFloat />
          </AuthProvider>
        </SessionProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/55997252786?text=Olá!%20Gostaria%20de%20um%20orçamento."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Virtual Games no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}
