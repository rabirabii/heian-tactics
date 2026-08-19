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
    where: { status: 'PUBLISHED' },
    include: { author: { select: { username: true } } },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function upsertTierList(data: { id?: string; title: string; description?: string; status?: 'PRIVATE' | 'PENDING_REVIEW' }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const payload: any = {
    title: data.title,
    description: data.description || null,
    authorId: user.id
  };
  
  if (data.status) {
    payload.status = data.status;
  }

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

  if (!score) {
    if (tierListId && tierListId !== 'system') {
      await prisma.shikigamiEvaluation.deleteMany({
        where: { shikigamiId, categoryId, tierListId }
      });
    } else {
      await prisma.shikigamiEvaluation.deleteMany({
        where: { shikigamiId, categoryId, tierListId: null }
      });
    }
    return;
  }

  // If modifying a global evaluation (tierListId is null or "system"), must be ADMIN
  if (!tierListId || tierListId === 'system') {
    if (dbUser?.role !== 'ADMIN') throw new Error('Only admins can modify the global tier list');
    
    await prisma.shikigamiEvaluation.upsert({
      where: {
        shikigamiId_categoryId_tierListId: {
          shikigamiId,
          categoryId,
          tierListId: null
        }
      } as any,
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

export async function adminUpdateTierListStatus(tierListId: string, status: 'PUBLISHED' | 'REJECTED') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== 'ADMIN') throw new Error('Unauthorized');

  await prisma.tierList.update({
    where: { id: tierListId },
    data: { status }
  });
  
  revalidatePath('/meta/tier-list');
}

export async function upsertShikigamiRoles(
  shikigamiId: string,
  pveRoleIds: string[],
  pvpRoleIds: string[],
  tierListId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const tierList = await prisma.tierList.findUnique({ where: { id: tierListId } });
  if (!tierList || tierList.authorId !== user.id) {
    throw new Error('Unauthorized to modify this tier list roles');
  }

  await prisma.$transaction(async (tx) => {
    // Delete existing roles for this tier list
    await tx.shikigamiRoleAssignment.deleteMany({
      where: { shikigamiId, tierListId }
    });

    const newAssignments = [
      ...pveRoleIds.map(rid => ({ shikigamiId, roleId: rid, mode: 'PvE', tierListId })),
      ...pvpRoleIds.map(rid => ({ shikigamiId, roleId: rid, mode: 'PvP', tierListId }))
    ];

    if (newAssignments.length > 0) {
      await tx.shikigamiRoleAssignment.createMany({
        data: newAssignments
      });
    }
  });

  revalidatePath('/meta/tier-list');
}
