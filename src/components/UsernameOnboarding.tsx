'use client';

import { useState } from 'react';
import { setUsername } from '@/app/actions/user';

export default function UsernameOnboarding({ user }: { user: any }) {
  const [username, setInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user || user.username) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await setUsername(username);
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface border border-accent-gold p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-display text-accent-gold mb-2">Welcome!</h2>
        <p className="text-sm font-mono text-text-secondary mb-6">
          To participate in editing Meta Lineups and Community Builds, you must choose a unique username. This will be used for the audit trail.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="text" 
              value={username} 
              onChange={e => setInput(e.target.value)}
              placeholder="Enter username" 
              className="w-full bg-background border border-border-ink p-3 font-mono text-sm focus:border-accent-vermillion outline-none"
              minLength={3}
              maxLength={20}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
          <button 
            type="submit" 
            disabled={isLoading || username.length < 3}
            className="w-full py-3 bg-accent-gold text-background font-bold font-mono hover:bg-accent-gold/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Set Username'}
          </button>
        </form>
      </div>
    </div>
  );
}
