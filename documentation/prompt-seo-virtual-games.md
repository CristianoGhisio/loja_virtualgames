# Prompt de Implementação SEO — Virtual Games
## Instruções para Execução por IA (Etapa por Etapa)

---

> **REGRA CRÍTICA DE EXECUÇÃO:**
> Você é um engenheiro de SEO técnico. Execute **uma etapa por vez**. Após cada etapa, apresente o código implementado, explique o que foi feito e **AGUARDE CONFIRMAÇÃO EXPLÍCITA** ("próximo", "ok", "continuar") antes de avançar. Nunca salte etapas. Nunca execute mais de uma etapa por resposta. Se encontrar um problema em qualquer etapa, resolva-o completamente antes de prosseguir.

---

## Contexto do Projeto

- **Projeto:** Virtual Games — landing page de assistência técnica gamer
- **Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Domínio:** https://virtualgames.com.br
- **Localização:** Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2, Santa Maria/RS — CEP 97010-002
- **Telefone/WhatsApp:** Conforme `storeInfo.phone` no projeto
- **Horário:** Segunda a sexta 09h–18h30 | Sábado 09h–13h
- **Objetivo:** Ranquear organicamente para "manutenção PS5 Santa Maria", "assistência técnica console Santa Maria" e termos relacionados
- **Diferença técnica importante:** Este projeto usa Next.js com App Router — meta tags ficam no objeto `metadata` em `app/page.tsx` e `app/layout.tsx`; o schema JSON-LD é injetado via `<script>` no componente de página; o sitemap é gerado via `app/sitemap.ts`

---

## ETAPA 1 — Criar o arquivo `robots.txt`

**Objetivo:** Controlar o crawl dos bots de busca, proteger rotas administrativas e comunicar a localização do sitemap. Este arquivo está completamente ausente no projeto.

**O que fazer:**
1. Verificar se o arquivo `/public/robots.txt` existe
2. Se não existir (confirmado pela auditoria), criar com o conteúdo abaixo
3. Confirmar que o arquivo está no diretório correto (`/public/`, não na raiz)

**Arquivo a criar:** `/public/robots.txt`

```txt
# robots.txt - Virtual Games
User-agent: *
Allow: /
Allow: /api/health

Disallow: /api/
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/auth/
Disallow: /*?*

Sitemap: https://virtualgames.com.br/sitemap.xml

# Diretivas específicas para Google
User-agent: Googlebot
Crawl-delay: 1

# Bloquear indexação de assets estáticos do Next.js
User-agent: Googlebot-Image
Disallow: /_next/static/media/*
```

**Validação da etapa:**
- Confirme que o arquivo foi criado em `/public/robots.txt`
- Confirme que a linha `Sitemap:` aponta para a URL correta
- Informe: "Etapa 1 concluída. robots.txt criado em /public/robots.txt."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 2 — Criar o `sitemap.ts` via Next.js App Router

**Objetivo:** Gerar o sitemap automaticamente com o mecanismo nativo do Next.js, garantindo que o Google descubra e indexe todas as seções da landing page.

**O que fazer:**
1. Verificar se o arquivo `app/sitemap.ts` existe no projeto
2. Se não existir, criar com o conteúdo abaixo
3. Confirmar que a variável de ambiente `NEXT_PUBLIC_SITE_URL` está definida (ou usar o fallback hardcoded)

