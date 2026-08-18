'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function toggleShikigamiOwnership(
  shikigamiId: string, 
  isOwned: boolean,
  preset?: { grade: number; level: number; skills: { skillId: string; level: number }[]; projectId?: string }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (isOwned) {
    // Add to roster
    const rosterEntry = await prisma.userRoster.upsert({
      where: {
        userId_shikigamiId: {
          userId: user.id,
          shikigamiId: shikigamiId
        }
      },
      update: { 
        isOwned: true,
        grade: preset?.grade ?? 6,
        level: preset?.level ?? 40,
        projectId: preset?.projectId || null
      },
      create: {
        userId: user.id,
        shikigamiId: shikigamiId,
        isOwned: true,
        grade: preset?.grade ?? 6,
        level: preset?.level ?? 40,
        projectId: preset?.projectId || null
      }
    });

    if (preset?.skills) {
      // Upsert skills
      for (const skill of preset.skills) {
        await prisma.userRosterSkill.upsert({
          where: {
            userRosterId_skillId: {
              userRosterId: rosterEntry.id,
              skillId: skill.skillId
            }
          },
          update: { level: skill.level },
          create: {
            userRosterId: rosterEntry.id,
            skillId: skill.skillId,
            level: skill.level
          }
        });
      }
    }
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

export async function ownAllShikigami(allShikigamiIds: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Get current owned
  const currentOwned = await prisma.userRoster.findMany({
    where: { userId: user.id, shikigamiId: { in: allShikigamiIds } },
    select: { shikigamiId: true }
  });
  
  const ownedSet = new Set(currentOwned.map(o => o.shikigamiId));
  const toAdd = allShikigamiIds.filter(id => !ownedSet.has(id));

  if (toAdd.length > 0) {
    await prisma.userRoster.createMany({
      data: toAdd.map(shikigamiId => ({
        userId: user.id,
        shikigamiId,
        isOwned: true,
        grade: 6,
        level: 40,
      }))
    });
  }

  revalidatePath('/shikigami');
  return toAdd.length;
}
