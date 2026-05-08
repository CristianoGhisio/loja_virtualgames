import { AttributesManager } from '@/components/dashboard/controle/attributes-manager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AtributosPage() {
  const attributes = await prisma.attribute.findMany({ 
    orderBy: [
      { order: 'asc' },
      { name: 'asc' }
    ],
    include: { options: { orderBy: { order: 'asc' } } }
  });
  const normalized = attributes.map(attribute => ({
    ...attribute,
    options: attribute.options?.map(option => ({
      ...option,
      label: option.label ?? option.value
    }))
  }));
  return <AttributesManager initialAttributes={normalized} />;
}
