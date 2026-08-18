import { prisma } from '@/lib/prisma';
import OnmyojiClient from './OnmyojiClient';
import { unstable_cache } from 'next/cache';

export const metadata = {
  title: 'Onmyoji & Champions - Onmyoji Planner',
};

const getCachedOnmyojiData = unstable_cache(
  async () => {
    return prisma.onmyoji.findMany({
      include: { skills: true },
      orderBy: { name: 'asc' }
    });
  },
  ['onmyoji-data'],
  { tags: ['onmyoji'] }
);

export default async function ChampionsPage() {
  const onmyojiData = await getCachedOnmyojiData();

  return (
    <OnmyojiClient onmyojiData={onmyojiData} />
  );
}
