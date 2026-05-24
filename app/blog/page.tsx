import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

export const metadata: Metadata = {
  title: "Blog Gamer — Dicas, Guias e Novidades",
  description: "Dicas, guias e novidades do universo gamer. Manutenção de consoles, PC Gamer, comparativos e mais. Blog da Virtual Games em Santa Maria.",
  alternates: { canonical: `${siteUrl}/blog` },
  openGraph: {
    title: "Blog Gamer — Dicas, Guias e Novidades",
    description: "Dicas, guias e novidades do universo gamer. Manutenção de consoles, PC Gamer, comparativos e mais.",
    url: `${siteUrl}/blog`,
    siteName: "Virtual Games",
    locale: "pt_BR",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Blog Virtual Games" }],
  },
};

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  let posts: Array<{
    title: string;
    slug: string;
    excerpt: string | null;
    categoria: string;
    publishedAt: Date | null;
    author: { name: string };
  }> = [];

  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        categoria: true,
        publishedAt: true,
        author: { select: { name: true } },
      },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    // Blog not seeded yet
  }

  const categorias = [...new Set(posts.map((p) => p.categoria))].sort();

  return (
    <main id="main-content" className="min-h-screen text-foreground">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-12 sm:py-16 lg:py-20">
        <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Blog" }]} />
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-4">
          Blog <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Gamer</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Dicas, guias e novidades do universo gamer. Artigos escritos pela equipe Virtual Games.
        </p>

        {categorias.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <Link href="/blog" className="bg-neon-blue/10 text-neon-blue text-sm px-4 py-2 rounded-lg hover:bg-neon-blue/20 transition-colors font-medium">Todos</Link>
            {categorias.map((cat) => (
              <Link key={cat} href={`/blog/categoria/${cat.toLowerCase()}`} className="bg-white/5 text-gray-400 text-sm px-4 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
                {cat}
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">Nenhum artigo publicado ainda.</p>
            <p className="text-gray-400 text-sm">Em breve, conteúdo exclusivo sobre games, consoles e manutenção.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-6 hover:border-neon-blue/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-neon-blue text-xs font-medium uppercase tracking-wider">{post.categoria}</span>
                  <span className="text-gray-600 text-xs">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("pt-BR") : ""}
                  </span>
                </div>
                <h2 className="text-white font-bold text-xl mb-2 group-hover:text-neon-blue transition-colors">{post.title}</h2>
                <p className="text-gray-400 text-sm line-clamp-2">{post.excerpt}</p>
                <p className="text-gray-400 text-xs mt-3">Por {post.author.name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
