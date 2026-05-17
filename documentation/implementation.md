const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak
} = require('docx');
const fs = require('fs');

const BLUE   = "1A56C4";
const DARK   = "0D1117";
const GREEN  = "1A6B3A";
const RED    = "B91C1C";
const ORANGE = "B45309";
const PURPLE = "6D28D9";
const GREY   = "F1F5F9";
const GOLD   = "92400E";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" };
const borders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 440, after: 200 },
    children: [new TextRun({ text, bold: true, color: BLUE, size: 38, font: "Arial" })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 140 },
    children: [new TextRun({ text, bold: true, color: DARK, size: 26, font: "Arial" })]
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 100 },
    children: [new TextRun({ text, bold: true, color: "374151", size: 23, font: "Arial" })]
  });
}
function p(text, color = "1F2937") {
  return new Paragraph({
    spacing: { before: 80, after: 100 },
    children: [new TextRun({ text, size: 21, font: "Arial", color })]
  });
}
function code(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, size: 19, font: "Courier New", color: "1E3A5F" })]
  });
}
function bullet(text, color = "1F2937") {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 50, after: 50 },
    children: [new TextRun({ text, size: 21, font: "Arial", color })]
  });
}
function subbullet(text) {
  return new Paragraph({
    numbering: { reference: "subbullets", level: 0 },
    spacing: { before: 30, after: 30 },
    children: [new TextRun({ text, size: 20, font: "Arial", color: "374151" })]
  });
}
function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { before: 50, after: 50 },
    children: [new TextRun({ text, size: 21, font: "Arial" })]
  });
}
function divider() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0", space: 1 } },
    spacing: { before: 240, after: 240 },
    children: []
  });
}
function pb() { return new Paragraph({ children: [new PageBreak()] }); }
function spacer(n = 80) {
  return new Paragraph({ spacing: { before: n, after: 0 }, children: [] });
}

function box(title, lines, bg = GREY, titleColor = DARK, codeBlock = false) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({ children: [new TableCell({
      borders,
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: bg, type: ShadingType.CLEAR },
      margins: { top: 160, bottom: 160, left: 220, right: 220 },
      children: [
        new Paragraph({ spacing: { before: 40, after: 100 }, children: [new TextRun({ text: title, bold: true, size: 22, font: "Arial", color: titleColor })] }),
        ...lines.map(l => new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text: l, size: codeBlock ? 18 : 20, font: codeBlock ? "Courier New" : "Arial", color: codeBlock ? "1E3A5F" : "374151" })]
        }))
      ]
    })]})],
  });
}

function twoCol(rows, w1 = 2800, w2 = 6560) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [w1, w2],
    rows: rows.map(([a, b], i) => new TableRow({ children: [
      new TableCell({
        borders, width: { size: w1, type: WidthType.DXA },
        shading: { fill: i === 0 ? "DBEAFE" : "F8FAFC", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: a, bold: i === 0, size: 20, font: "Arial", color: i === 0 ? BLUE : "374151" })] })]
      }),
      new TableCell({
        borders, width: { size: w2, type: WidthType.DXA },
        shading: { fill: i === 0 ? "DBEAFE" : "FFFFFF", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: b, bold: i === 0, size: 20, font: "Arial", color: i === 0 ? BLUE : "374151" })] })]
      })
    ]}))
  });
}

function threeCol(rows, w1 = 2400, w2 = 3480, w3 = 3480) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [w1, w2, w3],
    rows: rows.map(([a, b, c], i) => new TableRow({ children: [
      new TableCell({ borders, width: { size: w1, type: WidthType.DXA }, shading: { fill: i === 0 ? "DBEAFE" : "F8FAFC", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: a, bold: i === 0, size: 19, font: "Arial", color: i === 0 ? BLUE : "374151" })] })] }),
      new TableCell({ borders, width: { size: w2, type: WidthType.DXA }, shading: { fill: i === 0 ? "DBEAFE" : "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: b, bold: i === 0, size: 19, font: "Arial", color: i === 0 ? BLUE : "374151" })] })] }),
      new TableCell({ borders, width: { size: w3, type: WidthType.DXA }, shading: { fill: i === 0 ? "DBEAFE" : "FFFFFF", type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: c, bold: i === 0, size: 19, font: "Arial", color: i === 0 ? BLUE : "374151" })] })] }),
    ]}))
  });
}

