import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultActivityRates } from '@/domain/activity-rates';
import { calculateActivityYield } from '@/domain/production-pipeline';
import { ActivityType } from '@/types/domain/activity';
import { createHash } from 'crypto';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    console.log("[BOT_SYNC_DEBUG] Received Auth Header:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const tokenString = authHeader.split('Bearer ')[1]?.trim();
    if (!tokenString) {
      return NextResponse.json({ error: 'Token is missing' }, { status: 401 });
    }

    const tokenHash = createHash('sha256').update(tokenString).digest('hex');

    const apiToken = await prisma.apiToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!apiToken) {
      return NextResponse.json({ error: 'Invalid or revoked token' }, { status: 401 });
    }

    // Fire and forget last used
    prisma.apiToken.update({
      where: { id: apiToken.id },
      data: { lastUsedAt: new Date() }
    }).catch(console.error);

    const userId = apiToken.userId;
    const body = await req.json();

    // ==========================================
    // ROUTER LOGIC: Inventory Sync vs Activity
    // ==========================================
    if (body.type === 'inventory_sync') {
      return await handleInventorySync(userId, body);
    } else {
      // Default fallback is activity run for backward compatibility
      return await handleActivityRun(userId, body);
    }

  } catch (error: any) {
    console.error('Automation Sync Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ----------------------------------------------------------------------------
// HANDLER: INVENTORY SYNC
// ----------------------------------------------------------------------------
async function handleInventorySync(userId: string, body: any) {
  const { inventory } = body;
  
  if (!inventory || typeof inventory !== 'object') {
    return NextResponse.json({ error: 'Invalid inventory payload format' }, { status: 400 });
  }

  // Map bot's snake_case resource names to our InventoryResourceType IDs
  const resourceMap: Record<string, string> = {
    'coins': 'coins',
    'jade': 'jade',
    'ap': 'ap',
    'mystery_amulet': 'mysteryAmulet',
    'broken_amulet': 'brokenAmulet',
  };

  const syncResults: any[] = [];

  await prisma.$transaction(async (tx) => {
    for (const [botKey, botValue] of Object.entries(inventory)) {
      if (typeof botValue !== 'number') continue;

      const resourceId = resourceMap[botKey];
      if (!resourceId) continue;

      const newAmount = Math.max(0, Math.round(botValue));

      const existing = await tx.userStorage.findUnique({
        where: { userId_resourceId: { userId, resourceId } }
      });

      const currentAmount = existing ? existing.amount : 0;
      const delta = newAmount - currentAmount;

      if (delta !== 0) {
        // Create Ledger Transaction for adjustment
        await tx.ledgerTransaction.create({
          data: {
            userId,
            resourceId,
            amount: Math.abs(delta),
            type: delta > 0 ? 'INCOME' : 'EXPENSE',
            source: 'BOT_INVENTORY_SYNC',
            referenceType: 'OCR_CORRECTION',
            metadata: { previous_amount: currentAmount, new_amount: newAmount, delta }
          }
        });

        // Update/Create User Storage
        if (existing) {
          await tx.userStorage.update({
            where: { id: existing.id },
            data: { amount: newAmount }
          });
        } else {
          await tx.userStorage.create({
            data: { userId, resourceId, amount: newAmount }
          });
        }
      }

      syncResults.push({ resource: resourceId, old: currentAmount, new: newAmount, delta });
    }
  });

  return NextResponse.json({ success: true, synced_resources: syncResults });
}

// ----------------------------------------------------------------------------
// HANDLER: ACTIVITY RUN (EV Calculation)
// ----------------------------------------------------------------------------
async function handleActivityRun(userId: string, body: any) {
  const { activity, runs_completed } = body;

  if (!activity || typeof runs_completed !== 'number') {
    return NextResponse.json({ error: 'Missing required fields (activity, runs_completed)' }, { status: 400 });
  }

  const activityMap: Record<string, ActivityType> = {
    'realm_raid': 'RealmRaid',
    'exploration': 'Exploration',
    'soul_zone': 'SoulZone',
  };

  const domainActivity = activityMap[activity];
  if (!domainActivity) {
    return NextResponse.json({ error: `Unsupported activity type: ${activity}` }, { status: 400 });
  }

  const rates = defaultActivityRates[domainActivity];
  if (!rates) {
    return NextResponse.json({ error: `No EV rates defined for ${domainActivity}` }, { status: 500 });
  }

  const yieldResult = calculateActivityYield(domainActivity, runs_completed, rates);

  await prisma.$transaction(async (tx) => {
    // 1. Record the activity run event itself
    await tx.ledgerTransaction.create({
      data: {
        userId,
        resourceId: 'ACTIVITY_RUN',
        amount: runs_completed,
        type: 'INCOME',
        source: 'BOT_AUTOMATION',
        referenceType: domainActivity,
        metadata: body
      }
    });

    const resourceMap: Record<string, string> = {
      'jadePerRun': 'jade',
      'apPerRun': 'ap',
      'apCostPerRun': 'ap', 
      'soulsPerRun': 'souls',
      'blackDarumaShardsPerRun': 'blackDarumaShards',
      'eventCurrencyPerRun': 'eventCurrency',
      'mysteryAmuletPerRun': 'mysteryAmulet',
      // Note: coins and broken amulets were intentionally removed from EV tracking
    };

    // 2. Process EV Yields
    for (const [yieldKey, amount] of Object.entries(yieldResult)) {
      if (!amount || amount === 0) continue;

      const resourceId = resourceMap[yieldKey];
      if (!resourceId) continue;

      const isExpense = yieldKey.includes('Cost');
      const finalAmount = isExpense ? -Math.abs(amount) : Math.abs(amount);
      
      await tx.ledgerTransaction.create({
        data: {
          userId,
          resourceId,
          amount: Math.abs(finalAmount),
          type: isExpense ? 'EXPENSE' : 'INCOME',
          source: 'BOT_AUTOMATION_YIELD',
          referenceType: domainActivity,
          metadata: { runs_completed, yieldKey }
        }
      });

      const roundedAmount = Math.round(finalAmount);
      if (roundedAmount !== 0) {
        const existing = await tx.userStorage.findUnique({
          where: { userId_resourceId: { userId, resourceId } }
        });

        if (existing) {
          await tx.userStorage.update({
            where: { id: existing.id },
            data: { amount: Math.max(0, existing.amount + roundedAmount) }
          });
        } else {
          await tx.userStorage.create({
            data: { userId, resourceId, amount: Math.max(0, roundedAmount) }
          });
        }
      }
    }
  });

  return NextResponse.json({ success: true, calculated_yield: yieldResult });
}
