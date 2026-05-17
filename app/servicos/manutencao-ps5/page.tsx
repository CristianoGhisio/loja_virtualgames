import { ServicePage, createServiceMetadata } from "@/components/servico/service-page";
import type { Metadata } from "next";

const config = {
  slug: "manutencao-ps5",
  h1: "Manutenção e Reparo de PS5 em Santa Maria, RS",
  metaTitle: "Manutenção e Reparo de PS5 em Santa Maria | Virtual Games",
  metaDescription: "Assistência técnica especializada em PS5 em Santa Maria, RS. Diagnóstico grátis, garantia de 90 dias. Reparo de HDMI, superaquecimento, disco e mais. Orçamento em 24h!",
  introParagraphs: [
    "A Virtual Games é a assistência técnica especializada em manutenção de PS5 em Santa Maria, RS. Somos gamers e entendemos a frustração de ter seu console favorito parado. Por isso, oferecemos diagnóstico gratuito, orçamento transparente e garantia de 90 dias em todos os reparos.",
    "Seja qual for o problema do seu PlayStation 5 — superaquecimento, porta HDMI sem sinal, disco que não lê, travamentos ou até mesmo console que não liga — nossa equipe técnica está preparada para devolver seu PS5 funcionando perfeitamente.",
  ],
  servicesList: [
    { name: "Reparo da Porta HDMI", desc: "Substituição da porta HDMI danificada com solda profissional. Serviço mais procurado em PS5." },
    { name: "Superaquecimento e Limpeza", desc: "Limpeza interna completa, troca de pasta térmica e thermal pads. Resolvemos desligamentos por temperatura." },
    { name: "Disco Que Não Lê", desc: "Reparo ou substituição do leitor de disco do PS5. Testamos com mídia original após o reparo." },
    { name: "Console Não Liga", desc: "Diagnóstico completo da fonte, placa-mãe e componentes. Identificamos a causa raiz antes de qualquer cobrança." },
    { name: "Upgrade de SSD", desc: "Instalação de SSD NVMe para expansão de armazenamento. Configuramos o sistema e testamos desempenho." },
    { name: "Travamentos e Artefatos", desc: "Diagnóstico de GPU e RAM. Reparo de BGA quando necessário. Seu PS5 rodando liso novamente." },
  ],
  processSteps: [
    { title: "Traga ou envie seu PS5", desc: "Venha até nossa loja em Santa Maria ou solicite coleta via WhatsApp." },
    { title: "Diagnóstico gratuito em até 24h", desc: "Analisamos seu console completamente e informamos o problema e valor." },
    { title: "Você aprova o orçamento", desc: "Transparência total: você sabe exatamente o que será feito e quanto custa." },
    { title: "Reparo com garantia de 90 dias", desc: "Executamos o serviço com peças de qualidade e você retira funcionando." },
  ],
  whyChooseItems: [
    "Especialização exclusiva em consoles — não somos assistência genérica",
    "Diagnóstico 100% gratuito — você só paga se autorizar o reparo",
    "Garantia de 90 dias em peças e mão de obra",
    "Equipe técnica formada por gamers que conhecem cada detalhe do PS5",
    "Orçamento em até 24h via WhatsApp — resposta rápida e transparente",
  ],
  faqs: [
    { question: "Quanto custa consertar um PS5?", answer: "O valor depende do defeito. Um reparo de porta HDMI custa entre R$ 250 e R$ 400. Limpeza preventiva com troca de pasta térmica a partir de R$ 150. O diagnóstico é gratuito e você recebe o orçamento antes de autorizar." },
    { question: "Quanto tempo leva o reparo de PS5?", answer: "A maioria dos reparos de PS5 é concluída em 2 a 5 dias úteis. Reparos simples como limpeza são feitos em 24h. Serviços mais complexos como reparo de placa podem levar até 10 dias." },
    { question: "A Virtual Games usa peças originais no PS5?", answer: "Utilizamos peças de alta qualidade e, quando disponível, originais. Para portas HDMI e componentes eletrônicos, usamos peças de fornecedores homologados com especificações idênticas às originais." },
    { question: "Meu PS5 está superaquecendo, o que pode ser?", answer: "Superaquecimento geralmente é causado por acúmulo de poeira no dissipador, pasta térmica seca ou falha no cooler. No diagnóstico, abrimos o console, fazemos limpeza profunda e trocamos a pasta térmica. O problema é resolvido na maioria dos casos." },
    { question: "Qual a garantia do reparo do PS5?", answer: "Todos os reparos de PS5 têm garantia de 90 dias para peças e mão de obra. Se o mesmo problema voltar dentro desse período, reavaliamos e corrigimos sem custo adicional." },
  ],
  testimonials: [
    { name: "Lucas M.", role: "Cliente de Reparo PS5", text: "Meu PS5 não dava vídeo. Levei na Virtual Games e em 2 dias estava pronto. Porta HDMI trocada e funcionando perfeitamente. Atendimento nota 10!" },
    { name: "Rafael T.", role: "Cliente de Limpeza PS5", text: "Meu PS5 desligava sozinho depois de 30 minutos. Fizeram limpeza e troca de pasta térmica. Nunca mais desligou. Temperatura baixou muito." },
  ],
  whatsappPreText: "Olá! Gostaria de um orçamento para manutenção do meu PS5.",
  relatedLinks: [
    { href: "/servicos/manutencao-xbox", label: "Reparo Xbox" },
    { href: "/servicos/reparo-hdmi-ps5", label: "Reparo HDMI PS5" },
    { href: "/servicos/upgrade-ssd-ps5", label: "Upgrade SSD PS5" },
  ],
  serviceName: "Manutenção de PS5",
  serviceDescription: "Reparo especializado em PlayStation 5 em Santa Maria, RS. Diagnóstico gratuito e garantia de 90 dias.",
  serviceType: "Reparo de Console",
};

export const metadata: Metadata = createServiceMetadata(config);

export default function ManutencaoPs5Page() {
  return <ServicePage config={config} />;
}
