# Todo — Implementação Completa SEO + Arquitetura Multi-Página
## Virtual Games (virtualgames.com.br)

**Base:** Análise Estratégica de SEO (analise.md)
**Fonte da verdade:** Prompt Mestre de Implementação (implementation.md)
**Stack real do projeto:** Next.js App Router + TypeScript + Tailwind + PostgreSQL + Prisma
**Adaptação necessária:** O implementation.md prevê Sanity CMS; o projeto usa Prisma/PostgreSQL — as atividades de CMS serão adaptadas para Prisma.

---

## FASE 0 — Setup, Configuração e Estrutura Base

**Objetivo:** Criar a fundação técnica: estrutura de pastas, dependências, configuração de SEO global, sitemap dinâmico, robots.txt, metadados base e componentes reutilizáveis.

### Tarefa 0.1 — Revisão da estrutura de pastas
( ) Verificar se a estrutura `src/app/` comporta todas as páginas necessárias (serviços, blog, institucionais)
( ) Criar diretórios que faltarem: `app/servicos/`, `app/servicos/manutencao-ps5/`, `app/servicos/manutencao-xbox/`, `app/servicos/manutencao-nintendo-switch/`, `app/servicos/montagem-pc-gamer/`, `app/servicos/reparo-controle-drift/`, `app/servicos/reparo-celular/`, `app/servicos/limpeza-preventiva/`, `app/servicos/reparo-hdmi-ps5/`, `app/servicos/upgrade-ssd-ps5/`, `app/sobre/`, `app/faq/`, `app/garantia/`, `app/privacidade/`, `app/termos/`, `app/campeonatos/`, `app/acompanhar-reparo/`, `app/assistencia-tecnica-santa-maria/`, `app/blog/`, `app/blog/[slug]/`, `app/blog/categoria/[categoria]/`
( ) Criar diretórios de componentes: `components/seo/`, `components/home/`, `components/servico/`, `components/blog/`

### Tarefa 0.2 — Configuração do next.config.ts
( ) Verificar se `next.config.ts` já tem headers de cache para `/_next/static/` e imagens — **já implementado parcialmente**
( ) Adicionar redirects 301: `/login` → `/acompanhar-reparo`, `/garantias` → `/garantia`
( ) Configurar `images.remotePatterns` para Sanity (se for usar) ou manter os existentes
( ) Garantir `poweredByHeader: false`, `compress: true`

### Tarefa 0.3 — Metadata base global (app/layout.tsx)
( ) Verificar se `layout.tsx` já exporta objeto `metadata` completo — **verificar estado atual**
( ) Adicionar/atualizar: `metadataBase`, `title.template` ('%s | Virtual Games'), `description` base, `robots`, `openGraph` base, `twitter` base, `verification` (GSC), `alternates.canonical`
( ) Adicionar preconnect para CDN de imagens no `<head>`
( ) Adicionar Analytics e SpeedInsights da Vercel no layout
( ) Garantir que o botão flutuante WhatsApp está no RootLayout (presente em TODAS as páginas)

### Tarefa 0.4 — Sitemap dinâmico (app/sitemap.ts)
( ) Verificar sitemap existente — **já implementado com 4 URLs**
( ) Expandir para incluir TODAS as URLs: home, 9 serviços, blog (dinâmico), páginas institucionais
( ) Incluir changeFrequency e priority diferenciados por tipo de página
( ) Se blog via Prisma: buscar slugs dos artigos do banco dinamicamente

### Tarefa 0.5 — Robots (app/robots.ts)
( ) Verificar se existe — **já existe `/public/robots.txt`**
( ) Opcional: migrar para `app/robots.ts` dinâmico (ou manter estático existente)
( ) Confirmar regras: Allow `/`, Disallow `/api/`, `/dashboard/`, `/_next/`, `/admin/`
( ) Confirmar Sitemap: `https://virtualgames.com.br/sitemap.xml`

### Tarefa 0.6 — SchemaOrg componente reutilizável
( ) Criar `components/seo/SchemaOrg.tsx` — componente que aceita objeto schema e injeta `<script type="application/ld+json">`
( ) Criar `components/seo/Breadcrumbs.tsx` — componente de breadcrumb com schema BreadcrumbList

