# Guia de Deploy VPS — Hostinger (Docker)
## Virtual Games — virtualgames.com.br

**Data:** 17/05/2026
**Origem:** Implementações realizadas localmente com base no plano SEO multi-página
**Destino:** VPS Hostinger rodando Docker (PostgreSQL + Next.js)

---

## ⚠️ REGRA ZERO — BACKUP DO BANCO ANTES DE QUALQUER COISA

Antes de executar QUALQUER comando abaixo, faça backup do banco de dados que está rodando no Docker da VPS:

```bash
# 1. Acesse a VPS via SSH
ssh usuario@ip-da-vps

# 2. Vá até o diretório do projeto
cd /caminho/do/projeto/loja_virtualgames

# 3. Backup do banco PostgreSQL
docker compose exec db pg_dump -U postgres -d postgres > /backup/backup_$(date +%Y%m%d_%H%M%S).sql

# 4. Confirme que o backup foi criado com sucesso
ls -la /backup/
```

**SÓ PROSSIGA DEPOIS DE CONFIRMAR QUE O BACKUP EXISTE.**

---

## 1. Resumo do que foi implementado localmente

### 1.1 Arquivos criados

| Arquivo | Tipo | Finalidade |
|---------|------|------------|
| `components/seo/SchemaOrg.tsx` | Novo | Componente reutilizável para injetar JSON-LD |
| `components/seo/Breadcrumbs.tsx` | Novo | Componente de breadcrumb com schema nativo |
| `components/servico/service-page.tsx` | Novo | Template reutilizável para páginas de serviço |
| `lib/schemas.ts` | Novo | Funções de criação de schemas (LocalBusiness, FAQPage, Service, Breadcrumb, AggregateRating) |
| `app/servicos/page.tsx` | Novo | Hub de serviços |
| `app/servicos/manutencao-ps5/page.tsx` | Novo | Página: Manutenção PS5 |
| `app/servicos/manutencao-xbox/page.tsx` | Novo | Página: Reparo Xbox |
| `app/servicos/manutencao-nintendo-switch/page.tsx` | Novo | Página: Reparo Switch |
| `app/servicos/montagem-pc-gamer/page.tsx` | Novo | Página: Montagem PC Gamer |
| `app/servicos/reparo-controle-drift/page.tsx` | Novo | Página: Reparo de Controle |
| `app/servicos/reparo-celular/page.tsx` | Novo | Página: Reparo Celular |
| `app/servicos/limpeza-preventiva/page.tsx` | Novo | Página: Limpeza Preventiva |
| `app/servicos/reparo-hdmi-ps5/page.tsx` | Novo | Página: Reparo HDMI PS5 |
| `app/servicos/upgrade-ssd-ps5/page.tsx` | Novo | Página: Upgrade SSD PS5 |
| `app/sobre/page.tsx` | Novo | Página institucional Sobre |
| `app/faq/page.tsx` | Novo | Página FAQ (20+ perguntas) |
| `app/garantia/page.tsx` | Novo | Página Garantia 90 dias |
| `app/contato/page.tsx` | Novo | Página Contato com mapa |
| `app/privacidade/page.tsx` | Novo | Política de Privacidade (LGPD) |
| `app/termos/page.tsx` | Novo | Termos de Serviço |
| `app/acompanhar-reparo/page.tsx` | Novo | Página de consulta de OS |
| `app/campeonatos/page.tsx` | Novo | Página de campeonatos |
| `app/assistencia-tecnica-santa-maria/page.tsx` | Novo | Página SEO local |
| `app/blog/page.tsx` | Novo | Hub do blog |
| `app/blog/[slug]/page.tsx` | Novo | Artigo individual do blog |
| `app/blog/categoria/[categoria]/page.tsx` | Novo | Artigos por categoria |
| `types/html2canvas.d.ts` | Novo | Declaração de tipos para html2canvas |

