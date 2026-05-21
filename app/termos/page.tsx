import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Termos de Serviço | Virtual Games",
  description: "Termos e condições de serviço da Virtual Games. Prazos, garantias e responsabilidades.",
  robots: { index: false },
};

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12 sm:py-16 lg:py-20">
        <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Termos de Serviço" }]} />
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-6">Termos de Serviço</h1>
        <div className="prose prose-invert max-w-none space-y-4 text-gray-300 leading-relaxed text-sm">
          <p><strong>Última atualização:</strong> maio de 2026</p>
          <p>Ao deixar seu equipamento na Virtual Games, você concorda com estes termos.</p>

          <h2 className="text-xl font-bold text-white mt-6">1. Diagnóstico</h2>
          <p>O diagnóstico é gratuito. Após avaliação, informamos o orçamento e prazo do reparo. O serviço só é iniciado após sua aprovação expressa (via WhatsApp ou presencial).</p>

          <h2 className="text-xl font-bold text-white mt-6">2. Prazo de Reparo</h2>
          <p>Os prazos informados são estimativas baseadas na complexidade do defeito e disponibilidade de peças. A maioria dos reparos é concluída em 2 a 5 dias úteis.</p>

          <h2 className="text-xl font-bold text-white mt-6">3. Orçamento</h2>
          <p>O orçamento tem validade de 5 dias. O pagamento é realizado na retirada do equipamento.</p>

          <h2 className="text-xl font-bold text-white mt-6">4. Garantia</h2>
          <p>Todos os reparos têm garantia de 90 dias em peças e mão de obra. A garantia cobre defeitos relacionados ao serviço realizado. Não cobre danos físicos, mau uso ou intervenção de terceiros.</p>

          <h2 className="text-xl font-bold text-white mt-6">5. Responsabilidade</h2>
          <p>A Virtual Games se responsabiliza pelo equipamento durante o período em que estiver em nossa posse. Recomendamos fazer backup dos dados antes de deixar o equipamento.</p>

          <h2 className="text-xl font-bold text-white mt-6">6. Retirada</h2>
          <p>O equipamento deve ser retirado em até 30 dias após a notificação de conclusão. Após este prazo, será cobrada taxa de armazenamento.</p>

          <h2 className="text-xl font-bold text-white mt-6">7. Peças Substituídas</h2>
          <p>As peças substituídas são descartadas, salvo solicitação prévia de devolução no momento da autorização do serviço.</p>

          <h2 className="text-xl font-bold text-white mt-6">8. Contato</h2>
          <p>Dúvidas sobre estes termos: contato@virtualgames.com ou WhatsApp (55) 99725-2786.</p>
        </div>
      </div>
    </main>
  );
}
