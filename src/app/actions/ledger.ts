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

export interface LedgerFilter {
  category: 'TRANSACTIONS' | 'ACTIVITIES';
  year?: number;
  month?: number; // 1-12
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  resourceId?: string;
  type?: TransactionType;
  source?: string;
  page?: number;
  pageSize?: number;
}

export async function getLedgerHistory(filter: LedgerFilter) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { page = 1, pageSize = 20 } = filter;
  const where: any = { userId: user.id };

  // Instruction: Encapsulate ACTIVITY_RUN implementation detail in the backend.
  // The frontend only knows about 'category'.
  if (filter.category === 'ACTIVITIES') {
    where.resourceId = 'ACTIVITY_RUN';
  } else if (filter.category === 'TRANSACTIONS') {
    where.resourceId = { not: 'ACTIVITY_RUN' };
  }

  // Resource / Type / Source filters
  if (filter.resourceId && filter.category === 'TRANSACTIONS') {
    where.resourceId = filter.resourceId;
  }
  if (filter.type) {
    where.type = filter.type;
  }
  if (filter.source) {
    where.source = filter.source;
  }

  // Date Filtering (Timezone and boundary safe)
  const dateConditions: any = {};
  
  if (filter.year) {
    // If only year and month are provided, construct the boundaries
    const startMonth = filter.month ? filter.month - 1 : 0;
    const endMonth = filter.month ? filter.month : 12;
    
    // Explicitly using UTC to prevent server/browser timezone drift
    const start = new Date(Date.UTC(filter.year, startMonth, 1));
    const end = filter.month 
      ? new Date(Date.UTC(filter.year, filter.month, 1)) // 1st of next month
      : new Date(Date.UTC(filter.year + 1, 0, 1)); // 1st of next year
      
    dateConditions.gte = start;
    dateConditions.lt = end;
  } else if (filter.startDate || filter.endDate) {
    if (filter.startDate) dateConditions.gte = new Date(filter.startDate);
    if (filter.endDate) dateConditions.lte = new Date(filter.endDate);
  }

  if (Object.keys(dateConditions).length > 0) {
    where.createdAt = dateConditions;
  }

  const transactions = await prisma.ledgerTransaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const total = await prisma.ledgerTransaction.count({ where });

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
