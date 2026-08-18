import { prisma } from '@/lib/prisma';
import { BuildsTable } from './BuildsTable';
import { createClient } from '@/utils/supabase/server';

export default async function MetaBuildsPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [
      rarities,
      rolesData,
      soulsData,
      lineupTypes,
      lineupCategories
    ] = await Promise.all([
      prisma.rarity.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.shikigamiRole.findMany(),
      prisma.soul.findMany(),
      prisma.lineupType.findMany(),
      prisma.lineupCategory.findMany()
    ]);

    // Fetch Shikigami with builds matching criteria
    const shikigamiData = await prisma.shikigami.findMany({
      select: {
        id: true,
        name: true,
        rarityId: true,
        rarityRef: true,
        icon: true,
        builds: {
          where: {
            OR: [
              { isPublic: true },
              { authorId: user?.id || 'NO_USER' }
            ]
          },
          include: {
            roleRef: true,
            type: true,
            category: true,
            userAuthor: { select: { username: true } }
          }
        }
      }
    });

    // Filter out shikigami that have no builds
    const dataWithBuilds = shikigamiData.filter(s => s.builds && s.builds.length > 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-foreground tracking-wide">Builds</h1>
            <p className="text-text-secondary mt-1 font-mono text-sm">
              Target stats and soul recommendations for Shikigami.
            </p>
          </div>
        </div>
        <BuildsTable 
          data={dataWithBuilds as any} 
          rarities={rarities as any} 
          allShikigami={shikigamiData || []}
          rolesData={rolesData || []}
          soulsData={soulsData || []}
          lineupTypes={lineupTypes || []}
          lineupCategories={lineupCategories || []}
          currentUserId={user?.id}
        />
      </div>
    );
  } catch (error) {
    console.error('Error fetching builds:', error);
    return <div>Error loading builds.</div>;
  }
}
