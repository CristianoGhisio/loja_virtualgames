import { ServicePage, createServiceMetadata } from "@/components/servico/service-page";
import type { Metadata } from "next";

const config = {
  slug: "montagem-pc-gamer",
  h1: "Montagem de PC Gamer em Santa Maria, RS",
  metaTitle: "Montagem de PC Gamer em Santa Maria | Virtual Games",
  metaDescription: "Montagem de PC Gamer personalizado em Santa Maria, RS. Escolha das peças, montagem profissional, teste e garantia. Diagnóstico grátis. Orçamento em 24h!",
  introParagraphs: [
    "A Virtual Games oferece serviço completo de montagem de PC Gamer em Santa Maria, RS. Desde a escolha das peças ideais para o seu orçamento até a montagem, configuração e testes de desempenho, cuidamos de tudo para você.",
    "Seja seu primeiro PC Gamer ou um upgrade de componentes, nossa equipe monta computadores equilibrados, com foco em performance, refrigeração e estética. Trabalhamos com as melhores marcas do mercado.",
  ],
  servicesList: [
    { name: "Consultoria de Hardware", desc: "Ajudamos você a escolher as peças certas para seu orçamento e tipo de uso (jogos, streaming, trabalho)." },
    { name: "Montagem Completa", desc: "Montagem do gabinete, placa-mãe, processador, memória, GPU, fonte, refrigeração e organização de cabos." },
    { name: "Upgrade de PC", desc: "Troca de placa de vídeo, processador, memória RAM, fonte ou SSD com testes de compatibilidade e desempenho." },
    { name: "Instalação de Sistema e Drivers", desc: "Instalação do Windows, drivers, BIOS update e configurações essenciais de performance." },
    { name: "Limpeza e Manutenção", desc: "Limpeza interna, troca de pasta térmica e otimização da refrigeração do seu PC Gamer." },
  ],
  processSteps: [
    { title: "Consultoria gratuita", desc: "Conversamos sobre seu orçamento, jogos e necessidades. Sugerimos a melhor build." },
    { title: "Aquisição das peças", desc: "Você compra as peças ou podemos ajudar com fornecedores parceiros." },
    { title: "Montagem profissional", desc: "Montamos seu PC com organização de cabos e testes de cada componente." },
    { title: "Entrega e garantia", desc: "Você recebe seu PC pronto, testado e com garantia de 90 dias na montagem." },
  ],
  whyChooseItems: [
    "Consultoria personalizada baseada no seu orçamento e tipo de jogo",
    "Montagem profissional com cable management impecável",
    "Testes de estresse e temperatura antes da entrega",
    "Garantia de 90 dias na montagem e suporte pós-venda",
    "Técnicos que montam e jogam — conhecemos cada peça na prática",
  ],
  faqs: [
    { question: "Vocês montam PC Gamer do zero?", answer: "Sim, montamos PCs completos. Você pode trazer as peças ou contar com nossa consultoria para escolher a configuração ideal para seu orçamento e necessidades." },
    { question: "Quanto custa montar um PC Gamer básico em Santa Maria?", answer: "O custo de montagem (mão de obra) é a partir de R$ 200 para PCs básicos, R$ 350 para intermediários com water cooler. O valor das peças depende da configuração escolhida." },
    { question: "Vocês fazem upgrade de PC Gamer existente?", answer: "Sim, realizamos upgrades de GPU, CPU, RAM, fonte, armazenamento e refrigeração. Testamos compatibilidade e performance antes de entregar." },
    { question: "Qual é o prazo para montagem de PC Gamer?", answer: "A montagem é feita em 1 a 3 dias úteis após a chegada de todas as peças. Upgrades simples podem ser feitos no mesmo dia." },
    { question: "A Virtual Games oferece suporte após a montagem?", answer: "Sim, oferecemos garantia de 90 dias na montagem e suporte técnico para dúvidas. Se houver qualquer problema com a montagem, corrigimos sem custo." },
  ],
  testimonials: [
    { name: "André L.", role: "Cliente de Montagem PC Gamer", text: "Montei meu primeiro PC Gamer com a Virtual Games. Me ajudaram a escolher cada peça e o resultado ficou incrível. Cable management impecável!" },
    { name: "Fernanda M.", role: "Cliente de Upgrade PC", text: "Fiz upgrade de GPU e fonte. Testaram tudo, atualizaram drivers e entregaram no mesmo dia. PC rodando tudo no ultra agora." },
  ],
  whatsappPreText: "Olá! Gostaria de um orçamento para montagem de PC Gamer.",
  relatedLinks: [
    { href: "/servicos/manutencao-ps5", label: "Manutenção PS5" },
    { href: "/servicos/limpeza-preventiva", label: "Limpeza Preventiva" },
    { href: "/servicos/manutencao-xbox", label: "Reparo Xbox" },
  ],
  serviceName: "Montagem de PC Gamer",
  serviceDescription: "Montagem e upgrade de PC Gamer personalizado em Santa Maria, RS. Consultoria gratuita e garantia de 90 dias.",
  serviceType: "Montagem e Upgrade de Computador",
};

export const metadata: Metadata = createServiceMetadata(config);

export default function MontagemPCGamerPage() {
  return <ServicePage config={config} />;
}