### Tarefa 0.7 — Schema LocalBusiness base
( ) Criar constante/arquivo com schema LocalBusiness completo da Virtual Games
( ) Incluir: `@id`, name, description, url, telephone, email, priceRange, address (PostalAddress), geo (GeoCoordinates), openingHoursSpecification, sameAs, hasOfferCatalog
( ) Injetar no layout.tsx para estar em TODAS as páginas

### Tarefa 0.8 — Google Search Console
( ) Verificar se GSC está configurado
( ) Enviar sitemap.xml
( ) Resolver erros de cobertura se houver

### Tarefa 0.9 — Google Meu Negócio
( ) Perfil 100% completo: fotos, horário, categoria, serviços, Q&A — **ação externa, documentar**
( ) Vincular GSC com GMB

---

## FASE 1 — Home (page.tsx) — Estrutura Completa

**Objetivo:** Reconstruir a Home como página multi-seção com SEO total, hierarquia de headings, trust signals, schema markup e CTAs de conversão.

### Tarefa 1.1 — Metadata da Home
( ) Verificar e ajustar `metadata.title` → "Assistência Técnica em Consoles e PC Gamer em Santa Maria | Virtual Games"
( ) Verificar `metadata.description` → 150-160 caracteres com KW + diferenciais + CTA
( ) Adicionar `alternates.canonical`, `openGraph` completo com imagem

### Tarefa 1.2 — Hierarquia de Headings (corrigir)
( ) **H1 (único na página):** "Assistência Técnica em Consoles e PC Gamer em Santa Maria, RS" — já existe via `sr-only`
( ) **H2** "Por Que a Virtual Games?" — Trust signals
( ) **H2** "Nossos Serviços Especializados" — Grid de serviços
( ) **H3** para cada serviço: "Manutenção de PS5", "Reparo Xbox", etc.
( ) **H2** "Como Funciona o Reparo" — Processo
( ) **H2** "O Que Nossos Clientes Dizem" — Depoimentos
( ) **H2** "Nossa Equipe de Especialistas" — Equipe
( ) **H2** "Perguntas Frequentes" — FAQ
( ) **H2** "Últimas do Blog Gamer" — Blog preview (quando houver artigos)
( ) **H2** "Fale Conosco — Santa Maria, RS" — Contato
( ) Remover seção "O Mundo dos eSports" se existir (sem valor SEO/conversão)

### Tarefa 1.3 — Seção Hero (refatorar)
( ) Manter H1 com `sr-only` com texto correto
( ) CTA primário: WhatsApp com link real wa.me/55997252786
( ) CTA secundário: link para `/servicos`
( ) Imagem hero: prioridade LCP, `priority={true}`, `fetchpriority='high'`
( ) Verificar se usa Unsplash — substituir por imagem real ou placeholder SVG

### Tarefa 1.4 — Seção Trust Bar (adicionar)
( ) Criar barra horizontal com: "Diagnóstico 100% Grátis" | "Garantia de 90 Dias" | "Orçamento em 24h" | "Atendimento Especializado"
( ) Adicionar contagem: "Mais de 2.000 reparos realizados" e "Nota 5.0 no Google"

### Tarefa 1.5 — Seção Serviços (refatorar)
( ) Grid de cards com ícone SVG, H3 com nome, descrição com keyword localizada, link para `/servicos/[slug]`
( ) Serviços obrigatórios: Manutenção PS5 | Reparo Xbox | Nintendo Switch | Montagem PC Gamer | Reparo de Controle | Reparo Mobile
( ) **ZERO links para "#"** — todos os links devem ser reais

### Tarefa 1.6 — Seção Processo (adicionar)
( ) 4 passos numerados: 1) Traga o equipamento → 2) Diagnóstico grátis → 3) Aprovação do orçamento → 4) Reparo com garantia
( ) Usar <ol> (lista ordenada semântica)

### Tarefa 1.7 — Seção Depoimentos (corrigir)
( ) **Substituir fotos do Unsplash** por fotos reais ou avatares SVG com iniciais
( ) Mínimo 3 depoimentos com: nome real, tipo de serviço, texto do depoimento
( ) Implementar schema AggregateRating no JSON-LD

