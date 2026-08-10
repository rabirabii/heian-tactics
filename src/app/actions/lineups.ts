'use server';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

export async function upsertMetaLineup(lineupId: string, data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  const {
    name,
    category,
    subcategoryId,
    description,
    notes,
    beginnerFriendly,
    strengths,
    weaknesses,
    status,
    slots
  } = data;

  const payload = {
    name,
    category,
    subcategoryId: subcategoryId || null,
    description,
    notes,
    beginnerFriendly,
    strengths,
    weaknesses,
    status: data.status || 'CURRENT',
    author: data.author || 'System',
    updatedBy: dbUser?.username || null,
    referenceUrl: data.referenceUrl || null,
    slots: {
      create: slots.map((s: any) => ({
        slotNumber: s.slotNumber,
        shikigamiId: s.shikigamiId || null,
        onmyojiId: s.onmyojiId || null,
        buildId: s.buildId || null,
        slot2: s.slot2 || null,
        slot4: s.slot4 || null,
        slot6: s.slot6 || null,
        statReq: s.statReq || null,
        minSpeed: s.minSpeed || null,
        minEffectHit: s.minEffectHit || null,
        minEffectRes: s.minEffectRes || null,
        minCrit: s.minCrit || null,
        minCritDmg: s.minCritDmg || null,
        indicator: s.indicator || null,
        skillReq: s.skillReq || null,
        primarySouls: s.primarySouls || [],
        secondarySouls: s.secondarySouls || [],
        substituteIds: s.substituteIds || []
      }))
    }
  };

  const isNew = lineupId === 'new';

  if (isNew) {
    return await prisma.metaLineup.create({ data: payload });
  } else {
    if (data.isNewVersion) {
      return await prisma.$transaction(async (tx) => {
        const newRecord = await tx.metaLineup.create({
          data: { ...payload, status: 'CURRENT' }
        });

        await tx.metaLineup.update({
          where: { id: lineupId },
          data: {
            status: 'HISTORICAL',
            becameHistoricalAt: new Date(),
            supersededById: newRecord.id
          }
        });

        return newRecord;
      });
    } else {
      return await prisma.$transaction(async (tx) => {
        await tx.lineupSlot.deleteMany({ where: { lineupId } });
        return await tx.metaLineup.update({
          where: { id: lineupId },
          data: payload
        });
      });
    }
  }
}
