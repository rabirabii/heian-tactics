import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma_v2: PrismaClient | undefined;
  pool: Pool | undefined;
};

// We need to use PrismaPg adapter since we are using Supabase connection string.
const connectionString = `${process.env.DATABASE_URL}`;

const pool = globalForPrisma.pool ?? new Pool({ connectionString });
if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool;

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma_v2 ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v2 = prisma;