### Tarefa 1.8 — Seção Equipe (corrigir)
( ) **Substituir ui-avatars.com** por fotos reais ou placeholder SVG
( ) H3 com nome completo, cargo, bio de 2-3 linhas
( ) Schema Person pelo menos para o CEO

### Tarefa 1.9 — Seção FAQ (adicionar na Home)
( ) 5 perguntas de alta intenção com schema FAQPage
( ) Perguntas: diagnóstico gratuito, prazo reparo PS5, garantia 90 dias, região atendida, como solicitar orçamento
( ) Link "Ver todas as perguntas" → `/faq`

### Tarefa 1.10 — Seção Blog Preview
( ) Buscar 3 últimos artigos (se via Prisma: query no banco)
( ) Card com: imagem, categoria, título (H3), resumo, data, link `/blog/[slug]`
( ) Se não houver artigos: ocultar seção com `display:none`
( ) Link "Ver todos os artigos" → `/blog`

### Tarefa 1.11 — Seção Contato (refatorar)
( ) Endereço completo com link Google Maps
( ) Horário de funcionamento em formato de tabela
( ) Botão WhatsApp com pré-texto
( ) Embed Google Maps com lazy loading

### Tarefa 1.12 — Schemas JSON-LD da Home
( ) LocalBusiness (já implementado em app/page.tsx)
( ) WebSite com SearchAction
( ) FAQPage com 5 perguntas (já implementado)
( ) AggregateRating com reviewCount
( ) BreadcrumbList para home
( ) Organization (já implementado)

---

## FASE 2 — Páginas de Serviço (9 páginas)

**Objetivo:** Criar 9 páginas de serviço individuais, cada uma otimizada para keyword transacional, com estrutura semântica completa, schema Service, FAQPage e CTAs.

### Tarefa 2.1 — Template base de página de serviço
( ) Criar componente/template reutilizável para páginas de serviço
( ) Estrutura obrigatória: Metadata, Breadcrumb, H1, Intro (150-200 palavras), "O Que Fazemos" (ul), "Como Funciona" (ol), Garantia, "Por Que Escolher", FAQ (5 perguntas + schema), Depoimentos, CTA WhatsApp, Interlinking

### Tarefa 2.2 — Página /servicos/manutencao-ps5
( ) H1: "Manutenção e Reparo de PS5 em Santa Maria, RS"
( ) Schema Service + FAQPage + AggregateRating
( ) FAQ específica: 5 perguntas sobre PS5

### Tarefa 2.3 — Página /servicos/manutencao-xbox
( ) H1: "Reparo e Manutenção de Xbox em Santa Maria, RS"
( ) Schema Service + FAQPage + AggregateRating
( ) FAQ específica: 5 perguntas sobre Xbox

### Tarefa 2.4 — Página /servicos/manutencao-nintendo-switch
( ) H1: "Assistência Técnica Nintendo Switch em Santa Maria"
( ) Schema Service + FAQPage + AggregateRating
( ) FAQ específica: 5 perguntas sobre Switch

### Tarefa 2.5 — Página /servicos/montagem-pc-gamer
( ) H1: "Montagem de PC Gamer em Santa Maria, RS"
( ) Schema Service + FAQPage + AggregateRating
( ) FAQ específica: 5 perguntas sobre PC Gamer

### Tarefa 2.6 — Página /servicos/reparo-controle-drift
( ) H1: "Reparo de Controle com Drift em Santa Maria, RS"
( ) Schema Service + FAQPage + AggregateRating
( ) FAQ específica: 5 perguntas sobre drift

### Tarefa 2.7 — Página /servicos/reparo-celular
( ) H1: "Reparo de Celular em Santa Maria — iPhone e Android"
( ) Schema Service + FAQPage + AggregateRating
( ) FAQ específica: 5 perguntas sobre reparo mobile

### Tarefa 2.8 — Página /servicos/limpeza-preventiva
( ) H1: "Limpeza Preventiva de Console em Santa Maria, RS"
( ) Schema Service + FAQPage + AggregateRating
( ) FAQ específica: 5 perguntas sobre limpeza

