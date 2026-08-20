import { Suspense } from 'react';
import LedgerClient from './LedgerClient';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getLedgerHistory, getUserStorage } from '@/app/actions/ledger';

export const metadata = {
  title: 'Ledger | Heian Tactics',
  description: 'Resource management and transaction history',
};

export default async function LedgerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch initial data for SSR
  const [historyResult, storage] = await Promise.all([
    getLedgerHistory({ category: 'TRANSACTIONS', page: 1, pageSize: 20 }),
    getUserStorage()
  ]);

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 md:p-6 lg:p-8 space-y-8 fade-in">
      <div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground uppercase tracking-widest mb-2">
          Ledger
        </h1>
        <p className="font-mono text-text-secondary text-sm">
          Resource storage and transaction history
        </p>
      </div>

      <Suspense fallback={<div className="font-mono text-text-secondary text-sm animate-pulse">Loading ledger data...</div>}>
        <LedgerClient 
          initialTransactions={historyResult.transactions} 
          initialTotal={historyResult.total}
          initialStorage={storage}
        />
      </Suspense>
    </div>
  );
}
