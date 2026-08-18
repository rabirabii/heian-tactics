import { prisma } from '@/lib/prisma';
import LineupsClient from './LineupsClient';
import { unstable_cache } from 'next/cache';

const getCachedLineupsData = unstable_cache(
  async () => {
    return Promise.all([
      prisma.shikigami.findMany({
        select: {
          id: true,
          name: true,
          rarityId: true,
          rarityRef: true,
          icon: true,
          strengths: true,
          weaknesses: true,
          builds: true
        }
      }),
      prisma.onmyoji.findMany({ include: { skills: true } }),
      prisma.soul.findMany(),
      prisma.metaLineup.findMany({
        where: { supersededById: null },
        include: {
          subcategory: {
            include: {
              category: {
                include: { type: true }
              }
            }
          },
          slots: true,
          scenarios: { select: { id: true } }
        }
      }),
      prisma.lineupType.findMany({
        include: {
          categories: {
            include: {
              subcategories: true
            }
          }
        }
      }),
      prisma.rarity.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.shikigamiRole.findMany()
    ]);
  },
  ['meta-lineups-data'],
  { tags: ['meta-lineups'] }
);

export default async function MetaLineupsPage() {
  const [
    shikigamiData,
    onmyojiData,
    soulsData,
    lineupsData,
    lineupTypesData,
    raritiesData,
    rolesData
  ] = await getCachedLineupsData();

  return (
    <LineupsClient 
      shikigamiData={shikigamiData || []}
      onmyojiData={onmyojiData || []}
      soulsData={soulsData || []}
      lineupsData={lineupsData || []}
      lineupTypesData={lineupTypesData || []}
      raritiesData={raritiesData || []}
      rolesData={rolesData || []}
    />
  );
}
