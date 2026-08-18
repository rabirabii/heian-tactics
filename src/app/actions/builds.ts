'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function upsertShikigamiBuild(buildId: string | 'new', data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  const payload: any = {
    shikigamiId: data.shikigamiId,
    roleId: data.roleId,
    typeId: data.typeId || 'PvE',
    categoryId: data.categoryId || null,
    beginnerFriendly: data.beginnerFriendly || false,
    soulChoices: data.soulChoices || [],
    slot2: data.slot2 || null,
    slot4: data.slot4 || null,
    slot6: data.slot6 || null,
    substats: data.substats || '',
    breakpoint: data.breakpoint || '',
    notes: data.notes || null,
    tags: data.tags || [],
    status: data.status || 'CURRENT',
    referenceUrl: data.referenceUrl || null,
  };

  if (buildId === 'new') {
    // For new builds, the creator is the author, and it's private by default.
    payload.authorId = user.id;
    payload.isPublic = false; 
    payload.author = dbUser?.username || 'Anonymous_Player'; // Keep legacy field populated
    return prisma.shikigamiBuild.create({ data: payload });
  } else {
    // Check ownership or admin rights for editing
    const existingBuild = await prisma.shikigamiBuild.findUnique({ where: { id: buildId } });
    if (!existingBuild) throw new Error('Build not found');

    if (existingBuild.authorId !== user.id && dbUser?.role !== 'ADMIN') {
      throw new Error('You do not have permission to edit this build');
    }

    // Only set updatedBy if an Admin edits someone else's build (or a System build)
    if (existingBuild.authorId !== user.id) {
      payload.updatedBy = dbUser?.username || 'Admin';
    }

    if (data.isNewVersion) {
      // Auto-supersede logic with transaction
      payload.authorId = existingBuild.authorId;
      payload.isPublic = existingBuild.isPublic;
      payload.author = existingBuild.author;

      return await prisma.$transaction(async (tx) => {
        const newRecord = await tx.shikigamiBuild.create({ 
          data: { ...payload, status: 'CURRENT' } 
        });

        await tx.shikigamiBuild.update({
          where: { id: buildId },
          data: {
            status: 'HISTORICAL',
            becameHistoricalAt: new Date(),
            supersededById: newRecord.id
          }
        });

        return newRecord;
      });
    } else {
      return prisma.shikigamiBuild.update({
        where: { id: buildId },
        data: payload
      });
    }
  }
}

export async function toggleBuildVisibility(buildId: string, isPublic: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const existingBuild = await prisma.shikigamiBuild.findUnique({ where: { id: buildId } });
  if (!existingBuild) throw new Error('Build not found');

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (existingBuild.authorId !== user.id && dbUser?.role !== 'ADMIN') {
    throw new Error('You do not have permission to change visibility of this build');
  }

  return prisma.shikigamiBuild.update({
    where: { id: buildId },
    data: { isPublic }
  });
}

export async function deleteShikigamiBuild(buildId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const inUse = await prisma.lineupSlot.findFirst({ where: { buildId } });
  if (inUse) {
    throw new Error('This build is currently referenced by one or more lineups. It cannot be deleted. Please mark it as HISTORICAL instead.');
  }

  return prisma.shikigamiBuild.delete({
    where: { id: buildId }
  });
}
