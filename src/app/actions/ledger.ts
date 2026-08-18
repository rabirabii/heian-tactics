'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { TransactionType } from '@prisma/client';

export async function getUserStorage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const storage = await prisma.userStorage.findMany({
    where: { userId: user.id },
  });

  return storage;
}

export async function getLedgerHistory(page = 1, pageSize = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const transactions = await prisma.ledgerTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const total = await prisma.ledgerTransaction.count({
    where: { userId: user.id }
  });

  return { transactions, total, page, pageSize };
}

export interface CreateLedgerTransactionInput {
  resourceId: string;
  amount: number;
  type: TransactionType;
  source: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: any;
}

export async function createLedgerTransaction(input: CreateLedgerTransactionInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  // Use an atomic transaction to ensure data integrity
  return await prisma.$transaction(async (tx) => {
    // 1. Find or create the storage record
    let storage = await tx.userStorage.findUnique({
      where: {
        userId_resourceId: {
          userId: user.id,
          resourceId: input.resourceId
        }
      }
    });

    if (!storage) {
      storage = await tx.userStorage.create({
        data: {
          userId: user.id,
          resourceId: input.resourceId,
          amount: 0
        }
      });
    }

    // 2. Prevent negative balances for expenses
    if (input.type === TransactionType.EXPENSE) {
      if (storage.amount < input.amount) {
        throw new Error(`Insufficient ${input.resourceId} balance. You need ${input.amount} but only have ${storage.amount}.`);
      }
    }

    // 3. Update storage balance
    const newAmount = input.type === TransactionType.INCOME 
      ? storage.amount + input.amount 
      : storage.amount - input.amount;

    await tx.userStorage.update({
      where: { id: storage.id },
      data: { amount: newAmount }
    });

    // 4. Create ledger transaction
    const transaction = await tx.ledgerTransaction.create({
      data: {
        userId: user.id,
        resourceId: input.resourceId,
        amount: input.amount, // Always store absolute amount
        type: input.type,
        source: input.source,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        metadata: input.metadata || null,
      }
    });

    return { transaction, newBalance: newAmount };
  });
}
