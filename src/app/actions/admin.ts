'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// UPSERT SHIKIGAMI BASIC
export async function upsertShikigamiBase(
  id: string | null, 
  data: any, 
  pveRoleIds: string[],
  pvpRoleIds: string[]
) {
  const shikiId = id === 'new' || !id ? data.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : id;
  
  await prisma.$transaction(async (tx) => {
    // Upsert Shikigami
    await tx.shikigami.upsert({
      where: { id: shikiId },
      update: {
        name: data.name,
        rarity: data.rarityId,
        rarityId: data.rarityId,
        icon: data.icon,
        beginnerFriendly: data.beginnerFriendly,
        availableGlobal: data.availableGlobal,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
      },
      create: {
        id: shikiId,
        name: data.name,
        rarity: data.rarityId,
        rarityId: data.rarityId,
        icon: data.icon,
        beginnerFriendly: data.beginnerFriendly,
        availableGlobal: data.availableGlobal,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
      } as any
    });

    // Sync Roles
    await tx.shikigamiRoleAssignment.deleteMany({
      where: { shikigamiId: shikiId }
    });

    const newAssignments = [
      ...pveRoleIds.map(rid => ({ shikigamiId: shikiId, roleId: rid, mode: 'PvE' })),
      ...pvpRoleIds.map(rid => ({ shikigamiId: shikiId, roleId: rid, mode: 'PvP' }))
    ];

    if (newAssignments.length > 0) {
      await tx.shikigamiRoleAssignment.createMany({
        data: newAssignments
      });
    }
  });

  revalidatePath('/admin/shikigami');
  revalidatePath('/meta/tier-list');
  revalidatePath('/shikigami');
  return { success: true, id: shikiId };
}

// UPSERT SHIKIGAMI EVALUATIONS
export async function upsertShikigamiEvaluations(shikigamiId: string, evaluations: { categoryId: string, score: string, metrics?: any, notes?: string }[]) {
  await prisma.$transaction(async (tx) => {
    for (const ev of evaluations) {
      if (!ev.score) {
        // If empty score, maybe delete it?
        await tx.shikigamiEvaluation.deleteMany({
          where: { shikigamiId, categoryId: ev.categoryId }
        });
        continue;
      }

      await tx.shikigamiEvaluation.upsert({
        where: {
          shikigamiId_categoryId_tierListId: { 
            shikigamiId, 
            categoryId: ev.categoryId,
            tierListId: null 
          }
        } as any,
        update: { 
          score: ev.score,
          metrics: ev.metrics ?? null,
          notes: ev.notes ?? null
        },
        create: {
          shikigamiId,
          categoryId: ev.categoryId,
          tierListId: null,
          score: ev.score,
          metrics: ev.metrics ?? null,
          notes: ev.notes ?? null
        }
      });
    }
  });

  revalidatePath('/admin/shikigami');
  revalidatePath('/meta/tier-list');
  revalidatePath('/shikigami');
  return { success: true };
}

// DELETE SHIKIGAMI
export async function deleteShikigami(id: string) {
  await prisma.shikigami.delete({
    where: { id }
  });
  
  revalidatePath('/shikigami');
  revalidatePath('/meta/tier-list');
  return { success: true };
}

// UPSERT SHIKIGAMI SKILLS
export async function upsertShikigamiSkills(shikigamiId: string, skills: any[]) {
  await prisma.$transaction(async (tx) => {
    // Easiest is to delete existing and recreate
    await tx.shikigamiSkill.deleteMany({
      where: { shikigamiId }
    });

    for (const s of skills) {
      await tx.shikigamiSkill.create({
        data: {
          shikigamiId,
          name: s.name,
          description: s.description,
          icon: s.icon,
          type: s.type || 'Normal',
          cost: parseInt(s.cost) || 0,
          cooldown: parseInt(s.cooldown) || 0,
          levelUpgrades: s.levelUpgrades || []
        }
      });
    }
  });

  revalidatePath(`/shikigami/${shikigamiId}`);
  return { success: true };
}
