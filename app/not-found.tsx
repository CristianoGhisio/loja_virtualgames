import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-screen text-foreground flex items-center justify-center">
      <div className="text-center px-4 py-20 max-w-lg">
        <h1 className="text-7xl sm:text-9xl font-bold text-neon-blue/20 mb-4">404</h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Página não encontrada
        </h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          A página que você procura não existe ou foi movida. Mas não se preocupe — sua assistência técnica gamer continua pronta para te atender.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-neon-blue hover:bg-neon-blue-dark text-black font-bold py-3 px-6 rounded-xl transition-all duration-300"
          >
            Voltar ao Início
          </Link>
          <a
            href="https://wa.me/55997252786?text=Olá!%20Gostaria%20de%20um%20orçamento."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
