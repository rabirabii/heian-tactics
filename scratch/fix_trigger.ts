import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const directUrl = process.env.DIRECT_URL;

const sql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public."User" (id, email, "updatedAt")
  VALUES (new.id::text, new.email, NOW());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
`;

async function main() {
  if (!directUrl) {
    console.error("No DIRECT_URL found in .env.local");
    return;
  }

  const client = new Client({
    connectionString: directUrl
  });

  try {
    await client.connect();
    console.log("Connected to Supabase DB via DIRECT_URL.");
    
    await client.query(sql);
    console.log("Trigger created successfully.");
    
  } catch (err) {
    console.error("Failed to execute SQL:", err);
  } finally {
    await client.end();
  }
}

main();
