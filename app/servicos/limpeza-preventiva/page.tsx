import { ServicePage, createServiceMetadata } from "@/components/servico/service-page";
import type { Metadata } from "next";

const config = {
  slug: "limpeza-preventiva",
  h1: "Limpeza Preventiva de Console em Santa Maria, RS",
  metaTitle: "Limpeza Preventiva de Console em Santa Maria",
  metaDescription: "Limpeza preventiva de PS5, Xbox e PC Gamer em Santa Maria. Troca de pasta térmica, remoção de poeira e otimização. Garantia 90 dias. Orçamento em 24h!",
  introParagraphs: [
    "A limpeza preventiva é o serviço mais negligenciado e mais importante para a vida útil do seu console ou PC Gamer. Na Virtual Games, em Santa Maria, realizamos limpeza interna completa com troca de pasta térmica de alta performance.",
    "Poeira acumulada obstrui a refrigeração, aumentando temperaturas e causando desligamentos. Nossa limpeza preventiva resolve superaquecimento, reduz ruído do cooler e prolonga a vida útil do equipamento.",
  ],
  servicesList: [
    { name: "Limpeza PS5", desc: "Abertura completa, remoção de poeira do dissipador, troca de pasta térmica e thermal pads. Teste de temperatura." },
    { name: "Limpeza Xbox Series X/S", desc: "Desmontagem, limpeza do sistema de refrigeração e troca de pasta térmica. Teste de desempenho." },
    { name: "Limpeza PC Gamer", desc: "Limpeza de todos os componentes, fans, radiadores e gabinete. Troca de pasta térmica da CPU/GPU." },
    { name: "Limpeza Nintendo Switch", desc: "Abertura e limpeza do sistema de ventilação do dock e console. Troca de pasta térmica." },
  ],
  processSteps: [
    { title: "Traga seu equipamento", desc: "Console, PC ou notebook. Atendemos em Santa Maria." },
    { title: "Abertura e limpeza", desc: "Desmontagem completa, remoção de poeira e limpeza de componentes." },
    { title: "Troca de pasta térmica", desc: "Aplicação de pasta térmica de alta performance (Arctic MX-4 ou similar)." },
    { title: "Teste e garantia", desc: "Testamos temperaturas em carga. Você retira com 90 dias de garantia." },
  ],
  whyChooseItems: [
    "Usamos pasta térmica de alta performance — nada de pasta barata",
    "Desmontagem completa — limpamos onde a poeira realmente se acumula",
    "Teste de temperatura antes e depois — você vê a diferença",
    "Garantia de 90 dias no serviço",
  ],
  faqs: [
    { question: "Com que frequência devo fazer limpeza preventiva?", answer: "Recomendamos a cada 12 meses, ou antes se você notar ruído excessivo do cooler ou desligamentos. Ambientes com poeira ou fumantes exigem limpeza mais frequente." },
    { question: "A limpeza preventiva resolve superaquecimento?", answer: "Na maioria dos casos, sim. Poeira acumulada e pasta térmica seca são as causas mais comuns de superaquecimento. Nossa limpeza resolve o problema em aproximadamente 90% dos casos." },
    { question: "Quanto tempo demora a limpeza preventiva?", answer: "A limpeza de console leva de 2 a 4 horas. PCs podem levar de 4 a 8 horas dependendo da complexidade. Na maioria dos casos entregamos no mesmo dia." },
    { question: "Vale a pena fazer limpeza preventiva?", answer: "Sim, a limpeza preventiva é essencial para prolongar a vida do seu console e evitar danos permanentes causados por superaquecimento." },
  ],
  testimonials: [
    { name: "Felipe M.", role: "Cliente Limpeza PS5", text: "Meu PS5 desligava sozinho depois de 30 min. Limpeza + pasta térmica nova resolveu. Temperatura caiu 12 graus. Essencial!" },
    { name: "Roberta L.", role: "Cliente Limpeza PC", text: "PC Gamer com 2 anos sem limpeza, parecia um aspirador. Voltou silencioso e frio. Trabalho impecável." },
  ],
  whatsappPreText: "Olá! Gostaria de agendar uma limpeza preventiva para meu console/PC.",
  relatedLinks: [
    { href: "/servicos/manutencao-ps5", label: "Manutenção PS5" },
    { href: "/servicos/manutencao-xbox", label: "Reparo Xbox" },
    { href: "/servicos/montagem-pc-gamer", label: "Montagem PC Gamer" },
  ],
  serviceName: "Limpeza Preventiva de Console",
  serviceDescription: "Limpeza interna completa de PS5, Xbox, PC Gamer e Switch em Santa Maria. Troca de pasta térmica e garantia de 90 dias.",
  serviceType: "Manutenção Preventiva",
};

export const metadata: Metadata = createServiceMetadata(config);

export default function LimpezaPreventivaPage() {
  return <ServicePage config={config} />;
}
