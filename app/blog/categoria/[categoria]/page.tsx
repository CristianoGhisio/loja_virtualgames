import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import Link from "next/link";
import { notFound } from "next/navigation";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }): Promise<Metadata> {
  const { categoria } = await params;
  const nomeCategoria = decodeURIComponent(categoria).replace(/-/g, " ");
  return {
    title: `${nomeCategoria}`,
    description: `Artigos sobre ${nomeCategoria} no Blog da Virtual Games. Dicas, guias e novidades do universo gamer em Santa Maria, RS.`,
    alternates: { canonical: `${siteUrl}/blog/categoria/${categoria}` },
    openGraph: {
      title: `${nomeCategoria} — Blog Virtual Games`,
      description: `Artigos sobre ${nomeCategoria} no Blog da Virtual Games.`,
      url: `${siteUrl}/blog/categoria/${categoria}`,
      siteName: "Virtual Games",
      locale: "pt_BR",
    },
  };
}

export default async function BlogCategoriaPage({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params;
  const nomeCategoria = decodeURIComponent(categoria).replace(/-/g, " ");

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
      where: { published: true, categoria: { contains: nomeCategoria, mode: "insensitive" } },
      select: { title: true, slug: true, excerpt: true, categoria: true, publishedAt: true, author: { select: { name: true } } },
      orderBy: { publishedAt: "desc" },
    });
  } catch { /* ignore */ }

  if (posts.length === 0) notFound();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-12 sm:py-16 lg:py-20">
        <Breadcrumbs items={[{ name: "Início", href: "/" }, { name: "Blog", href: "/blog" }, { name: nomeCategoria }]} />
        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-8">{nomeCategoria}</h1>
        <div className="grid gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-6 hover:border-neon-blue/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-neon-blue text-xs font-medium uppercase tracking-wider">{post.categoria}</span>
                <span className="text-gray-600 text-xs">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("pt-BR") : ""}</span>
              </div>
              <h2 className="text-white font-bold text-xl mb-2 group-hover:text-neon-blue transition-colors">{post.title}</h2>
              <p className="text-gray-400 text-sm line-clamp-2">{post.excerpt}</p>
              <p className="text-gray-400 text-xs mt-3">Por {post.author.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
