'use client';

import { useState } from 'react';
import { TransactionType } from '@prisma/client';
import { createLedgerTransaction } from '@/app/actions/ledger';
import { Plus, ArrowDownRight, ArrowUpRight, Coins, Gem, Zap, Scroll, Droplet, Star } from 'lucide-react';

const COMMON_RESOURCES = [
  { id: 'JADE', name: 'Jade', icon: <Gem className="w-4 h-4 text-emerald-400" /> },
  { id: 'COIN', name: 'Coins', icon: <Coins className="w-4 h-4 text-yellow-400" /> },
  { id: 'AP', name: 'AP (Sushi)', icon: <Zap className="w-4 h-4 text-pink-400" /> },
  { id: 'MYSTERY_AMULET', name: 'Mystery Amulet', icon: <Scroll className="w-4 h-4 text-blue-300" /> },
  { id: 'SKILL_DARUMA', name: 'Skill Daruma', icon: <Droplet className="w-4 h-4 text-black" /> },
  { id: 'GRADE_DARUMA', name: 'Grade Daruma', icon: <Droplet className="w-4 h-4 text-white" /> },
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [resourceId, setResourceId] = useState('JADE');
  const [amount, setAmount] = useState<number>(0);
  const [source, setSource] = useState('');

  // Handle local state to reflect optimistic updates without hard reload
  const [transactions, setTransactions] = useState(initialTransactions);
  const [storage, setStorage] = useState(initialStorage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      
      const res = await createLedgerTransaction({
        resourceId,
        amount,
        type,
        source: source || 'Manual Entry'
      });

      // Optimistically update local state
      setTransactions([res.transaction, ...transactions]);
      
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

      <div className="flex justify-between items-end border-b border-border-ink pb-4">
        <div>
          <h2 className="font-display text-2xl text-foreground">Transaction Log</h2>
          <p className="font-mono text-xs text-text-secondary mt-1">Immutable record of resource flow</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent-gold text-surface px-4 py-2 font-mono text-sm uppercase tracking-wider hover:bg-accent-gold/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Ledger History */}
      <div className="bg-surface border border-border-ink overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <thead className="bg-background border-b border-border-ink text-text-secondary text-xs uppercase">
            <tr>
              <th className="p-4 font-normal">Date</th>
              <th className="p-4 font-normal">Type</th>
              <th className="p-4 font-normal">Resource</th>
              <th className="p-4 font-normal text-right">Amount</th>
              <th className="p-4 font-normal">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-ink/50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-secondary">No transactions recorded yet.</td>
              </tr>
            ) : (
              transactions.map(tx => {
                const isIncome = tx.type === 'INCOME';
                const rInfo = getResourceDetails(tx.resourceId);
                return (
                  <tr key={tx.id} className="hover:bg-background/50 transition-colors">
                    <td className="p-4 text-text-secondary">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 ${isIncome ? 'text-emerald-400' : 'text-accent-vermillion'}`}>
                        {isIncome ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-2 text-foreground">
                        {rInfo.icon} {rInfo.name}
                      </span>
                    </td>
                    <td className={`p-4 text-right font-bold ${isIncome ? 'text-emerald-400' : 'text-accent-vermillion'}`}>
                      {isIncome ? '+' : '-'}{tx.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-text-secondary truncate max-w-[200px]" title={tx.source}>
                      {tx.source}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
                  <input type="radio" name="txType" className="hidden" checked={type === 'INCOME'} onChange={() => setType('INCOME')} />
                  <ArrowDownRight className="w-4 h-4" /> INCOME
                </label>
                <label className="flex-1 flex items-center gap-2 cursor-pointer border border-border-ink p-3 hover:bg-background transition-colors has-[:checked]:border-accent-vermillion has-[:checked]:bg-accent-vermillion/10 text-accent-vermillion font-mono text-sm">
                  <input type="radio" name="txType" className="hidden" checked={type === 'EXPENSE'} onChange={() => setType('EXPENSE')} />
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