### 1.2 Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `next.config.ts` | Adicionados redirects 301 (`/login`→`/acompanhar-reparo`, `/garantias`→`/garantia`) |
| `app/layout.tsx` | Adicionado `metadata` global completo (title template, OG, Twitter), SchemaOrg com LocalBusiness, botão WhatsApp flutuante, GA4 condicional, skip-to-content |
| `app/page.tsx` | Home reconstruída: TrustBar, Processo (ol), FAQ accordion, Blog preview. Schemas: LocalBusiness + FAQPage + Organization + WebSite + AggregateRating + BreadcrumbList |
| `app/sitemap.ts` | Expandido para ~30 URLs (serviços, institucionais, blog dinâmico via Prisma) |
| `app/globals.css` | Adicionado estilo `.skip-to-content` |
| `prisma/schema.prisma` | Adicionados models `BlogAuthor` e `BlogPost` (TABELAS NOVAS — não altera nenhuma tabela existente) |
| `components/sections/testimonials.tsx` | Substituídas fotos do Unsplash por avatares CSS com inicial |
| `components/sections/team.tsx` | Substituído ui-avatars.com por placeholder SVG quando sem foto |
| `components/layout/footer.tsx` | Todos os links de `#` substituídos por URLs reais. Redes sociais com links verdadeiros. Coluna Legal com Termos/Privacidade/Acompanhar |
| `components/layout/navbar.tsx` | Links de âncora substituídos por links de página (`/sobre`, `/servicos`, `/campeonatos`, `/contato`) |
| `lib/api-auth.ts` | Corrigido warning de lint (`eslint-disable` para `detect-object-injection`) |
| `lib/env.ts` | Corrigido warning de lint |
| `lib/error-codes.ts` | Corrigido warning de lint |
| `lib/prisma.ts` | Corrigido warning de lint |
| `components/ui/button.tsx` | Corrigido warning de lint |
| `components/sections/hero.tsx` | Corrigido warning de lint |
| `components/dashboard/os/os-list.tsx` | Corrigido warning de lint |
| `app/dashboard/clientes/[id]/visao-geral/page.tsx` | Corrigido warning de lint |
| `app/dashboard/vendas/garantias/page.tsx` | Corrigidos warnings de lint (imports e variáveis não usadas) |
| `app/api/admin/users/[id]/route.ts` | Corrigido warning de lint (variável não usada) |
| `app/api/atendimento/[id]/feedback-preview/route.ts` | Removida função `summarizeNames` não usada |
| `app/api/integrations/whatsapp/lead/route.ts` | Corrigido warning de lint |

### 1.3 Estado das validações

- ✅ `npm run lint` — 0 erros, 0 warnings
- ✅ `npx tsc --noEmit` — 0 erros

---

## 2. Passo a passo para deploy na VPS

### 2.1 Pull do GitHub

```bash
# Na VPS, vá até o diretório do projeto
cd /caminho/do/projeto/loja_virtualgames

# Puxe as mudanças
git pull origin main
```

### 2.2 Migração do banco de dados

**IMPORTANTE:** O Prisma precisa do `DATABASE_URL` configurado. Verifique se o arquivo `.env` existe no diretório do projeto na VPS com a string de conexão correta.

```bash
# Gere o cliente Prisma atualizado
npx prisma generate

# Crie a migração para as novas tabelas (BlogAuthor, BlogPost)
# Isso NÃO apaga dados existentes — apenas cria 2 tabelas novas
npx prisma migrate dev --name add_blog_models
```

**O que esta migração faz:**
- `CREATE TABLE "BlogAuthor"` — tabela para autores do blog
- `CREATE TABLE "BlogPost"` — tabela para artigos do blog, com relação `authorId` → `BlogAuthor`
- **Nenhuma** tabela existente é alterada, renomeada ou removida

### 2.3 Rebuild dos containers Docker

```bash
# Pare os containers
docker compose down

# Reconstrua e inicie
docker compose up -d --build

# Verifique se ambos os containers subiram saudáveis
docker compose ps

# Verifique os logs
docker compose logs -f app
```

### 2.4 Seed do blog (popular dados iniciais)

A tabela `BlogPost` estará vazia após a migração. Para popular com conteúdo, você precisa de um script de seed.

**Opção A — Criar via Prisma Studio (recomendado para começar):**
```bash
# Na VPS (ou no diretório do projeto), execute:
npx prisma studio
```
Isso abrirá uma interface web onde você pode adicionar registros manualmente.

**Opção B — Seed automatizado (recomendado para produção):**

Os artigos precisam ser inseridos. Você pode criar um script no arquivo `prisma/seed-blog.ts` com 15 artigos (os títulos estão listados no `documentation/todo.md` na FASE 4).

### 2.5 Verificações pós-deploy

