'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { ActivityType, WeeklyActivityPattern } from '@/types/domain/activity';

export interface PlannerData {
  patterns: Record<string, WeeklyActivityPattern>;
  actuals: Record<string, number>; // activityType -> total runs this month
  storage: Record<string, number>; // resourceId -> amount
}

export async function getPlannerData(): Promise<PlannerData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // 1. Fetch Planned Patterns
  const dbPatterns = await prisma.userActivityPattern.findMany({
    where: { userId: user.id }
  });

  const patterns: Record<string, WeeklyActivityPattern> = {};
  dbPatterns.forEach(p => {
    patterns[p.activityType] = {
      mon: p.mon,
      tue: p.tue,
      wed: p.wed,
      thu: p.thu,
      fri: p.fri,
      sat: p.sat,
      sun: p.sun
    };
  });

  // 2. Fetch Actual Activity Runs (Current Month)
  // For simplicity, we just fetch all ACTIVITY_RUN for the current month and group by referenceType
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const actualLedger = await prisma.ledgerTransaction.groupBy({
    by: ['referenceType'],
    where: {
      userId: user.id,
      resourceId: 'ACTIVITY_RUN',
      createdAt: { gte: startOfMonth }
    },
    _sum: {
      amount: true
    }
  });

  const actuals: Record<string, number> = {};
  actualLedger.forEach(entry => {
    if (entry.referenceType) {
      actuals[entry.referenceType] = entry._sum.amount || 0;
    }
  });

  // 3. Fetch User Storage (Current live inventory from DB)
  const userStorage = await prisma.userStorage.findMany({
    where: { userId: user.id }
  });

  const storage: Record<string, number> = {};
  userStorage.forEach(s => {
    storage[s.resourceId] = s.amount;
  });

  return { patterns, actuals, storage };
}

export async function updateUserActivityPattern(activityType: string, pattern: WeeklyActivityPattern) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  await prisma.userActivityPattern.upsert({
    where: {
      userId_activityType: {
        userId: user.id,
        activityType: activityType
      }
    },
    update: {
      mon: pattern.mon,
      tue: pattern.tue,
      wed: pattern.wed,
      thu: pattern.thu,
      fri: pattern.fri,
      sat: pattern.sat,
      sun: pattern.sun
    },
    create: {
      userId: user.id,
      activityType: activityType,
      mon: pattern.mon,
      tue: pattern.tue,
      wed: pattern.wed,
      thu: pattern.thu,
      fri: pattern.fri,
      sat: pattern.sat,
      sun: pattern.sun
    }
  });

  return { success: true };
}