### Tarefa 2.9 — Página /servicos/reparo-hdmi-ps5
( ) H1: "Reparo da Porta HDMI do PS5 em Santa Maria, RS"
( ) Schema Service + FAQPage + AggregateRating
( ) FAQ específica: 5 perguntas sobre HDMI PS5

### Tarefa 2.10 — Página /servicos/upgrade-ssd-ps5
( ) H1: "Upgrade de SSD no PS5 — Santa Maria, RS"
( ) Schema Service + FAQPage + AggregateRating
( ) FAQ específica: 5 perguntas sobre upgrade SSD

### Tarefa 2.11 — Página Hub /servicos
( ) H1: "Nossos Serviços de Assistência Técnica Gamer"
( ) Grid com todas as 9 páginas de serviço linkando para cada uma
( ) Schema ItemList ou CollectionPage

### Tarefa 2.12 — Interlinking entre serviços
( ) Cada página de serviço deve linkar para o hub `/servicos`
( ) Cada página de serviço deve linkar para 2-3 páginas de serviço relacionadas
( ) Cada página de serviço deve linkar para `/faq`, `/garantia`, `/contato`

---

## FASE 3 — Páginas Institucionais e E-E-A-T

**Objetivo:** Criar páginas institucionais que constroem autoridade, credibilidade e E-E-A-T.

### Tarefa 3.1 — Página /sobre
( ) H1: "Sobre a Virtual Games — Especialistas em Consoles e PC Gamer em Santa Maria"
( ) Foto real da fachada ou interior da loja (ou placeholder SVG)
( ) História da empresa com dados reais
( ) Missão, Visão e Valores explícitos
( ) Seção de equipe com foto real de cada membro, nome, cargo, bio
( ) Número de reparos realizados, anos de mercado
( ) Schema Organization completo + Schema Person para cada membro
( ) Link para página de garantia

### Tarefa 3.2 — Página /faq
( ) H1: "Perguntas Frequentes — Assistência Técnica Gamer Virtual Games"
( ) Mínimo 20 perguntas organizadas por categoria (H2): Sobre os Serviços | PS5 | Xbox | Nintendo Switch | PC Gamer | Pagamento e Garantia
( ) Cada pergunta em H3, resposta em parágrafo
( ) Schema FAQPage com todas as 20+ perguntas
( ) Accordion interativo
( ) CTA ao final: "Não encontrou sua resposta?" → WhatsApp
( ) Links de retorno para cada serviço correspondente

### Tarefa 3.3 — Página /garantia
( ) H1: "Garantia de 90 Dias — Virtual Games Santa Maria"
( ) Explicação detalhada do que a garantia cobre e NÃO cobre
( ) Como acionar a garantia (link WhatsApp com pré-texto)
( ) Schema WarrantyPromise ou Offer com garantia
( ) Diferencial: "Nossa garantia é superior às assistências técnicas genéricas"

### Tarefa 3.4 — Página /contato
( ) H1: "Fale com a Virtual Games — Santa Maria, RS"
( ) Formulário de contato: Nome, WhatsApp, Equipamento, Descrição do problema
( ) Criar API route `/api/contato` que recebe os dados do formulário e dispara notificação (WhatsApp ou e-mail)
( ) Endereço completo com link Google Maps
( ) Horário de funcionamento
( ) Embed Google Maps com lazy loading
( ) Schema ContactPoint

### Tarefa 3.5 — Páginas /privacidade e /termos
( ) Conteúdo real e completo (LGPD explicitamente em /privacidade)
( ) Termos de Serviço: prazo de reparo, garantia, responsabilidade por equipamentos
( ) Metadata: `robots: { index: false }` para ambas

### Tarefa 3.6 — Página /acompanhar-reparo
( ) H1: "Acompanhar Meu Reparo — Virtual Games"
( ) Campo de busca por número de OS
( ) Integrar com sistema interno via API route ou redirecionar para WhatsApp com número da OS
( ) Metadata: `robots: { index: false }`

### Tarefa 3.7 — Página /campeonatos
( ) H1: "Campeonatos de Games em Santa Maria — Virtual Games"
( ) Lista de torneios passados e futuros
( ) Schema Event para cada campeonato futuro
( ) CTA de inscrição via WhatsApp
( ) Galeria de fotos dos eventos passados (fotos reais)