**Arquivo a criar:** `app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://virtualgames.com.br';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#servicos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#equipe`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/#contato`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
```

**Validação da etapa:**
- Confirme que `app/sitemap.ts` foi criado
- Confirme que o Next.js irá gerar automaticamente a rota `/sitemap.xml` ao fazer build
- Verifique se `NEXT_PUBLIC_SITE_URL` está no `.env` ou `.env.local`; se não estiver, informe para adicioná-la
- Informe: "Etapa 2 concluída. app/sitemap.ts criado. O sitemap será gerado em /sitemap.xml após o próximo build."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 3 — Atualizar a `title tag` no metadata

**Objetivo:** Colocar a keyword transacional com geolocalização no início do título, que é o fator de maior peso para CTR e relevância.

**O que fazer:**
1. Localizar o objeto `metadata` em `app/page.tsx` (por volta da linha 21)
2. Encontrar a propriedade `title`
3. Substituir pelo novo valor

**Antes:**
```typescript
title: 'Virtual Games | Manutenção de Consoles e PC Gamer em Santa Maria, RS',
```

**Depois:**
```typescript
title: 'Manutenção de Consoles PS5 Xbox em Santa Maria | Virtual Games',
```

**Regras a verificar:**
- O título deve ter no máximo 60 caracteres (contar e confirmar)
- A keyword transacional deve ser a primeira palavra
- O nome da marca deve aparecer após o separador `|`
- Verificar também se há `title` no `app/layout.tsx` — se houver, verificar se há conflito

**Validação da etapa:**
- Mostre o trecho do arquivo antes e depois
- Confirme o número exato de caracteres
- Informe: "Etapa 3 concluída. Title tag atualizada com X caracteres."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 4 — Atualizar a `meta description`

**Objetivo:** Reescrever a descrição com diferenciais concretos (diagnóstico grátis, garantia de 90 dias) e CTA específico para aumentar o CTR.

**O que fazer:**
1. No mesmo objeto `metadata` em `app/page.tsx`
2. Localizar a propriedade `description`
3. Substituir pelo novo valor

**Antes:**
```typescript
description: 'Assistência técnica especializada em PS5, Xbox, Switch, PC Gamer e celulares em Santa Maria, RS. Reparo com garantia e atendimento rápido. Fale agora pelo WhatsApp!',
```

**Depois:**
```typescript
description: 'Assistência técnica gamer em Santa Maria: PS5, Xbox, Switch, PC Gamer e celulares. Diagnóstico grátis, garantia de 90 dias. Orçamento via WhatsApp em 24h!',
```

**Regras a verificar:**
- A description deve ter no máximo 155 caracteres (contar e confirmar)
- Deve conter: localização, diferenciais concretos ("diagnóstico grátis", "garantia 90 dias"), CTA

**Validação da etapa:**
- Mostre a linha antes e depois
- Confirme o número exato de caracteres (deve ser ≤ 155)
- Informe: "Etapa 4 concluída. Meta description atualizada com X caracteres."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 5 — Remover `meta keywords` (deprecated)

**Objetivo:** Remover o array de `keywords` do metadata, pois o Google não usa essa tag desde 2009 e mantê-la pode causar ruído desnecessário no código.

**O que fazer:**
1. Localizar o array `keywords` no objeto `metadata` em `app/page.tsx` (linhas 21–34 conforme auditoria)
2. Remover completamente o campo `keywords` do objeto
3. Se quiser manter para referência interna (Bing/Yahoo ainda processa), comentar com `//` mas não deixar ativo

**Antes:**
```typescript
keywords: [
  'manutenção PS5 Santa Maria',
  'reparo Xbox Santa Maria',
  'assistência técnica videogame Santa Maria',
  // ... demais keywords
],
```

**Depois (remover ou comentar):**
```typescript
// keywords removidas — Google não indexa meta keywords desde 2009
// Manter lista abaixo apenas como referência de foco de conteúdo:
// manutenção PS5 Santa Maria, reparo Xbox Santa Maria, conserto Switch Santa Maria,
// assistência técnica gamer Santa Maria, montagem PC gamer Santa Maria,
// troca de tela celular Santa Maria, controle PS5 com drift Santa Maria
```

**Validação da etapa:**
- Mostre o objeto `metadata` sem o campo `keywords`
- Confirme que nenhuma outra funcionalidade depende dessa propriedade
- Informe: "Etapa 5 concluída. Meta keywords removidas do metadata."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 6 — Corrigir o `H1` da seção Hero

**Objetivo:** Garantir um H1 único, estático e rastreável pelo Google, contendo a keyword principal. O hero atual usa JavaScript para alternar entre múltiplos H1s dinâmicos, o que prejudica o crawling.

**O que fazer:**
1. Localizar o arquivo `components/sections/hero.tsx`
2. Identificar onde o H1 é renderizado (por volta da linha 122)
3. Adicionar um H1 visualmente oculto (mas rastreável pelo Google) com o texto fixo da keyword principal
4. O H1 visual dinâmico pode continuar existindo como elemento de apresentação, mas NÃO como tag `<h1>`

