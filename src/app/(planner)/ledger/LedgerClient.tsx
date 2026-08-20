'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { TransactionType } from '@prisma/client';
import { createLedgerTransaction, getLedgerHistory, LedgerFilter } from '@/app/actions/ledger';
import { Plus, ArrowDownRight, ArrowUpRight, Coins, Gem, Zap, Scroll, Droplet, Star, Filter, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

const COMMON_RESOURCES = [
  { id: 'jade', name: 'Jade', icon: <Gem className="w-4 h-4 text-emerald-400" /> },
  { id: 'coins', name: 'Coins', icon: <Coins className="w-4 h-4 text-yellow-400" /> },
  { id: 'ap', name: 'AP (Sushi)', icon: <Zap className="w-4 h-4 text-pink-400" /> },
  { id: 'mysteryAmulet', name: 'Mystery Amulet', icon: <Scroll className="w-4 h-4 text-blue-300" /> },
  { id: 'skillDaruma', name: 'Skill Daruma', icon: <Droplet className="w-4 h-4 text-black" /> },
  { id: 'gradeDaruma', name: 'Grade Daruma', icon: <Droplet className="w-4 h-4 text-white" /> },
];

export default function LedgerClient({ 
  initialTransactions, 
  initialTotal,
  initialStorage 
}: { 
  initialTransactions: any[];
  initialTotal: number;
  initialStorage: any[];
}) {
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'ACTIVITIES'>('TRANSACTIONS');
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const pageSize = 20;

  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState<number | ''>(''); // '' means all months
  const [filterResource, setFilterResource] = useState<string>('');
  const [filterType, setFilterType] = useState<TransactionType | ''>('');
  
  // Data state
  const [transactions, setTransactions] = useState(initialTransactions);
  const [storage, setStorage] = useState(initialStorage);
  const [isLoading, setIsLoading] = useState(false);

  // Manual entry modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txType, setTxType] = useState<TransactionType>(TransactionType.INCOME);
  const [resourceId, setResourceId] = useState('jade');
  const [amount, setAmount] = useState<number>(0);
  const [source, setSource] = useState('');

  // Fetch logic
  const fetchLedger = useCallback(async (isInitial = false) => {
    // If it's the very first render and we're looking at TRANSACTIONS, skip fetch and use initial (avoid double fetch)
    if (isInitial && activeTab === 'TRANSACTIONS' && filterYear === new Date().getFullYear() && !filterMonth && !filterResource && !filterType) {
      return; 
    }
    
    setIsLoading(true);
    try {
      const filter: LedgerFilter = {
        category: activeTab,
        page,
        pageSize,
        year: filterYear,
      };
      
      if (filterMonth) filter.month = filterMonth;
      if (filterResource) filter.resourceId = filterResource;
      if (filterType) filter.type = filterType;

      const res = await getLedgerHistory(filter);
      setTransactions(res.transactions);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page, filterYear, filterMonth, filterResource, filterType]);

  // Refetch when filters/tab change
  useEffect(() => {
    setPage(1); // Reset to page 1 on filter change
  }, [activeTab, filterYear, filterMonth, filterResource, filterType]);

  useEffect(() => {
    fetchLedger();
  }, [page, activeTab, filterYear, filterMonth, filterResource, filterType, fetchLedger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (amount <= 0) throw new Error("Amount must be greater than 0");
      const res = await createLedgerTransaction({
        resourceId,
        amount,
        type: txType,
        source: source || 'Manual Entry'
      });
      // Optimistic updates (only prepend if on page 1 of transactions tab)
      if (activeTab === 'TRANSACTIONS' && page === 1 && !filterResource && !filterMonth && !filterType) {
        setTransactions(prev => [res.transaction, ...prev]);
        setTotal(prev => prev + 1);
      } else {
        // Just trigger a refetch if we are filtered out
        fetchLedger();
      }
      
      const newStorage = [...storage];
      const storageIdx = newStorage.findIndex(s => s.resourceId === resourceId);
      if (storageIdx >= 0) {
        newStorage[storageIdx] = { ...newStorage[storageIdx], amount: res.newBalance };
      } else {
        newStorage.push({ resourceId, amount: res.newBalance });
      }
      setStorage(newStorage);
      setIsModalOpen(false);
      setAmount(0);
      setSource('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResourceDetails = (id: string) => {
    return COMMON_RESOURCES.find(r => r.id === id) || { name: id, icon: <Star className="w-4 h-4" /> };
  };

  const groupedTransactions = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      const date = new Date(tx.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      if (!acc[date]) acc[date] = [];
      acc[date].push(tx);
      return acc;
    }, {} as Record<string, any[]>);
  }, [transactions]);

  const maxPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-8">
      {/* Storage Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {COMMON_RESOURCES.map(resource => {
          const stored = storage.find(s => s.resourceId === resource.id);
          const amt = stored ? stored.amount : 0;
          return (
            <div key={resource.id} className="bg-surface border border-border-ink p-4 flex flex-col items-center justify-center gap-2">
              <div className="bg-background p-2 rounded-full border border-border-ink">
                {resource.icon}
              </div>
              <div className="font-display text-xl text-foreground mt-2">{amt.toLocaleString()}</div>
              <div className="text-xs font-mono text-text-secondary">{resource.name}</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border-ink pb-4">
        <div>
          <h2 className="font-display text-2xl text-foreground">Resource Ledger</h2>
          <p className="font-mono text-xs text-text-secondary mt-1">Immutable accounting record</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent-gold text-surface px-4 py-2 font-mono text-sm uppercase tracking-wider hover:bg-accent-gold/90 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-ink">
        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`px-6 py-3 font-mono text-sm uppercase tracking-widest transition-colors ${
            activeTab === 'TRANSACTIONS' 
            ? 'border-b-2 border-accent-gold text-accent-gold bg-accent-gold/5' 
            : 'text-text-secondary hover:text-foreground hover:bg-surface'
          }`}
        >
          <div className="flex items-center gap-2">
            <Gem className="w-4 h-4" /> Transactions
          </div>
        </button>
        <button
          onClick={() => setActiveTab('ACTIVITIES')}
          className={`px-6 py-3 font-mono text-sm uppercase tracking-widest transition-colors ${
            activeTab === 'ACTIVITIES' 
            ? 'border-b-2 border-accent-gold text-accent-gold bg-accent-gold/5' 
            : 'text-text-secondary hover:text-foreground hover:bg-surface'
          }`}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" /> Activities
          </div>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface border border-border-ink p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-1">Year</label>
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="bg-background border border-border-ink p-2 text-xs font-mono text-foreground focus:border-accent-gold outline-none w-24"
          >
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-mono text-text-secondary mb-1">Period</label>
          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value ? Number(e.target.value) : '')}
            className="bg-background border border-border-ink p-2 text-xs font-mono text-foreground focus:border-accent-gold outline-none w-32"
          >
            <option value="">All Months</option>
            {Array.from({length: 12}).map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('en', {month: 'short'})}</option>
            ))}
          </select>
        </div>

        {activeTab === 'TRANSACTIONS' && (
          <>
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1">Resource</label>
              <select 
                value={filterResource} 
                onChange={(e) => setFilterResource(e.target.value)}
                className="bg-background border border-border-ink p-2 text-xs font-mono text-foreground focus:border-accent-gold outline-none w-36"
              >
                <option value="">All Resources</option>
                {COMMON_RESOURCES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-mono text-text-secondary mb-1">Type</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value as TransactionType | '')}
                className="bg-background border border-border-ink p-2 text-xs font-mono text-foreground focus:border-accent-gold outline-none w-24"
              >
                <option value="">All</option>
                <option value="INCOME">IN</option>
                <option value="EXPENSE">OUT</option>
              </select>
            </div>
          </>
        )}

        <div className="flex-1"></div>

        <button 
          onClick={() => {
            setFilterYear(new Date().getFullYear());
            setFilterMonth('');
            setFilterResource('');
            setFilterType('');
          }}
          className="flex items-center gap-2 text-text-secondary hover:text-foreground text-xs font-mono p-2 transition-colors"
        >
          <Filter className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-surface border border-border-ink overflow-hidden relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="font-mono text-sm text-accent-gold animate-pulse">Loading {activeTab.toLowerCase()}...</div>
          </div>
        )}
        
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-text-secondary font-mono text-sm">
            No {activeTab.toLowerCase()} found for this period.
          </div>
        ) : (
          <div className="divide-y divide-border-ink/50">
            {Object.entries(groupedTransactions).map(([date, dailyTxs]: [string, any]) => (
              <div key={date} className="mb-6">
                <div className="bg-background px-4 py-2 border-y border-border-ink text-xs font-mono text-text-secondary uppercase tracking-wider sticky top-0 z-0">
                  {date}
                </div>
                <table className="w-full text-left font-mono text-sm whitespace-nowrap">
                  <tbody className="divide-y divide-border-ink/20">
                    {dailyTxs.map((tx: any) => {
                      const isIncome = tx.type === 'INCOME';
                      
                      if (activeTab === 'ACTIVITIES') {
                        // Render Activity Row
                        const meta = tx.metadata as any || {};
                        const activityName = tx.referenceType || 'Unknown Activity';
                        const runs = meta.runs_completed ? `${meta.runs_completed} runs` : '';
                        
                        return (
                          <tr key={tx.id} className="hover:bg-background/50 transition-colors group">
                            <td className="p-3 pl-4 text-text-secondary w-24">
                              {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3 w-48 font-bold text-foreground">
                              {activityName}
                            </td>
                            <td className="p-3 w-32 text-text-secondary">
                              {runs}
                            </td>
                            <td className="p-3 text-text-secondary text-right truncate">
                              {tx.source}
                            </td>
                          </tr>
                        );
                      }

                      // Render Transaction Row
                      const rInfo = getResourceDetails(tx.resourceId);
                      let extraDetails = '';
                      if (tx.source === 'BOT_INVENTORY_SYNC' && tx.metadata && (tx.metadata as any).new_amount !== undefined) {
                        extraDetails = `(OCR: ${(tx.metadata as any).new_amount.toLocaleString()})`;
                      }

                      return (
                        <tr key={tx.id} className="hover:bg-background/50 transition-colors group">
                          <td className="p-3 pl-4 text-text-secondary w-24">
                            {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-3 w-24">
                            <span className={`flex items-center gap-1 font-bold ${isIncome ? 'text-emerald-400' : 'text-accent-vermillion'}`}>
                              {isIncome ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                              {isIncome ? 'IN' : 'OUT'}
                            </span>
                          </td>
                          <td className="p-3 w-48">
                            <span className="flex items-center gap-2 text-foreground">
                              {rInfo.icon} {rInfo.name}
                            </span>
                          </td>
                          <td className={`p-3 text-right font-bold w-32 ${isIncome ? 'text-emerald-400' : 'text-accent-vermillion'}`}>
                            {isIncome ? '+' : '-'}{tx.amount.toLocaleString()}
                          </td>
                          <td className="p-3 text-text-secondary truncate min-w-[200px]">
                            <span className="flex items-center justify-between">
                              <span title={tx.source}>{tx.source}</span>
                              {extraDetails && <span className="text-xs opacity-50">{extraDetails}</span>}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between border-t border-border-ink pt-4 font-mono text-sm">
          <div className="text-text-secondary">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-surface border border-border-ink hover:bg-background disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-foreground">Page {page} of {maxPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(maxPages, p + 1))}
              disabled={page >= maxPages}
              className="p-2 bg-surface border border-border-ink hover:bg-background disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Manual Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-border-ink max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-foreground"
            >
              ✕
            </button>
            <div className="p-6 border-b border-border-ink">
              <h2 className="font-display text-xl text-foreground">Record Transaction</h2>
              <p className="font-mono text-xs text-text-secondary mt-1">Manually adjust your storage balance</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 text-red-500 font-mono text-xs">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border-ink p-3 hover:bg-background transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-500/10 text-emerald-400 font-mono text-sm">
                  <input type="radio" name="txType" className="hidden" checked={txType === 'INCOME'} onChange={() => setTxType('INCOME')} />
                  <ArrowDownRight className="w-4 h-4" /> INCOME
                </label>
                <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border-ink p-3 hover:bg-background transition-colors has-[:checked]:border-accent-vermillion has-[:checked]:bg-accent-vermillion/10 text-accent-vermillion font-mono text-sm">
                  <input type="radio" name="txType" className="hidden" checked={txType === 'EXPENSE'} onChange={() => setTxType('EXPENSE')} />
                  <ArrowUpRight className="w-4 h-4" /> EXPENSE
                </label>
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">Resource</label>
                <select 
                  value={resourceId} 
                  onChange={e => setResourceId(e.target.value)}
                  className="w-full bg-background border border-border-ink p-2 font-mono text-sm text-foreground focus:border-accent-gold outline-none"
                >
                  {COMMON_RESOURCES.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">Amount</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  value={amount || ''} 
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full bg-background border border-border-ink p-2 font-mono text-sm text-foreground focus:border-accent-gold outline-none"
                  placeholder="e.g. 1000"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1">Source / Description</label>
                <input 
                  type="text" 
                  required
                  value={source} 
                  onChange={e => setSource(e.target.value)}
                  className="w-full bg-background border border-border-ink p-2 font-mono text-sm text-foreground focus:border-accent-gold outline-none"
                  placeholder="e.g. Weekly PvP Reward"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-foreground text-background px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-text-secondary transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Commit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
