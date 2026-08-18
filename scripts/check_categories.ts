import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.lineupCategory.findMany({ include: { subcategories: true } });
  console.dir(categories, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