**Estratégia:**
```tsx
// hero.tsx — adicionar H1 estático oculto ANTES do carrossel visual
// Este H1 é lido pelo Google mas invisível ao usuário

<h1 className="sr-only">
  Manutenção de Consoles PS5 Xbox Switch, PC Gamer e Celulares em Santa Maria | Virtual Games
</h1>

{/* O texto visual do carrossel permanece como <div> ou <span>, nunca como <h1> */}
<div
  aria-hidden="true"
  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black"
>
  {currentSlide.title1}{' '}
  <span className="text-yellow-400">{currentSlide.title2}</span>
</div>
```

**Regras a verificar:**
- Executar busca global por `<h1` em TODOS os componentes — deve existir apenas UM
- A classe `sr-only` do Tailwind torna o elemento invisível visualmente mas rastreável por bots e leitores de tela
- O texto do H1 estático deve conter a keyword principal + geolocalização

**Validação da etapa:**
- Mostre o componente Hero antes e depois das alterações
- Execute `grep -r "<h1" src/` (ou `components/`) e mostre o resultado — deve haver exatamente 1 ocorrência
- Informe: "Etapa 6 concluída. H1 único e estático implementado. Total de H1 no projeto: 1."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 7 — Atualizar Open Graph completo

**Objetivo:** Garantir que compartilhamentos no WhatsApp, Facebook, LinkedIn e Telegram exibam título, descrição e imagem corretos e otimizados.

**O que fazer:**
1. Localizar o objeto `openGraph` dentro do `metadata` em `app/page.tsx`
2. Substituir o bloco inteiro pelo novo abaixo

**Antes:**
```typescript
openGraph: {
  type: 'website',
  locale: 'pt_BR',
  url: siteUrl,
  siteName: 'Virtual Games - Santa Maria, RS',
  title: 'Virtual Games | Manutenção de Consoles e PC Gamer em Santa Maria, RS',
  description: 'Assistência técnica especializada em PS5, Xbox, Switch, PC Gamer e celulares em Santa Maria, RS. Reparo com garantia e atendimento rápido.',
  images: [{ url: `${siteUrl}/og-image.jpg`, width: 1200, height: 630 }],
},
```

**Depois:**
```typescript
openGraph: {
  type: 'website',
  locale: 'pt_BR',
  url: siteUrl,
  siteName: 'Virtual Games - Assistência Técnica Gamer',
  title: 'Manutenção PS5 Xbox Switch PC Gamer Santa Maria | Virtual Games',
  description: 'Assistência técnica gamer em Santa Maria com diagnóstico grátis. PS5, Xbox, Nintendo Switch, PC Gamer. Garantia 90 dias. Solicite orçamento via WhatsApp!',
  images: [
    {
      url: `${siteUrl}/og-image.jpg`,
      width: 1200,
      height: 630,
      alt: 'Virtual Games - Assistência Técnica em Consoles e PC Gamer em Santa Maria, RS',
      type: 'image/jpeg',
    },
  ],
},
```

**ATENÇÃO:** A imagem `og-image.jpg` está referenciada mas pode não existir em `/public/`. Verificar e informar — será tratada na Etapa 9.

**Validação da etapa:**
- Mostre o bloco `openGraph` antes e depois
- Informe se `og-image.jpg` existe ou não em `/public/`
- Informe: "Etapa 7 concluída. Open Graph atualizado."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 8 — Atualizar Twitter Card

**Objetivo:** Garantir exibição correta ao compartilhar no Twitter/X e em outros leitores de cards sociais.

**O que fazer:**
1. Localizar o objeto `twitter` dentro do `metadata` em `app/page.tsx`
2. Substituir pelo bloco atualizado abaixo

**Antes:**
```typescript
twitter: {
  card: 'summary_large_image',
  title: 'Virtual Games | Manutenção de Consoles e PC Gamer em Santa Maria, RS',
  description: 'Assistência técnica especializada em PS5, Xbox, Switch...',
  images: [`${siteUrl}/og-image.jpg`],
},
```

