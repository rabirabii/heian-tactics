import { SidebarNav } from '@/components/sidebar';
import { createClient } from '@/utils/supabase/server';
import type { ReactNode } from 'react';
import { prisma } from '@/lib/prisma';
import UsernameOnboarding from '@/components/UsernameOnboarding';

export default async function PlannerLayout({
  children,
}: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let dbUser = null;
  if (user) {
    dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  }

  return (
    <div className="flex w-full min-h-screen bg-[var(--background)]">
      <UsernameOnboarding user={dbUser} />
      <SidebarNav className="flex-shrink-0" user={user} />
      <main className="flex-1 p-6 lg:p-8 max-w-screen-2xl mx-auto w-full min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}