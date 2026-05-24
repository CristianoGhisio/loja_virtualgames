import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Acompanhar Meu Reparo | Virtual Games",
  description: "Acompanhe o status do seu reparo pelo número da Ordem de Serviço.",
  robots: { index: false },
};

export default function AcompanharReparoPage() {
  return (
    <main id="main-content" className="min-h-screen text-foreground">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-lg py-20 text-center">
        <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Acompanhar Reparo" }]} />
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-6">Acompanhar Meu Reparo</h1>
        <p className="text-gray-400 mb-8">Consulte o status do seu equipamento pelo número da OS (Ordem de Serviço).</p>
        <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-6 mb-6">
          <label htmlFor="os-number" className="text-white text-sm font-medium block mb-2 text-left">Número da OS</label>
          <input
            id="os-number"
            type="text"
            placeholder="Ex: OS-000001"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-neon-blue focus:outline-none transition-colors mb-4"
          />
          <button className="w-full bg-neon-blue hover:bg-neon-blue-dark text-black font-bold py-3 px-6 rounded-xl transition-all duration-300">
            CONSULTAR STATUS
          </button>
        </div>
        <p className="text-gray-400 text-sm">
          Não tem o número da OS?{' '}
          <a href="https://wa.me/55997252786?text=Olá!%20Gostaria%20de%20saber%20o%20status%20do%20meu%20equipamento." target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline">
            Consulte pelo WhatsApp
          </a>
        </p>
      </div>
    </main>
  );
}
