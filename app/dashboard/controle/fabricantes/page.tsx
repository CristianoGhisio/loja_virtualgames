import { ManufacturersManager } from '@/components/dashboard/controle/manufacturers-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function FabricantesPage() {
  const manufacturers = await prisma.manufacturer.findMany({ 
    include: {
      products: {
        select: {
          id: true,
        },
      },
    },
    orderBy: { name: 'asc' } 
  });
  return <ManufacturersManager initialManufacturers={manufacturers} />;
}
