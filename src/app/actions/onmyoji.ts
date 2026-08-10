'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function upsertOnmyoji(id: string | null, data: { name: string; icon?: string; role?: string }) {
  const onmyojiId = id === 'new' || !id ? data.name.toLowerCase().replace(/[^a-z0-9]/g, '_') : id;
  
  await prisma.onmyoji.upsert({
    where: { id: onmyojiId },
    update: {
      name: data.name,
      icon: data.icon,
      role: data.role || "Onmyoji",
    },
    create: {
      id: onmyojiId,
      name: data.name,
      icon: data.icon,
      role: data.role || "Onmyoji",
    }
  });

  revalidatePath('/shikigami/champions');
  return { success: true, id: onmyojiId };
}

export async function deleteOnmyoji(id: string) {
  await prisma.onmyoji.delete({
    where: { id }
  });
  revalidatePath('/shikigami/champions');
  return { success: true };
}

export async function upsertOnmyojiSkill(id: string | null, onmyojiId: string, data: { name: string; description: string; icon?: string }) {
  if (id === 'new' || !id) {
    await prisma.onmyojiSkill.create({
      data: {
        onmyojiId,
        name: data.name,
        description: data.description,
        icon: data.icon,
      }
    });
  } else {
    await prisma.onmyojiSkill.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
      }
    });
  }

  revalidatePath('/shikigami/champions');
  return { success: true };
}

export async function deleteOnmyojiSkill(id: string) {
  await prisma.onmyojiSkill.delete({
    where: { id }
  });
  revalidatePath('/shikigami/champions');
  return { success: true };
}

export async function upsertOnmyojiSkills(onmyojiId: string, skills: any[]) {
  // Get existing skills
  const existingSkills = await prisma.onmyojiSkill.findMany({
    where: { onmyojiId }
  });
  const existingIds = existingSkills.map(s => s.id);
  const newIds = skills.filter(s => s.id && s.id !== 'new').map(s => s.id);
  await prisma.$transaction(async (tx) => {
    // Delete skills that are no longer in the list
    const toDelete = existingIds.filter(id => !newIds.includes(id));
    if (toDelete.length > 0) {
      await tx.onmyojiSkill.deleteMany({
        where: { id: { in: toDelete } }
      });
    }

    // Upsert the remaining skills
    for (const skill of skills) {
      if (skill.id && skill.id !== 'new') {
        await tx.onmyojiSkill.update({
          where: { id: skill.id },
          data: {
            name: skill.name,
            description: skill.description,
            icon: skill.icon,
            type: skill.type || 'Normal',
            cooldown: parseInt(skill.cooldown) || 0,
            levelUpgrades: skill.levelUpgrades || [],
          }
        });
      } else {
        await tx.onmyojiSkill.create({
          data: {
            onmyojiId,
            name: skill.name,
            description: skill.description,
            icon: skill.icon,
            type: skill.type || 'Normal',
            cooldown: parseInt(skill.cooldown) || 0,
            levelUpgrades: skill.levelUpgrades || [],
          }
        });
      }
    }
  });

  revalidatePath('/shikigami/champions');
  return { success: true };
}
