'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!password) {
      setMessage('Password is required.');
      setLoading(false);
      return;
    }

    // Password Login for test accounts
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-accent-gold via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent-vermillion via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-surface p-8 border border-border-ink shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-foreground mb-2">Onmyoji Meta</h1>
          <p className="text-sm font-mono text-text-secondary">Sign in to sync your roster & manage projects</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1">EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border-ink px-4 py-2 text-foreground font-mono focus:outline-none focus:border-accent-gold transition-colors"
              placeholder="seimei@heian.kyo"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-text-secondary mb-1">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border-ink px-4 py-2 text-foreground font-mono focus:outline-none focus:border-accent-gold transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-gold text-background font-mono font-bold py-2 hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Log In'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-background border border-border-ink text-center text-xs font-mono text-text-secondary">
            {message}
          </div>
        )}

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-border-ink"></div>
          <span className="px-4 text-xs font-mono text-text-secondary">OR</span>
          <div className="flex-1 border-t border-border-ink"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-background border border-border-ink text-foreground font-mono font-bold py-2 hover:bg-surface transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <button onClick={() => router.push('/meta/lineups')} className="w-full mt-4 text-xs font-mono text-text-secondary hover:text-foreground text-center">
          ← Back to Public Site
        </button>
      </div>
    </div>
  );
}
