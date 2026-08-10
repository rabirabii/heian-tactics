'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function toggleShikigamiOwnership(shikigamiId: string, isOwned: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (isOwned) {
    // Add to roster
    await prisma.userRoster.upsert({
      where: {
        userId_shikigamiId: {
          userId: user.id,
          shikigamiId: shikigamiId
        }
      },
      update: { isOwned: true },
      create: {
        userId: user.id,
        shikigamiId: shikigamiId,
        isOwned: true
      }
    });
  } else {
    // Remove from roster
    await prisma.userRoster.deleteMany({
      where: {
        userId: user.id,
        shikigamiId: shikigamiId
      }
    });
  }

  revalidatePath('/shikigami');
  return true;
}
