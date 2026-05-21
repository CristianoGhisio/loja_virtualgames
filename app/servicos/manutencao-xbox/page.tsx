import { ServicePage, createServiceMetadata } from "@/components/servico/service-page";
import type { Metadata } from "next";

const config = {
  slug: "manutencao-xbox",
  h1: "Reparo e Manutenção de Xbox em Santa Maria, RS",
  metaTitle: "Reparo de Xbox Series X/S e Xbox One em Santa Maria",
  metaDescription: "Assistência técnica Xbox em Santa Maria: Series X/S e Xbox One. Diagnóstico grátis, garantia 90 dias. Superaquecimento, HDMI, disco e mais. Orçamento em 24h!",
  introParagraphs: [
    "A Virtual Games oferece assistência técnica especializada em Xbox Series X, Xbox Series S e Xbox One em Santa Maria, RS. Diagnosticamos e reparamos todos os modelos com equipamentos profissionais e peças de qualidade.",
    "Seja superaquecimento, porta HDMI danificada, leitor de disco com problema ou console que não liga, nossa equipe está pronta para recuperar seu Xbox com garantia de 90 dias.",
  ],
  servicesList: [
    { name: "Reparo HDMI Xbox Series X/S", desc: "Substituição da porta HDMI com solda de precisão. Recuperamos imagem e som do seu Xbox." },
    { name: "Superaquecimento", desc: "Limpeza interna, troca de pasta térmica e verificação do sistema de refrigeração." },
    { name: "Disco Não Lê (Xbox Series X/One)", desc: "Reparo ou troca do leitor óptico. Testamos com jogos originais após o serviço." },
    { name: "Console Não Liga", desc: "Diagnóstico de fonte, placa-mãe e trilhas. Identificamos a causa exata antes do orçamento." },
    { name: "Controle com Drift", desc: "Troca de analógicos do controle Xbox com calibragem profissional." },
  ],
  processSteps: [
    { title: "Traga seu Xbox", desc: "Atendimento presencial em Santa Maria ou envio via correio." },
    { title: "Diagnóstico grátis", desc: "Análise completa do console em até 24h." },
    { title: "Orçamento transparente", desc: "Você aprova antes de qualquer reparo começar." },
    { title: "Garantia de 90 dias", desc: "Reparo concluído com peças de qualidade e garantia total." },
  ],
  whyChooseItems: [
    "Especialização em consoles Xbox — Series X, Series S e Xbox One",
    "Diagnóstico 100% gratuito — você só autoriza após conhecer o orçamento",
    "Garantia de 90 dias em todas as peças e mão de obra",
    "Técnicos gamers que conhecem profundamente o ecossistema Xbox",
  ],
  faqs: [
    { question: "Vocês consertam Xbox Series X e Xbox One?", answer: "Sim, reparamos todos os modelos: Xbox Series X, Xbox Series S, Xbox One, Xbox One S e Xbox One X. Temos experiência com toda a linha Xbox." },
    { question: "Quanto tempo leva o reparo do Xbox?", answer: "A maioria dos reparos leva de 2 a 5 dias úteis. Problemas simples como limpeza são resolvidos em 24h. Reparos complexos podem levar até 10 dias." },
    { question: "O que fazer quando o Xbox não liga?", answer: "Verifique primeiro o cabo de força e a tomada. Se o problema persistir, traga para diagnóstico gratuito. Pode ser fonte, placa-mãe ou curto em componente." },
    { question: "Qual a garantia do reparo do Xbox?", answer: "Todos os reparos têm 90 dias de garantia em peças e mão de obra. Se o mesmo problema retornar, reavaliamos e corrigimos." },
  ],
  testimonials: [
    { name: "Bruno C.", role: "Cliente de Reparo Xbox Series X", text: "Meu Series X não ligava depois de uma queda de energia. Acharam o curto na placa e consertaram em 3 dias. Voltou perfeito!" },
    { name: "Gabriel S.", role: "Cliente de Limpeza Xbox One", text: "Meu Xbox One estava barulhento e desligando. Limpeza e troca de pasta resolveram. Silencioso e frio de novo." },
  ],
  whatsappPreText: "Olá! Gostaria de um orçamento para reparo do meu Xbox.",
  relatedLinks: [
    { href: "/servicos/manutencao-ps5", label: "Manutenção PS5" },
    { href: "/servicos/reparo-controle-drift", label: "Reparo de Controle" },
    { href: "/servicos/limpeza-preventiva", label: "Limpeza Preventiva" },
  ],
  serviceName: "Reparo de Xbox",
  serviceDescription: "Reparo especializado em Xbox Series X/S e Xbox One em Santa Maria, RS. Diagnóstico gratuito e garantia de 90 dias.",
  serviceType: "Reparo de Console",
};

export const metadata: Metadata = createServiceMetadata(config);

export default function ManutencaoXboxPage() {
  return <ServicePage config={config} />;
}
