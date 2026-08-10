// @ts-nocheck
import { defineConfig } from '@prisma/config';
import { loadEnvConfig } from '@next/env';

// Load .env.local because Prisma defaults to .env only
const projectDir = process.cwd();
loadEnvConfig(projectDir);

export default defineConfig({
  datasource: {
    // For db push, we MUST use the DIRECT_URL (port 5432) to avoid PgBouncer prepared statement errors
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
  migrate: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