**Depois:**
```typescript
twitter: {
  card: 'summary_large_image',
  title: 'Manutenção PS5 Xbox Switch PC Gamer Santa Maria | Virtual Games',
  description: 'Assistência técnica gamer em Santa Maria com diagnóstico grátis. Garantia 90 dias. Solicite orçamento pelo WhatsApp!',
  images: [`${siteUrl}/og-image.jpg`],
  site: '@virtualgames',
  creator: '@virtualgames',
},
```

**Validação da etapa:**
- Mostre o bloco `twitter` antes e depois
- Informe: "Etapa 8 concluída. Twitter Card atualizado."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 9 — Verificar e registrar ausência da `og-image.jpg`

**Objetivo:** Documentar a ausência da imagem OG e gerar um plano de ação claro, já que a imagem é referenciada em Open Graph, Twitter Card e Schema, mas não existe em `/public/`.

**O que fazer:**
1. Verificar se `/public/og-image.jpg` existe
2. Se não existir, documentar e listar as especificações para criação manual

**Verificação:**
```bash
ls -la public/ | grep og-image
```

**Se não existir, registrar o seguinte plano de ação:**

```
PENDÊNCIA: Criar /public/og-image.jpg manualmente
Dimensões obrigatórias: 1200 x 630 pixels
Formato: JPEG, máximo 200KB
Conteúdo recomendado:
  - Fundo escuro com elementos gamer (cores da marca)
  - Logo "Virtual Games" centralizado e legível
  - Texto: "Assistência Técnica Gamer em Santa Maria"
  - Subtexto: "PS5 | Xbox | PC Gamer | Celulares"
  - Ícone do WhatsApp ou número de contato visível
Ferramentas sugeridas: Canva, Figma, Adobe Express
```

**Validação da etapa:**
- Confirme se o arquivo existe ou não
- Se não existir, registre a pendência e continue (o código já referencia a imagem corretamente; falta apenas o arquivo)
- Informe: "Etapa 9 concluída. og-image.jpg [existe / NÃO existe — pendência registrada para criação manual]."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 10 — Substituir Schema JSON-LD: LocalBusiness completo

**Objetivo:** Substituir o schema `Store` incompleto atual por um `LocalBusiness` completo, com endereço estruturado, coordenadas geográficas, horários, faixa de preço e catálogo de serviços.

**O que fazer:**
1. Localizar o schema JSON-LD atual em `app/page.tsx` (por volta da linha 158–175)
2. Identificar a constante `jsonLd` ou equivalente
3. Substituir o objeto inteiro pelo novo abaixo

**Schema LocalBusiness completo a implementar:**
```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Virtual Games",
  "image": `${siteUrl}/og-image.jpg`,
  "url": siteUrl,
  "telephone": storeInfo.phone,
  "email": storeInfo.email,
  "priceRange": "$$",
  "description": "Assistência técnica especializada em consoles, PC Gamer e celulares em Santa Maria/RS. Diagnóstico gratuito e garantia de 90 dias em todos os serviços.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2",
    "addressLocality": "Santa Maria",
    "addressRegion": "RS",
    "postalCode": "97010-002",
    "addressCountry": "BR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "-29.6881",
    "longitude": "-53.8091"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:30"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday"],
      "opens": "09:00",
      "closes": "13:00"
    }
  ],
  "areaServed": {
    "@type": "City",
    "name": "Santa Maria"
  },
  "sameAs": [
    "https://instagram.com/virtualgames",
    "https://facebook.com/virtualgames"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Serviços de Assistência Técnica Gamer",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Manutenção de Consoles",
          "description": "Reparo especializado em PS5, Xbox Series X/S, Nintendo Switch e demais consoles"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Montagem e Upgrade de PC Gamer",
          "description": "Montagem personalizada e upgrades de PCs para jogos em Santa Maria/RS"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Reparo de Celular",
          "description": "Troca de tela, bateria e reparo em iPhone e Android"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Reparo de Controles",
          "description": "Conserto de drift, analógicos e botões em controles de PS5, Xbox e Switch"
        }
      }
    ]
  }
};
```

**Também verificar se o JSON-LD está sendo injetado corretamente no `<head>`:**
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

