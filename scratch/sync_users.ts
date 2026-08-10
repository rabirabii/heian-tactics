import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const directUrl = process.env.DIRECT_URL;

const sql = `
INSERT INTO public."User" (id, email, "updatedAt")
SELECT id::text, email, NOW()
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public."User" WHERE public."User".id = auth.users.id::text
);
`;

async function main() {
  const client = new Client({ connectionString: directUrl });
  try {
    await client.connect();
    await client.query(sql);
    console.log("Missing users synced successfully.");
  } catch (err) {
    console.error("Failed to sync users:", err);
  } finally {
    await client.end();
  }
}

main();
