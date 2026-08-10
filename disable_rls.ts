import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function disableRls() {
  const tables = [
    'ShikigamiRole',
    'EvaluationCategory',
    'ShikigamiEvaluation',
    '_ShikigamiToShikigamiRole'
  ];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`);
      console.log(`Disabled RLS on ${table}`);
    } catch (e) {
      console.error(`Error on ${table}:`, e);
    }
  }
  process.exit(0);
}

disableRls();
