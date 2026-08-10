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

  const payload = {
    shikigamiId: data.shikigamiId,
    roleId: data.roleId,
    typeId: data.typeId || 'PvE',
    categoryId: data.categoryId || null,
    beginnerFriendly: data.beginnerFriendly || false,
    soulChoices: data.soulChoices || [],
    slotStats: data.slotStats || '',
    substats: data.substats || '',
    breakpoint: data.breakpoint || '',
    notes: data.notes || null,
    tags: data.tags || [],
    author: data.author || 'System',
    updatedBy: dbUser?.username || null,
    referenceUrl: data.referenceUrl || null,
    status: data.status || 'CURRENT',
  };

  if (buildId === 'new') {
    return prisma.shikigamiBuild.create({ data: payload });
  } else {
    if (data.isNewVersion) {
      // Auto-supersede logic
      const newRecord = await prisma.shikigamiBuild.create({ 
        data: { ...payload, status: 'CURRENT' } 
      });

      await prisma.shikigamiBuild.update({
        where: { id: buildId },
        data: {
          status: 'HISTORICAL',
          becameHistoricalAt: new Date(),
          supersededById: newRecord.id
        }
      });

      return newRecord;
    } else {
      return prisma.shikigamiBuild.update({
        where: { id: buildId },
        data: payload
      });
    }
  }
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
