'use server';

import { revalidateTag } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export async function revalidateMetaCache(tag: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Only logged-in users can trigger cache revalidation
  if (!user) {
    throw new Error('Unauthorized attempt to revalidate cache');
  }

  // Ensure the tag is one of the allowed global meta tags
  const allowedTags = ['meta-lineups', 'meta-builds', 'meta-tier-list'];
  if (!allowedTags.includes(tag)) {
    throw new Error('Invalid cache tag');
  }

  // @ts-expect-error - Next.js types might be outdated or conflicting
  revalidateTag(tag);
  console.log(`[Cache Revalidated] tag: ${tag} by user: ${user.id}`);
  
  return { success: true, tag };
}
