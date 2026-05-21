import { ServicePage, createServiceMetadata } from "@/components/servico/service-page";
import type { Metadata } from "next";

const config = {
  slug: "upgrade-ssd-ps5",
  h1: "Upgrade de SSD no PS5 — Santa Maria, RS",
  metaTitle: "Upgrade de SSD PS5 em Santa Maria",
  metaDescription: "Upgrade de SSD NVMe no PS5 em Santa Maria. Instalação profissional, testes de velocidade. Diagnóstico grátis, garantia 90 dias. Orçamento em 24h!",
  introParagraphs: [
    "Sem espaço no seu PS5? A Virtual Games realiza o upgrade de SSD NVMe no PlayStation 5 em Santa Maria. Instalamos o SSD, configuramos o sistema e testamos a velocidade de leitura — tudo com garantia de 90 dias.",
    "O PS5 tem slot dedicado para expansão de armazenamento SSD NVMe. Escolhemos e instalamos o SSD ideal para o seu uso, garantindo compatibilidade e performance máxima.",
  ],
  servicesList: [
    { name: "Consultoria de SSD", desc: "Ajudamos você a escolher o SSD NVMe ideal para seu PS5: velocidade, capacidade e custo-benefício." },
    { name: "Instalação de SSD", desc: "Instalação profissional no slot M.2 do PS5 com dissipador térmico adequado." },
    { name: "Configuração e Teste", desc: "Formatamos o SSD, configuramos como armazenamento padrão e testamos a velocidade de leitura." },
    { name: "Transferência de Jogos", desc: "Transferimos seus jogos do SSD interno para o novo armazenamento." },
  ],
  processSteps: [
    { title: "Escolha do SSD", desc: "Selecionamos o SSD compatível com a velocidade exigida pelo PS5 (mín. 5500MB/s)." },
    { title: "Instalação profissional", desc: "Abertura do PS5, instalação no slot M.2 com dissipador e fechamento." },
    { title: "Configuração", desc: "Formatamos o SSD e configuramos o PS5. Teste de velocidade de leitura." },
    { title: "Pronto para jogar", desc: "Você leva seu PS5 com armazenamento expandido e garantia de 90 dias." },
  ],
  whyChooseItems: [
    "Instalação profissional — sem risco de danificar o slot M.2",
    "Consultoria para escolher o SSD com melhor custo-benefício",
    "Teste de velocidade de leitura para confirmar compatibilidade",
    "Garantia de 90 dias na instalação",
  ],
  faqs: [
    { question: "Qual SSD é compatível com o PS5?", answer: "O PS5 requer SSD NVMe PCIe Gen4 com velocidade de leitura mínima de 5500MB/s. Marcas recomendadas: WD Black SN850, Samsung 980 Pro, Kingston Fury Renegade, entre outros. Nós ajudamos a escolher." },
    { question: "Preciso comprar o SSD ou vocês têm?", answer: "Você pode trazer seu próprio SSD NVMe compatível ou adquirir conosco. Consulte-nos pelo WhatsApp para mais informações." },
    { question: "Instalar SSD no PS5 anula a garantia da Sony?", answer: "Não, a Sony projetou o PS5 com slot de expansão acessível ao usuário. A instalação de SSD não afeta a garantia do console." },
    { question: "Quanto tempo leva a instalação?", answer: "A instalação do SSD é feita em 1 a 2 horas. Se precisar transferir jogos, pode levar mais tempo dependendo do volume de dados." },
    { question: "Vale a pena fazer upgrade de SSD no PS5?", answer: "Sim, o armazenamento interno do PS5 (825GB, ~667GB útil) enche rápido. Um SSD de 1TB ou 2TB resolve o problema de espaço e mantém a mesma performance do SSD interno." },
  ],
  testimonials: [
    { name: "Gustavo P.", role: "Cliente Upgrade SSD PS5", text: "Instalei SSD de 2TB com eles. Processo rápido, testaram velocidade na minha frente. Agora tenho 20 jogos instalados sem preocupação!" },
    { name: "Leonardo S.", role: "Cliente Upgrade SSD", text: "Comprei SSD errado (muito lento). Eles me orientaram, troquei e instalaram o correto. Profissionais que entendem do assunto." },
  ],
  whatsappPreText: "Olá! Gostaria de um orçamento para upgrade de SSD no meu PS5.",
  relatedLinks: [
    { href: "/servicos/manutencao-ps5", label: "Manutenção PS5" },
    { href: "/servicos/reparo-hdmi-ps5", label: "Reparo HDMI PS5" },
    { href: "/servicos/montagem-pc-gamer", label: "Montagem PC Gamer" },
  ],
  serviceName: "Upgrade de SSD no PS5",
  serviceDescription: "Instalação profissional de SSD NVMe no PS5 em Santa Maria. Consultoria, teste de velocidade e garantia de 90 dias.",
  serviceType: "Upgrade de Console",
};

export const metadata: Metadata = createServiceMetadata(config);

export default function UpgradeSsdPs5Page() {
  return <ServicePage config={config} />;
}