**Validação da etapa:**
- Mostre o schema completo após a alteração
- Confirme que o bloco `<script>` está dentro do `<head>` da página
- Confirme que o JSON é válido (sem vírgulas extras ou chaves faltando)
- Informe: "Etapa 10 concluída. Schema LocalBusiness completo implementado."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 11 — Adicionar Schema JSON-LD: FAQPage

**Objetivo:** Ativar rich results de perguntas frequentes nos resultados do Google, aumentando a visibilidade da Virtual Games sem custo adicional.

**O que fazer:**
1. No mesmo arquivo `app/page.tsx`, após a constante `jsonLd` da Etapa 10
2. Criar uma segunda constante `faqJsonLd`
3. Injetar um segundo `<script type="application/ld+json">` no `<head>`

**Schema FAQPage a implementar:**
```typescript
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quanto tempo leva para consertar um PS5 em Santa Maria?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "O conserto de PS5 na Virtual Games em Santa Maria leva em média de 2 a 5 dias úteis, dependendo do tipo de defeito e disponibilidade de peças. O diagnóstico é gratuito."
      }
    },
    {
      "@type": "Question",
      "name": "A Virtual Games oferece garantia nos serviços?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim, todos os serviços realizados na Virtual Games possuem garantia de 90 dias para peças e mão de obra."
      }
    },
    {
      "@type": "Question",
      "name": "Como acompanhar o status do meu equipamento na Virtual Games?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Você pode acompanhar o status do seu equipamento em tempo real pelo número da OS (Ordem de Serviço) diretamente no site da Virtual Games, no campo de busca disponível na seção de serviços."
      }
    },
    {
      "@type": "Question",
      "name": "O diagnóstico do console é gratuito?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim, a Virtual Games realiza o diagnóstico de consoles, PC Gamer e celulares de forma totalmente gratuita. Você só paga se autorizar o serviço de reparo."
      }
    },
    {
      "@type": "Question",
      "name": "A Virtual Games conserta controle com drift de PS5 ou Xbox?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim, realizamos reparo de drift em controles de PS5 (DualSense) e Xbox. O serviço inclui substituição dos analógicos e calibragem. Entre em contato via WhatsApp para solicitar orçamento."
      }
    },
    {
      "@type": "Question",
      "name": "Onde fica a Virtual Games em Santa Maria?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A Virtual Games está localizada na Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2, em Santa Maria/RS. Funcionamos de segunda a sexta das 09h às 18h30 e aos sábados das 09h às 13h."
      }
    }
  ]
};
```

**Injeção no `<head>` (adicionar após o primeiro script):**
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
/>
```

**Validação da etapa:**
- Confirme que há dois blocos JSON-LD no `<head>` sem conflito
- Mostre os dois scripts em sequência
- Confirme que o JSON é válido
- Informe: "Etapa 11 concluída. Schema FAQPage implementado com 6 perguntas."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 12 — Adicionar Schema JSON-LD: Organization (Entity SEO)

**Objetivo:** Definir a Virtual Games como entidade clara no Knowledge Graph do Google, melhorando a compreensão da IA sobre o negócio e favorecendo respostas em ferramentas como Perplexity, ChatGPT e Google SGE.

**O que fazer:**
1. Criar uma terceira constante `organizationJsonLd` em `app/page.tsx`
2. Injetar um terceiro `<script type="application/ld+json">` no `<head>`

**Schema Organization a implementar:**
```typescript
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Virtual Games",
  "alternateName": "VG Games",
  "url": siteUrl,
  "logo": `${siteUrl}/og-image.jpg`,
  "telephone": storeInfo.phone,
  "email": storeInfo.email,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2",
    "addressLocality": "Santa Maria",
    "addressRegion": "RS",
    "postalCode": "97010-002",
    "addressCountry": "BR"
  },
  "areaServed": {
    "@type": "City",
    "name": "Santa Maria",
    "containedInPlace": {
      "@type": "State",
      "name": "Rio Grande do Sul"
    }
  },
  "knowsAbout": [
    "Manutenção de consoles",
    "Reparo de PS5",
    "Reparo de Xbox",
    "Reparo de Nintendo Switch",
    "Montagem de PC Gamer",
    "Assistência técnica mobile",
    "Reparo de controle com drift"
  ],
  "sameAs": [
    "https://instagram.com/virtualgames",
    "https://facebook.com/virtualgames"
  ]
};
```

**Validação da etapa:**
- Confirme que há três blocos JSON-LD no `<head>` coexistindo sem erro
- Mostre os três scripts em sequência para confirmação visual
- Informe: "Etapa 12 concluída. Schema Organization implementado."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 13 — Otimizar carregamento de imagens no Hero

**Objetivo:** Corrigir o carregamento desnecessário das 4 imagens do carrossel simultâneo, reduzindo o impacto no LCP e melhorando o Core Web Vitals.

**O que fazer:**
1. Localizar o arquivo `components/sections/hero.tsx`
2. Encontrar onde as imagens dos slides são renderizadas
3. Aplicar carregamento condicional: apenas a imagem do slide atual deve ser renderizada com prioridade; as demais devem usar lazy loading

**Antes (imagem sempre renderizada independente do slide ativo):**
```tsx
<Image
  src={slide.image}
  alt={slide.title2}
  fill
  priority
  sizes="100vw"