### Tarefa 3.8 — Página /assistencia-tecnica-santa-maria
( ) H1: "Assistência Técnica Gamer em Santa Maria, RS — Virtual Games"
( ) Conteúdo rico sobre a loja, localização, bairros atendidos
( ) Schema LocalBusiness com geoCoordinates precisas
( ) Link para Google Maps
( ) Grid de serviços linkando para cada página de serviço
( ) Depoimentos de clientes da cidade

---

## FASE 4 — Blog + CMS (adaptado para Prisma/PostgreSQL)

**Objetivo:** Implementar blog completo com PostgreSQL + Prisma como CMS, ISR para performance, schema Article, FAQPage por artigo, interlinking automático e estrutura de clusters.

### Tarefa 4.1 — Modelo Prisma para Blog
( ) Criar model `BlogPost` no schema.prisma com campos: id, title, slug (único), metaTitle, metaDescription, featuredImage, featuredImageAlt, categoria, publishedAt, updatedAt, authorId, excerpt, body (JSON), faqs (JSON), relatedService (string), readingTime (int), published (boolean)
( ) Criar model `BlogAuthor` no schema.prisma com campos: id, name, slug, role, bio, image, imageAlt
( ) Executar `npx prisma migrate dev` para criar migração

### Tarefa 4.2 — API routes para Blog
( ) Criar `app/api/blog/posts/route.ts` — GET (listar publicados) e POST (criar)
( ) Criar `app/api/blog/posts/[slug]/route.ts` — GET (por slug) e PUT/PATCH (atualizar)
( ) Criar `app/api/blog/authors/route.ts` — GET e POST
( ) Criar `app/api/blog/posts/category/[categoria]/route.ts` — GET (filtrar por categoria)

### Tarefa 4.3 — Seed de autores e artigos iniciais
( ) Criar seed com 4 autores (Emerson, Kevin, Elias, Gabriel) com fotos reais ou placeholder
( ) Criar seed com 15 artigos iniciais (conteúdo original mínimo 1.500 palavras cada)

### Tarefa 4.4 — Página Hub /blog
( ) Listar artigos publicados com paginação
( ) Filtro por categoria
( ) Card com: imagem, categoria, título (H3), resumo, data, autor, link `/blog/[slug]`
( ) Schema CollectionPage ou Blog

### Tarefa 4.5 — Página de artigo /blog/[slug]
( ) Metadata dinâmica via `generateMetadata`
( ) Breadcrumb: Início > Blog > [Categoria] > [Título]
( ) Cabeçalho: categoria, H1, data, tempo de leitura, autor com foto
( ) TL;DR box (resumo 2-3 frases)
( ) Corpo do artigo renderizado do JSON (PortableText ou similar)
( ) CTA contextual no meio e no final do artigo
( ) Seção de FAQs do artigo com schema FAQPage
( ) Artigos relacionados (3 cards)
( ) Link para serviço relacionado (se existir)
( ) `export const revalidate = 3600` (ISR)

### Tarefa 4.6 — Página /blog/categoria/[categoria]
( ) Listar artigos da categoria
( ) Metadata com título e descrição específicos da categoria

### Tarefa 4.7 — Schemas de Artigo
( ) Schema Article em cada artigo: headline, description, image, author, publisher, datePublished, dateModified, mainEntityOfPage
( ) Schema FAQPage em cada artigo que tiver FAQs
( ) Schema BreadcrumbList em cada artigo

### Tarefa 4.8 — Interlinking do Blog
( ) 100% dos artigos linkam para página de serviço relacionado
( ) Cada artigo linka para 2-3 artigos relacionados
( ) Cada artigo linka para `/faq` e `/contato`

---

## FASE 5 — SEO Técnico e Core Web Vitals

**Objetivo:** Garantir que o site atinja as métricas que o Google avalia: LCP < 2.5s, CLS < 0.1, INP < 200ms.

