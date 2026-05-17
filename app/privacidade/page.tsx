import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Política de Privacidade | Virtual Games",
  description: "Política de Privacidade da Virtual Games em conformidade com a LGPD. Saiba como tratamos seus dados pessoais.",
  robots: { index: false },
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12 sm:py-16 lg:py-20">
        <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Privacidade" }]} />
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-6">Política de Privacidade</h1>
        <div className="prose prose-invert max-w-none space-y-4 text-gray-300 leading-relaxed text-sm">
          <p><strong>Última atualização:</strong> Maio de 2026</p>
          <p>A Virtual Games, inscrita no CNPJ sob o nome fantasia Virtual Games, com sede em Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2, Santa Maria/RS, CEP 97010-002, respeita a sua privacidade e está comprometida com a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).</p>

          <h2 className="text-xl font-bold text-white mt-6">1. Dados Coletados</h2>
          <p>Coletamos apenas os dados necessários para a prestação dos nossos serviços de assistência técnica: nome completo, número de WhatsApp/telefone, CPF (para emissão de nota fiscal e garantia), endereço de e-mail (opcional) e informações sobre o equipamento deixado para reparo (modelo, defeito relatado).</p>

          <h2 className="text-xl font-bold text-white mt-6">2. Finalidade</h2>
          <p>Seus dados são utilizados exclusivamente para: emissão de ordem de serviço, comunicação sobre o andamento do reparo, emissão de nota fiscal, acionamento de garantia e contato para autorização de orçamento.</p>

          <h2 className="text-xl font-bold text-white mt-6">3. Compartilhamento</h2>
          <p>Não compartilhamos seus dados com terceiros, exceto quando exigido por lei ou para proteção dos nossos direitos.</p>

          <h2 className="text-xl font-bold text-white mt-6">4. Armazenamento</h2>
          <p>Seus dados são armazenados em servidores seguros pelo prazo necessário para cumprir as finalidades descritas ou conforme exigido por legislação fiscal.</p>

          <h2 className="text-xl font-bold text-white mt-6">5. Seus Direitos (LGPD)</h2>
          <p>Você tem direito de acessar, corrigir, excluir seus dados ou revogar consentimento. Para exercer esses direitos, entre em contato pelo e-mail contato@virtualgames.com.</p>

          <h2 className="text-xl font-bold text-white mt-6">6. Cookies</h2>
          <p>Nosso site pode utilizar cookies essenciais para funcionamento. Não utilizamos cookies de rastreamento publicitário.</p>

          <h2 className="text-xl font-bold text-white mt-6">7. Contato</h2>
          <p>Dúvidas sobre esta política: contato@virtualgames.com ou WhatsApp (55) 99725-2786.</p>
        </div>
      </div>
    </main>
  );
}