/>
```

**Depois (carregamento condicional):**
```tsx
{currentIndex === slideIndex && (
  <Image
    src={slide.image}
    alt={slide.title2}
    fill
    priority={currentIndex === 0}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    loading={currentIndex === 0 ? "eager" : "lazy"}
  />
)}
```

**Também adicionar `aria-label` na navegação do carrossel:**
```tsx
<nav aria-label="Navegação do carrossel de serviços">
  {/* botões de navegação */}
</nav>
```

**Validação da etapa:**
- Mostre o componente Hero antes e depois das alterações de imagem
- Confirme que apenas o slide ativo renderiza a imagem
- Confirme que o slide 0 usa `priority` e `eager` (acima da dobra)
- Informe: "Etapa 13 concluída. Carregamento condicional de imagens do hero implementado."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 14 — Adicionar headers de cache para assets estáticos

**Objetivo:** Configurar cache de longa duração para assets estáticos do Next.js, melhorando a performance em visitas recorrentes.

**O que fazer:**
1. Localizar o arquivo `next.config.ts` na raiz do projeto
2. Verificar se a função `headers()` já existe
3. Adicionar as regras de cache abaixo dentro do array de headers existente (ou criar a função se não existir)

**Código a adicionar no `next.config.ts`:**
```typescript
async headers() {
  return [
    // ... headers existentes (manter todos) ...
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/(.*)\\.(jpg|jpeg|png|gif|webp|svg|ico)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=86400, stale-while-revalidate=604800',
        },
      ],
    },
  ];
},
```

**Validação da etapa:**
- Mostre o `next.config.ts` após a adição
- Confirme que os headers existentes foram mantidos e os novos foram adicionados
- Informe: "Etapa 14 concluída. Headers de cache configurados para assets estáticos e imagens."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 15 — Adicionar `aria-label` na navegação principal

**Objetivo:** Corrigir a acessibilidade do navbar, adicionando identificador semântico que também reforça sinais de estrutura para bots de busca.

**O que fazer:**
1. Localizar o arquivo `components/layout/navbar.tsx`
2. Encontrar a tag `<nav>` (por volta da linha 54)
3. Adicionar o atributo `aria-label`

**Antes:**
```tsx
<nav className="hidden md:flex...">
```

**Depois:**
```tsx
<nav aria-label="Navegação principal" className="hidden md:flex...">
```

**Se houver uma segunda `<nav>` (mobile menu), adicionar também:**
```tsx
<nav aria-label="Navegação mobile" className="...">
```

**Validação da etapa:**
- Mostre o componente navbar antes e depois
- Confirme que todas as tags `<nav>` têm `aria-label` descritivo
- Informe: "Etapa 15 concluída. aria-label adicionado em X tag(s) nav."

**Aguarde confirmação antes de prosseguir.**

---

## ETAPA 16 — Revisão final e checklist de validação

**Objetivo:** Confirmar que todas as etapas foram implementadas corretamente antes de fazer o deploy e definir os próximos passos pós-deploy.

**O que fazer:**
Percorrer cada item do checklist abaixo e responder ✅ (feito) ou ❌ (pendente):

### Checklist de Arquivos
- [ ] `/public/robots.txt` criado com `Crawl-delay` e `Sitemap:` (Etapa 1)
- [ ] `app/sitemap.ts` criado com 4 URLs mapeadas (Etapa 2)

### Checklist de Metadata (`app/page.tsx`)
- [ ] `title` começa com keyword transacional, ≤ 60 caracteres (Etapa 3)
- [ ] `description` com diferenciais concretos e CTA, ≤ 155 caracteres (Etapa 4)
- [ ] `keywords` removidas ou comentadas (Etapa 5)
- [ ] `openGraph` completo com 8 propriedades incluindo `alt` e `type` da imagem (Etapa 7)
- [ ] `twitter` card com `site` e `creator` (Etapa 8)

### Checklist de Schema JSON-LD
- [ ] LocalBusiness com endereço estruturado, geo, horários e catálogo de serviços (Etapa 10)
- [ ] FAQPage com 6 perguntas/respostas otimizadas (Etapa 11)
- [ ] Organization com `knowsAbout` e `sameAs` (Etapa 12)
- [ ] Três scripts `application/ld+json` coexistindo sem erro

### Checklist de Componentes
- [ ] H1 único e estático com `sr-only` no Hero (Etapa 6)
- [ ] Grep confirma exatamente 1 `<h1>` em todo o projeto (Etapa 6)
- [ ] Imagens do hero carregando condicionalmente por slide ativo (Etapa 13)
- [ ] `aria-label` em todas as tags `<nav>` (Etapa 15)

### Checklist de Configuração
- [ ] `next.config.ts` com headers de cache para `/_next/static/` e imagens (Etapa 14)

### Pendências Manuais (fora do código)
- [ ] Criar `/public/og-image.jpg` (1200×630px, <200KB) com identidade visual da Virtual Games (Etapa 9)

**Ao final, gerar o relatório de conclusão:**
```
RELATÓRIO DE IMPLEMENTAÇÃO SEO — VIRTUAL GAMES
Data: [data atual]
Etapas concluídas: X/16
Itens do checklist: X/[total]

