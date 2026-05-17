import { ServicePage, createServiceMetadata } from "@/components/servico/service-page";
import type { Metadata } from "next";

const config = {
  slug: "manutencao-nintendo-switch",
  h1: "Assistência Técnica Nintendo Switch em Santa Maria",
  metaTitle: "Conserto Nintendo Switch em Santa Maria | Virtual Games",
  metaDescription: "Assistência técnica Nintendo Switch em Santa Maria: tela quebrada, bateria, drift no Joy-Con. Diagnóstico grátis, garantia 90 dias. Orçamento em 24h!",
  introParagraphs: [
    "A Virtual Games é especializada em reparo de Nintendo Switch, Switch Lite e Switch OLED em Santa Maria, RS. Seja tela rachada, bateria viciada, drift no Joy-Con ou console que não liga, nossa equipe resolve.",
    "Trabalhamos com todos os modelos da linha Switch. Diagnóstico gratuito, orçamento transparente e garantia de 90 dias em todos os serviços.",
  ],
  servicesList: [
    { name: "Troca de Tela", desc: "Substituição de tela LCD do Switch, Switch Lite ou OLED. Usamos telas de alta qualidade." },
    { name: "Drift no Joy-Con", desc: "Troca dos analógicos com calibragem profissional. Resolvemos drift em qualquer modelo." },
    { name: "Troca de Bateria", desc: "Substituição de bateria interna com teste de carga e autonomia." },
    { name: "Console Não Liga", desc: "Diagnóstico completo de placa, bateria e circuito de carga." },
    { name: "Não Carrega", desc: "Reparo da porta USB-C, troca de conector e verificação do circuito de carga." },
  ],
  processSteps: [
    { title: "Traga seu console", desc: "Venha até a loja em Santa Maria ou envie pelo correio." },
    { title: "Diagnóstico gratuito", desc: "Analisamos o defeito e informamos prazo e valor." },
    { title: "Você aprova", desc: "Orçamento transparente — você decide antes de começarmos." },
    { title: "Reparo com garantia", desc: "Executamos o serviço com peças de qualidade. Garantia de 90 dias." },
  ],
  whyChooseItems: [
    "Especialistas em toda a linha Nintendo Switch",
    "Diagnóstico gratuito — sem custo para avaliar seu console",
    "Garantia de 90 dias em peças e mão de obra",
    "Peças de qualidade testadas antes da instalação",
  ],
  faqs: [
    { question: "Vocês consertam Nintendo Switch com tela quebrada?", answer: "Sim, trocamos telas de Switch, Switch Lite e Switch OLED. O serviço inclui a substituição completa do display com teste de touchscreen e qualidade de imagem." },
    { question: "Quanto custa consertar um Nintendo Switch?", answer: "O diagnóstico é gratuito. Troca de tela: a partir de R$ 350 (varia por modelo). Reparo de Joy-Con com drift: a partir de R$ 120 por controle. O valor exato depende do defeito." },
    { question: "Vocês consertam Nintendo Switch Lite e OLED?", answer: "Sim, trabalhamos com todos os modelos: Switch V1/V2, Switch Lite e Switch OLED. Cada modelo tem particularidades que nossa equipe domina." },
    { question: "O que fazer quando o Switch não carrega?", answer: "Pode ser problema na porta USB-C, bateria ou circuito de carga. Traga para diagnóstico gratuito. Identificamos a causa e apresentamos o orçamento." },
    { question: "Qual a garantia do reparo do Switch?", answer: "90 dias de garantia em peças e mão de obra. Se houver qualquer problema relacionado ao serviço realizado, reavaliamos sem custo." },
  ],
  testimonials: [
    { name: "Marina A.", role: "Cliente Switch OLED", text: "Derramei água no meu Switch OLED. Acharam oxidação na placa e recuperaram! Perdi só a bateria que foi trocada. Atendimento incrível." },
    { name: "Thiago R.", role: "Cliente Joy-Con Drift", text: "Dois Joy-Cons com drift severo. Trocaram os analógicos e calibraram. Ficaram melhores que novos. Recomendo!" },
  ],
  whatsappPreText: "Olá! Gostaria de um orçamento para reparo do meu Nintendo Switch.",
  relatedLinks: [
    { href: "/servicos/reparo-controle-drift", label: "Reparo de Controle" },
    { href: "/servicos/reparo-celular", label: "Reparo de Celular" },
    { href: "/servicos/manutencao-ps5", label: "Manutenção PS5" },
  ],
  serviceName: "Reparo Nintendo Switch",
  serviceDescription: "Conserto de Nintendo Switch, Switch Lite e Switch OLED em Santa Maria, RS. Diagnóstico gratuito e garantia de 90 dias.",
  serviceType: "Reparo de Console Portátil",
};

export const metadata: Metadata = createServiceMetadata(config);

export default function ManutencaoSwitchPage() {
  return <ServicePage config={config} />;
}
