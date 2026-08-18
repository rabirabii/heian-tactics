import { prisma } from '@/lib/prisma';
import TierListClient from './TierListClient';
import { unstable_cache } from 'next/cache';

const getCachedTierListData = unstable_cache(
  async () => {
    return Promise.all([
      prisma.shikigamiRole.findMany({ orderBy: { name: 'asc' } }),
      prisma.evaluationCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.shikigami.findMany({
        select: {
          id: true,
          name: true,
          icon: true,
          rarityId: true,
          beginnerFriendly: true,
          availableGlobal: true,
          rarityRef: true,
          roleAssignments: {
            select: {
              roleId: true,
              mode: true,
              role: true
            }
          },
          evaluations: {
            include: {
              category: true
            }
          }
        }
      }),
      prisma.rarity.findMany({ orderBy: { sortOrder: 'asc' } })
    ]);
  },
  ['meta-tier-list-data'],
  { tags: ['meta-tier-list'] }
);

export default async function TierListPage() {
  const [roles, categories, shikigamis, rarities] = await getCachedTierListData();

  return (
    <TierListClient 
      shikigamis={shikigamis || []} 
      roles={roles || []} 
      categories={categories || []} 
      rarities={rarities || []}
    />
  );
}
