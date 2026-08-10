import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function test() {
  const { data, error } = await supabase
    .from('Shikigami')
    .select(`
      id,
      name,
      builds:ShikigamiBuild(*)
    `).limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success, found records:', data?.length);
  }
}

test();