### Tarefa 5.1 — Otimização de Imagens
( ) Garantir que **todas** as imagens usam `next/image` (nunca `<img>`)
( ) Hero image: `priority={true}`, `sizes="100vw"`, `quality={85}`
( ) Demais imagens: `loading="lazy"`, `sizes` responsivos
( ) **Remover TODAS as imagens do Unsplash** — substituir por fotos reais ou placeholders SVG
( ) **Remover ui-avatars.com** — substituir por avatares SVG com iniciais ou fotos reais
( ) Adicionar `alt` text descritivo em 100% das imagens
( ) Comprimir `og-image.png` para < 200KB (mantendo 1200x630px)

### Tarefa 5.2 — Preload e Hints de Performance
( ) Adicionar `<link rel="preconnect">` para CDN de imagens e fontes
( ) Adicionar `<link rel="dns-prefetch">` para recursos externos
( ) Verificar se @vercel/analytics e @vercel/speed-insights estão no layout

### Tarefa 5.3 — Headers de Cache (next.config.ts)
( ) Verificar headers de cache existentes — **já implementado parcialmente**
( ) Garantir `/_next/static/(.*)` → `max-age=31536000, immutable`
( ) Garantir imagens `.(jpg|jpeg|png|gif|webp|svg|ico)` → `max-age=86400, stale-while-revalidate=604800`

### Tarefa 5.4 — Core Web Vitals — Correções
( ) Rodar PageSpeed Insights e anotar métricas atuais
( ) Se LCP > 2.5s: otimizar hero image (diminuir resolução, próximo formato)
( ) Se CLS > 0.1: garantir width/height em todas as imagens
( ) Se TTFB > 600ms: verificar SSG/ISR, reduzir server components pesados

### Tarefa 5.5 — Links quebrados
( ) `grep -r "href='#'" .` — **ZERAR TODAS AS OCORRÊNCIAS**
( ) `grep -r 'href="#"' .` — **ZERAR TODAS AS OCORRÊNCIAS**
( ) Verificar links de rodapé: Garantia, Termos, Privacidade, Redes Sociais — todos devem apontar para URLs reais

### Tarefa 5.6 — Redirecionamentos 301
( ) Configurar redirect: `/login` → `/acompanhar-reparo`
( ) Configurar redirect: `/garantias` → `/garantia`

---

## FASE 6 — Header, Footer e Componentes Globais

**Objetivo:** Header e Footer completos com links reais, navegação semântica, breadcrumb e acessibilidade.

