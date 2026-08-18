import { prisma } from '@/lib/prisma';
import ShikigamiClient from './ShikigamiClient';
import { unstable_cache } from 'next/cache';

const getCachedRosterData = unstable_cache(
  async () => {
    return Promise.all([
      prisma.rarity.findMany({ orderBy: { sortOrder: 'asc' } }),
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
            include: { category: true }
          },
          skills: true
        }
      })
    ]);
  },
  ['shikigami-data'],
  { tags: ['shikigami'] }
);

export default async function RosterPage() {
  const [rarities, roles, categories, shikigamis] = await getCachedRosterData();

  return (
    <ShikigamiClient 
      shikigamiData={shikigamis || []} 
      roles={roles || []} 
      categories={categories || []} 
      rarities={rarities || []}
    />
  );
}
