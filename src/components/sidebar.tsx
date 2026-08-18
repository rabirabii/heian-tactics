"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import {
  Gauge,
  TableProperties,
  FolderKanban,
  Users,
  CalendarDays,
  Settings,
  RefreshCcw,
  Factory,
  ListTodo,
  LogOut,
  LogIn
} from 'lucide-react';

export function SidebarNav({ className, user }: { className?: string, user?: User | null }) {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const resetDemoData = () => {
    localStorage.clear();
    toast.success('Demo data has been reset!');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleLogout = async () => {
    toast.loading('Logging out...', { id: 'logout' });
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Successfully logged out!', { id: 'logout' });
      window.location.href = '/login';
    } catch (e) {
      toast.error('Failed to log out', { id: 'logout' });
    }
  };

  // Only show these categories if user is logged in
  const categories = [
    ...(user ? [{
      title: "GENERAL",
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: Gauge },
        { href: '/ledger', label: 'Ledger (Resources)', icon: Factory },
        { href: '/projects', label: 'Projects', icon: FolderKanban },
        { href: '/fodder', label: 'Fodder', icon: Factory },
      ]
    }] : []),
    {
      title: "MY ROSTER",
      items: [
        { href: '/shikigami', label: 'Shikigami', icon: Users },
        { href: '/shikigami/champions', label: 'Onmyoji & Champions', icon: Users },
      ]
    },
    {
      title: "META & BUILDS",
      items: [
        { href: '/meta/tier-list', label: 'Meta Tier List', icon: TableProperties },
        { href: '/meta/builds', label: 'Community Builds', icon: TableProperties },
        { href: '/meta/lineups', label: 'Meta Lineups', icon: ListTodo },
      ]
    },
    ...(user ? [{
      title: "OTHERS",
      items: [
        { href: '/planner', label: 'Planner', icon: CalendarDays },
        { href: '/settings', label: 'Settings', icon: Settings },
      ]
    }] : [])
  ];

  return (
    <>
      <aside className={cn(
        "w-64 bg-[var(--surface)] border-r border-[var(--border-ink)] p-4 flex flex-col justify-between h-screen sticky top-0 overflow-y-auto",
        className
      )}>
        <div>
          <div className="flex items-center gap-2.5 mb-8 px-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent-vermillion)]">
              <path d="M4 6h16" />
              <path d="M6 6v14" />
              <path d="M18 6v14" />
              <path d="M6 10h12" />
            </svg>
            <h2 className="text-xl text-[var(--foreground)] font-display ink">
              Onmyoji Planner
            </h2>
          </div>
          <nav className="space-y-6">
            {categories.map((category) => (
              <div key={category.title}>
                <h3 className="px-3 text-xs font-mono font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                  {category.title}
                </h3>
                <div className="space-y-1">
                  {category.items.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || pathname.startsWith(`${href}/`);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2 text-sm font-bold rounded-[var(--radius-medium)] transition-colors",
                          active
                            ? "bg-[var(--surface)] border-l-[3px] border-[var(--accent-vermillion)] text-[var(--foreground)] rounded-l-none"
                            : "text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--foreground)] border-l-[3px] border-transparent"
                        )}
                      >
                        <Icon size={16} className={active ? "text-[var(--accent-vermillion)]" : "text-inherit"} />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
        <div className="space-y-2 mt-auto pt-6">
          <button
            onClick={resetDemoData}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-[var(--foreground)] bg-[var(--surface)] border border-[var(--border-ink)] rounded-[var(--radius-medium)] hover:bg-[var(--surface)] transition-colors"
          >
            <RefreshCcw size={16} />
            Reset Demo
          </button>
          
          {user ? (
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-red-500 bg-[var(--surface)] border border-red-500/30 rounded-[var(--radius-medium)] hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              Log Out
            </button>
          ) : (
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-background bg-accent-gold rounded-[var(--radius-medium)] hover:bg-yellow-600 transition-colors"
            >
              <LogIn size={16} />
              Log In
            </Link>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--surface)] border border-[var(--border-ink)] p-6 shadow-2xl max-w-sm w-full mx-4 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-display text-[var(--foreground)] mb-2">Sign Out</h3>
            <p className="text-sm text-[var(--text-secondary)] font-mono mb-6">
              Are you sure you want to sign out of Onmyoji Meta? You will need a magic link to return.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-mono font-bold text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  handleLogout();
                }}
                className="px-4 py-2 text-sm font-mono font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-colors"
              >
                YES, LOG OUT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}