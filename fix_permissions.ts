import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixPermissions() {
  console.log('Fixing Supabase RLS and Grants...');
  try {
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;`);
    await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;`);
    await prisma.$executeRawUnsafe(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;`);
    
    // Specifically enable RLS on UserRoster to keep it secure
    await prisma.$executeRawUnsafe(`ALTER TABLE "UserRoster" ENABLE ROW LEVEL SECURITY;`);
    
    // Create policies for UserRoster if they don't exist
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own roster' AND tablename = 'UserRoster'
        ) THEN
            CREATE POLICY "Users can view their own roster" ON "UserRoster" FOR SELECT USING (auth.uid() = "userId"::uuid);
            CREATE POLICY "Users can insert their own roster" ON "UserRoster" FOR INSERT WITH CHECK (auth.uid() = "userId"::uuid);
            CREATE POLICY "Users can update their own roster" ON "UserRoster" FOR UPDATE USING (auth.uid() = "userId"::uuid);
            CREATE POLICY "Users can delete their own roster" ON "UserRoster" FOR DELETE USING (auth.uid() = "userId"::uuid);
        END IF;
      END
      $$;
    `);

    console.log('Permissions fixed successfully!');
  } catch (error) {
    console.error('Error fixing permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPermissions();
