import { prisma } from '@/lib/prisma';
import OnmyojiClient from './OnmyojiClient';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'Onmyoji & Champions - Onmyoji Planner',
};

export default async function ChampionsPage() {
  const onmyojiData = await prisma.onmyoji.findMany({
    include: {
      skills: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <OnmyojiClient onmyojiData={onmyojiData} user={user} />
  );
}
