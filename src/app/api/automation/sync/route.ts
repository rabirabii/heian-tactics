import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultActivityRates } from '@/domain/activity-rates';
import { calculateActivityYield } from '@/domain/production-pipeline';
import { ActivityType } from '@/types/domain/activity';

// Temporary auth: Bot must send userId and a secret token in headers or body.
// In a real production scenario, use a proper API key system.
const BOT_SECRET = process.env.BOT_SECRET || 'heian_tactics_bot_secret';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== BOT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized bot access' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, activity, runs_completed, metadata } = body;

    if (!userId || !activity || typeof runs_completed !== 'number') {
      return NextResponse.json({ error: 'Missing required fields (userId, activity, runs_completed)' }, { status: 400 });
    }

    // Map bot's snake_case activity name to our Domain ActivityType
    // e.g. "realm_raid" -> "RealmRaid"
    const activityMap: Record<string, ActivityType> = {
      'realm_raid': 'RealmRaid',
      'exploration': 'Exploration',
      'soul_zone': 'SoulZone',
      // Add more mappings as the bot expands
    };

    const domainActivity = activityMap[activity];
    if (!domainActivity) {
      return NextResponse.json({ error: `Unsupported activity type: ${activity}` }, { status: 400 });
    }

    const rates = defaultActivityRates[domainActivity];
    if (!rates) {
      return NextResponse.json({ error: `No EV rates defined for ${domainActivity}` }, { status: 500 });
    }

    // 1. Calculate Expected Value (EV) from the runs
    const yieldResult = calculateActivityYield(domainActivity, runs_completed, rates);

    // 2. Wrap everything in a database transaction to ensure Ledger and Storage are synced
    await prisma.$transaction(async (tx) => {
      // Create ledger transaction for the run itself (record of event)
      await tx.ledgerTransaction.create({
        data: {
          userId,
          resourceId: 'ACTIVITY_RUN', // Virtual resource to track runs
          amount: runs_completed,
          type: 'INCOME',
          source: 'BOT_AUTOMATION',
          referenceType: domainActivity,
          metadata: body
        }
      });

      // Map EV domain fields to InventoryResourceType IDs
      const resourceMap: Record<string, string> = {
        'jadePerRun': 'jade',
        'coinsPerRun': 'coins',
        'apPerRun': 'ap',
        'apCostPerRun': 'ap', // Need to subtract this
        'g2FodderPerRun': 'g2Fodder',
        'brokenAmuletPerRun': 'brokenAmulet',
        'mysteryAmuletPerRun': 'mysteryAmulet',
        'blackDarumaShardsPerRun': 'blackDarumaShards',
        'blackDarumaPerRun': 'blackDaruma',
        'soulsPerRun': 'souls',
        'eventCurrencyPerRun': 'eventCurrency'
      };

      // Process each yielded resource
      for (const [yieldKey, amount] of Object.entries(yieldResult)) {
        if (!amount || amount === 0) continue;

        const resourceId = resourceMap[yieldKey];
        if (!resourceId) continue;

        // Determine if it's an expense (like apCost) or income
        const isExpense = yieldKey.includes('Cost');
        const finalAmount = isExpense ? -Math.abs(amount) : Math.abs(amount);
        
        // Log to Ledger
        await tx.ledgerTransaction.create({
          data: {
            userId,
            resourceId,
            amount: Math.abs(finalAmount), // Ledger stores absolute value
            type: isExpense ? 'EXPENSE' : 'INCOME',
            source: 'BOT_AUTOMATION_YIELD',
            referenceType: domainActivity,
            metadata: { runs_completed, yieldKey }
          }
        });

        // Update User Storage (Upsert)
        // Since we are storing raw decimal EVs (like 1.67 Jade), 
        // we should probably round it or store float. Prisma Int doesn't take float.
        // For now, we round it. In a real financial app, we might scale by 100.
        const roundedAmount = Math.round(finalAmount);
        if (roundedAmount !== 0) {
          const existing = await tx.userStorage.findUnique({
            where: { userId_resourceId: { userId, resourceId } }
          });

          if (existing) {
            await tx.userStorage.update({
              where: { id: existing.id },
              data: { amount: existing.amount + roundedAmount }
            });
          } else {
            // Can't have negative balance if it doesn't exist
            await tx.userStorage.create({
              data: {
                userId,
                resourceId,
                amount: Math.max(0, roundedAmount)
              }
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true, calculated_yield: yieldResult });
  } catch (error: any) {
    console.error('Automation Sync Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
