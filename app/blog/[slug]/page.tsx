import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SchemaOrg } from "@/components/seo/SchemaOrg";
import { createFAQPageSchema, aggregateRatingSchema } from "@/lib/schemas";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

export const revalidate = 60;

type FaqJson = Array<{ question: string; answer: string }>;

function isFaqJson(data: unknown): data is FaqJson {
  return Array.isArray(data) && data.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "question" in item &&
      "answer" in item &&
      typeof (item as Record<string, unknown>).question === "string" &&
      typeof (item as Record<string, unknown>).answer === "string",
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      select: { metaTitle: true, metaDescription: true, title: true, excerpt: true, featuredImage: true },
    });
    if (!post) return { title: "Artigo não encontrado" };
    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt?.slice(0, 160) || "",
      alternates: { canonical: `${siteUrl}/blog/${slug}` },
      openGraph: {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt?.slice(0, 160) || "",
        images: post.featuredImage ? [{ url: post.featuredImage }] : [{ url: "/og-image.png", width: 1200, height: 630 }],
      },
    };
  } catch {
    return { title: "Blog | Virtual Games" };
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let post: {
    id: string;
    title: string;
    slug: string;
    metaTitle: string | null;
    metaDescription: string | null;
    featuredImage: string | null;
    featuredImageAlt: string | null;
    categoria: string;
    publishedAt: Date | null;
    updatedAt: Date;
    excerpt: string | null;
    body: unknown;
    faqs: unknown;
    relatedService: string | null;
    readingTime: number | null;
    author: { name: string; role: string; bio: string | null };
  } | null = null;

  try {
    post = await prisma.blogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        metaTitle: true,
        metaDescription: true,
        featuredImage: true,
        featuredImageAlt: true,
        categoria: true,
        publishedAt: true,
        updatedAt: true,
        excerpt: true,
        body: true,
        faqs: true,
        relatedService: true,
        readingTime: true,
        author: { select: { name: true, role: true, bio: true } },
      },
    });
  } catch {
    post = null;
  }

  if (!post) notFound();

  const faqs = isFaqJson(post.faqs) ? post.faqs : [];
  const faqSchema = faqs.length > 0 ? createFAQPageSchema(faqs) : null;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || "",
    image: post.featuredImage || `${siteUrl}/og-image.png`,
    author: { "@type": "Person", name: post.author.name, jobTitle: post.author.role, worksFor: { "@id": `${siteUrl}/#empresa` } },
    publisher: { "@id": `${siteUrl}/#empresa` },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/blog/${post.slug}` },
    inLanguage: "pt-BR",
    keywords: `${post.categoria}, assistência técnica santa maria`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.categoria, item: `${siteUrl}/blog/categoria/${post.categoria.toLowerCase()}` },
      { "@type": "ListItem", position: 4, name: post.title },
    ],
  };

  let relatedPosts: Array<{ title: string; slug: string; categoria: string }> = [];
  try {
    relatedPosts = await prisma.blogPost.findMany({
      where: { published: true, slug: { not: post.slug }, categoria: post.categoria },
      select: { title: true, slug: true, categoria: true },
      take: 3,
      orderBy: { publishedAt: "desc" },
    });
  } catch { /* ignore */ }

  return (
    <>
      <SchemaOrg schema={articleSchema} />
      {faqSchema && <SchemaOrg schema={faqSchema} />}
      <SchemaOrg schema={breadcrumbSchema} />
      <SchemaOrg schema={aggregateRatingSchema} />
      <main id="main-content" className="min-h-screen text-foreground">
        <article className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12 sm:py-16 lg:py-20">
          <Breadcrumbs items={[
            { name: "Início", href: "/" },
            { name: "Blog", href: "/blog" },
            { name: post.categoria, href: `/blog/categoria/${post.categoria.toLowerCase()}` },
            { name: post.title },
          ]} />

          <div className="mt-6 mb-2">
            <Link href={`/blog/categoria/${post.categoria.toLowerCase()}`} className="text-neon-blue text-xs font-medium uppercase tracking-wider hover:underline">
              {post.categoria}
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
            <span>Por {post.author.name}</span>
            {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString("pt-BR")}</span>}
            {post.readingTime && <span>{post.readingTime} min de leitura</span>}
          </div>

          {post.excerpt && (
            <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-xl p-6 mb-10">
              <p className="text-gray-300 text-sm font-medium uppercase tracking-wider mb-2">TL;DR</p>
              <p className="text-white text-lg leading-relaxed">{post.excerpt}</p>
            </div>
          )}

          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed mb-10">
            {typeof post.body === "object" && post.body !== null && Array.isArray(post.body)
              ? (post.body as Array<{ type: string; children?: Array<{ text: string }> }>).map((block, i) => {
                  if (block.type === "paragraph" && block.children) {
                    return <p key={i} className="mb-4">{block.children.map((c) => c.text).join("")}</p>;
                  }
                  if (block.type === "heading" && block.children) {
                    return <h2 key={i} className="text-2xl font-bold text-white mt-8 mb-4">{block.children.map((c) => c.text).join("")}</h2>;
                  }
                  if (block.type === "list" && block.children) {
                    return (
                      <ul key={i} className="list-disc list-inside space-y-2 mb-4">
                        {block.children.map((c, j) => <li key={j}>{c.text}</li>)}
                      </ul>
                    );
                  }
                  return null;
                })
              : <p className="text-gray-400">Conteúdo completo em breve.</p>}
          </div>

          {post.relatedService && (
            <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-6 mb-10 text-center">
              <p className="text-gray-400 mb-3">Precisa de ajuda com este serviço?</p>
              <Link href={post.relatedService} className="text-neon-blue hover:underline font-medium">
                Veja nossa página de serviço →
              </Link>
            </div>
          )}

          {faqs.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Perguntas Frequentes</h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <details key={i} className="group bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl overflow-hidden">
                    <summary className="px-6 py-4 cursor-pointer text-white font-medium hover:text-neon-blue list-none flex items-center justify-between">
                      <span>{faq.question}</span>
                      <span className="text-neon-blue text-lg group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="px-6 pb-4 text-gray-400 text-sm">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {relatedPosts.length > 0 && (
            <section className="border-t border-white/5 pt-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Leia Também</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedPosts.map((rp) => (
                  <Link key={rp.slug} href={`/blog/${rp.slug}`} className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-5 hover:border-neon-blue/30 transition-all duration-300">
                    <span className="text-neon-blue text-xs uppercase tracking-wider">{rp.categoria}</span>
                    <h3 className="text-white font-bold mt-2">{rp.title}</h3>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
    </>
  );
}
