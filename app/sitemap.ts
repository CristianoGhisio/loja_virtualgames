import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://virtualgames.com.br";

const staticRoutes: { url: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { url: siteUrl, changeFrequency: "weekly", priority: 1.0 },
  { url: `${siteUrl}/servicos`, changeFrequency: "weekly", priority: 0.9 },
  { url: `${siteUrl}/servicos/manutencao-ps5`, changeFrequency: "monthly", priority: 0.9 },
  { url: `${siteUrl}/servicos/manutencao-xbox`, changeFrequency: "monthly", priority: 0.9 },
  { url: `${siteUrl}/servicos/manutencao-nintendo-switch`, changeFrequency: "monthly", priority: 0.9 },
  { url: `${siteUrl}/servicos/montagem-pc-gamer`, changeFrequency: "monthly", priority: 0.9 },
  { url: `${siteUrl}/servicos/reparo-controle-drift`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/servicos/reparo-celular`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/servicos/limpeza-preventiva`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/servicos/reparo-hdmi-ps5`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/servicos/upgrade-ssd-ps5`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/sobre`, changeFrequency: "monthly", priority: 0.7 },
  { url: `${siteUrl}/faq`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${siteUrl}/garantia`, changeFrequency: "monthly", priority: 0.7 },
  { url: `${siteUrl}/contato`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/privacidade`, changeFrequency: "yearly", priority: 0.4 },
  { url: `${siteUrl}/termos`, changeFrequency: "yearly", priority: 0.4 },
  { url: `${siteUrl}/acompanhar-reparo`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${siteUrl}/campeonatos`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${siteUrl}/assistencia-tecnica-santa-maria`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${siteUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: route.url,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let blogUrls: MetadataRoute.Sitemap = [];
  let categoryUrls: MetadataRoute.Sitemap = [];

  try {
    const [posts, categorias] = await Promise.all([
      prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.blogPost.findMany({
        where: { published: true },
        select: { categoria: true },
        distinct: ['categoria'],
      }),
    ]);

    blogUrls = posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    categoryUrls = categorias.map((cat) => ({
      url: `${siteUrl}/blog/categoria/${cat.categoria.toLowerCase().replace(/\s+/g, '-')}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // BlogPost table may not exist yet — ignore gracefully
  }

  return [...staticUrls, ...blogUrls, ...categoryUrls];
}
