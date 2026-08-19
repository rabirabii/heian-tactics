'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getMyTierLists() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  return await prisma.tierList.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function getPublicTierLists() {
  return await prisma.tierList.findMany({
    where: { isPublic: true },
    include: { author: { select: { username: true } } },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function upsertTierList(data: { id?: string; title: string; description?: string; isPublic: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const payload = {
    title: data.title,
    description: data.description || null,
    isPublic: data.isPublic,
    authorId: user.id
  };

  let result;
  if (data.id) {
    // Check ownership
    const existing = await prisma.tierList.findUnique({ where: { id: data.id } });
    if (!existing || existing.authorId !== user.id) {
      throw new Error('Unauthorized or not found');
    }
    result = await prisma.tierList.update({
      where: { id: data.id },
      data: payload
    });
  } else {
    result = await prisma.tierList.create({
      data: payload
    });
  }

  revalidatePath('/meta/tier-list');
  return result;
}

export async function upsertShikigamiEvaluation(
  shikigamiId: string,
  categoryId: string,
  score: string,
  notes?: string,
  tierListId?: string | null,
  metrics?: any
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  // If modifying a global evaluation (tierListId is null or "system"), must be ADMIN
  if (!tierListId || tierListId === 'system') {
    if (dbUser?.role !== 'ADMIN') throw new Error('Only admins can modify the global tier list');
    
    await prisma.shikigamiEvaluation.upsert({
      where: {
        shikigamiId_categoryId_tierListId: {
          shikigamiId,
          categoryId,
          tierListId: null // use Prisma's logic or we have to use raw query?
        }
      } as any, // fallback needed because prisma schema might not fully map nulls correctly in unique constraints
      update: { score, notes: notes || null, metrics: metrics || null },
      create: { shikigamiId, categoryId, score, notes: notes || null, metrics: metrics || null }
    });
  } else {
    // Modify user tier list
    const tierList = await prisma.tierList.findUnique({ where: { id: tierListId } });
    if (!tierList || (tierList.authorId !== user.id && dbUser?.role !== 'ADMIN')) {
      throw new Error('Unauthorized to modify this tier list');
    }

    await prisma.shikigamiEvaluation.upsert({
      where: {
        shikigamiId_categoryId_tierListId: {
          shikigamiId,
          categoryId,
          tierListId
        }
      },
      update: { score, notes: notes || null, metrics: metrics || null },
      create: { shikigamiId, categoryId, tierListId, score, notes: notes || null, metrics: metrics || null }
    });
  }

  revalidatePath('/meta/tier-list');
}
