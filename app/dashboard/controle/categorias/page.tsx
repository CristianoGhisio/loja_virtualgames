import { CategoriesManager } from '@/components/dashboard/controle/categories-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CategoriasPage() {
  const categories = await prisma.category.findMany({ 
    orderBy: { name: 'asc' } 
  });
  return <CategoriesManager initialCategories={categories} />;
}
