import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    console.log("[INVENTORY_SYNC_DEBUG] Received Auth Header:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
    }

    const tokenString = authHeader.split('Bearer ')[1]?.trim();
    if (!tokenString) {
      return NextResponse.json({ error: 'Token is missing' }, { status: 401 });
    }

    const tokenHash = createHash('sha256').update(tokenString).digest('hex');

    // Find the token in the database
    const apiToken = await prisma.apiToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!apiToken) {
      return NextResponse.json({ error: 'Invalid or revoked token' }, { status: 401 });
    }

    // Update last used at (fire and forget)
    prisma.apiToken.update({
      where: { id: apiToken.id },
      data: { lastUsedAt: new Date() }
    }).catch(console.error);

    const userId = apiToken.userId;

    const body = await req.json();
    const { type, inventory } = body;

    if (type !== 'inventory_sync' || !inventory || typeof inventory !== 'object') {
      return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
    }

    // Map bot's snake_case resource names to our InventoryResourceType IDs
    const resourceMap: Record<string, string> = {
      'coins': 'coins',
      'jade': 'jade',
      'ap': 'ap',
      'mystery_amulet': 'mysteryAmulet',
      'broken_amulet': 'brokenAmulet',
      // Add more as the OCR capabilities expand
    };

    const syncResults: any[] = [];

    // Wrap everything in a transaction for data integrity
    await prisma.$transaction(async (tx) => {
      for (const [botKey, botValue] of Object.entries(inventory)) {
        if (typeof botValue !== 'number') continue;

        const resourceId = resourceMap[botKey];
        if (!resourceId) continue;

        const newAmount = Math.max(0, Math.round(botValue));

        // Get current balance
        const existing = await tx.userStorage.findUnique({
          where: { userId_resourceId: { userId, resourceId } }
        });

        const currentAmount = existing ? existing.amount : 0;
        const delta = newAmount - currentAmount;

        if (delta !== 0) {
          // 1. Create Ledger Transaction to explain the jump
          await tx.ledgerTransaction.create({
            data: {
              userId,
              resourceId,
              amount: Math.abs(delta),
              type: delta > 0 ? 'INCOME' : 'EXPENSE',
              source: 'BOT_INVENTORY_SYNC',
              referenceType: 'OCR_CORRECTION',
              metadata: { 
                previous_amount: currentAmount, 
                new_amount: newAmount,
                delta: delta
              }
            }
          });

          // 2. Update/Create User Storage to match OCR exactly
          if (existing) {
            await tx.userStorage.update({
              where: { id: existing.id },
              data: { amount: newAmount }
            });
          } else {
            await tx.userStorage.create({
              data: {
                userId,
                resourceId,
                amount: newAmount
              }
            });
          }
        }

        syncResults.push({ resource: resourceId, old: currentAmount, new: newAmount, delta });
      }
    });

    return NextResponse.json({ 
      success: true, 
      synced_resources: syncResults 
    });

  } catch (error: any) {
    console.error('Inventory Sync Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
