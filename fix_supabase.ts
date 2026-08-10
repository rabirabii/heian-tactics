import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());
const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const tables = [
    'ShikigamiRole',
    'EvaluationCategory',
    'ShikigamiEvaluation',
    '_ShikigamiToShikigamiRole',
    'ShikigamiBuild'
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`GRANT ALL ON public."${table}" TO anon;`);
      await prisma.$executeRawUnsafe(`GRANT ALL ON public."${table}" TO authenticated;`);
      await prisma.$executeRawUnsafe(`GRANT ALL ON public."${table}" TO service_role;`);
      console.log(`Granted permissions on ${table}`);
    } catch (e) {
      console.error(`Error granting on ${table}:`, e);
    }
  }

  try {
    await prisma.$executeRawUnsafe(`NOTIFY pgrst, 'reload schema';`);
    console.log('Reloaded PostgREST schema cache');
  } catch(e) {
    console.error('Error reloading cache', e);
  }

}

run().finally(() => prisma.$disconnect());
