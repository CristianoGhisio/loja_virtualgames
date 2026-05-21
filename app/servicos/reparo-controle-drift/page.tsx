import { ServicePage, createServiceMetadata } from "@/components/servico/service-page";
import type { Metadata } from "next";

const config = {
  slug: "reparo-controle-drift",
  h1: "Reparo de Controle com Drift em Santa Maria, RS",
  metaTitle: "Reparo de Controle com Drift em Santa Maria",
  metaDescription: "Conserto de drift em controles PS5, Xbox e Nintendo Switch em Santa Maria. Troca de analógicos com calibragem profissional. Garantia 90 dias. Orçamento em 24h!",
  introParagraphs: [
    "Seu controle está com drift? O analógico se move sozinho e atrapalha a gameplay? A Virtual Games é especializada em reparo de controles com drift em Santa Maria, RS. Atendemos DualSense (PS5), controle Xbox Series e Joy-Con do Nintendo Switch.",
    "O drift é um dos problemas mais comuns em controles modernos. Nossa equipe substitui os analógicos por componentes de alta qualidade e realiza calibragem profissional. Diagnóstico gratuito e garantia de 90 dias.",
  ],
  servicesList: [
    { name: "Drift DualSense (PS5)", desc: "Troca do módulo analógico com solda de precisão. Calibragem e teste em jogo." },
    { name: "Drift Controle Xbox", desc: "Substituição dos analógicos do controle Xbox Series X/S e Xbox One. Teste de deadzone." },
    { name: "Drift Joy-Con (Switch)", desc: "Troca dos analógicos do Joy-Con esquerdo ou direito. Calibragem via software do Switch." },
    { name: "Botões com Mau Contato", desc: "Reparo ou substituição de botões (L1/R1, L2/R2, X, O, etc.) com membrana nova." },
    { name: "Gatilhos com Problema", desc: "Reparo de gatilhos adaptativos do DualSense e gatilhos analógicos do Xbox." },
  ],
  processSteps: [
    { title: "Traga seu controle", desc: "Venha até a loja em Santa Maria com o controle defeituoso." },
    { title: "Diagnóstico gratuito", desc: "Testamos o drift e identificamos quais analógicos precisam de troca." },
    { title: "Orçamento e aprovação", desc: "Informamos o diagnóstico e prazo. Você aprova antes do reparo." },
    { title: "Reparo com garantia", desc: "Trocamos os analógicos, calibramos e testamos. Garantia de 90 dias." },
  ],
  whyChooseItems: [
    "Especialistas em drift — resolvemos dezenas de controles por mês",
    "Peças de qualidade testadas — nada de analógicos genéricos",
    "Calibragem profissional pós-reparo em todos os controles",
    "Garantia de 90 dias no reparo",
    "Atendemos os 3 consoles principais: PS5, Xbox e Switch",
  ],
  faqs: [
    { question: "Controle com drift tem conserto?", answer: "Sim! O drift é causado pelo desgaste dos analógicos. Substituímos o módulo analógico completo e o controle volta a funcionar como novo. É um reparo definitivo." },
    { question: "Qual o preço para trocar analógico do controle PS5?", answer: "A troca de analógico do DualSense custa a partir de R$ 120 por analógico. Se ambos estiverem com drift, o valor é a partir de R$ 200. O diagnóstico é gratuito." },
    { question: "Vocês consertam controles Xbox e Nintendo?", answer: "Sim, reparamos controles de Xbox (Series X/S, One) e Joy-Con do Nintendo Switch. Cada modelo tem seu processo específico que dominamos." },
    { question: "Quanto tempo leva o reparo do controle?", answer: "A maioria dos reparos de controle é feita em 24h. Se houver alta demanda, em até 2 dias úteis. Você pode esperar ou retirar depois." },
    { question: "Qual a garantia do reparo de controles?", answer: "90 dias de garantia em peças e mão de obra. Se o drift voltar nesse período, trocamos o analógico novamente." },
  ],
  testimonials: [
    { name: "Pedro H.", role: "Cliente DualSense Drift", text: "Meu DualSense estava injogável de tanto drift. Trocaram os dois analógicos e ficou zero! Nem parece o mesmo controle." },
    { name: "João V.", role: "Cliente Joy-Con Drift", text: "Dois pares de Joy-Con com drift. Fizeram a troca no mesmo dia. Finalmente posso jogar Splatoon em paz!" },
  ],
  whatsappPreText: "Olá! Gostaria de um orçamento para reparo de drift no meu controle.",
  relatedLinks: [
    { href: "/servicos/manutencao-ps5", label: "Manutenção PS5" },
    { href: "/servicos/manutencao-xbox", label: "Reparo Xbox" },
    { href: "/servicos/manutencao-nintendo-switch", label: "Reparo Switch" },
  ],
  serviceName: "Reparo de Controle com Drift",
  serviceDescription: "Conserto de drift em controles PS5, Xbox e Nintendo Switch em Santa Maria. Troca de analógicos com garantia de 90 dias.",
  serviceType: "Reparo de Periférico",
};

export const metadata: Metadata = createServiceMetadata(config);

export default function ReparoControleDriftPage() {
  return <ServicePage config={config} />;
}