### Tarefa 6.1 — Header (refatorar)
( ) Tag `<header>` com `role="banner"`
( ) Logo linkando para `/` com `alt` descritivo
( ) `<nav aria-label="Navegação principal">` com links: Início | Serviços | Blog | Campeonatos | Sobre | Contato
( ) Dropdown "Serviços" com links para TODAS as 9 páginas de serviço
( ) CTA WhatsApp no header
( ) Sticky header com backdrop blur
( ) **NENHUM** link de âncora (#) — apenas links reais

### Tarefa 6.2 — Footer (refatorar)
( ) `<footer>` com `role="contentinfo"`
( ) Colunas: Navegação | Serviços | Informações | Redes Sociais
( ) Links de serviços para TODAS as 9 páginas
( ) Redes Sociais: Instagram | YouTube | Facebook — **links REAIS, não "#"**
( ) Links Legais: Privacidade | Termos | Garantia — **links REAIS, não "#"**
( ) Endereço completo, horário, telefone
( ) Copyright

### Tarefa 6.3 — Breadcrumb Component
( ) Criar `components/layout/Breadcrumb.tsx` com schema BreadcrumbList nativo
( ) Implementar em TODAS as páginas internas (serviços, blog, institucionais)

### Tarefa 6.4 — Botão WhatsApp Flutuante
( ) Criar `components/layout/WhatsAppButton.tsx`
( ) Posição: `fixed bottom-6 right-6 z-50`
( ) Link: `https://wa.me/55997252786?text=Olá!%20Gostaria%20de%20um%20orçamento.`
( ) `aria-label="Falar com a Virtual Games no WhatsApp"`
( ) Incluir no RootLayout — presente em TODAS as páginas

### Tarefa 6.5 — Skip to Content (acessibilidade)
( ) Adicionar link "Pular para conteúdo principal" no layout — verificar se já existe

### Tarefa 6.6 — Página 404 personalizada
( ) Criar `app/not-found.tsx` com CTA para WhatsApp e link para home
( ) Verificar se já existe

---

## FASE 7 — Validação Final e Checklist de Auditoria

**Objetivo:** Validar que TUDO foi implementado corretamente. Auditoria externa deve resultar em SITE 100% OTIMIZADO.

### Tarefa 7.1 — Build e Lint
( ) Executar `npm run build` — zero erros
( ) Executar `npm run lint` — zero erros

### Tarefa 7.2 — Checklist SEO Técnico
( ) `/sitemap.xml` contém todas as URLs (≥ 30)
( ) `/robots.txt` sem bloqueio indevido
( ) Canonical correto em 100% das páginas
( ) Meta title ≤ 60 caracteres em todas as páginas
( ) Meta description 120-160 caracteres em todas as páginas
( ) H1 único por página em 100% das páginas
( ) Zero links `href="#"` em todo o site
( ) Zero links 404
( ) Schema validado: LocalBusiness, Service, Article, FAQPage
( ) Open Graph em todas as páginas
( ) Twitter Card em todas as páginas
( ) 100% das imagens com alt text
( ) Zero imagens do Unsplash
( ) Redirecionamentos 301 funcionando
( ) HTTPS forçado

### Tarefa 7.3 — Checklist Core Web Vitals
( ) LCP Mobile < 2.5s
( ) LCP Desktop < 1.8s
( ) CLS < 0.10 (Mobile e Desktop)
( ) INP < 200ms
( ) FCP < 1.8s
( ) TTFB < 800ms
( ) Performance Score Mobile ≥ 80
( ) Performance Score Desktop ≥ 90
( ) SEO Score Lighthouse = 100
( ) Accessibility Score ≥ 90
( ) Best Practices Score ≥ 95

### Tarefa 7.4 — Checklist E-E-A-T
( ) Foto real de TODOS os membros da equipe na página /sobre
( ) CEO com bio detalhada e história pessoal com games
( ) Cada técnico com especialização declarada
( ) Endereço físico verificável e coerente com Google Meu Negócio
( ) Número de reparos realizados declarado explicitamente
( ) Política de privacidade LGPD completa
( ) Termos de serviço e garantia documentados
( ) Depoimentos de clientes reais com nome e tipo de serviço
( ) Schema AggregateRating com dados reais
( ) Google Meu Negócio verificado — **pendência externa**

### Tarefa 7.5 — Checklist de Conteúdo e Interlinking
( ) 15 artigos publicados com ≥ 1.500 palavras cada
( ) 100% dos artigos linkam para página de serviço relacionado
( ) 100% das páginas de serviço linkam para artigos do blog
( ) Cluster PS5: pilar + 5 artigos satélite
( ) Cluster PC Gamer: pilar + 3 artigos satélite
( ) FAQ: 20+ perguntas com schema FAQPage
( ) Breadcrumb em 100% das páginas internas
( ) Nenhuma página órfã (toda página tem ≥ 1 link interno)

### Tarefa 7.6 — Configurações Externas
( ) Google Search Console: verificado, sitemap enviado, sem erros críticos
( ) Google Analytics 4: configurado com evento de conversão 'clique_whatsapp'
( ) Google Meu Negócio: perfil 100% completo
( ) Bing Webmaster Tools: verificado e sitemap enviado
( ) Instagram/Facebook/YouTube: links reais no footer

### Tarefa 7.7 — Relatório Final
( ) Gerar relatório com: URLs criadas, métricas de performance, schemas validados, checklists preenchidos
( ) Listar pendências externas (se houver)

---

## Resumo de Entregas

| Fase | Descrição | Total de Atividades |
|------|-----------|-------------------|
| FASE 0 | Setup, Configuração e Estrutura Base | 9 |
| FASE 1 | Home — Estrutura Completa | 12 |
| FASE 2 | Páginas de Serviço (9 páginas) | 12 |
| FASE 3 | Páginas Institucionais e E-E-A-T | 8 |
| FASE 4 | Blog + CMS (Prisma/PostgreSQL) | 8 |
| FASE 5 | SEO Técnico e Core Web Vitals | 6 |
| FASE 6 | Header, Footer e Componentes Globais | 6 |
| FASE 7 | Validação Final e Auditoria | 7 |
| **Total** | | **68** |
