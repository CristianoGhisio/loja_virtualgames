import { ServicePage, createServiceMetadata } from "@/components/servico/service-page";
import type { Metadata } from "next";

const config = {
  slug: "reparo-celular",
  h1: "Reparo de Celular em Santa Maria — iPhone e Android",
  metaTitle: "Reparo de Celular em Santa Maria | Virtual Games",
  metaDescription: "Reparo de celular em Santa Maria: troca de tela iPhone e Android, bateria, carregador. Diagnóstico grátis, garantia 90 dias. Orçamento em 24h!",
  introParagraphs: [
    "A Virtual Games também oferece serviço de reparo de celular em Santa Maria, RS. Atendemos iPhones e smartphones Android com o mesmo padrão de qualidade e garantia de 90 dias que nos consoles.",
    "Troca de tela, substituição de bateria, reparo de conector de carga e diagnóstico de placa. Tudo com transparência: diagnóstico gratuito e orçamento antes de qualquer serviço.",
  ],
  servicesList: [
    { name: "Troca de Tela", desc: "Substituição de display em iPhones e Android. Usamos telas de alta qualidade com teste de toque e imagem." },
    { name: "Troca de Bateria", desc: "Bateria desgastada? Substituímos por bateria nova com teste de carga e autonomia." },
    { name: "Conector de Carga", desc: "Reparo ou troca da porta de carregamento. Seu celular carregando normalmente." },
    { name: "Celular Não Liga", desc: "Diagnóstico completo de placa, bateria e circuito de carga. Identificamos a causa raiz." },
  ],
  processSteps: [
    { title: "Traga seu celular", desc: "Venha até a loja em Santa Maria com o aparelho." },
    { title: "Diagnóstico grátis", desc: "Avaliamos o defeito em até 2h na maioria dos casos." },
    { title: "Você aprova", desc: "Informamos valor e prazo exatos. Sem surpresas." },
    { title: "Reparo com garantia", desc: "Serviço concluído com peças de qualidade. 90 dias de garantia." },
  ],
  whyChooseItems: [
    "Diagnóstico gratuito em todos os aparelhos",
    "Garantia de 90 dias em peças e mão de obra",
    "Transparência total no orçamento",
    "Atendimento rápido — maioria dos reparos no mesmo dia",
  ],
  faqs: [
    { question: "Quanto custa a troca de tela de celular em Santa Maria?", answer: "O valor varia conforme o modelo. Troca de tela iPhone: a partir de R$ 350. Android: a partir de R$ 250. O diagnóstico é gratuito e o orçamento é informado antes do reparo." },
    { question: "Vocês consertam iPhone e Android?", answer: "Sim, trabalhamos com iPhones (todas as gerações) e smartphones Android das principais marcas: Samsung, Motorola, Xiaomi e outras." },
    { question: "Quanto tempo demora o reparo de celular?", answer: "Trocas de tela e bateria geralmente são feitas no mesmo dia. Reparos mais complexos de placa podem levar de 2 a 5 dias úteis." },
    { question: "Vocês oferecem garantia no reparo de celular?", answer: "Sim, todos os reparos de celular têm garantia de 90 dias em peças e mão de obra, mesmo padrão dos consoles." },
    { question: "Preciso deixar a senha do celular para o reparo?", answer: "Para testar a tela e funções após o reparo, solicitamos que desabilite a senha temporariamente. Seus dados não são acessados." },
  ],
  testimonials: [
    { name: "Camila R.", role: "Cliente Troca de Tela", text: "Tela do iPhone rachada. Trocaram em 2h e ficou perfeita. Atendimento rápido e preço justo." },
    { name: "Diego F.", role: "Cliente Troca de Bateria", text: "Bateria do meu Android não durava nada. Trocaram e agora dura o dia todo. Recomendo!" },
  ],
  whatsappPreText: "Olá! Gostaria de um orçamento para reparo de celular.",
  relatedLinks: [
    { href: "/servicos/manutencao-ps5", label: "Manutenção PS5" },
    { href: "/servicos/manutencao-xbox", label: "Reparo Xbox" },
    { href: "/servicos/manutencao-nintendo-switch", label: "Reparo Switch" },
  ],
  serviceName: "Reparo de Celular",
  serviceDescription: "Reparo de celular iPhone e Android em Santa Maria: troca de tela, bateria e reparos. Garantia de 90 dias.",
  serviceType: "Reparo de Dispositivo Móvel",
};

export const metadata: Metadata = createServiceMetadata(config);

export default function ReparoCelularPage() {
  return <ServicePage config={config} />;
}
