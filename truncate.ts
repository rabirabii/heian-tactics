import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());
const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  await prisma.$executeRawUnsafe('DELETE FROM "ShikigamiBuild";');
  console.log('Deleted ShikigamiBuild rows');
}

run().finally(() => prisma.$disconnect());
