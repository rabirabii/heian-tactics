import { prisma } from '@/lib/prisma';
import TierListClient from './TierListClient';

import { createClient } from '@/utils/supabase/server';

export default async function TierListPage(props: { searchParams: Promise<{ tierListId?: string }> }) {
  const searchParams = await props.searchParams;
  const selectedTierListId = searchParams?.tierListId || null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [roles, categories, shikigamis, rarities, publicTierLists, myTierLists, dbUser] = await Promise.all([
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
          where: {
            OR: [
              { tierListId: null },
              ...(selectedTierListId ? [{ tierListId: selectedTierListId }] : [])
            ]
          },
          select: {
            roleId: true,
            mode: true,
            tierListId: true
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
      where: { status: 'PUBLISHED' },
      include: { author: { select: { username: true } } },
      orderBy: { updatedAt: 'desc' }
    }),
    user ? prisma.tierList.findMany({
      where: { authorId: user.id },
      orderBy: { updatedAt: 'desc' }
    }) : Promise.resolve([]),
    user ? prisma.user.findUnique({ where: { id: user.id } }) : Promise.resolve(null)
  ]);

  return (
    <TierListClient 
      shikigamis={shikigamis || []} 
      roles={roles || []} 
      categories={categories || []} 
      rarities={rarities || []}
      publicTierLists={publicTierLists || []}
      myTierLists={myTierLists || []}
      currentTierListId={selectedTierListId}
      isAdmin={dbUser?.role === 'ADMIN'}
      currentUserId={user?.id}
    />
  );
}
