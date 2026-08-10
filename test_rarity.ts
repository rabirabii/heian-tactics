import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function test() {
  const { data, error } = await supabase
    .from('Rarity')
    .select('*');

  if (error) {
    console.error('Error fetching Rarity:', error);
  } else {
    console.log('Success, found rarities:', data?.length);
  }

  const { data: sData, error: sError } = await supabase
    .from('Shikigami')
    .select('id, rarityRef:Rarity(*)')
    .limit(1);

  if (sError) {
    console.error('Error fetching Shikigami:', sError);
  } else {
    console.log('Success, found Shikigami with rarityRef:', sData);
  }
}

test();