// ══════════════════════════════════════════════════════════════════
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "→", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "subbullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 38, bold: true, font: "Arial", color: BLUE }, paragraph: { spacing: { before: 440, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial", color: DARK }, paragraph: { spacing: { before: 300, after: 140 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 23, bold: true, font: "Arial", color: "374151" }, paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    children: [

      // ── CAPA ───────────────────────────────────────────────────
      new Paragraph({ spacing: { before: 1200, after: 60 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "PROMPT MESTRE DE IMPLEMENTAÇÃO", bold: true, size: 52, font: "Arial", color: BLUE })] }),
      new Paragraph({ spacing: { before: 40, after: 40 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "virtualgames.com.br", size: 38, font: "Arial", color: "475569" })] }),
      new Paragraph({ spacing: { before: 30, after: 30 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Para execução pela IA MiniMax 2.7", size: 26, font: "Arial", color: "94A3B8", italics: true })] }),
      new Paragraph({ spacing: { before: 20, after: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Baseado na Análise Estratégica Completa de SEO — Maio 2026", size: 22, font: "Arial", color: "94A3B8", italics: true })] }),
      box("📋 LEIA ANTES DE COMEÇAR", [
        "Este documento contém o prompt mestre completo para implementação total do site virtualgames.com.br.",
        "Ele está dividido em FASES sequenciais. A IA deve executar uma fase completa antes de avançar.",
        "Cada fase contém: contexto, arquivos a criar, código exato, regras de SEO e critérios de conclusão.",
        "O objetivo final é que uma auditoria externa avalie o site como 100% otimizado em SEO, arquitetura,",
        "performance, E-E-A-T, Core Web Vitals, semântica, interlinking e conversão.",
        "Stack obrigatória: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Sanity CMS.",
        "Repositório: GitHub privado. Deploy: Vercel. Domínio: virtualgames.com.br",
      ], "EFF6FF", BLUE),
      spacer(120),
      pb(),

      // ══════════════════════════════════════════════════════════
      // CONTEXTO DO PROJETO
      // ══════════════════════════════════════════════════════════
      h1("CONTEXTO DO PROJETO"),
      h2("Sobre a Virtual Games"),
      p("A Virtual Games é uma assistência técnica especializada em consoles (PS5, Xbox Series X/S, Nintendo Switch), PC Gamer e celulares, localizada em Santa Maria, RS. O negócio é físico, com atendimento presencial, e utiliza WhatsApp como canal principal de conversão."),
      twoCol([
        ["Dado", "Informação"],
        ["Empresa", "Virtual Games"],
        ["CNPJ / Razão Social", "A confirmar com o cliente"],
        ["Endereço", "Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2, Centro, Santa Maria, RS — CEP 97010-002"],
        ["WhatsApp", "(55) 99725-2786"],
        ["E-mail", "contato@virtualgames.com"],
        ["Horário", "Seg-Sex 09h–18h30 | Sáb 09h–13h"],
        ["CEO", "Emerson Gabriel de Mello Graeff"],
        ["Domínio atual", "https://virtualgames.com.br"],
        ["Stack atual", "Next.js (SPA one-page)"],
        ["Stack nova", "Next.js 14+ App Router + TypeScript + Tailwind + Sanity CMS"],
        ["Deploy", "Vercel (manter)"],
        ["Diferenciais", "Diagnóstico grátis | Garantia 90 dias | Orçamento em 24h"],
      ]),
      spacer(),

      h2("Identidade Visual a Manter"),
      bullet("Paleta: fundo escuro (#0a0a0f), azul cyan (#00d4ff), branco para textos"),
      bullet("Nome da marca: VIRTUALGAMES (caixa alta no logo)"),
      bullet("Tom de voz: especialista gamer, direto, técnico e confiável"),
      bullet("Estilo: dark mode gamer com toques neon — NÃO alterar a identidade visual existente"),
      divider(),
      pb(),

      // ══════════════════════════════════════════════════════════
      // FASE 0 — SETUP
      // ══════════════════════════════════════════════════════════
      h1("FASE 0 — Setup, Configuração e Estrutura Base"),
      box("🎯 Objetivo da Fase", [
        "Criar a fundação técnica do projeto: repositório, estrutura de pastas, dependências, variáveis de ambiente,",
        "configuração de SEO global, sitemap dinâmico, robots.txt, metadados base e componentes reutilizáveis.",
        "Ao final desta fase, o projeto deve compilar sem erros e estar deployado na Vercel.",
      ], "ECFDF5", GREEN),
      spacer(),

      h2("0.1 — Inicialização do Projeto"),
      box("Comando de criação", [
        "npx create-next-app@latest virtualgames --typescript --tailwind --eslint --app --src-dir --import-alias '@/*'",
        "cd virtualgames",
        "npm install next-sitemap @sanity/client @portabletext/react",
        "npm install next-themes lucide-react clsx tailwind-merge",
        "npm install @vercel/analytics @vercel/speed-insights",
        "npm install schema-dts  # para TypeScript schema markup",
      ], "F0F9FF", BLUE, true),
      spacer(),

      h2("0.2 — Estrutura de Pastas Obrigatória"),
      box("Estrutura src/app/ (App Router)", [
        "src/",
        "├── app/",
        "│   ├── layout.tsx                    ← RootLayout global com metadata base",
        "│   ├── page.tsx                      ← Home (SSG)",
        "│   ├── not-found.tsx                 ← Página 404 personalizada",
        "│   ├── sitemap.ts                    ← Sitemap dinâmico",
        "│   ├── robots.ts                     ← robots.txt dinâmico",
        "│   ├── sobre/page.tsx",
        "│   ├── contato/page.tsx",
        "│   ├── faq/page.tsx",
        "│   ├── garantia/page.tsx",
        "│   ├── privacidade/page.tsx",
        "│   ├── termos/page.tsx",
        "│   ├── campeonatos/page.tsx",
        "│   ├── acompanhar-reparo/page.tsx",
        "│   ├── assistencia-tecnica-santa-maria/page.tsx",
        "│   ├── servicos/",
        "│   │   ├── page.tsx                  ← Hub de serviços",
        "│   │   ├── manutencao-ps5/page.tsx",
        "│   │   ├── manutencao-xbox/page.tsx",
        "│   │   ├── manutencao-nintendo-switch/page.tsx",
        "│   │   ├── montagem-pc-gamer/page.tsx",
        "│   │   ├── reparo-controle-drift/page.tsx",
        "│   │   ├── reparo-celular/page.tsx",
        "│   │   ├── limpeza-preventiva/page.tsx",
        "│   │   ├── reparo-hdmi-ps5/page.tsx",
        "│   │   └── upgrade-ssd-ps5/page.tsx",
        "│   └── blog/",
        "│       ├── page.tsx                  ← Hub do blog",
        "│       ├── [slug]/page.tsx            ← Artigo individual (SSG + ISR)",
        "│       └── categoria/[categoria]/page.tsx",
        "├── components/",
        "│   ├── layout/",
        "│   │   ├── Header.tsx",
        "│   │   ├── Footer.tsx",
        "│   │   ├── Breadcrumb.tsx",
        "│   │   └── WhatsAppButton.tsx        ← Botão flutuante global",
        "│   ├── seo/",
        "│   │   ├── SchemaOrg.tsx             ← Injeção de JSON-LD",
        "│   │   └── Breadcrumbs.tsx",
        "│   ├── home/",
        "│   │   ├── HeroSection.tsx",
        "│   │   ├── TrustBar.tsx",
        "│   │   ├── ServicesSection.tsx",
        "│   │   ├── TestimonialsSection.tsx",
        "│   │   ├── TeamSection.tsx",
        "│   │   ├── FaqSection.tsx",
        "│   │   ├── BlogPreviewSection.tsx",
        "│   │   └── ContactSection.tsx",
        "│   ├── servico/",
        "│   │   ├── ServiceHero.tsx",
        "│   │   ├── ServiceProcess.tsx",
        "│   │   ├── ServiceFaq.tsx",
        "│   │   └── ServiceTestimonials.tsx",
        "│   └── blog/",
        "│       ├── ArticleHeader.tsx",
        "│       ├── ArticleBody.tsx",
        "│       ├── ArticleFaq.tsx",
        "│       ├── RelatedPosts.tsx",
        "│       └── BlogCard.tsx",
        "├── lib/",
        "│   ├── sanity.ts                     ← Cliente Sanity",
        "│   ├── queries.ts                    ← GROQ queries",
        "│   └── utils.ts                      ← Helpers (cn, formatDate, etc.)",
        "└── types/",
        "    └── index.ts                      ← Tipos TypeScript globais",
      ], "F8FAFC", DARK, true),
      spacer(),

      h2("0.3 — next.config.js Obrigatório"),
      box("next.config.js — configurações SEO e performance", [
        "/** @type {import('next').NextConfig} */",
        "const nextConfig = {",
        "  images: {",
        "    formats: ['image/avif', 'image/webp'],",
        "    remotePatterns: [{ protocol: 'https', hostname: '**.sanity.io' }],",
        "    deviceSizes: [640, 750, 828, 1080, 1200, 1920],",
        "    imageSizes: [16, 32, 64, 96, 128, 256, 384],",
        "  },",
        "  async headers() {",
        "    return [{ source: '/(.*)', headers: [",
        "      { key: 'X-Content-Type-Options', value: 'nosniff' },",
        "      { key: 'X-Frame-Options', value: 'DENY' },",
        "      { key: 'X-XSS-Protection', value: '1; mode=block' },",
        "    ]}]",
        "  },",
        "  async redirects() {",
        "    return [",
        "      { source: '/garantias', destination: '/garantia', permanent: true },",
        "      { source: '/login', destination: '/acompanhar-reparo', permanent: true },",
        "    ]",
        "  },",
        "  compress: true,",
        "  poweredByHeader: false,",
        "}",
        "module.exports = nextConfig",
      ], "F0F9FF", BLUE, true),
      spacer(),

      h2("0.4 — Metadata Base Global (layout.tsx)"),
      p("O arquivo src/app/layout.tsx deve exportar um objeto Metadata completo com:"),
      box("Metadata base obrigatória", [
        "export const metadata: Metadata = {",
        "  metadataBase: new URL('https://virtualgames.com.br'),",
        "  title: { default: 'Assistência Técnica Gamer em Santa Maria | Virtual Games', template: '%s | Virtual Games' },",
        "  description: 'Assistência técnica especializada em PS5, Xbox, Nintendo Switch e PC Gamer em Santa Maria, RS. Diagnóstico grátis, garantia 90 dias. Orçamento via WhatsApp em 24h!',",
        "  keywords: ['assistência técnica ps5 santa maria', 'conserto xbox santa maria', 'montagem pc gamer santa maria', 'reparo nintendo switch rs'],",
        "  authors: [{ name: 'Virtual Games', url: 'https://virtualgames.com.br' }],",
        "  creator: 'Virtual Games',",
        "  publisher: 'Virtual Games',",
        "  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },",
        "  openGraph: { type: 'website', locale: 'pt_BR', url: 'https://virtualgames.com.br', siteName: 'Virtual Games', title: 'Assistência Técnica Gamer em Santa Maria | Virtual Games', description: '...', images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Virtual Games — Assistência Técnica Gamer em Santa Maria, RS' }] },",
        "  twitter: { card: 'summary_large_image', site: '@virtualgames', creator: '@virtualgames' },",
        "  verification: { google: 'SEU_CODIGO_GSC_AQUI' },",
        "  alternates: { canonical: 'https://virtualgames.com.br' },",
        "}",
      ], "F0F9FF", BLUE, true),
      spacer(),

      h2("0.5 — sitemap.ts Dinâmico"),
      box("src/app/sitemap.ts — gera sitemap completo incluindo blog do Sanity", [
        "import { MetadataRoute } from 'next'",
        "import { client } from '@/lib/sanity'",
        "",
        "const STATIC_URLS = [",
        "  '/', '/sobre', '/contato', '/faq', '/garantia', '/privacidade', '/termos',",
        "  '/campeonatos', '/acompanhar-reparo', '/assistencia-tecnica-santa-maria',",
        "  '/servicos', '/servicos/manutencao-ps5', '/servicos/manutencao-xbox',",
        "  '/servicos/manutencao-nintendo-switch', '/servicos/montagem-pc-gamer',",
        "  '/servicos/reparo-controle-drift', '/servicos/reparo-celular',",
        "  '/servicos/limpeza-preventiva', '/servicos/reparo-hdmi-ps5',",
        "  '/servicos/upgrade-ssd-ps5', '/blog',",
        "]",
        "",
        "export default async function sitemap(): Promise<MetadataRoute.Sitemap> {",
        "  const posts = await client.fetch(`*[_type == 'post']{ slug, _updatedAt }`)",
        "  const staticUrls = STATIC_URLS.map(url => ({ url: 'https://virtualgames.com.br' + url, lastModified: new Date(), changeFrequency: url === '/' ? 'weekly' : 'monthly', priority: url === '/' ? 1 : url.startsWith('/servicos/') ? 0.9 : url === '/blog' ? 0.8 : 0.7 }))",
        "  const blogUrls = posts.map(post => ({ url: 'https://virtualgames.com.br/blog/' + post.slug.current, lastModified: new Date(post._updatedAt), changeFrequency: 'monthly', priority: 0.7 }))",
        "  return [...staticUrls, ...blogUrls]",
        "}",
      ], "F0F9FF", BLUE, true),
      spacer(),

      h2("0.6 — robots.ts"),
      box("src/app/robots.ts", [
        "import { MetadataRoute } from 'next'",
        "export default function robots(): MetadataRoute.Robots {",
        "  return {",
        "    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/_next/', '/studio/'] }],",
        "    sitemap: 'https://virtualgames.com.br/sitemap.xml',",
        "    host: 'https://virtualgames.com.br',",
        "  }",
        "}",
      ], "F0F9FF", BLUE, true),
      spacer(),

      h2("0.7 — Componente SchemaOrg (JSON-LD)"),
      p("Criar src/components/seo/SchemaOrg.tsx que aceita qualquer objeto schema e o injeta como <script type='application/ld+json'>:"),
      box("SchemaOrg.tsx", [
        "export function SchemaOrg({ schema }: { schema: Record<string, unknown> }) {",
        "  return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />",
        "}",
      ], "F0F9FF", BLUE, true),
      spacer(),

      h2("0.8 — Schema LocalBusiness (incluir em TODA página)"),
      box("Schema base da empresa — usar em layout.tsx ou em cada página", [
        "const localBusinessSchema = {",
        "  '@context': 'https://schema.org',",
        "  '@type': 'LocalBusiness',",
        "  '@id': 'https://virtualgames.com.br/#empresa',",
        "  name: 'Virtual Games',",
        "  description: 'Assistência técnica especializada em PS5, Xbox, Nintendo Switch e PC Gamer em Santa Maria, RS.',",
        "  url: 'https://virtualgames.com.br',",
        "  telephone: '+55-55-99725-2786',",
        "  email: 'contato@virtualgames.com',",
        "  priceRange: '$$',",
        "  currenciesAccepted: 'BRL',",
        "  paymentAccepted: 'Dinheiro, PIX, Cartão de Crédito, Cartão de Débito',",
        "  image: 'https://virtualgames.com.br/og-image.png',",
        "  logo: 'https://virtualgames.com.br/logo.png',",
        "  address: { '@type': 'PostalAddress', streetAddress: 'Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2', addressLocality: 'Santa Maria', addressRegion: 'RS', postalCode: '97010-002', addressCountry: 'BR' },",
        "  geo: { '@type': 'GeoCoordinates', latitude: -29.6848, longitude: -53.8069 },",
        "  openingHoursSpecification: [",
        "    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '18:30' },",
        "    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '13:00' }",
        "  ],",
        "  sameAs: ['https://www.instagram.com/virtualgames', 'https://www.facebook.com/virtualgames', 'https://www.youtube.com/@virtualgames'],",
        "  hasMap: 'https://maps.google.com/?cid=SEU_GOOGLE_CID',",
        "}",
      ], "F0F9FF", BLUE, true),

      box("✅ Critério de Conclusão da Fase 0", [
        "→ Projeto compila: npm run build sem erros",
        "→ Deploy na Vercel funcionando em https://virtualgames.com.br",
        "→ /sitemap.xml retorna todas as URLs estáticas (mínimo 20 URLs)",
        "→ /robots.txt retorna regras corretas",
        "→ Google Search Console: site verificado e sitemap enviado",
        "→ Nenhum link 404 na navegação principal",
      ], "ECFDF5", GREEN),
      spacer(80),
      pb(),

      // ══════════════════════════════════════════════════════════
      // FASE 1 — HOME
      // ══════════════════════════════════════════════════════════
      h1("FASE 1 — Home (page.tsx) — Estrutura Completa"),
      box("🎯 Objetivo", [
        "Reconstruir a Home como página multi-seção SSG com todas as seções otimizadas para SEO,",
        "hierarquia de headings correta, trust signals, schema markup completo e CTAs de conversão.",
      ], "ECFDF5", GREEN),
      spacer(),

      h2("1.1 — Metadata da Home"),
      box("src/app/page.tsx — metadata export", [
        "export const metadata: Metadata = {",
        "  title: 'Assistência Técnica em Consoles e PC Gamer em Santa Maria | Virtual Games',",
        "  description: 'Assistência técnica especializada em PS5, Xbox, Nintendo Switch e PC Gamer em Santa Maria, RS. Diagnóstico grátis, garantia 90 dias. Orçamento via WhatsApp em 24h!',",
        "  alternates: { canonical: 'https://virtualgames.com.br' },",
        "  openGraph: { title: '...', description: '...', url: 'https://virtualgames.com.br', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },",
        "}",
      ], "F0F9FF", BLUE, true),
      spacer(),

      h2("1.2 — Hierarquia de Headings Obrigatória"),
      twoCol([
        ["Tag HTML", "Texto Exato / Orientação"],
        ["<h1> (único na página)", "Assistência Técnica em Consoles e PC Gamer em Santa Maria, RS"],
        ["<h2> — Trust", "Por Que a Virtual Games?"],
        ["<h2> — Serviços", "Nossos Serviços Especializados"],
        ["<h3> — cada serviço", "Manutenção de PS5 / Reparo Xbox / Montagem PC Gamer / etc."],
        ["<h2> — Processo", "Como Funciona o Reparo"],
        ["<h2> — Depoimentos", "O Que Nossos Clientes Dizem"],
        ["<h2> — Equipe", "Nossa Equipe de Especialistas"],
        ["<h3> — cada membro", "Nome + Cargo do técnico"],
        ["<h2> — FAQ", "Perguntas Frequentes"],
        ["<h3> — cada pergunta", "Texto da pergunta (em formato de pergunta)"],
        ["<h2> — Blog", "Últimas do Blog Gamer"],
        ["<h2> — Contato", "Fale Conosco — Santa Maria, RS"],
      ]),
      spacer(),

      h2("1.3 — Seções Obrigatórias da Home (na ordem exata)"),

      h3("Seção 1: Hero"),
      p("Conteúdo obrigatório:"),
      bullet("Tag <h1> com o texto definido acima"),
      bullet("Subtítulo: 'Especialistas em manutenção de PS5, Xbox, Nintendo Switch e PC Gamer em Santa Maria, RS.'"),
      bullet("CTA primário: botão com link href='https://wa.me/55997252786?text=Olá! Gostaria de solicitar um orçamento.' com texto 'SOLICITAR ORÇAMENTO VIA WHATSAPP'"),
      bullet("CTA secundário: link href='/servicos' com texto 'Ver Todos os Serviços'"),
      bullet("Imagem hero: foto real da loja ou equipe (NÃO usar Unsplash). Se não disponível, usar placeholder com alt='Equipe Virtual Games — Assistência Técnica Gamer em Santa Maria'"),
      bullet("Atributo priority={true} na imagem hero (LCP element)"),
      bullet("Atributo fetchpriority='high' na tag <img> gerada"),

      h3("Seção 2: Trust Bar"),
      p("Barra horizontal com 4 selos de confiança:"),
      bullet("Diagnóstico 100% Grátis"),
      bullet("Garantia de 90 Dias"),
      bullet("Orçamento em até 24h"),
      bullet("Atendimento por Especialistas Gamers"),
      bullet("Adicionar contagem: 'Mais de 2.000 reparos realizados' e 'Nota 5.0 no Google'"),

      h3("Seção 3: Serviços"),
      p("Grid de cards, cada card com:"),
      bullet("Ícone SVG relevante ao serviço"),
      bullet("<h3> com nome do serviço"),
      bullet("Parágrafo de descrição com keyword localizada (ex: 'Manutenção de PS5 em Santa Maria')"),
      bullet("Link href='/servicos/[slug]' com texto 'Saiba Mais' — NUNCA href='#'"),
      p("Serviços obrigatórios no grid: Manutenção PS5 | Reparo Xbox | Nintendo Switch | Montagem PC Gamer | Reparo de Controle | Reparo Mobile"),

      h3("Seção 4: Processo (Como Funciona)"),
      bullet("4 passos: 1) Traga o equipamento → 2) Diagnóstico grátis → 3) Aprovação do orçamento → 4) Reparo com garantia"),
      bullet("Usar lista ordenada <ol> com schema implícito"),

      h3("Seção 5: Depoimentos"),
      bullet("MÍNIMO 3 depoimentos com: foto real do cliente (ou avatar gerado com initial do nome), nome real, tipo de serviço, texto do depoimento"),
      bullet("PROIBIDO usar imagens do Unsplash — usar fotos reais ou avatares CSS/SVG com initial"),
      bullet("Implementar schema AggregateRating no JSON-LD: { '@type': 'AggregateRating', ratingValue: '5.0', reviewCount: '87', bestRating: '5' }"),
      bullet("Cada depoimento: schema Review com author, reviewBody, reviewRating"),

      h3("Seção 6: Equipe"),
      bullet("Foto real de cada membro (obrigatório — não usar ui-avatars.com)"),
      bullet("<h3> com nome completo"),
      bullet("Cargo com título correto (CEO, Técnico em Consoles, Técnico Mobile, Atendimento)"),
      bullet("Bio de 2-3 linhas para cada membro"),
      bullet("Schema Person para CEO: { '@type': 'Person', name: 'Emerson Gabriel de Mello Graeff', jobTitle: 'CEO', worksFor: { '@id': '#empresa' } }"),

      h3("Seção 7: FAQ (Home)"),
      bullet("Incluir 5 perguntas de alta intenção — implementar schema FAQPage"),
      bullet("Pergunta 1: 'O diagnóstico é realmente gratuito?' → 'Sim, realizamos o diagnóstico completo sem custo. Você aprova o orçamento antes de qualquer reparo.'"),
      bullet("Pergunta 2: 'Qual é o prazo de reparo de um PS5?' → 'A maioria dos reparos é concluída em 2 a 5 dias úteis. Casos mais complexos podem levar até 10 dias.'"),
      bullet("Pergunta 3: 'A Virtual Games tem garantia?' → 'Sim, todos os reparos têm garantia de 90 dias em peças e mão de obra.'"),
      bullet("Pergunta 4: 'Vocês atendem qual região?' → 'Estamos em Santa Maria, RS. Atendemos presencialmente e via envio postal para toda a região central do RS.'"),
      bullet("Pergunta 5: 'Como solicitar um orçamento?' → 'Basta enviar uma mensagem pelo WhatsApp (55) 99725-2786. Respondemos em até 24h.'"),
      bullet("Link 'Ver todas as perguntas' apontando para href='/faq'"),

      h3("Seção 8: Preview do Blog"),
      bullet("Buscar 3 últimos artigos publicados via Sanity (server component)"),
      bullet("Card com: imagem, categoria, título (<h3>), resumo, data e link href='/blog/[slug]'"),
      bullet("Link 'Ver todos os artigos' apontando para href='/blog'"),
      bullet("Caso blog vazio (antes de publicar artigos): ocultar seção com display:none"),

      h3("Seção 9: Contato"),
      bullet("Endereço completo: Rua Venâncio Aires, 1434, Torre Divindade, Sala 106 D-2, Centro, Santa Maria, RS — CEP 97010-002"),
      bullet("Link de Google Maps: href='https://maps.google.com/?q=Rua+Venâncio+Aires+1434+Santa+Maria+RS'"),
      bullet("Horário de funcionamento em formato de tabela"),
      bullet("Botão WhatsApp com pré-texto"),
      bullet("E-mail: contato@virtualgames.com"),
      bullet("Embed do Google Maps iframe (lazy loading) OU link para o mapa"),

      h2("1.4 — Schema da Home (JSON-LD completo)"),
      box("Schemas obrigatórios na Home", [
        "1. LocalBusiness (ver Fase 0)",
        "2. WebSite com SearchAction:",
        "   { '@type': 'WebSite', url: 'https://virtualgames.com.br', name: 'Virtual Games',",
        "     potentialAction: { '@type': 'SearchAction', target: 'https://virtualgames.com.br/blog?q={search_term_string}', 'query-input': 'required name=search_term_string' } }",
        "3. FAQPage com as 5 perguntas da seção de FAQ",
        "4. AggregateRating com reviewCount mínimo de 87",
        "5. BreadcrumbList para a home: [{ '@type': 'ListItem', position: 1, name: 'Início', item: 'https://virtualgames.com.br' }]",
      ], "EFF6FF", BLUE),
      spacer(),

      h2("1.5 — Botão WhatsApp Flutuante Global"),
      p("Criar componente src/components/layout/WhatsAppButton.tsx que aparece em TODAS as páginas:"),
      bullet("Posição: fixed, bottom-6, right-6, z-50"),
      bullet("Ícone do WhatsApp (SVG verde)"),
      bullet("Link: https://wa.me/55997252786?text=Olá!%20Gostaria%20de%20um%20orçamento."),
      bullet("aria-label='Falar com a Virtual Games no WhatsApp'"),
      bullet("Incluir no RootLayout — presente em todas as páginas"),

      box("✅ Critério de Conclusão da Fase 1", [
        "→ Home com H1 único e correto",
        "→ Todas as 9 seções implementadas e funcionais",
        "→ ZERO links apontando para '#'",
        "→ ZERO fotos do Unsplash nos depoimentos",
        "→ Schemas validados em schema.org/validator",
        "→ PageSpeed Insights: LCP < 2.5s, CLS < 0.1",
        "→ Teste de Rich Results do Google: FAQPage aparece",
      ], "ECFDF5", GREEN),
      spacer(80),
      pb(),

      // ══════════════════════════════════════════════════════════
      // FASE 2 — PÁGINAS DE SERVIÇO
      // ══════════════════════════════════════════════════════════
      h1("FASE 2 — Páginas de Serviço (9 páginas)"),
      box("🎯 Objetivo", [
        "Criar as 9 páginas de serviço individuais, cada uma otimizada para uma keyword transacional,",
        "com estrutura semântica completa, schema Service, FAQPage e CTAs de conversão.",
      ], "ECFDF5", GREEN),
      spacer(),

      h2("2.1 — Mapeamento Completo: Página × Keyword × Schema"),
      threeCol([
        ["URL", "H1 (título exato)", "KW Primary"],
        ["/servicos/manutencao-ps5", "Manutenção e Reparo de PS5 em Santa Maria, RS", "manutenção ps5 santa maria"],
        ["/servicos/manutencao-xbox", "Reparo e Manutenção de Xbox em Santa Maria, RS", "reparo xbox santa maria"],
        ["/servicos/manutencao-nintendo-switch", "Assistência Técnica Nintendo Switch em Santa Maria", "conserto nintendo switch santa maria"],
        ["/servicos/montagem-pc-gamer", "Montagem de PC Gamer em Santa Maria, RS", "montagem pc gamer santa maria"],
        ["/servicos/reparo-controle-drift", "Reparo de Controle com Drift em Santa Maria, RS", "reparo controle drift santa maria"],
        ["/servicos/reparo-celular", "Reparo de Celular em Santa Maria — iPhone e Android", "conserto celular santa maria"],
        ["/servicos/limpeza-preventiva", "Limpeza Preventiva de Console em Santa Maria, RS", "limpeza ps5 xbox santa maria"],
        ["/servicos/reparo-hdmi-ps5", "Reparo da Porta HDMI do PS5 em Santa Maria, RS", "porta hdmi ps5 problema"],
        ["/servicos/upgrade-ssd-ps5", "Upgrade de SSD no PS5 — Santa Maria, RS", "upgrade ssd ps5 santa maria"],
      ]),
      spacer(),

      h2("2.2 — Template de Página de Serviço (aplicar às 9 páginas)"),
      p("Cada página de serviço deve seguir exatamente este template:"),
      box("Estrutura obrigatória de cada página de serviço", [
        "1. METADATA: title = '[Serviço] em Santa Maria | Virtual Games'",
        "             description = 150-160 chars com KW local + proposta de valor + CTA",
        "             canonical = URL absoluta da página",
        "             openGraph completo com og:image específico do serviço",
        "",
        "2. BREADCRUMB: Início > Serviços > [Nome do Serviço]",
        "   Schema BreadcrumbList com 3 itens",
        "",
        "3. <h1>: Exatamente o título mapeado acima",
        "",
        "4. INTRO PARAGRAPH (150-200 palavras):",
        "   Deve conter: keyword primária + localização + proposta de valor + garantia",
        "   Ex: 'A Virtual Games é a assistência técnica especializada em manutenção de PS5 em Santa Maria, RS...'",
        "",
        "5. <h2>: 'O Que Fazemos no [Console/Serviço]'",
        "   Lista de serviços específicos com preço estimado (ou 'consulte-nos')",
        "   Usar <ul> semântico",
        "",
        "6. <h2>: 'Como Funciona o Reparo'",
        "   4 passos numerados: <ol> com steps",
        "",
        "7. <h2>: 'Garantia de 90 Dias'",
        "   Parágrafo explicando a garantia — usar keyword 'garantia reparo [console] santa maria'",
        "",
        "8. <h2>: 'Por Que Escolher a Virtual Games?'",
        "   3-4 bullet points de diferenciais",
        "",
        "9. <h2>: 'Perguntas Frequentes sobre [Serviço]'",
        "   5 FAQs específicas do serviço — schema FAQPage",
        "",
        "10. <h2>: 'O Que Dizem Nossos Clientes'",
        "    2-3 depoimentos específicos do serviço (fotos reais ou avatar com inicial)",
        "",
        "11. CTA FINAL: Botão WhatsApp com pré-texto específico",
        "    Ex: text='Olá! Gostaria de um orçamento para manutenção do meu PS5.'",
        "",
        "12. INTERLINKING:",
        "    - Link para /faq",
        "    - Link para /garantia",
        "    - Links para 2-3 artigos do blog relacionados (quando existirem)",
        "    - Link para /servicos (hub)",
      ], "F8FAFC", DARK),
      spacer(),

      h2("2.3 — Schema de Cada Página de Serviço"),
      box("JSON-LD obrigatório em CADA página de serviço", [
        "// Schema Service",
        "{ '@context': 'https://schema.org',",
        "  '@type': 'Service',",
        "  name: '[Nome do Serviço]',",
        "  description: '[Descrição de 150 chars]',",
        "  provider: { '@id': 'https://virtualgames.com.br/#empresa' },",
        "  areaServed: { '@type': 'City', name: 'Santa Maria', sameAs: 'https://www.wikidata.org/wiki/Q175907' },",
        "  serviceType: '[Tipo: Reparo de Console / Montagem de PC Gamer / etc.]',",
        "  offers: { '@type': 'Offer', priceSpecification: { '@type': 'PriceSpecification', priceCurrency: 'BRL', description: 'Diagnóstico gratuito. Orçamento aprovado pelo cliente.' } },",
        "  hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Serviços de [Console]', itemListElement: [ /* lista de sub-serviços */ ] },",
        "}",
        "",
        "// Schema FAQPage (5 perguntas por página)",
        "{ '@context': 'https://schema.org', '@type': 'FAQPage',",
        "  mainEntity: [ { '@type': 'Question', name: '...', acceptedAnswer: { '@type': 'Answer', text: '...' } } ]",
        "}",
        "",
        "// Schema AggregateRating",
        "{ '@type': 'AggregateRating', ratingValue: '5', reviewCount: '87', bestRating: '5', worstRating: '1' }",
      ], "F0F9FF", BLUE, true),
      spacer(),

      h2("2.4 — FAQs Específicas por Serviço (5 por página)"),
      p("Use as seguintes FAQs como base (adaptar para cada serviço):"),
      twoCol([
        ["Serviço", "FAQs obrigatórias (perguntas exatas)"],
        ["PS5", "1. Quanto custa consertar um PS5? 2. Quanto tempo leva o reparo de PS5? 3. A Virtual Games usa peças originais no PS5? 4. Meu PS5 está superaquecendo, o que pode ser? 5. Qual a garantia do reparo do PS5?"],
        ["Xbox", "1. Vocês consertam Xbox Series X e Xbox One? 2. Quanto tempo leva o reparo do Xbox? 3. Qual o preço para consertar um Xbox? 4. O que fazer quando o Xbox não liga? 5. Qual a garantia do reparo do Xbox?"],
        ["Nintendo Switch", "1. Vocês consertam Nintendo Switch com tela quebrada? 2. Quanto custa consertar um Nintendo Switch? 3. Vocês consertam Nintendo Switch Lite e OLED? 4. O que fazer quando o Switch não carrega? 5. Qual a garantia do reparo do Switch?"],
        ["PC Gamer", "1. Vocês montam PC Gamer do zero? 2. Quanto custa montar um PC Gamer básico em Santa Maria? 3. Vocês fazem upgrade de PC Gamer existente? 4. Qual é o prazo para montagem de PC Gamer? 5. A Virtual Games oferece suporte após a montagem?"],
        ["Reparo Controle", "1. Controle com drift tem conserto? 2. Qual o preço para trocar analógico do controle PS5? 3. Vocês consertam controles Xbox e Nintendo? 4. Quanto tempo leva o reparo do controle? 5. Qual a garantia do reparo de controles?"],
      ]),
      spacer(),

      box("✅ Critério de Conclusão da Fase 2", [
        "→ 9 páginas de serviço funcionais e indexáveis",
        "→ Cada página com H1 único e keyword-rich",
        "→ Cada página com FAQPage schema validado",
        "→ Breadcrumb funcional e com schema em todas as páginas",
        "→ ZERO links quebrados entre páginas",
        "→ Interlinking implementado: cada serviço linka para hub /servicos",
        "→ Google Search Console: 9 novas URLs aparecendo na cobertura",
      ], "ECFDF5", GREEN),
      spacer(80),
      pb(),

      // ══════════════════════════════════════════════════════════
      // FASE 3 — PÁGINAS INSTITUCIONAIS
      // ══════════════════════════════════════════════════════════
      h1("FASE 3 — Páginas Institucionais e E-E-A-T"),
      box("🎯 Objetivo", [
        "Criar as páginas institucionais que constroem autoridade, credibilidade e E-E-A-T.",
        "Estas páginas são fundamentais para o algoritmo de avaliação de qualidade do Google.",
      ], "ECFDF5", GREEN),
      spacer(),

      h2("3.1 — Página /sobre"),
      p("Esta é a página mais crítica para E-E-A-T. Deve conter:"),
      bullet("H1: 'Sobre a Virtual Games — Especialistas em Consoles e PC Gamer em Santa Maria'"),
      bullet("Foto real da fachada ou interior da loja (obrigatório — sem stock photos)"),
      bullet("História da empresa com datas reais"),
      bullet("Missão, Visão e Valores explícitos"),
      bullet("Seção de equipe com foto real de CADA membro, nome, cargo e bio de 3-5 linhas"),
      bullet("Número de reparos realizados, anos de mercado"),
      bullet("Menção a certificações ou formações técnicas (se existirem)"),
      bullet("Link para página de garantia"),
      bullet("Schema Organization completo"),
      bullet("Schema Person para cada membro da equipe"),
      p("Schema obrigatório em /sobre:"),
      box("Schema Organization e Person", [
        "{ '@context': 'https://schema.org', '@type': 'Organization',",
        "  '@id': 'https://virtualgames.com.br/#empresa',",
        "  name: 'Virtual Games', url: 'https://virtualgames.com.br',",
        "  foundingDate: '2020',  // confirmar data real com o cliente",
        "  founder: { '@type': 'Person', name: 'Emerson Gabriel de Mello Graeff' },",
        "  numberOfEmployees: { '@type': 'QuantitativeValue', value: 4 },",
        "  member: [",
        "    { '@type': 'Person', name: 'Emerson Gabriel de Mello Graeff', jobTitle: 'CEO e Fundador' },",
        "    { '@type': 'Person', name: 'Kevin de Mello Graeff', jobTitle: 'Técnico em Consoles' },",
        "    { '@type': 'Person', name: 'Elias Rodrigues Fagundes', jobTitle: 'Técnico em Consoles' },",
        "    { '@type': 'Person', name: 'Gabriel Rae da Silva Castro', jobTitle: 'Atendimento e Vendas' },",
        "  ]",
        "}",
      ], "F0F9FF", BLUE, true),
      spacer(),

      h2("3.2 — Página /faq"),
      p("Página de FAQ completa com mínimo 20 perguntas organizadas por categoria:"),
      bullet("H1: 'Perguntas Frequentes — Assistência Técnica Gamer Virtual Games'"),
      bullet("Organizar em seções com H2: Sobre os Serviços | PS5 | Xbox | Nintendo Switch | PC Gamer | Pagamento e Garantia"),
      bullet("Cada pergunta em H3, resposta em parágrafo"),
      bullet("Schema FAQPage com todas as 20+ perguntas"),
      bullet("Accordion interativo (HTML/CSS puro ou Radix UI)"),
      bullet("CTA ao final: botão WhatsApp 'Não encontrou sua resposta?'"),
      bullet("Link de retorno para cada serviço correspondente"),
      spacer(),

      h2("3.3 — Página /garantia"),
      bullet("H1: 'Garantia de 90 Dias — Virtual Games Santa Maria'"),
      bullet("Explicação detalhada do que a garantia cobre"),
      bullet("O que NÃO é coberto pela garantia (danos físicos após reparo, etc.)"),
      bullet("Como acionar a garantia (link WhatsApp com pré-texto)"),
      bullet("Schema WarrantyPromise ou Offer com garantia"),
      bullet("Diferencial: 'Nossa garantia é superior às assistências técnicas genéricas'"),
      spacer(),

      h2("3.4 — Página /contato"),
      bullet("H1: 'Fale com a Virtual Games — Santa Maria, RS'"),
      bullet("Formulário de contato com campos: Nome, WhatsApp, Equipamento, Descrição do problema"),
      bullet("Ação do formulário: enviar para API route /api/contato que dispara mensagem via WhatsApp Business API ou e-mail"),
      bullet("Endereço completo com link Google Maps"),
      bullet("Horário de funcionamento"),
      bullet("Embed Google Maps (lazy loading: loading='lazy')"),
      bullet("Schema ContactPoint"),
      spacer(),

      h2("3.5 — Páginas /privacidade e /termos"),
      bullet("Conteúdo real e completo (NÃO links para '#')"),
      bullet("Política de Privacidade deve mencionar LGPD explicitamente"),
      bullet("Termos de Serviço devem cobrir: prazo de reparo, garantia, responsabilidade por equipamentos"),
      bullet("Metadata: robots='noindex' para /privacidade e /termos (não precisam ranquear)"),
      spacer(),

      h2("3.6 — Página /acompanhar-reparo"),
      bullet("H1: 'Acompanhar Meu Reparo — Virtual Games'"),
      bullet("Campo de busca por número de OS"),
      bullet("Integrar com sistema interno (API route /api/os/[numero])"),
      bullet("Se sistema não existir: formulário que direciona para WhatsApp com número da OS"),
      bullet("Metadata: robots='noindex' (página de sistema, não precisa indexar)"),
      spacer(),

      h2("3.7 — Página /campeonatos"),
      bullet("H1: 'Campeonatos de Games em Santa Maria — Virtual Games'"),
      bullet("Lista de torneios passados e futuros"),
      bullet("Schema Event para cada campeonato futuro"),
      bullet("CTA de inscrição via WhatsApp"),
      bullet("Galeria de fotos dos eventos passados (fotos reais)"),
      bullet("Esta página é excelente para link building local — promover em redes sociais"),
      spacer(),

      h2("3.8 — Página /assistencia-tecnica-santa-maria (SEO Local)"),
      p("Esta é a página pilar de SEO local — maximizar para 'assistência técnica gamer santa maria':"),
      bullet("H1: 'Assistência Técnica Gamer em Santa Maria, RS — Virtual Games'"),
      bullet("Conteúdo rico sobre a loja, localização, bairros atendidos"),
      bullet("Mencionar pontos de referência locais (Centro, UFSM, bairros próximos)"),
      bullet("Mencionar que atendem toda a região central do RS"),
      bullet("Schema LocalBusiness com geoCoordinates precisas"),
      bullet("Link para Google Maps"),
      bullet("Grid de serviços linkando para cada página de serviço"),
      bullet("Depoimentos de clientes da cidade"),

      box("✅ Critério de Conclusão da Fase 3", [
        "→ Todas as 7 páginas institucionais criadas com conteúdo real",
        "→ /sobre com fotos reais da equipe (sem avatares gerados)",
        "→ /faq com 20+ perguntas e schema FAQPage completo",
        "→ /privacidade e /termos com conteúdo real (sem '#')",
        "→ /contato com formulário funcional",
        "→ Schema Organization validado em schema.org/validator",
        "→ Zero páginas com conteúdo placeholder ('Lorem Ipsum', 'Em breve', etc.)",
      ], "ECFDF5", GREEN),
      spacer(80),
      pb(),

      // ══════════════════════════════════════════════════════════
      // FASE 4 — BLOG E CMS
      // ══════════════════════════════════════════════════════════
      h1("FASE 4 — Blog com Sanity CMS"),
      box("🎯 Objetivo", [
        "Implementar o blog completo com Sanity como CMS headless, ISR para performance,",
        "schema Article, FAQPage por artigo, interlinking automático e estrutura de clusters.",
      ], "ECFDF5", GREEN),
      spacer(),

      h2("4.1 — Schema do Sanity (sanity.config.ts)"),
      box("Definição de tipos no Sanity Studio", [
        "// schemas/post.ts — schema do artigo",
        "export default {",
        "  name: 'post', title: 'Artigo do Blog', type: 'document',",
        "  fields: [",
        "    { name: 'title', type: 'string', title: 'Título (H1)', validation: r => r.required().max(70) },",
        "    { name: 'slug', type: 'slug', title: 'Slug (URL)', options: { source: 'title' } },",
        "    { name: 'metaTitle', type: 'string', title: 'Meta Title (SEO)', validation: r => r.max(60) },",
        "    { name: 'metaDescription', type: 'string', title: 'Meta Description', validation: r => r.max(160) },",
        "    { name: 'featuredImage', type: 'image', title: 'Imagem Destaque', fields: [{ name: 'alt', type: 'string', title: 'Alt text (obrigatório)', validation: r => r.required() }] },",
        "    { name: 'categoria', type: 'string', title: 'Categoria', options: { list: ['PS5','Xbox','Nintendo Switch','PC Gamer','Celular','eSports','Guias','Comparativos','Santa Maria'] } },",
        "    { name: 'publishedAt', type: 'datetime', title: 'Data de Publicação' },",
        "    { name: 'updatedAt', type: 'datetime', title: 'Data de Atualização' },",
        "    { name: 'author', type: 'reference', to: [{ type: 'author' }] },",
        "    { name: 'excerpt', type: 'text', title: 'Resumo (para TL;DR e meta)', validation: r => r.max(300) },",
        "    { name: 'body', type: 'array', title: 'Conteúdo', of: [{ type: 'block' }, { type: 'image' }] },",
        "    { name: 'faqs', title: 'FAQs do Artigo', type: 'array', of: [{ type: 'object', fields: [{ name: 'question', type: 'string' }, { name: 'answer', type: 'text' }] }] },",
        "    { name: 'relatedPosts', type: 'array', title: 'Artigos Relacionados', of: [{ type: 'reference', to: [{ type: 'post' }] }], validation: r => r.max(3) },",
        "    { name: 'relatedService', type: 'string', title: 'Serviço Relacionado (URL)', description: 'Ex: /servicos/manutencao-ps5' },",
        "    { name: 'readingTime', type: 'number', title: 'Tempo de Leitura (minutos)' },",
        "  ]",
        "}",
        "",
        "// schemas/author.ts",
        "export default {",
        "  name: 'author', title: 'Autor', type: 'document',",
        "  fields: [",
        "    { name: 'name', type: 'string', title: 'Nome Completo' },",
        "    { name: 'slug', type: 'slug', options: { source: 'name' } },",
        "    { name: 'role', type: 'string', title: 'Cargo' },",
        "    { name: 'bio', type: 'text', title: 'Bio (E-E-A-T)' },",
        "    { name: 'image', type: 'image', title: 'Foto Real (obrigatório)' },",
        "  ]",
        "}",
      ], "F0F9FF", BLUE, true),
      spacer(),

      h2("4.2 — Página de Artigo Individual (/blog/[slug]/page.tsx)"),
      p("Esta é a estrutura obrigatória de CADA artigo:"),
      box("Estrutura completa do artigo", [
        "1. METADATA dinâmica (generateMetadata):",
        "   title = post.metaTitle || post.title + ' | Virtual Games'",
        "   description = post.metaDescription || post.excerpt",
        "   canonical = https://virtualgames.com.br/blog/[slug]",
        "   openGraph com imagem do artigo",
        "   alternates: { canonical: url }",
        "",
        "2. BREADCRUMB: Início > Blog > [Categoria] > [Título]",
        "   Schema BreadcrumbList com 4 itens",
        "",
        "3. CABEÇALHO DO ARTIGO:",
        "   - Categoria (link para /blog/categoria/[categoria])",
        "   - <h1>: post.title",
        "   - Data de publicação e atualização visíveis",
        "   - Tempo de leitura",
        "   - Autor: foto real + nome + cargo (link para /sobre)",
        "   - Imagem destaque com alt text (priority={true} se for LCP)",
        "",
        "4. TL;DR BOX (logo abaixo do header):",
        "   Caixa destacada com resumo de 2-3 frases — resposta direta",
        "   Otimiza para featured snippets",
        "",
        "5. CORPO DO ARTIGO:",
        "   - Renderizar via PortableText do Sanity",
        "   - Headings no corpo: H2 e H3 (nunca H1 — já usado acima)",
        "   - Imagens com alt text obrigatório e loading='lazy'",
        "   - Links internos para serviços relacionados (post.relatedService)",
        "",
        "6. CTA CONTEXTUAL (no meio e no final do artigo):",
        "   Caixa: 'Precisa de assistência técnica? [Botão WhatsApp]'",
        "   CTA meio do artigo: após ~50% do conteúdo",
        "   CTA final: após o corpo do artigo",
        "",
        "7. SEÇÃO DE FAQs:",
        "   <h2>Perguntas Frequentes</h2>",
        "   Accordion com as FAQs do campo post.faqs",
        "   Schema FAQPage",
        "",
        "8. ARTIGOS RELACIONADOS:",
        "   <h2>Leia Também</h2>",
        "   Grid de 3 cards com post.relatedPosts",
        "",
        "9. LINK PARA SERVIÇO:",
        "   Se post.relatedService existir:",
        "   'Precisa de ajuda com [serviço]? Veja nossa página de [link para serviço]'",
      ], "F8FAFC", DARK),
      spacer(),

      h2("4.3 — Schema do Artigo (JSON-LD)"),
      box("Schemas obrigatórios em CADA artigo", [
        "// Article Schema",
        "{ '@context': 'https://schema.org', '@type': 'Article',",
        "  headline: post.title,",
        "  description: post.excerpt,",
        "  image: post.featuredImage.url,",
        "  author: { '@type': 'Person', name: post.author.name, jobTitle: post.author.role, worksFor: { '@id': 'https://virtualgames.com.br/#empresa' } },",
        "  publisher: { '@id': 'https://virtualgames.com.br/#empresa' },",
        "  datePublished: post.publishedAt,",
        "  dateModified: post.updatedAt || post.publishedAt,",
        "  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://virtualgames.com.br/blog/' + post.slug },",
        "  inLanguage: 'pt-BR',",
        "  keywords: post.categoria + ', assistência técnica santa maria',",
        "}",
        "",
        "// FAQPage (se post.faqs.length > 0)",
        "{ '@context': 'https://schema.org', '@type': 'FAQPage',",
        "  mainEntity: post.faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } }))",
        "}",
        "",
        "// BreadcrumbList",
        "{ '@context': 'https://schema.org', '@type': 'BreadcrumbList',",
        "  itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Início', item: '...' }, { '@type': 'ListItem', position: 2, name: 'Blog', item: '.../blog' }, { '@type': 'ListItem', position: 3, name: post.categoria, item: '.../blog/categoria/...' }, { '@type': 'ListItem', position: 4, name: post.title } ]",
        "}",
      ], "F0F9FF", BLUE, true),
      spacer(),

      h2("4.4 — 15 Artigos Iniciais a Criar no Sanity (conteúdo completo)"),
      p("Os artigos devem ser escritos pela IA com MÍNIMO 1.500 palavras cada, conteúdo original e útil:"),
      threeCol([
        ["Título do Artigo", "Categoria", "Serviço Relacionado"],
        ["PS5 Superaquecendo: Causas, Sintomas e Soluções Definitivas", "PS5", "/servicos/manutencao-ps5"],
        ["Drift no Controle PS5: Tem Conserto? Quanto Custa?", "PS5", "/servicos/reparo-controle-drift"],
        ["Quanto Custa Consertar um PS5? Guia de Preços 2025", "PS5", "/servicos/manutencao-ps5"],
        ["PS5 Não Liga: O Que Pode Ser e Como Resolver", "PS5", "/servicos/manutencao-ps5"],
        ["Porta HDMI do PS5 Sem Sinal: Causas e Solução", "PS5", "/servicos/reparo-hdmi-ps5"],
        ["Upgrade de SSD no PS5: Vale a Pena? Guia Completo", "PS5", "/servicos/upgrade-ssd-ps5"],
        ["Como Montar um PC Gamer do Zero — Guia para Iniciantes", "PC Gamer", "/servicos/montagem-pc-gamer"],
        ["Quanto Custa Montar um PC Gamer em 2025?", "PC Gamer", "/servicos/montagem-pc-gamer"],
        ["PS5 vs Xbox Series X: Qual Comprar em 2025?", "Comparativos", null],
        ["Nintendo Switch OLED vs Lite vs Original: Qual é o Melhor?", "Comparativos", "/servicos/manutencao-nintendo-switch"],
        ["Xbox Series X Não Lê Disco: Causas e Solução", "Xbox", "/servicos/manutencao-xbox"],
        ["Limpeza Preventiva de Console: Por Que É Essencial?", "Guias", "/servicos/limpeza-preventiva"],
        ["Controle Xbox com Drift: Como Resolver?", "Xbox", "/servicos/reparo-controle-drift"],
        ["Melhores Jogos de PS5 em 2025 para Começar", "PS5", null],
        ["Assistência Técnica de Games em Santa Maria: Guia Completo", "Santa Maria", "/assistencia-tecnica-santa-maria"],
      ]),
      spacer(),

      h2("4.5 — Configuração ISR nos Artigos"),
      box("ISR — Incremental Static Regeneration", [
        "// Em /blog/[slug]/page.tsx",
        "export const revalidate = 3600  // revalida a cada 1 hora",
        "",
        "// generateStaticParams para pre-renderizar na build",
        "export async function generateStaticParams() {",
        "  const slugs = await client.fetch(`*[_type == 'post']{ 'slug': slug.current }`)",
        "  return slugs.map(({ slug }) => ({ slug }))",
        "}",
      ], "F0F9FF", BLUE, true),
      spacer(),

      box("✅ Critério de Conclusão da Fase 4", [
        "→ Sanity CMS configurado com schemas post e author",
        "→ 15 artigos criados e publicados com conteúdo original",
        "→ Página de artigo com TODOS os elementos do template",
        "→ Schema Article e FAQPage validados",
        "→ ISR configurado corretamente",
        "→ Hub /blog listando artigos por categoria",
        "→ Página /blog/categoria/[categoria] funcional",
        "→ Interlinking: 100% dos artigos linkam para serviço relacionado",
      ], "ECFDF5", GREEN),
      spacer(80),
      pb(),

      // ══════════════════════════════════════════════════════════
      // FASE 5 — SEO TÉCNICO E PERFORMANCE
      // ══════════════════════════════════════════════════════════
      h1("FASE 5 — SEO Técnico e Core Web Vitals"),
      box("🎯 Objetivo", [
        "Garantir que o site atinja as métricas técnicas que o Google avalia.",
        "Meta: LCP < 2.5s | CLS < 0.1 | INP < 200ms | FCP < 1.8s | TTFB < 600ms",
      ], "ECFDF5", GREEN),
      spacer(),

      h2("5.1 — Otimização de Imagens (Crítico para LCP)"),
      box("Regras obrigatórias para next/image", [
        "// ✅ CORRETO — Hero Image (LCP element)",
        "<Image src='/hero.jpg' alt='Equipe Virtual Games em Santa Maria' width={1200} height={630} priority={true} sizes='100vw' quality={85} />",
        "",
        "// ✅ CORRETO — Cards de serviço",
        "<Image src={serviceImg} alt={service.imageAlt} width={600} height={400} loading='lazy' sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' />",
        "",
        "// ❌ PROIBIDO — nunca usar assim",
        "<img src='https://images.unsplash.com/...' />  // proibido",
        "<Image src={img} width={3840} height={2160} />  // tamanho excessivo, proibido",
        "<Image src={img} />  // sem width/height, causa CLS",
      ], "F0F9FF", BLUE, true),
      bullet("Todas as imagens de depoimentos, equipe e serviços: usar fotos reais da Virtual Games"),
      bullet("Formato obrigatório: next/image gera WebP/AVIF automaticamente — usar sempre"),
      bullet("alt text: descritivo e com keyword quando relevante, sem keyword stuffing"),
      bullet("Nunca usar priority={true} em mais de 1 imagem por página"),
      spacer(),

      h2("5.2 — Preload e Hints de Performance"),
      box("Adicionar no RootLayout <head>", [
        "// Preconnect para recursos externos",
        "<link rel='preconnect' href='https://cdn.sanity.io' />",
        "<link rel='dns-prefetch' href='https://cdn.sanity.io' />",
        "",
        "// Google Analytics 4 — lazy load",
        "// Usar @vercel/analytics e @vercel/speed-insights já instalados",
        "import { Analytics } from '@vercel/analytics/react'",
        "import { SpeedInsights } from '@vercel/speed-insights/next'",
        "// Adicionar <Analytics /> e <SpeedInsights /> no layout",
      ], "F0F9FF", BLUE, true),
      spacer(),

      h2("5.3 — Headers de Cache (vercel.json)"),
      box("vercel.json — cache e headers de segurança", [
        "{",
        "  'headers': [",
        "    { 'source': '/(.*)\\\\.(ico|png|jpg|jpeg|webp|avif|svg|woff2|css|js)', 'headers': [{ 'key': 'Cache-Control', 'value': 'public, max-age=31536000, immutable' }] },",
        "    { 'source': '/(.*)', 'headers': [",
        "      { 'key': 'X-Content-Type-Options', 'value': 'nosniff' },",
        "      { 'key': 'Referrer-Policy', 'value': 'strict-origin-when-cross-origin' }",
        "    ]}",
        "  ]",
        "}",
      ], "F0F9FF", BLUE, true),
      spacer(),

      h2("5.4 — Checklist Técnico Completo"),
      threeCol([
        ["Item", "Implementação", "Ferramenta de Verificação"],
        ["Canonical em todas as páginas", "alternates.canonical em cada metadata", "GSC → Cobertura"],
        ["Open Graph em todas as páginas", "metadata.openGraph em cada página", "opengraph.xyz"],
        ["Twitter Card em todas as páginas", "metadata.twitter em cada página", "cards-dev.twitter.com"],
        ["Schema validado", "schema.org/validator para cada tipo", "validator.schema.org"],
        ["Sitemap enviado ao GSC", "sitemap.ts + envio manual no GSC", "GSC → Sitemaps"],
        ["robots.txt correto", "robots.ts sem bloquear páginas indexáveis", "GSC → robots.txt tester"],
        ["404 page customizada", "src/app/not-found.tsx com CTA", "curl -I /pagina-inexistente"],
        ["Redirecionamentos 301", "next.config.js redirects", "curl -I /login"],
        ["Core Web Vitals", "PageSpeed Insights mobile e desktop", "pagespeed.web.dev"],
        ["HTTPS forçado", "Vercel faz automaticamente", "curl -I http://..."],
        ["Sem conteúdo duplicado", "Canonicals em todas as páginas", "SEOquake"],
        ["Imagens com alt text", "Verificar 100% das imagens", "WAVE acessibilidade"],
        ["Links sem href='#'", "Grep: grep -r \"href='#'\" src/", "Terminal"],
        ["Mobile First", "Tailwind mobile-first classes", "Chrome DevTools"],
      ]),
      spacer(),

      box("✅ Critério de Conclusão da Fase 5", [
        "→ PageSpeed Insights Mobile: Performance ≥ 80",
        "→ PageSpeed Insights Desktop: Performance ≥ 90",
        "→ LCP < 2.5s em todas as páginas principais",
        "→ CLS < 0.1 em todas as páginas",
        "→ Zero erros no Google Search Console",
        "→ Zero links href='#' em todo o site",
        "→ 100% das imagens com alt text",
        "→ Schema validado para LocalBusiness, Service, Article, FAQPage",
      ], "ECFDF5", GREEN),
      spacer(80),
      pb(),

      // ══════════════════════════════════════════════════════════
      // FASE 6 — HEADER, FOOTER E COMPONENTES GLOBAIS
      // ══════════════════════════════════════════════════════════
      h1("FASE 6 — Header, Footer e Componentes Globais"),
      spacer(),

      h2("6.1 — Header (src/components/layout/Header.tsx)"),
      p("O Header deve ser um componente de servidor com navegação semântica:"),
      bullet("Tag <header> com role='banner'"),
      bullet("Logo linkando para / (href='/') com alt='Virtual Games — Assistência Técnica Gamer'"),
      bullet("Navegação: <nav aria-label='Navegação principal'>"),
      bullet("Links principais: Início | Serviços | Blog | Campeonatos | Sobre | Contato"),
      bullet("Dropdown em 'Serviços' com links para TODAS as 9 páginas de serviço"),
      bullet("CTA no header: botão 'WhatsApp' linkando para wa.me/..."),
      bullet("Hamburger menu para mobile (CSS only ou Headless UI)"),
      bullet("Sticky header (position: sticky, top: 0) com backdrop blur"),
      bullet("Não usar links de âncora (#) — apenas links reais de página"),
      spacer(),

      h2("6.2 — Footer (src/components/layout/Footer.tsx)"),
      p("Footer completo com TODOS os links reais funcionais:"),
      bullet("<footer> com role='contentinfo'"),
      bullet("Logo + tagline: 'Assistência Técnica Gamer em Santa Maria, RS'"),
      bullet("Coluna 1 — Navegação: Início | Sobre | Blog | Contato"),
      bullet("Coluna 2 — Serviços: links para TODAS as 9 páginas de serviço"),
      bullet("Coluna 3 — Informações: Endereço | Horário | Telefone | E-mail"),
      bullet("Coluna 4 — Redes Sociais: Instagram | YouTube | Facebook — links REAIS (não '#')"),
      bullet("Links Legais: Privacidade | Termos | Garantia — links REAIS (não '#')"),
      bullet("Copyright: '© 2026 Virtual Games. Todos os direitos reservados.'"),
      bullet("Endereço marcado com microdata address ou como texto plano (não em lista HTML vazia)"),
      spacer(),

      h2("6.3 — Breadcrumb Component"),
      box("src/components/layout/Breadcrumb.tsx", [
        "type BreadcrumbItem = { name: string; href?: string }",
        "",
        "export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {",
        "  return (",
        "    <nav aria-label='Breadcrumb' className='...'> ",
        "      <ol itemScope itemType='https://schema.org/BreadcrumbList' className='flex gap-2'>",
        "        {items.map((item, i) => (",
        "          <li key={i} itemProp='itemListElement' itemScope itemType='https://schema.org/ListItem'>",
        "            {item.href ? <a href={item.href} itemProp='item'><span itemProp='name'>{item.name}</span></a> : <span itemProp='name'>{item.name}</span>}",
        "            <meta itemProp='position' content={String(i + 1)} />",
        "          </li>",
        "        ))}",
        "      </ol>",
        "    </nav>",
        "  )",
        "}",
      ], "F0F9FF", BLUE, true),

      box("✅ Critério de Conclusão da Fase 6", [
        "→ Header com dropdown de serviços funcional no mobile e desktop",
        "→ Footer com TODOS os links funcionais — zero href='#'",
        "→ Breadcrumb em todas as páginas internas",
        "→ WhatsApp button flutuante em todas as páginas",
        "→ Teste de acessibilidade: WAVE sem erros críticos",
      ], "ECFDF5", GREEN),
      spacer(80),
      pb(),

      // ══════════════════════════════════════════════════════════
      // FASE 7 — VALIDAÇÃO FINAL
      // ══════════════════════════════════════════════════════════
      h1("FASE 7 — Validação Final e Checklist de Auditoria"),
      box("🎯 Objetivo", [
        "Esta fase não cria código novo — valida tudo que foi implementado.",
        "Uma auditoria externa deve resultar em: SITE 100% OTIMIZADO.",
      ], "ECFDF5", GREEN),
      spacer(),

      h2("7.1 — Checklist SEO Técnico (100% deve passar)"),
      twoCol([
        ["Item de Verificação", "Status (Pass/Fail)"],
        ["sitemap.xml contém todas as URLs (≥ 30)", "→ Verificar em /sitemap.xml"],
        ["robots.txt sem bloqueio indevido", "→ GSC robots.txt tester"],
        ["Canonical correto em 100% das páginas", "→ Screaming Frog"],
        ["Meta title ≤ 60 chars em todas as páginas", "→ Screaming Frog"],
        ["Meta description 120-160 chars em todas as páginas", "→ Screaming Frog"],
        ["H1 único por página em 100% das páginas", "→ Screaming Frog"],
        ["Zero links para href='#'", "→ grep -r \"href='#'\" src/"],
        ["Zero links 404", "→ Broken Link Checker"],
        ["Schema validado: LocalBusiness, Service, Article, FAQPage", "→ validator.schema.org"],
        ["Open Graph em todas as páginas", "→ opengraph.xyz"],
        ["Twitter Card em todas as páginas", "→ cards-dev.twitter.com"],
        ["100% imagens com alt text", "→ WAVE ou axe DevTools"],
        ["Zero imagens do Unsplash", "→ grep -r 'unsplash.com' src/"],
        ["Redirecionamento /login → /acompanhar-reparo (301)", "→ curl -I /login"],
        ["HTTPS forçado", "→ curl -I http://virtualgames.com.br"],
      ]),
      spacer(),

      h2("7.2 — Checklist Core Web Vitals"),
      twoCol([
        ["Métrica", "Meta obrigatória"],
        ["LCP (Mobile)", "< 2.5 segundos"],
        ["LCP (Desktop)", "< 1.8 segundos"],
        ["CLS (Mobile)", "< 0.10"],
        ["CLS (Desktop)", "< 0.10"],
        ["INP (Mobile)", "< 200ms"],
        ["FCP (Mobile)", "< 1.8s"],
        ["TTFB (Mobile)", "< 800ms"],
        ["Performance Score Mobile", "≥ 80/100"],
        ["Performance Score Desktop", "≥ 90/100"],
        ["Accessibility Score", "≥ 90/100"],
        ["Best Practices Score", "≥ 95/100"],
        ["SEO Score (Lighthouse)", "100/100"],
      ]),
      spacer(),

      h2("7.3 — Checklist E-E-A-T"),
      bullet("Foto real de TODOS os membros da equipe na página /sobre"),
      bullet("CEO com bio detalhada e história pessoal com games"),
      bullet("Cada técnico com especialização declarada"),
      bullet("Endereço físico verificável e coerente com Google Meu Negócio"),
      bullet("Número de reparos realizados declarado explicitamente"),
      bullet("Política de privacidade LGPD completa"),
      bullet("Termos de serviço e garantia documentados"),
      bullet("Depoimentos de clientes reais com nome e tipo de serviço"),
      bullet("Schema AggregateRating com dados reais"),
      bullet("Google Meu Negócio verificado e com foto da equipe"),
      spacer(),

      h2("7.4 — Checklist de Conteúdo e Interlinking"),
      bullet("15 artigos publicados com ≥ 1.500 palavras cada"),
      bullet("100% dos artigos linkam para página de serviço relacionado"),
      bullet("100% das páginas de serviço linkam para artigos do blog"),
      bullet("Cluster PS5: pilar + 5 artigos satélite com interlinking mútuo"),
      bullet("Cluster PC Gamer: pilar + 3 artigos satélite"),
      bullet("FAQ: 20+ perguntas com schema FAQPage"),
      bullet("Breadcrumb em 100% das páginas internas"),
      bullet("Nenhuma página órfã (toda página tem ≥ 1 link interno apontando para ela)"),
      spacer(),

      h2("7.5 — Configurações Externas (não código, mas obrigatórias)"),
      bullet("Google Search Console: verificado, sitemap enviado, sem erros críticos"),
      bullet("Google Analytics 4: configurado com evento de conversão 'clique_whatsapp'"),
      bullet("Google Meu Negócio: perfil 100% completo — fotos, horário, categoria, serviços, Q&A"),
      bullet("Bing Webmaster Tools: verificado e sitemap enviado"),
      bullet("Instagram/Facebook/YouTube: links reais no footer do site"),

      box("✅ CRITÉRIO FINAL DE ENTREGA", [
        "O site está 100% pronto quando TODOS os itens abaixo passarem:",
        "",
        "→ Lighthouse SEO: 100/100",
        "→ Lighthouse Performance Mobile: ≥ 80/100",
        "→ Lighthouse Accessibility: ≥ 90/100",
        "→ validator.schema.org: zero erros em todas as páginas",
        "→ Google Search Console: zero erros, ≥ 30 URLs indexadas",
        "→ PageSpeed Insights Mobile: LCP < 2.5s, CLS < 0.1, INP < 200ms",
        "→ Nenhum link href='#' ou 404 no site inteiro",
        "→ Nenhuma foto do Unsplash — todas as imagens são da Virtual Games",
        "→ FAQPage schema em: Home, todas as 9 páginas de serviço, todos os 15 artigos, /faq",
        "→ Sitemap.xml com ≥ 30 URLs incluindo artigos do blog",
        "→ 15 artigos publicados no blog com conteúdo original ≥ 1.500 palavras cada",
      ], "ECFDF5", GREEN),
      spacer(80),
      pb(),

      // ══════════════════════════════════════════════════════════
      // INSTRUÇÕES PARA A IA
      // ══════════════════════════════════════════════════════════
      h1("Instruções de Execução para a IA MiniMax 2.7"),
      box("⚠️ REGRAS CRÍTICAS DE EXECUÇÃO", [
        "1. Execute UMA FASE POR VEZ. Não avance para a próxima fase sem confirmar o critério de conclusão.",
        "2. Ao iniciar cada fase, leia os critérios de conclusão ANTES de escrever código.",
        "3. Para cada arquivo criado, confirme que ele está completo e sem TODOs, placeholders ou 'Em breve'.",
        "4. Após cada fase, execute: npm run build. Nenhum erro de TypeScript é tolerado.",
        "5. Para textos de artigos: escreva conteúdo ORIGINAL, técnico e útil. Mínimo 1.500 palavras por artigo.",
        "6. NUNCA use imagens do Unsplash. Para imagens da loja: use placeholders SVG até o cliente fornecer fotos reais.",
        "7. NUNCA use href='#' em nenhum link do site.",
        "8. Todo texto placeholder deve ser substituído por conteúdo real relevante para a Virtual Games.",
        "9. Schemas JSON-LD devem ser validados em validator.schema.org antes de marcar a fase como concluída.",
        "10. Reporte ao usuário: lista de arquivos criados, métricas de performance e links das ferramentas de validação.",
      ], "FFF7ED", GOLD),
      spacer(),

      box("📋 ORDEM DE EXECUÇÃO", [
        "FASE 0 → Setup e configuração base → Deploy na Vercel → GSC verificado",
        "FASE 1 → Home completa com 9 seções → Schemas validados → Zero links '#'",
        "FASE 2 → 9 páginas de serviço → FAQPage em cada uma → Interlinking hub",
        "FASE 3 → Páginas institucionais → E-E-A-T completo → Conteúdo real",
        "FASE 4 → Blog + Sanity CMS → 15 artigos publicados → Schema Article",
        "FASE 5 → SEO técnico → Core Web Vitals → Lighthouse 100 SEO",
        "FASE 6 → Header/Footer finais → Zero links quebrados → Acessibilidade",
        "FASE 7 → Auditoria completa → Todos os checklists → Site aprovado",
      ], "F0F9FF", BLUE),
      spacer(),

      new Paragraph({ spacing: { before: 300, after: 100 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "— FIM DO PROMPT MESTRE —", size: 24, color: "94A3B8", font: "Arial", italics: true })] }),
      new Paragraph({ spacing: { before: 60, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Baseado na Análise Estratégica Completa de SEO — virtualgames.com.br — Maio 2026", size: 18, color: "CBD5E1", font: "Arial", italics: true })] }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/mnt/user-data/outputs/prompt-mestre-implementacao-virtualgames.docx', buf);
  console.log('Done');
});