```bash
# 1. Home com SEO
curl -I https://virtualgames.com.br

# 2. Sitemap
curl https://virtualgames.com.br/sitemap.xml

# 3. Páginas de serviço
curl -I https://virtualgames.com.br/servicos/manutencao-ps5
curl -I https://virtualgames.com.br/servicos/manutencao-xbox
curl -I https://virtualgames.com.br/servicos/montagem-pc-gamer

# 4. Páginas institucionais
curl -I https://virtualgames.com.br/sobre
curl -I https://virtualgames.com.br/faq
curl -I https://virtualgames.com.br/garantia
curl -I https://virtualgames.com.br/contato
curl -I https://virtualgames.com.br/privacidade
curl -I https://virtualgames.com.br/termos

# 5. Blog (deve retornar 200, mesmo sem artigos)
curl -I https://virtualgames.com.br/blog

# 6. Redirects
curl -I https://virtualgames.com.br/login
# Deve retornar 301 → /acompanhar-reparo

# 7. Schema validation (externo)
# Acesse: https://validator.schema.org/
# Insira a URL: https://virtualgames.com.br
```

---

## 3. Pendências a serem executadas

### 3.1 CRÍTICAS — Precisam ser feitas para o blog funcionar

1. **Seed de autores do blog:** Inserir 4 autores na tabela `BlogAuthor`:
   - Emerson Gabriel de Mello Graeff (CEO e Fundador)
   - Kevin de Mello Graeff (Técnico em Consoles)
   - Elias Rodrigues Fagundes (Técnico em Consoles)
   - Gabriel Rae da Silva Castro (Atendimento e Vendas)

2. **Seed de artigos do blog:** Inserir 15 artigos na tabela `BlogPost` (mínimo 1.500 palavras cada). Títulos dos artigos conforme o plano:
   - "PS5 Superaquecendo: Causas, Sintomas e Soluções Definitivas"
   - "Drift no Controle PS5: Tem Conserto? Quanto Custa?"
   - "Quanto Custa Consertar um PS5? Guia de Preços 2026"
   - "PS5 Não Liga: O Que Pode Ser e Como Resolver"
   - "Porta HDMI do PS5 Sem Sinal: Causas e Solução"
   - "Upgrade de SSD no PS5: Vale a Pena? Guia Completo"
   - "Como Montar um PC Gamer do Zero — Guia para Iniciantes"
   - "Quanto Custa Montar um PC Gamer em 2026?"
   - "PS5 vs Xbox Series X: Qual Comprar em 2026?"
   - "Nintendo Switch OLED vs Lite vs Original: Qual é o Melhor?"
   - "Xbox Series X Não Lê Disco: Causas e Solução"
   - "Limpeza Preventiva de Console: Por Que É Essencial?"
   - "Controle Xbox com Drift: Como Resolver?"
   - "Melhores Jogos de PS5 em 2026 para Começar"
   - "Assistência Técnica de Games em Santa Maria: Guia Completo"

### 3.2 IMPORTANTES — Configurações externas (ações manuais)

1. **Google Search Console:** Submeter o novo sitemap em `https://search.google.com/search-console` → Sitemaps → `https://virtualgames.com.br/sitemap.xml`

2. **Google Analytics 4:** Configurar a variável de ambiente `NEXT_PUBLIC_GA_ID` com o ID de medição do GA4

3. **Google Meu Negócio:** Perfil 100% completo com fotos, horários, categoria correta

4. **Teste de Rich Results:** Validar schemas em `https://search.google.com/test/rich-results` com a URL `https://virtualgames.com.br`

5. **PageSpeed Insights:** Rodar `https://pagespeed.web.dev/` para a home e páginas principais

6. **Robots.txt:** Confirmar que `https://virtualgames.com.br/robots.txt` está acessível e correto

---

## 4. Variáveis de ambiente necessárias

Certifique-se de que o arquivo `.env` na VPS contenha:

```bash
DATABASE_URL=postgresql://postgres:senha@db:5432/postgres
NEXT_PUBLIC_SITE_URL=https://virtualgames.com.br
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # opcional — só se tiver GA4 configurado
```

---

## 5. Resumo do comando de rebuild completo (executar em ordem)

```bash
# 1. BACKUP DO BANCO (OBRIGATÓRIO)
docker compose exec db pg_dump -U postgres -d postgres > /backup/backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Pull das mudanças
git pull origin main

# 3. Gerar Prisma Client
npx prisma generate

# 4. Aplicar migração (cria as 2 tabelas novas do blog)
npx prisma migrate dev --name add_blog_models

# 5. Rebuild dos containers
docker compose down
docker compose up -d --build

# 6. Verificar saúde
docker compose ps
docker compose logs -f app

# 7. (Opcional) Popular o blog depois que o app estiver rodando
# Criar script de seed e executar:
# npx prisma db seed
```

---

**Fim do documento.** Qualquer dúvida, consultar os arquivos de referência em `documentation/`:
- `analise.md` — Análise estratégica de SEO
- `implementation.md` — Prompt mestre de implementação
- `todo.md` — Plano de tarefas completo