Pendências no código (se houver):
- [lista de itens ❌]

Ações manuais obrigatórias pós-deploy:
1. Criar og-image.jpg (1200x630px) e copiar para /public/
2. Submeter sitemap em: https://search.google.com/search-console → Sitemaps → https://virtualgames.com.br/sitemap.xml
3. Solicitar indexação da URL principal no Google Search Console
4. Validar schemas em: https://search.google.com/test/rich-results
5. Criar/otimizar Google Business Profile em: https://business.google.com
6. Configurar Google Analytics 4
7. Rodar Lighthouse após deploy e anotar scores de Performance, SEO e Acessibilidade
8. Monitorar rankings em 30 dias para: "manutenção PS5 Santa Maria", "conserto Xbox Santa Maria", "assistência técnica gamer Santa Maria"
```

---

## Notas Importantes para a IA Executora

1. **Nunca avance sem confirmação** — cada etapa é atômica e deve ser validada individualmente
2. **Este projeto é Next.js App Router** — metadata fica nos objetos `metadata` em `app/page.tsx` e `app/layout.tsx`; o sitemap é gerado via `app/sitemap.ts`, não como arquivo estático em `/public/`
3. **Mostre sempre o código antes e depois** — nunca assuma que algo foi feito
4. **O H1 dinâmico é um problema específico** deste projeto — a solução com `sr-only` é intencional e correta para manter o visual sem prejudicar o SEO
5. **Três schemas JSON-LD** devem coexistir no `<head>` sem conflito — verificar se não há chave duplicada entre eles
6. **A constante `storeInfo`** já existe no projeto com telefone e email — usar as referências existentes, não hardcodar
7. **Preservar todos os headers de segurança** já existentes no `next.config.ts` — apenas adicionar os de cache, sem remover nada
8. **Em caso de JSON inválido**, validar a estrutura antes de inserir (chaves balanceadas, vírgulas corretas, aspas duplas)
9. **O arquivo `og-image.jpg`** não pode ser criado por código — registrar como pendência manual se não existir
10. **Meta keywords são deprecated pelo Google** — remover sem hesitação; não é uma regressão

---

*Prompt gerado com base no Relatório de Auditoria SEO — Virtual Games (15/05/2026)*
