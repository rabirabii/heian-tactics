import { prisma } from '@/lib/prisma';
import TierListClient from './TierListClient';

export default async function TierListPage({ searchParams }: { searchParams: { tierListId?: string } }) {
  const selectedTierListId = searchParams.tierListId || null;

  const [roles, categories, shikigamis, rarities, publicTierLists] = await Promise.all([
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
          where: { tierListId: selectedTierListId },
          include: {
            category: true
          }
        }
      }
    }),
    prisma.rarity.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.tierList.findMany({ 
      where: { isPublic: true },
      include: { author: { select: { username: true } } },
      orderBy: { updatedAt: 'desc' }
    })
  ]);

  return (
    <TierListClient 
      shikigamis={shikigamis || []} 
      roles={roles || []} 
      categories={categories || []} 
      rarities={rarities || []}
      publicTierLists={publicTierLists || []}
      currentTierListId={selectedTierListId}
    />
  );
}
