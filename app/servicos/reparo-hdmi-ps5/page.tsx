import { ServicePage, createServiceMetadata } from "@/components/servico/service-page";
import type { Metadata } from "next";

const config = {
  slug: "reparo-hdmi-ps5",
  h1: "Reparo da Porta HDMI do PS5 em Santa Maria, RS",
  metaTitle: "Reparo HDMI PS5 em Santa Maria | Virtual Games",
  metaDescription: "Especialistas em reparo da porta HDMI do PS5 em Santa Maria. Solda de precisão, peças de qualidade. Diagnóstico grátis, garantia 90 dias. Orçamento em 24h!",
  introParagraphs: [
    "O reparo da porta HDMI é o serviço mais procurado para PS5 da Virtual Games, em Santa Maria. Se seu console não dá imagem ou o sinal fica piscando, provavelmente a porta HDMI está danificada — problema muito comum no PS5.",
    "Nossa equipe realiza a troca da porta HDMI com solda de precisão (microsoldagem), usando estação de retrabalho profissional. Peças de alta qualidade, diagnóstico gratuito e garantia de 90 dias.",
  ],
  servicesList: [
    { name: "Troca da Porta HDMI PS5", desc: "Substituição completa do conector HDMI com solda BGA/superficial de precisão. Teste em TV 4K com HDR." },
    { name: "Diagnóstico HDMI", desc: "Nem sempre é a porta. Diagnosticamos se o problema é no conector, trilha ou chip de vídeo antes de qualquer serviço." },
    { name: "Reparo de Trilha HDMI", desc: "Quando a porta é arrancada, trilhas da placa podem romper. Recuperamos com fio jumper e solda." },
    { name: "Chip HDMI PS5", desc: "Se o chip codificador HDMI estiver danificado, substituímos com solda BGA e testamos todas as resoluções." },
  ],
  processSteps: [
    { title: "Traga seu PS5", desc: "Traga o console para diagnóstico em Santa Maria. Avaliamos o defeito." },
    { title: "Diagnóstico preciso", desc: "Identificamos se o problema é na porta, trilha ou chip. Orçamento detalhado." },
    { title: "Troca com microsoldagem", desc: "Removemos a porta danificada e soldamos uma nova com equipamento profissional." },
    { title: "Teste e garantia", desc: "Testamos em TV 4K com diferentes resoluções. Garantia de 90 dias." },
  ],
  whyChooseItems: [
    "Especialistas em reparo HDMI do PS5 — dezenas de consoles reparados por mês",
    "Solda profissional com estação de retrabalho — nada de ferro de solda caseiro",
    "Diagnóstico preciso — diferenciamos defeito de porta, trilha e chip",
    "Garantia de 90 dias — se a porta HDMI falhar, trocamos de novo sem custo",
  ],
  faqs: [
    { question: "Como saber se a porta HDMI do PS5 está com problema?", answer: "Sintomas: tela preta, imagem piscando, 'sem sinal' na TV, ou imagem com artefatos. Se o console liga mas não dá vídeo, o problema provavelmente está na porta HDMI." },
    { question: "Quanto custa o reparo da porta HDMI do PS5?", answer: "A troca da porta HDMI custa entre R$ 250 e R$ 400, dependendo se há danos nas trilhas da placa. O diagnóstico é gratuito e você recebe o valor exato antes do reparo começar." },
    { question: "Quanto tempo leva o reparo da porta HDMI?", answer: "O reparo de porta HDMI é concluído em 1 a 3 dias úteis. Casos com trilha rompida podem levar até 5 dias." },
    { question: "Vocês oferecem atendimento de emergência para HDMI?", answer: "Sim, em casos urgentes podemos priorizar seu reparo. Consulte disponibilidade via WhatsApp (55) 99725-2786." },
    { question: "A nova porta HDMI tem garantia?", answer: "Sim, garantia de 90 dias na porta HDMI trocada e na mão de obra. Se houver qualquer problema no período, trocamos novamente sem custo." },
  ],
  testimonials: [
    { name: "Ricardo A.", role: "Cliente Reparo HDMI PS5", text: "Puxei o cabo e a porta HDMI quebrou. Levei na Virtual Games e em 2 dias estava pronto. Imagem perfeita em 4K HDR." },
    { name: "Daniela C.", role: "Cliente Reparo HDMI", text: "PS5 não dava vídeo. Acharam trilha rompida além da porta. Consertaram tudo e testaram na minha frente. Profissionais!" },
  ],
  whatsappPreText: "Olá! Gostaria de um orçamento para reparo da porta HDMI do meu PS5.",
  relatedLinks: [
    { href: "/servicos/manutencao-ps5", label: "Manutenção PS5" },
    { href: "/servicos/upgrade-ssd-ps5", label: "Upgrade SSD PS5" },
    { href: "/servicos/limpeza-preventiva", label: "Limpeza Preventiva" },
  ],
  serviceName: "Reparo da Porta HDMI do PS5",
  serviceDescription: "Troca da porta HDMI do PS5 com solda de precisão em Santa Maria, RS. Diagnóstico gratuito e garantia de 90 dias.",
  serviceType: "Reparo de Console",
};

export const metadata: Metadata = createServiceMetadata(config);

export default function ReparoHdmiPs5Page() {
  return <ServicePage config={config} />;
}
