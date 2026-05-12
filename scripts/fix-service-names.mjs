import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function fixEncoding(text) {
  const bytes = Buffer.from(text, 'latin1');
  return bytes.toString('utf-8');
}

async function main() {
  const services = await prisma.service.findMany({ orderBy: { internalCode: 'asc' } });
  
  console.log(`\nTotal de serviços: ${services.length}\n`);
  
  for (const svc of services) {
    const fixed = fixEncoding(svc.name);
    if (fixed !== svc.name) {
      console.log(`[UPDATE] ${svc.internalCode}`);
      console.log(`  ANTES : ${svc.name}`);
      console.log(`  DEPOIS: ${fixed}`);
      await prisma.service.update({
        where: { id: svc.id },
        data: { name: fixed },
      });
    } else {
      console.log(`[OK]    ${svc.internalCode}: "${svc.name}" - sem alteração`);
    }
  }
  
  console.log('\nCorreção concluída.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
